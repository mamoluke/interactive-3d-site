// 基本設定
const canvas = document.getElementById('webglCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 立方体の作成
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x44aa88 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// ライト設定
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// カメラの位置設定
camera.position.z = 5;

// Raycasterとマウスベクトル
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDragging = false;

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// マウスイベントリスナー
canvas.addEventListener('mousedown', (event) => {
  isDragging = true;

  // マウスの位置を計算
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Raycasterでマウス位置を取得
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(cube);

  if (intersects.length > 0) {
    cube.material.color.set(0xff5555); // クリック時に色を変更
  }
});

canvas.addEventListener('mousemove', (event) => {
  if (isDragging) {
    // マウス位置に基づいて立方体を動かす
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(cube);

    if (intersects.length > 0) {
      cube.position.x = intersects[0].point.x;
      cube.position.y = intersects[0].point.y;
    }
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  cube.material.color.set(0x44aa88); // 色を元に戻す
});

// ウィンドウサイズ変更対応
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
