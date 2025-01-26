// Ammo.js の初期化を待機
Ammo().then(() => {
  init(); // 初期化
  animate(); // アニメーション開始
});

let scene, camera, renderer, physicsWorld, rigidBodies;
const margin = 0.05;

function init() {
  // シーンとカメラの設定
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);

  // レンダラーの作成
  const canvas = document.getElementById('webglCanvas');
  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }

  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff); // 背景を白に設定
  document.body.appendChild(renderer.domElement);

  // 照明の追加
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 10, 10);
  scene.add(light);

  // Ammo.js 物理エンジンの初期化
  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  const overlappingPairCache = new Ammo.btDbvtBroadphase();
  const solver = new Ammo.btSequentialImpulseConstraintSolver();

  physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
  physicsWorld.setGravity(new Ammo.btVector3(0, -9.8, 0));

  rigidBodies = [];

  // 地面を作成
  createFloor();

  // 球体をランダムに生成
  for (let i = 0; i < 10; i++) {
    createSphere(Math.random() * 0.5 + 0.2, { x: Math.random() * 4 - 2, y: 5, z: Math.random() * 4 - 2 });
  }

  // ウィンドウリサイズイベント
  window.addEventListener('resize', onWindowResize);
}

function createFloor() {
  const pos = { x: 0, y: -1, z: 0 };
  const scale = { x: 10, y: 1, z: 10 };

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(scale.x, scale.y, scale.z),
    new THREE.MeshStandardMaterial({ color: 0x808080 })
  );
  floor.position.set(pos.x, pos.y, pos.z);
  scene.add(floor);

  // Ammo.js 用の物理ボディ
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  const motionState = new Ammo.btDefaultMotionState(transform);

  const colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
  colShape.setMargin(margin);

  const mass = 0; // 静的オブジェクト
  const localInertia = new Ammo.btVector3(0, 0, 0);
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
  const body = new Ammo.btRigidBody(rbInfo);

  physicsWorld.addRigidBody(body);
}

function createSphere(radius, position) {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
  );
  sphere.position.set(position.x, position.y, position.z);
  scene.add(sphere);

  // Ammo.js 用の物理ボディ
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
  const motionState = new Ammo.btDefaultMotionState(transform);

  const colShape = new Ammo.btSphereShape(radius);
  colShape.setMargin(margin);

  const mass = 1;
  const localInertia = new Ammo.btVector3(0, 0, 0);
  colShape.calculateLocalInertia(mass, localInertia);

  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
  const body = new Ammo.btRigidBody(rbInfo);

  physicsWorld.addRigidBody(body);
  rigidBodies.push({ mesh: sphere, body });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // Ammo.js 物理シミュレーションの更新
  const deltaTime = 1 / 60;
  physicsWorld.stepSimulation(deltaTime, 10);

  // Three.js のオブジェクト位置を更新
  for (let i = 0; i < rigidBodies.length; i++) {
    const objThree = rigidBodies[i].mesh;
    const objAmmo = rigidBodies[i].body;
    const motionState = objAmmo.getMotionState();
    if (motionState) {
      const transform = new Ammo.btTransform();
      motionState.getWorldTransform(transform);
      const origin = transform.getOrigin();
      const rotation = transform.getRotation();
      objThree.position.set(origin.x(), origin.y(), origin.z());
      objThree.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
    }
  }

  renderer.render(scene, camera);
}
