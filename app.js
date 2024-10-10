let net;
const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const ctx = canvasElement.getContext('2d');

// PoseNetモデルを読み込み
async function loadPosenetModel() {
    net = await posenet.load();
    console.log("PoseNetモデルがロードされました");
}

// 骨格検出をリアルタイムで行う関数
async function detectPoseInRealTime() {
    const pose = await net.estimateSinglePose(videoElement, {
        flipHorizontal: false
    });

    drawPose(pose);
    requestAnimationFrame(detectPoseInRealTime);
}

// 骨格を描画する関数
function drawPose(pose) {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    const keypoints = pose.keypoints;
    keypoints.forEach(point => {
        if (point.score > 0.3) {  // スコアのしきい値を0.3に設定
            const { y, x } = point.position;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);  // 円の半径を5に設定
            ctx.fillStyle = 'red';  // 点の色を赤に設定
            ctx.fill();
        }
    });
}

// 映像を選択しアップロードするイベント
const uploadInput = document.getElementById('upload');
uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        videoElement.src = url;
        videoElement.play();

        videoElement.addEventListener('loadeddata', () => {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
        });

        // 動画再生が始まったら骨格検出開始
        videoElement.addEventListener('play', () => {
            detectPoseInRealTime();
        });
    }
});

// モデルの読み込みを開始
loadPosenetModel();
