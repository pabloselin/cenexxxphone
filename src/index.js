import Peer from "peerjs";
import animate from "animate.css";
import adapter from "webrtc-adapter";

import {
  guid,
  handlePeerDisconnect,
  logMessage,
  renderAudio,
  switchCallButtons,
} from "./utils";
import { cenexRadio } from "./cenexradio";
import startPeerOperator from "./operator";
import peerServerConfig from "./peerServerConfig";

import "./css/style.css";

function startPeer() {
  // client-side js, loaded by index.html
  // run by the browser each time the page is loaded
  console.log("loading stuff");

  //let Peer = window.Peer;
  let operatorID = "cenexxx_operator";

  let audioEl = document.querySelector(".remote-audio");
  let videoEl = document.querySelector("#callvideo");
  let hasCallActive = false;

  let callerID = guid();

  let preRenderAudio = (stream) => {
    renderAudio(stream, hasCallActive, audioEl);
  };

  // Register with the peer server
  let peer = new Peer(peerServerConfig);

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

    conn.on("close", () => {
      console.log("closing all stuff");
      handlePeerDisconnect(peer);
    });
  });

  peer.on("disconnected", (conn) => {
    console.log(conn);
    switchCallButtons("hang");
    //peer.close();
    handlePeerDisconnect(peer);
    audioEl.setAttribute("src", null);
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
        call.on("stream", preRenderAudio);
        logMessage("Llamada en proceso...");
      })
      .catch((err) => {
        logMessage("No se ha podido conectar el audio", err);
      });
  };

  let disconnectPeer = () => {
    peer.disconnect();
    console.log("Disconnecting");
    logMessage("Llamada terminada");
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
