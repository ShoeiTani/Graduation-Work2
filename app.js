// HTML要素の取得
const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const uploadInput = document.getElementById('video-upload');
const ctx = canvasElement.getContext('2d');

// PoseNetモデルを読み込み
let net;
async function loadPosenetModel() {
    net = await posenet.load();
    console.log("PoseNetモデルがロードされました");
}

// 映像を選択しアップロードするイベント
uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        videoElement.src = url;
        videoElement.play();
        videoElement.addEventListener('loadeddata', () => {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            detectPoseInRealTime();
        });
    }
});

// 骨格をリアルタイムで検出し描画
async function detectPoseInRealTime() {
    while (true) {
        const pose = await net.estimateSinglePose(videoElement, {
            flipHorizontal: false
        });

        drawPose(pose);
        await tf.nextFrame(); // 次のフレームまで待機
    }
}

// 骨格を描画
function drawPose(pose) {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    const keypoints = pose.keypoints;
    keypoints.forEach(point => {
        if (point.score > 0.5) {
            const { y, x } = point.position;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
        }
    });
}

// 初期化
loadPosenetModel();
