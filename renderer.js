const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const video = document.querySelector("video");

const changeRecordingStatus = (status) => {
  if (status == "idle") {
    stopButton.disabled = true;
    startButton.disabled = false;
  } else {
    stopButton.disabled = false;
    startButton.disabled = true;
  }
};

let mediaRecorder = undefined;
let chunks = [];

// 格式化时间
const timeStr = () => {
	const options = {
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		hour12: false,
		timeZone: "Asia/Chongqing",
	};

	return new Intl.DateTimeFormat('fr-CA', options).format(new Date());
}

startButton.addEventListener("click", () => {
  changeRecordingStatus("recording");
  navigator.mediaDevices
    .getDisplayMedia({
      audio: true,
      video: {
        width: 1920,
        height: 1080,
        frameRate: 30,
      },
    })
    .then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = (e) => video.play();
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });
      chunks = [];
      mediaRecorder.start();

      mediaRecorder.ondataavailable = async (e) => {
        chunks.push(e.data);
        let blob = new Blob(chunks);
        let arrayBuffer = await blob.arrayBuffer();
				let saveTimeStr = timeStr();
				console.log(saveTimeStr)
        window.electronAPI.saveVideoToFile({
          buffer: arrayBuffer,
					filename: `test-${saveTimeStr}.webm`,
        });
      };
    })
    .catch((e) => console.log(e));
});

stopButton.addEventListener("click", () => {
  changeRecordingStatus("idle");
  video.pause();
  if (mediaRecorder != undefined) {
    mediaRecorder.stop();
    console.log(mediaRecorder.state);
    console.log("recorder stopped");
  }
});
