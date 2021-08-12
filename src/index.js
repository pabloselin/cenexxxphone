import Peer from "peerjs";
import animate from "animate.css";
import adapter from "webrtc-adapter";
import { Howl, Howler } from "howler";
import {
  guid,
  handlePeerDisconnect,
  logMessage,
  renderAudio,
  switchCallButtons,
  busyTone,
  waitingTone,
} from "./utils";
import { cenexRadio } from "./cenexradio";
import startPeerOperator from "./operator";
import peerServerConfig from "./peerServerConfig";

import "./css/style.css";
import "./assets/fonts/stylesheet.css";

function startPeer() {
  // client-side js, loaded by index.html
  // run by the browser each time the page is loaded
  console.log("loading stuff");

  //let Peer = window.Peer;
  let operatorID = "cenexxx_operator";

  let audioEl = document.querySelector(".remote-audio");
  let videoEl = document.querySelector("#callvideo");
  let callerZone = document.querySelector(".oncallzone");
  let hasCallActive = false;
  window.isCaller = false;

  let callerID = guid();

  let preRenderAudio = (stream) => {
    renderAudio(stream, hasCallActive, audioEl);
    //Localize stream
    window.localStream = stream;
    Howler.stop();
  };

  // Register with the peer server
  let peer = new Peer(peerServerConfig);

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(
      {
        audio: true,
        video: false,
      },
      (stream) => {
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
      }
    );
  }

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
      if (data === true) {
        logMessage(`Data recibida: ${data}`);

        peer.destroy();
        busyTone();
      }
    });
    conn.on("open", () => {
      conn.send("Conexión abierta");
    });

    conn.on("close", () => {
      console.log("closing all stuff");
      handlePeerDisconnect(peer);
    });
  });

  peer.on("disconnected", (id) => {
    console.log("disconnect event", id);
    switchCallButtons("hang");
    //peer.close();
    busyTone();
    handlePeerDisconnect(peer);
  });

  // Initiate outgoing connection
  let connectToPeer = () => {
    waitingTone();
    window.isCaller = true;
    callerZone.classList.add("active");
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
    console.log(peer);
    peer.disconnect();
    peer.destroy();
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
