let physicsWorld;
let scene, camera, renderer;
let rigidBodies = [];

// ページ読み込み時に実行
Ammo().then(start);

function start() {
    setupGraphics();
    setupPhysics();
    createObjects();
    animate();
}

function setupGraphics() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 5000);
    camera.position.set(0, 30, 70);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-10, 30, 20);
    light.castShadow = true;
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x707070));
}

function setupPhysics() {
    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    let dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    let broadphase = new Ammo.btDbvtBroadphase();
    let solver = new Ammo.btSequentialImpulseConstraintSolver();
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -50, 0));
}

function createObjects() {
    // 床を作成
    let pos = { x: 0, y: 0, z: 0 };
    let scale = { x: 50, y: 2, z: 50 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;

    let blockPlane = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshPhongMaterial({ color: 0xa0afa4 })
    );
    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);
    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;
    scene.add(blockPlane);

    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);
    physicsWorld.addRigidBody(body);

    // 球を作成
    for (let i = 0; i < 20; i++) {
        let ball = createBall();
        ball.position.set(
            Math.random() * 20 - 10,
            20 + Math.random() * 20,
            Math.random() * 20 - 10
        );
    }
}

function createBall() {
    let pos = { x: 0, y: 0, z: 0 };
    let radius = 2;
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 1;

    let ball = new THREE.Mesh(
        new THREE.SphereGeometry(radius),
        new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff })
    );
    ball.position.set(pos.x, pos.y, pos.z);
    ball.castShadow = true;
    ball.receiveShadow = true;
    scene.add(ball);

    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btSphereShape(radius);
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);

    physicsWorld.addRigidBody(body);
    rigidBodies.push({ mesh: ball, body: body });
    return ball;
}

function animate() {
    requestAnimationFrame(animate);
    let deltaTime = 1.0 / 60.0;
    updatePhysics(deltaTime);
    renderer.render(scene, camera);
}

function updatePhysics(deltaTime) {
    physicsWorld.stepSimulation(deltaTime, 10);
    for (let i = 0; i < rigidBodies.length; i++) {
        let objThree = rigidBodies[i].mesh;
        let objAmmo = rigidBodies[i].body;
        let ms = objAmmo.getMotionState();
        if (ms) {
            ms.getWorldTransform(tmpTrans);
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set(p.x(), p.y(), p.z());
            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }
    }
}

let tmpTrans = new Ammo.btTransform();
