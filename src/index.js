import Peer from "peerjs";
import animate from "animate.css";

import { guid, handlePeerDisconnect } from "./utils";
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
      audioEl.autoplay = true;
      logMessage("Audio conectado");
      switchCallButtons("call");
    } else {
      console.log("operadora ocupada...");
      //videoEl.src = "./videos/busy.mp4";
      audioEl.pause();
      audioEl.removeAttribute("src");
    }
  };

  let switchCallButtons = (mode) => {
    if (mode === "hang") {
      console.log("hanging");
      buttonCall.classList.remove("hidden");
      buttonHang.classList.remove("active");
    } else {
      buttonCall.classList.add("hidden");
      buttonHang.classList.add("active");
    }
  };

  // Register with the peer server
  let peer = new Peer({
    host: "radio.cenexxx.cl",
    path: "/cenexxxpeerserver",
    port: 9000,
    key: "cenexxx",
    config: {
      iceServers: [
        {
          url: "stun:numb.viagenie.ca",
        },
        {
          url: "turn:numb.viagenie.ca",
          username: "pabloselin@gmail.com",
          credential: "kL01ZWqK",
        },
      ],
    },
  });

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
        call.on("stream", renderAudio);
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
