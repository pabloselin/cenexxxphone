import Peer from 'peerjs';

import {guid} from './utils'
import {cenexRadio} from "./cenexradio";
import startPeerOperator from "./operator";
import "./css/style.css";

function startPeer() {
// client-side js, loaded by index.html
// run by the browser each time the page is loaded
console.log('loading stuff');

//let Peer = window.Peer;
let operatorID      =   "cenex_operator";
let messagesEl      =   document.querySelector(".messages");
let audioEl         =   document.querySelector(".remote-audio");
let hasCallActive   =   false;

let callerID = guid();

let logMessage = (message) => {
  let newMessage = document.createElement("div");
  newMessage.innerText = message;
  messagesEl.appendChild(newMessage);
};

let renderAudio = (stream) => {
  console.log('enabling audio', hasCallActive);
  if(hasCallActive === false) {
    audioEl.srcObject = stream;
  } else {
    console.log('llamada en progreso...');
    audioEl.destroy();
  }
  
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
    console.log('callactive', hasCallActive);
    
    navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
        call.answer(stream); // Answer the call with an A/V stream.
        call.on("stream", renderAudio );
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
    console.log('data', data);
    if(data === true) {
        console.log('cancel call');
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
    })
    .catch((err) => {
      logMessage("Failed to get local stream", err);
        });
    
};


window.connectToPeer = connectToPeer;

}

console.log(window.location.pathname);
if(window.location.pathname === '/') {
  startPeer();
  cenexRadio();
} else if(window.location.pathname === '/operadora') {
  startPeerOperator();
}


console.log('mainjs');