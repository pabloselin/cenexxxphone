import Peer from "peerjs";
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

  // Register with the peer server
  let operatorPeer = new Peer(operatorID, peerServerConfig);

  let preRenderAudio = (stream) => {
    renderAudioOperator(stream, hasCallActive, audioEl);
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
      logMessage("Llamada activa");
    });
  });

  // Handle incoming voice/video connection
  operatorPeer.on("call", (call) => {
    hasCallActive = true;
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        call.answer(stream); // Answer the call with an A/V stream.
        logMessage("Llamada establecida");
        call.on("stream", preRenderAudio);
        buttonHang.classList.add("active");
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
        call.on("stream", renderAudio);
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
}

export default startPeerOperator;
