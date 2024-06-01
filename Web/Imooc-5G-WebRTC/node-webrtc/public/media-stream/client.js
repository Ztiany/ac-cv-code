'use strict'

const elements = {
    // device options
    audioSourceSelect: undefined,
    audioOutputSelect: undefined,
    videoSourceSelect: undefined,

    // output mode
    outputModeSelect: undefined,

    // video
    videoPlayer: undefined,
    videoConstraintsDiv: undefined,
    videoFilterSelect: undefined,
    snapshotButton: undefined,
    snapshotCanvas: undefined,

    // audio player
    audioPlayer: undefined,
    audioConstraintsDiv: undefined,
}

const avConstraints = {
    video: false,
    audio: false
}

window.onload = function () {
    start();
}

function isWebRTCSupported() {
    return navigator.mediaDevices && navigator.mediaDevices.enumerateDevices;
}

function start() {
    if (!isWebRTCSupported()) {
        console.error("WebRTC is not supported in your browser.")
        return
    }
    console.log("WebRTC is supported in your browser.")
    findElements();
    setUpListeners();
    getAVDevices();
}

function findElements() {
    elements.audioSourceSelect = document.querySelector("select#audioSource")
    elements.audioOutputSelect = document.querySelector("select#audioOutput")
    elements.videoSourceSelect = document.querySelector("select#videoSource")
    elements.outputModeSelect = document.querySelector("select#outputMode")

    elements.videoPlayer = document.querySelector("video#videoPlayer")
    elements.videoFilterSelect = document.querySelector("select#videoFilter")
    elements.videoConstraintsDiv = document.querySelector("div#videoConstraints")
    elements.snapshotCanvas = document.querySelector("canvas#snapshotCanvas")
    elements.snapshotButton = document.querySelector("button#snapshotBtn")

    elements.audioPlayer = document.querySelector("audio#audioPlayer")
    elements.audioConstraintsDiv = document.querySelector("div#audioConstraints")
}

function setUpListeners() {
    elements.videoFilterSelect.onchange = function () {
        elements.videoPlayer.className = elements.videoFilterSelect.value;
    }

    elements.snapshotButton.onclick = function () {
        elements.snapshotCanvas.width = elements.videoPlayer.videoWidth;
        elements.snapshotCanvas.height = elements.videoPlayer.videoHeight;
        elements.snapshotCanvas.getContext("2d").drawImage(elements.videoPlayer, 0, 0, elements.snapshotCanvas.width, elements.snapshotCanvas.height);
    }

    /* 选择了新的源或模式，则重新执行一遍。*/
    elements.videoSourceSelect.onchange = function () {
        getAVDevices();
    }
    elements.audioSourceSelect.onchange = function () {
        getAVDevices();
    }
    elements.outputModeSelect.onchange = function () {
        getAVDevices();
    }
}

function buildAvConstraints() {
    if (elements.outputModeSelect.value === "audio") {
        avConstraints.video = false;
        avConstraints.audio = true;
        return
    }

    avConstraints.audio = false;
    avConstraints.video = {
        width: 640,
        height: 480,
        frameRate: 30,
        facingMode: "environment",
        deviceId: undefined
    };
    if (elements.outputModeSelect.value === "both") {
        avConstraints.audio = true;
    }

    // exact 表示精确匹配，不加则表示模糊匹配。
    let videoDeviceId = elements.videoSourceSelect.value;
    avConstraints.video.deviceId = videoDeviceId ? {exact: videoDeviceId} : undefined;
}

function onGetMediaStream(stream) {
    elements.audioPlayer.srcObject = null;
    elements.videoPlayer.srcObject = null;
    elements.videoConstraintsDiv.textContent = "";
    elements.audioConstraintsDiv.textContent = "";

    const videoDisplay = elements.outputModeSelect.value === "audio" ? "none" : "block";
    const audioDisplay = elements.outputModeSelect.value === "audio" ? "block" : "none";

    elements.audioPlayer.style.display = audioDisplay;
    elements.audioConstraintsDiv.style.display = audioDisplay;
    elements.videoPlayer.style.display = videoDisplay;
    elements.videoConstraintsDiv.style.display = videoDisplay;
    elements.snapshotButton.style.display = videoDisplay;
    elements.snapshotCanvas.style.display = videoDisplay;

    // audio only
    if (elements.outputModeSelect.value === "audio") {
        let audioTrack = stream.getAudioTracks()[0];
        elements.audioConstraintsDiv.textContent = JSON.stringify(audioTrack.getSettings(), null, 2);
        elements.audioPlayer.srcObject = stream;
        return navigator.mediaDevices.enumerateDevices();
    }

    // video only
    if (elements.outputModeSelect.value === "video") {
        let videoTrack = stream.getVideoTracks()[0];
        elements.videoConstraintsDiv.textContent = JSON.stringify(videoTrack.getSettings(), null, 2);
        elements.videoPlayer.srcObject = stream;
        return navigator.mediaDevices.enumerateDevices();
    }

    // audio and video
    let audioTrack = stream.getAudioTracks()[0];
    let videoTrack = stream.getVideoTracks()[0];
    let bothSettings = {
        audioTrack: audioTrack.getSettings(),
        videoTrack: videoTrack.getSettings()
    }
    elements.videoConstraintsDiv.textContent = JSON.stringify(bothSettings, null, 2);
    elements.videoPlayer.srcObject = stream;
    return navigator.mediaDevices.enumerateDevices();
}

function onGetDevices(devices) {
    if (!devices.length) {
        console.log("No devices found. devices: ", devices)
        return
    }

    elements.audioSourceSelect.innerHTML = ""
    elements.audioOutputSelect.innerHTML = ""
    elements.videoSourceSelect.innerHTML = ""

    devices.forEach(device => {
        /*
        非 https 网站无法获取设备的 label，解决方案：
            # 谷歌
            chrome://flags/#unsafely-treat-insecure-origin-as-secure
            # edge
            edge://flags/#unsafely-treat-insecure-origin-as-secure

            将上述地址打开，将 Insecure origins treated as secure 添加 http://localhost:8080，然后重启浏览器。具体参考
                    <https://blog.csdn.net/qq_35385687/article/details/120736610>。
                    <https://stackoverflow.com/questions/34878749/in-androids-google-chrome-how-to-set-unsafely-treat-insecure-origin-as-secure>
         */
        console.log(device.kind + ": label = " + device.label + ": id = " + device.deviceId + ": groupId = " + device.groupId);

        let option = document.createElement("option")
        option.value = device.deviceId
        if (device.kind === "audioinput") {
            option.text = device.label || "microphone " + (elements.audioSourceSelect.length + 1)
            elements.audioSourceSelect.appendChild(option)
        } else if (device.kind === "audiooutput") {
            option.text = device.label || "speaker " + (elements.audioOutputSelect.length + 1)
            elements.audioOutputSelect.appendChild(option)
        } else if (device.kind === "videoinput") {
            option.text = device.label || "camera " + (elements.videoSourceSelect.length + 1)

            // 选中已选择的设备
            const selectedDeviceId = avConstraints.video ? avConstraints.video : undefined;
            option.selected = device.deviceId === (selectedDeviceId ? selectedDeviceId.exact : undefined);

            elements.videoSourceSelect.appendChild(option)
        }
    });
}

function onGetDevicesError(error) {
    console.log(error);
}

function getAVDevices() {
    buildAvConstraints();
    navigator.mediaDevices
        .getUserMedia(avConstraints)// 获取音视频流，会触发用户授权
        .then(onGetMediaStream)
        .then(onGetDevices)
        .catch(onGetDevicesError)
}