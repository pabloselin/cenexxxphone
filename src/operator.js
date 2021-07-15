import Peer from "peerjs";
// client-side js, loaded by index.html
// run by the browser each time the page is loaded

function startPeerOperator() {
  let operatorID = "cenexxx_operator";

  let messagesEl = document.querySelector(".messages");
  let audioEl = document.querySelector(".remote-audio");
  let hasCallActive = false;

  let logMessage = (message) => {
    let newMessage = document.createElement("div");
    newMessage.innerText = message;
    messagesEl.appendChild(newMessage);
  };

  let renderAudio = (stream) => {
    audioEl.srcObject = stream;
  };

  // Register with the peer server
  let operatorPeer = new Peer(operatorID);
  operatorPeer.on("open", (id) => {
    logMessage("My operatorPeer ID is: " + id);
  });
  operatorPeer.on("error", (error) => {
    console.error(error);
  });

  // Handle incoming data connection
  operatorPeer.on("connection", (conn) => {
    logMessage("incoming peer connection!");
    conn.on("data", (data) => {
      logMessage(`received: ${data}`);
    });
    conn.on("open", () => {
      conn.send(hasCallActive);
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
      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
      });
  });

  // Initiate outgoing connection
  let connectToPeer = () => {
    logMessage(`Connecting to ${operatorID}...`);

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
      })
      .catch((err) => {
        logMessage("Failed to get local stream", err);
      });
  };

  window.connectToPeer = connectToPeer;
}

export default startPeerOperator;
