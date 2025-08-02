// Initialize the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// Set up camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Set up renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
const container = document.getElementById('canvas-container');
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Add orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Load 3D camera model
const loader = new THREE.GLTFLoader();
loader.load(
    'models/camera.glb',
    function (gltf) {
        const model = gltf.scene;
        model.scale.set(1.5, 1.5, 1.5);
        model.position.y = -0.5;
        scene.add(model);
    },
    undefined,
    function (error) {
        console.error('Error loading model:', error);
        // Fallback: create a simple camera model
        createFallbackCamera();
    }
);

function createFallbackCamera() {
    const bodyGeo = new THREE.CylinderGeometry(1, 1, 1.5, 32);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    
    const lensGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const lensMat = new THREE.MeshPhongMaterial({ 
        color: 0x0066ff, 
        transparent: true, 
        opacity: 0.7 
    });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.z = 1;
    
    const group = new THREE.Group();
    group.add(body);
    group.add(lens);
    scene.add(group);
}

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
animate();