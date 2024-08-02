const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const supportedMimeTypeTable = document.getElementById("supportType");
const video = document.querySelector("video");
const cameraVideo = document.querySelector('video#camera');

const cameraInfo = document.querySelector('#cameraInfo');
const desktopInfo = document.querySelector('#desktopInfo');


import { screen, camera } from './config/rtc.js';
cameraInfo.innerText = `摄像头抓取参数：${JSON.stringify(camera)}`;
desktopInfo.innerText = `屏幕抓取参数：${JSON.stringify(screen)}`;

const changeRecordingStatus = (status) => {
  if (status == "idle") {
    stopButton.disabled = true;
    startButton.disabled = false;
  } else {
    stopButton.disabled = false;
    startButton.disabled = true;
  }
};

const types = [
  "video/webm",
  "audio/webm",
  "video/webm;codecs=vp8",
  "video/webm;codecs=daala",
  "video/webm;codecs=h264",
  "audio/webm;codecs=opus",
  "video/mp4",
];

let supportedTypeStr = [];
for (const type of types) {
  supportedTypeStr.push(`是否支持${type}: ${MediaRecorder.isTypeSupported(type) ? "是" : "否"}`);
}
supportedMimeTypeTable.innerText = supportedTypeStr.join(' | ');

let desktopMediaRecorder = undefined;
let videoMediaRecorder = undefined;
let chunks = [];
let videoChunks = [];

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

// 同时录制摄像头和屏幕
startButton.addEventListener("click", () => {
  changeRecordingStatus("recording");
  navigator.mediaDevices
    .getDisplayMedia({
      audio: true,
      video: {
        width: screen.width,
        height: screen.height,
        frameRate: screen.frameRate,
      },
    })
    .then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = (e) => video.play();
      desktopMediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });
      chunks = [];
      desktopMediaRecorder.start();

      desktopMediaRecorder.ondataavailable = async (e) => {
        chunks.push(e.data);
        let blob = new Blob(chunks);
        let arrayBuffer = await blob.arrayBuffer();
        let saveTimeStr = timeStr();
        console.log(`desktop`, saveTimeStr)
        window.electronAPI.saveVideoToFile({
          buffer: arrayBuffer,
          filename: `desktop-${saveTimeStr}.webm`,
        });
      };
    })
    .catch((e) => console.log(e));

  // 摄像头
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: camera.width,
      height: camera.height,
      frameRate: camera.frameRate,
    }
  }).then(stream => {
    cameraVideo.srcObject = stream;
    cameraVideo.onloadedmetadata = (e) => cameraVideo.play();

    videoMediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
    });
    videoChunks = [];
    videoMediaRecorder.start();

    videoMediaRecorder.ondataavailable = async (e) => {
      videoChunks.push(e.data);
      let blob = new Blob(videoChunks);
        let arrayBuffer = await blob.arrayBuffer();
        let saveTimeStr = timeStr();
        console.log(`video`, saveTimeStr)
        window.electronAPI.saveVideoToFile({
          buffer: arrayBuffer,
          filename: `video-${saveTimeStr}.webm`,
        });
    }
  });
});

stopButton.addEventListener("click", () => {
  changeRecordingStatus("idle");
  video.pause();
  if (desktopMediaRecorder != undefined) {
    desktopMediaRecorder.stop();
    console.log(desktopMediaRecorder.state);
    console.log("desktop recorder stopped");
  }

  cameraVideo.pause();
  if (videoMediaRecorder != undefined) {
    videoMediaRecorder.stop();
    console.log(videoMediaRecorder.state);
    console.log("camera recorder stopped");
  }
});
