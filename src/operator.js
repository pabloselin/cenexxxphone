import Peer from "peerjs";
import { guid, handlePeerDisconnect } from "./utils";
// client-side js, loaded by index.html
// run by the browser each time the page is loaded

function startPeerOperator() {
  let operatorID = "cenexxx_operator";

  let messagesEl = document.querySelector(".messages");
  let audioEl = document.querySelector(".remote-audio");
  let hasCallActive = false;
  let buttonHang = document.querySelector("#botoncortar");

  let logMessage = (message) => {
    let newMessage = document.createElement("div");
    newMessage.innerText = message;
    messagesEl.appendChild(newMessage);
  };

  let renderAudio = (stream) => {
    audioEl.srcObject = stream;
  };

  // Register with the peer server
  let operatorPeer = new Peer(operatorID, {
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
  operatorPeer.on("open", (id) => {
    logMessage("ID de operadora activado:" + id);
    logMessage("Esperando llamada");
  });
  operatorPeer.on("error", (error) => {
    console.error(error);
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
        call.on("stream", renderAudio);
        logMessage("Audio conectado");
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
