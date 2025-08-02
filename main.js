// Initialize the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// Set up renderer with WebXR support
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.xr.enabled = true; // Enable WebXR
const container = document.getElementById('canvas-container');
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Camera - will be replaced in XR mode
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Load 3D camera model
const loader = new THREE.GLTFLoader();
let cameraModel;

loader.load(
    'models/camera.glb',
    function (gltf) {
        cameraModel = gltf.scene;
        cameraModel.scale.set(1.5, 1.5, 1.5);
        cameraModel.position.y = -0.5;
        scene.add(cameraModel);
        
        // Position for AR/VR
        if (renderer.xr.isPresenting) {
            cameraModel.position.set(0, 0, -2);
        }
    },
    undefined,
    function (error) {
        console.error('Error loading model:', error);
        createFallbackCamera();
    }
);

function createFallbackCamera() {
    const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    
    const lensGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const lensMat = new THREE.MeshPhongMaterial({ 
        color: 0x0066ff, 
        transparent: true, 
        opacity: 0.7 
    });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.z = 0.7;
    
    cameraModel = new THREE.Group();
    cameraModel.add(body);
    cameraModel.add(lens);
    scene.add(cameraModel);
}

// WebXR Button
document.body.appendChild(THREE.WebXR.createButton(renderer));

// Handle XR session start/end
renderer.xr.addEventListener('sessionstart', () => {
    if (cameraModel) {
        cameraModel.position.set(0, 0, -2); // Position in front of user
        cameraModel.scale.set(1, 1, 1);
    }
});

renderer.xr.addEventListener('sessionend', () => {
    if (cameraModel) {
        cameraModel.position.y = -0.5;
        cameraModel.scale.set(1.5, 1.5, 1.5);
    }
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
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);