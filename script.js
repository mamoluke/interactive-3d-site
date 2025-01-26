// シーン、カメラ、レンダラーの初期化
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 50, 100);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 照明の設定
const light = new THREE.DirectionalLight(0xffffff);
light.position.set(0, 50, 50);
scene.add(light);

// Oimo.js ワールドの作成
const world = new OIMO.World({ 
    timestep: 1/60, 
    iterations: 8, 
    broadphase: 2, // 1: brute force, 2: sweep and prune, 3: volume tree
    worldscale: 1, // scale full world 
    random: true,  // randomize sample
    info: false,   // calculate statistic or not
    gravity: [0, -9.8, 0] 
});

// ドミノのパラメータ
const dominoWidth = 1;
const dominoHeight = 5;
const dominoDepth = 0.5;
const dominoMass = 1;

// ドミノの配置
const dominos = [];
const dominoCount = 50;
for (let i = 0; i < dominoCount; i++) {
    const x = i * (dominoWidth + 0.1);
    const y = dominoHeight / 2;
    const z = 0;

    // Three.js メッシュの作成
    const geometry = new THREE.BoxGeometry(dominoWidth, dominoHeight, dominoDepth);
    const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const domino = new THREE.Mesh(geometry, material);
    domino.position.set(x, y, z);
    scene.add(domino);
    dominos.push(domino);

    // Oimo.js ボディの作成
    const body = world.add({
        type: 'box',
        size: [dominoWidth, dominoHeight, dominoDepth],
        pos: [x, y, z],
        rot: [0, 0, 0],
        move: true,
        density: 1,
        friction: 0.5,
        restitution: 0.1,
    });
    domino.userData.body = body;
}

// 床の作成
const ground = new THREE.Mesh(
    new THREE.BoxGeometry(100, 1, 100),
    new THREE.MeshLambertMaterial({ color: 0x888888 })
);
ground.position.y = -0.5;
scene.add(ground);
world.add({
    type: 'box',
    size: [100, 1, 100],
    pos: [0, -0.5, 0],
    rot: [0, 0, 0],
    move: false,
    density: 1,
    friction: 0.5,
    restitution: 0.1,
});

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);
    world.step();

    // ドミノの位置と回転を更新
    dominos.forEach(domino => {
        const body = domino.userData.body;
        const pos = body.getPosition();
        const rot = body.getQuaternion();
        domino.position.set(pos.x, pos.y, pos.z);
        domino.quaternion.set(rot.x, rot.y, rot.z, rot.w);
    });

    renderer.render(scene, camera);
}
animate();

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
