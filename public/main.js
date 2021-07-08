// client-side js, loaded by index.html
// run by the browser each time the page is loaded

let Peer = window.Peer;
let callerID = "cenex_caller";
let operatorID = "cenex_operator";
let messagesEl = document.querySelector(".messages");
let audioEl = document.querySelector(".remote-audio");
let radioURL = 'https://radio.cenexxx.cl/stream.ogg';
let liveURL = 'https://radio.cenexxx.cl/live.ogg';
let isCallActive = false;

let logMessage = (message) => {
  let newMessage = document.createElement("div");
  newMessage.innerText = message;
  messagesEl.appendChild(newMessage);
};

let renderAudio = (stream) => {
  console.log('enabling audio');
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
  console.log(navigator.mediaDevices);
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

  let conn = peer.connect(operatorID);
  conn.on("data", (data) => {
    logMessage(`received: ${data}`);
  });
  conn.on("open", () => {
    conn.send("Conexión establecida con llamador");
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

let radio = new Howl({
  src: [radioURL],
  html5: true,
  format: ['ogg']
});

var buttonPlay = document.getElementById("escuchar");
var buttonStop = document.getElementById("stop");

buttonPlay.addEventListener('click', function() {
  console.log('play');
  console.log(radio);
  radio.play();
});

buttonStop.addEventListener('click', function() {
  console.log('stop');
  radio.stop();
});