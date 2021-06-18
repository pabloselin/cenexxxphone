// client-side js, loaded by index.html
// run by the browser each time the page is loaded

let Peer = window.Peer;
let callerID = "cenex_caller";
let operatorID = "cenex_operator";
let messagesEl = document.querySelector(".messages");
let audioEl = document.querySelector(".remote-audio");

let logMessage = (message) => {
  let newMessage = document.createElement("div");
  newMessage.innerText = message;
  messagesEl.appendChild(newMessage);
};

let renderAudio = (stream) => {
  audioEl.srcObject = stream;
};

// Register with the peer server
let peer = new Peer(callerID);
peer.on("open", (id) => {
  logMessage("My peer ID is: " + id);
});
peer.on("error", (error) => {
  console.error(error);
});

// Handle incoming data connection
peer.on("connection", (conn) => {
  logMessage("incoming peer connection!");
  conn.on("data", (data) => {
    logMessage(`received: ${data}`);
  });
  conn.on("open", () => {
    conn.send("hello!");
  });
});

// Handle incoming voice/video connection
peer.on("call", (call) => {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      call.answer(stream); // Answer the call with an A/V stream.
      call.on("stream", renderVideo);
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
  });
  conn.on("open", () => {
    conn.send("hi!");
  });

  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      let call = peer.call(operatorID, stream);
      call.on("stream", renderAudio);
    })
    .catch((err) => {
      logMessage("Failed to get local stream", err);
    });
};

window.connectToPeer = connectToPeer;
