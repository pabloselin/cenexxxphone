import { Howl, Howler } from "howler";

function cenexRadio() {
  let radioURL = "https://radio.cenexxx.cl/stream.ogg";
  let liveURL = "https://radio.cenexxx.cl/live.ogg";
  let isPlaying = false;

  let radio = new Howl({
    src: [radioURL],
    html5: true,
    format: ["ogg"],
  });

  var buttonPlay = document.getElementById("escuchar");
  //var buttonStop = document.getElementById("stop");

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
