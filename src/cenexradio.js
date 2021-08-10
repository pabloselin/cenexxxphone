import { Howl, Howler } from "howler";
import uniquid from "uniquid";

function cenexRadio() {
  let radioURL = "https://radio.cenexxx.cl/stream.ogg";
  let liveURL = "https://radio.cenexxx.cl/live.ogg";
  let statusUrl = "https://radio.cenexxx.cl/status-json.xsl";
  let isPlaying = false;
  let busyZone = document.querySelector(".busyzone");
  let callZone = document.querySelector(".callzone");
  let videoBg = document.querySelector("#videobg");

  let serverStatus;

  let radio = new Howl({
    src: [radioURL],
    html5: true,
    format: ["ogg"],
    preload: false,
  });

  var buttonPlay = document.getElementById("escuchar");
  //var buttonStop = document.getElementById("stop");

  let checkStatus = () => {
    let status = fetch(statusUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log(data.icestats.source);
        let serverSources = data.icestats.source;
        console.log(serverSources.length);
        if (serverSources.length > 1) {
          triggerLive(true);
        } else {
          triggerLive(false);
        }
      });
  };

  let triggerLive = (isLive) => {
    if (isLive === true) {
      busyZone.classList.add("active");
      callZone.classList.add("hidden");
      videoBg.setAttribute("src", videoBg.getAttribute("data-altsrc"));
    } else {
      busyZone.classList.remove("active");
      callZone.classList.remove("hidden");
      videoBg.setAttribute("src", videoBg.getAttribute("data-origsrc"));
    }
  };

  //checkStatus
  //checkStatus();

  window.setInterval(checkStatus, 10000);

  buttonPlay.addEventListener("click", function () {
    if (isPlaying !== true) {
      console.log("play");
      isPlaying = true;
      console.log(radio);
      radio.play();

      buttonPlay.classList.add("animate__heartBeat");
    } else {
      radio.pause();
      isPlaying = false;
      buttonPlay.classList.remove("animate__heartBeat");
    }
  });

  // buttonStop.addEventListener("click", function () {
  //   console.log("stop");
  //   isPlaying = false;
  //   radio.stop();
  // });
}

export { cenexRadio };
