// Initialize the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8f9fa);

// Set up renderer with WebXR support
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
});
renderer.xr.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;

const container = document.getElementById('canvas-container');
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio || 1);
container.appendChild(renderer.domElement);

// Enhanced lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight1.position.set(5, 10, 7);
directionalLight1.castShadow = true;
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight2.position.set(-5, 5, -5);
scene.add(directionalLight2);

const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
scene.add(hemisphereLight);

// Camera setup
let camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 2;

// Controls
let controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI;
controls.minDistance = 0.5;
controls.maxDistance = 10;

// Model loading
const loader = new THREE.GLTFLoader();
let cameraModel;

// Show loading indicator
const loadingIndicator = document.getElementById('loader');

loader.load(
    'models/insta360_one_x2.glb',
    function (gltf) {
        cameraModel = gltf.scene;
        
        // Adjust model scale and position
        cameraModel.scale.set(0.3, 0.3, 0.3);
        cameraModel.position.y = -0.1;
        
        // Enable shadows for all meshes
        cameraModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        scene.add(cameraModel);
        
        // Hide loading indicator
        loadingIndicator.style.opacity = '0';
        setTimeout(() => loadingIndicator.style.display = 'none', 500);
    },
    undefined,
    function (error) {
        console.error('Error loading model:', error);
        loadingIndicator.textContent = 'Error loading 3D model. Showing fallback.';
        createFallbackCamera();
    }
);

function createFallbackCamera() {
    // Main body (sphere)
    const bodyGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const bodyMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x2c3e50,
        metalness: 0.7,
        roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    
    // Lens (cylinder)
    const lensGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
    const lensMat = new THREE.MeshPhysicalMaterial({
        color: 0x0066ff,
        transmission: 0.9,
        roughness: 0.1,
        ior: 1.5
    });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.z = 0.45;
    lens.rotation.x = Math.PI / 2;
    
    // Buttons (small spheres)
    const buttonGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const buttonMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const button1 = new THREE.Mesh(buttonGeo, buttonMat);
    button1.position.set(0.3, 0.1, 0.3);
    
    const button2 = new THREE.Mesh(buttonGeo, buttonMat);
    button2.position.set(-0.3, -0.1, 0.3);
    
    cameraModel = new THREE.Group();
    cameraModel.add(body);
    cameraModel.add(lens);
    cameraModel.add(button1);
    cameraModel.add(button2);
    scene.add(cameraModel);
    
    // Hide loading indicator
    loadingIndicator.style.opacity = '0';
    setTimeout(() => loadingIndicator.style.display = 'none', 500);
}

// WebXR Button
document.body.appendChild(THREE.WebXR.createButton(renderer, { 
    requiredFeatures: ['hit-test', 'dom-overlay'],
    domOverlay: { root: document.body }
}));

// Handle XR session
renderer.xr.addEventListener('sessionstart', () => {
    if (cameraModel) {
        cameraModel.position.set(0, 0, -1.5);
        cameraModel.scale.set(0.2, 0.2, 0.2);
    }
    renderer.setPixelRatio(1); // Better performance in XR
});

renderer.xr.addEventListener('sessionend', () => {
    if (cameraModel) {
        cameraModel.position.y = -0.1;
        cameraModel.scale.set(0.3, 0.3, 0.3);
    }
    renderer.setPixelRatio(window.devicePixelRatio || 1);
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);