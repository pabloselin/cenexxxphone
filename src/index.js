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
    busyTone();
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
    waitingTone();
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

  let waitingTone = () => {
    console.log("change waitingtone");
    let busysrc = audioEl.getAttribute("data-waitsound-ogg");
    audioEl.src = busysrc;
    audioEl.play();
    audioEl.loop = true;
  };

  let busyTone = () => {
    console.log("change busytone");
    let waitingsrc = audioEl.getAttribute("data-busysound-ogg");
    audioEl.src = waitingsrc;
    audioEl.play();
    audioEl.loop = true;
  };

  // Initiate outgoing connection
  let connectToPeer = () => {
    waitingTone();
    logMessage(`Connecting to ${operatorID}...`);
    let conn = peer.connect(operatorID);
    conn.on("data", (data) => {
      logMessage(`received: ${data}`);
      console.log("data", data);
    });
    conn.on("open", () => {
      conn.send("Conexión establecida con llamador");
    });

    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        const call = peer.call(operatorID, stream);
        call.on("stream", preRenderAudio);
        logMessage("Llamada en proceso...");
      })
      .catch((err) => {
        const call = peer.call(operatorId, new MediaStream());
        logMessage("Cambiando stream ...", err);
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
