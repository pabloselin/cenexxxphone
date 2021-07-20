import Peer from "peerjs";
import adapter from "webrtc-adapter";

import {
  guid,
  handlePeerDisconnect,
  logMessage,
  renderAudioOperator,
  switchCallButtons,
} from "./utils";
import peerServerConfig from "./peerServerConfig";

// client-side js, loaded by index.html
// run by the browser each time the page is loaded

function startPeerOperator() {
  let operatorID = "cenexxx_operator";

  let messagesEl = document.querySelector(".messages");
  let audioEl = document.querySelector(".remote-audio");
  let hasCallActive = false;
  let buttonHang = document.querySelector("#botoncortar");
  let buttonAnswer = document.querySelector("#botoncontestar");
  let audioRing = document.querySelector("#ringing");

  // Register with the peer server
  let operatorPeer = new Peer(operatorID, peerServerConfig);

  let answerCall = (stream) => {
    console.log("answer call");
    audioRing.pause();
    renderAudioOperator(stream, hasCallActive, audioEl);
    buttonAnswer.classList.remove("active");
    buttonHang.classList.add("active");
  };

  let preRenderAudio = (stream) => {
    answerCall(stream);
  };

  operatorPeer.on("open", (id) => {
    logMessage("ID de operadora activado:" + id);
    logMessage("Esperando llamada");
  });
  operatorPeer.on("error", (error) => {
    console.error("Error operadora", error);
    logMessage("Error en abrir la conexión");
  });

  // Handle incoming data connection
  operatorPeer.on("connection", (conn) => {
    logMessage("Conexión entrante");
    conn.on("data", (data) => {
      logMessage(`received: ${data}`);
    });
    conn.on("open", () => {
      conn.send(hasCallActive);
      logMessage("Conexión establecida");
    });
  });

  // Handle incoming voice/video connection
  operatorPeer.on("call", (call) => {
    hasCallActive = true;
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        logMessage("Llamada establecida");
        buttonAnswer.classList.add("active");
        audioRing.play();
        buttonAnswer.addEventListener("click", function () {
          call.answer(stream); // Answer the call with an audio stream.
          call.on("stream", preRenderAudio);
        });
      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
      });
  });

  // Initiate outgoing connection
  let connectToPeer = () => {
    logMessage(`Contactando a ${operatorID}...`);

    let conn = operatorPeer.connect(operatorID);
    conn.on("data", (data) => {
      logMessage(`received: ${data}`);
    });
    conn.on("open", () => {
      conn.send("hi!");
    });

    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        let call = operatorPeer.call(operatorID, stream);
        call.on("stream", preRenderAudio);
        logMessage("Audio conectado");
      })
      .catch((err) => {
        logMessage("No se ha podido conectar el audio", err);
      });
  };

  let disconnectPeer = () => {
    operatorPeer.disconnect();
    operatorPeer.destroy();
    handlePeerDisconnect(operatorPeer);
    logMessage("Llamada colgada");
  };

  window.connectToPeer = connectToPeer;
  window.disconnectPeer = disconnectPeer;
  window.answerCall = answerCall;
}

export default startPeerOperator;
