import Peer from "peerjs";

import { guid } from "./utils";
import { cenexRadio } from "./cenexradio";
import startPeerOperator from "./operator";
import "./css/style.css";

function startPeer() {
  // client-side js, loaded by index.html
  // run by the browser each time the page is loaded
  console.log("loading stuff");

  //let Peer = window.Peer;
  let operatorID = "cenexxx_operator";
  let messagesEl = document.querySelector(".messages");
  let audioEl = document.querySelector(".remote-audio");
  let videoEl = document.querySelector("#callvideo");
  let hasCallActive = false;
  let buttonCall = document.querySelector("#botonllamar");
  let buttonHang = document.querySelector("#botoncortar");

  let callerID = guid();

  let logMessage = (message) => {
    let newMessage = document.createElement("div");
    newMessage.classList.add = "message";
    newMessage.innerText = message;
    messagesEl.appendChild(newMessage);
  };

  let renderAudio = (stream) => {
    console.log("enabling audio", hasCallActive);
    if (hasCallActive === false) {
      audioEl.srcObject = stream;
      logMessage("Audio conectado");
      buttonCall.classList.add("hidden");
      buttonHang.classList.add("active");
    } else {
      console.log("operadora ocupada...");
      //videoEl.src = "./videos/busy.mp4";
      audioEl.pause();
      audioEl.removeAttribute("src");
    }
  };

  // Register with the peer server
  let peer = new Peer(callerID);

  peer.on("open", (id) => {
    logMessage("Mi ID de llamada es: " + id);
  });
  peer.on("error", (error) => {
    console.error(error);
    logMessage("Error");
  });

  // Handle incoming data connection
  peer.on("connection", (conn) => {
    logMessage("Conexión entrante");
    conn.on("data", (data) => {
      logMessage(`Data recibida: ${data}`);
    });
    conn.on("open", () => {
      conn.send("Conexión abierta");
    });
  });

  // Handle incoming voice/video connection
  peer.on("call", (call) => {
    console.log("callactive", hasCallActive);

    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        call.answer(stream); // Answer the call with an A/V stream.
        call.on("stream", renderAudio);
        logMessage("Llamada en proceso...");
      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
      });
  });

  // Initiate outgoing connection
  let connectToPeer = () => {
    logMessage(`Connecting to ${operatorID}...`);

    let conn = peer.connect(operatorID);
    conn.on("data", (data) => {
      logMessage(`received: ${data}`);
      console.log("data", data);
      if (data === true) {
        console.log("cancel call");
        logMessage("La operadora está ocupada");
        hasCallActive = true;
      }
    });
    conn.on("open", () => {
      conn.send("Conexión establecida con llamador");
    });

    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        let call = peer.call(operatorID, stream);
        call.on("stream", renderAudio);
        logMessage("Llamada en proceso...");
      })
      .catch((err) => {
        logMessage("No se ha podido conectar el audio", err);
      });
  };

  let disconnectPeer = () => {
    peer.destroy();
    logMessage("Llamada colgada");
  };

  window.disconnectPeer = disconnectPeer;
  window.connectToPeer = connectToPeer;
}

console.log(window.location.pathname);

if (window.location.pathname === "/") {
  startPeer();
  cenexRadio();
} else if (window.location.pathname === "/operadora") {
  startPeerOperator();
}

console.log("mainjs");
