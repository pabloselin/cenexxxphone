const guid = () => {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
    return (
        s4() +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        "-" +
        s4() +
        s4() +
        s4()
    );
};

let handlePeerDisconnect = (peer) => {
    // manually close the peer connections
    console.log("destroy");
    console.log(window.localStream);
    if (window.localStream) {
        window.localStream.getTracks().forEach((track) => {
            track.stop();
        });
    }
    busyTone();
    navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
            console.log(stream);
        });

    for (let conns in peer.connections) {
        peer.connections[conns].forEach((conn, index, array) => {
            console.log(
                `closing ${conn.connectionId} peerConnection (${index + 1}/${
                    array.length
                })`,
                conn.peerConnection
            );
            conn.peerConnection.close();

            // close it using peerjs methods
            if (conn.close) conn.close();
        });
    }
    location.reload();
};

let logMessage = (message) => {
    let messagesEl = document.querySelector(".messages");
    let newMessage = document.createElement("div");
    newMessage.innerText = message;
    messagesEl.appendChild(newMessage);
};

let waitingTone = () => {
    console.log("change waitingtone");
    let audioEl = document.querySelector(".remote-audio");
    let busysrc = audioEl.getAttribute("data-waitsound-ogg");
    audioEl.src = busysrc;
    audioEl.play();
    audioEl.loop = true;
};

let busyTone = () => {
    console.log("change busytone");
    let audioEl = document.querySelector(".remote-audio");
    let waitingsrc = audioEl.getAttribute("data-busysound-ogg");
    audioEl.src = waitingsrc;
    audioEl.play();
    audioEl.loop = true;
};

// let renderAudio = (stream) => {
//     logMessage("Audio conectado");
//     audioEl.srcObject = stream;
// };

let renderAudio = (stream, hasCallActive, audioEl) => {
    console.log("enabling audio", hasCallActive);
    if (hasCallActive === false) {
        audioEl.autoplay = true;
        audioEl.srcObject = stream;
        logMessage("Audio conectado");
        switchCallButtons("call");
    } else {
        console.log("operadora ocupada...");
        //videoEl.src = "./videos/busy.mp4";
        audioEl.pause();
        audioEl.removeAttribute("src");
    }
};

let renderAudioOperator = (stream, hasCallActive, audioEl) => {
    console.log("enabling audio", hasCallActive);
    audioEl.autoplay = true;
    audioEl.srcObject = stream;
    audioEl.play();
    logMessage("Audio conectado");
    switchCallButtons("call");

    // if (hasCallActive === false) {
    //     audioEl.autoplay = true;
    //     audioEl.srcObject = stream;
    //     audioEl.play();
    //     logMessage("Audio conectado");
    //     switchCallButtons("call");
    // } else {
    //     console.log("operadora ocupada...");
    //     //videoEl.src = "./videos/busy.mp4";
    //     audioEl.pause();
    //     audioEl.removeAttribute("src");
    // }
};

let switchCallButtons = (mode) => {
    let buttonCall = document.querySelector("#botonllamar");
    let buttonHang = document.querySelector("#botoncortar");
    if (mode === "hang") {
        console.log("hanging");
        if (buttonCall) {
            buttonCall.classList.remove("hidden");
        }
        buttonHang.classList.remove("active");
    } else {
        if (buttonCall) {
            buttonCall.classList.add("hidden");
        }
        buttonHang.classList.add("active");
    }
};

export {
    guid,
    handlePeerDisconnect,
    logMessage,
    renderAudio,
    renderAudioOperator,
    switchCallButtons,
    busyTone,
    waitingTone,
};
