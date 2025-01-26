// 基本設定
let scene, camera, renderer, physicsWorld, rigidBodies;
let margin = 0.05;

init();
animate();

function init() {
  // シーンとカメラの作成
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);

  // レンダラーの作成
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webglCanvas') });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 照明
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 10, 10);
  scene.add(light);

  // 物理エンジンの初期化
  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  const overlappingPairCache = new Ammo.btDbvtBroadphase();
  const solver = new Ammo.btSequentialImpulseConstraintSolver();

  physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
  physicsWorld.setGravity(new Ammo.btVector3(0, -9.8, 0));

  rigidBodies = [];

  // 平面の作成
  createFloor();

  // 球体をランダムに生成
  for (let i = 0; i < 10; i++) {
    createSphere(Math.random() * 0.5 + 0.2, { x: Math.random() * 4 - 2, y: 5, z: Math.random() * 4 - 2 });
  }

  // ウィンドウリサイズ対応
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

  // Ammo.js 物理ボディ
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

  // Ammo.js 物理ボディ
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
  const motionState = new Ammo.btDefaultMotionState(transform);

  const colShape = new Ammo.btSphereShape(radius);
  colShape.setMargin(margin);

  const mass = 1;
  const localInertia = new Ammo.btVector3(0, 0, 0);
  colShape.calcul
