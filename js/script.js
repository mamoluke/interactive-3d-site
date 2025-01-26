// グローバル変数
let scene, camera, renderer, physicsWorld, rigidBodies = [];

// Ammo.jsの初期化とメイン処理の開始
Ammo().then(function(Ammo) {
    init();
    animate();
});

function init() {
    // シーン作成
    scene = new THREE.Scene();
    
    // カメラ設定
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 40);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // レンダラー設定
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // ライト設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 15, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    setupPhysicsWorld();
    createGround();
    createBalls();

    window.addEventListener('resize', onWindowResize, false);
}

function setupPhysicsWorld() {
    // 物理演算ワールドの設定
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(
        dispatcher, 
        overlappingPairCache, 
        solver, 
        collisionConfiguration
    );
    physicsWorld.setGravity(new Ammo.btVector3(0, -9.81, 0));
}

function createGround() {
    // 地面のジオメトリ作成
    const groundGeometry = new THREE.BoxGeometry(30, 2, 30);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x999999,
        specular: 0x111111,
        shininess: 100
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.receiveShadow = true;
    groundMesh.position.set(0, -1, 0);
    scene.add(groundMesh);

    // 地面の物理ボディ作成
    const groundShape = new Ammo.btBoxShape(new Ammo.btVector3(15, 1, 15));
    const groundTransform = new Ammo.btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new Ammo.btVector3(0, -1, 0));
    
    const mass = 0; // 質量0で固定
    const localInertia = new Ammo.btVector3(0, 0, 0);
    const motionState = new Ammo.btDefaultMotionState(groundTransform);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, groundShape, localInertia);
    const groundBody = new Ammo.btRigidBody(rbInfo);
    
    physicsWorld.addRigidBody(groundBody);
}

function createBalls() {
    // 10個のボールを生成
    for (let i = 0; i < 10; i++) {
        const radius = Math.random() * 0.5 + 0.5;
        const ballGeometry = new THREE.SphereGeometry(radius, 32, 32);
        const ballMaterial = new THREE.MeshPhongMaterial({
            color: Math.random() * 0xffffff,
            specular: 0x333333,
            shininess: 15
        });
        
        const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
        ballMesh.castShadow = true;
        ballMesh.receiveShadow = true;
        
        // ランダムな位置に配置
        const x = Math.random() * 10 - 5;
        const y = Math.random() * 10 + 10;
        const z = Math.random() * 10 - 5;
        ballMesh.position.set(x, y, z);
        
        scene.add(ballMesh);

        // 物理ボディの作成
        const ballShape = new Ammo.btSphereShape(radius);
        const ballTransform = new Ammo.btTransform();
        ballTransform.setIdentity();
        ballTransform.setOrigin(new Ammo.btVector3(x, y, z));
        
        const mass = 1;
        const localInertia = new Ammo.btVector3(0, 0, 0);
        ballShape.calculateLocalInertia(mass, localInertia);
        
        const motionState = new Ammo.btDefaultMotionState(ballTransform);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, ballShape, localInertia);
        const ballBody = new Ammo.btRigidBody(rbInfo);
        
        physicsWorld.addRigidBody(ballBody);
        rigidBodies.push({ mesh: ballMesh, body: ballBody });
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // 物理演算の更新
    physicsWorld.stepSimulation(1 / 60, 10);
    
    // 物理オブジェクトの位置を更新
    for (let i = 0; i < rigidBodies.length; i++) {
        const objThree = rigidBodies[i].mesh;
        const objAmmo = rigidBodies[i].body;
        const ms = objAmmo.getMotionState();
        if (ms) {
            const transform = new Ammo.btTransform();
            ms.getWorldTransform(transform);
            const p = transform.getOrigin();
            const q = transform.getRotation();
            objThree.position.set(p.x(), p.y(), p.z());
            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }
    }
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
