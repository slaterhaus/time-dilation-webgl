// Setting up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Creating two cubes
const geometry = new THREE.BoxGeometry(.75, .75, .75);
const material = new THREE.MeshPhongMaterial({color: 0x00ff00});  // use MeshPhongMaterial for better lighting effects

const stationaryCube = new THREE.Mesh(geometry, material);
const movingCube = new THREE.Mesh(geometry, material);
const gravitySphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshPhongMaterial({color: 0xff0000})
);


// Adding the cubes to the scene
scene.add(stationaryCube);
scene.add(movingCube);
scene.add(gravitySphere);

// Positioning the cubes
stationaryCube.position.y = 2;
movingCube.position.y = 0;
movingCube.position.x = -2;


// Adding a directional light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);
// speed of light (c) is 5 units
const c = 5;
// gravitation constant
let g = 1;
// mass of the sphere
let sphereMass = 1;
let staticRotationAcc = 0;
let dilationRotationAcc = 0;

const hudData = {
    staticOrbits: 0,
    dilatedOrbits: 0,
    dilationFactor: 0,
    proximity: 2,
    sphereMass: 1,
};

// Create a GUI and add properties for the cubes' rotation and velocity
const gui = new dat.GUI();
gui.add(hudData, 'staticOrbits').listen();
gui.add(hudData, 'dilatedOrbits').listen();

gui.add(hudData, "dilationFactor").listen();
gui.add(hudData, "sphereMass", 1, 10).listen().onChange(value => {
    g = value;
});
gui.add(hudData, 'proximity', 1, 10).listen().onChange((value) => {
    movingCube.position.x = value;  // Update the X position of movingCube when the slider changes
    movingCube.position.y = 0; // Update all position values so the cub doesn't go flying off into space
    movingCube.position.z = 0;
});

// Animation
function animate() {
    requestAnimationFrame(animate);

    let v, v2;

    // Compute distance of each cube from the center of gravity
    const distanceStationary = gravitySphere.position.distanceTo(stationaryCube.position);
    const distanceMoving = gravitySphere.position.distanceTo(movingCube.position);

    // Apply gravitational time dilation based on the cube's distance from the 'center of gravity'
    const dilation_factor_stationary = Math.sqrt(1 - 2 * g * sphereMass / (distanceStationary * Math.pow(c, 2)));
    const dilation_factor_moving = Math.sqrt(1 - 2 * g * sphereMass / (distanceMoving * Math.pow(c, 2)));

    // Adjust velocity based on dilation factor
    v = 0.01 * dilation_factor_moving;
    v2 = 0.01 * dilation_factor_stationary;

    // Rotating the cubes
    movingCube.rotation.y += v;
    stationaryCube.rotation.y += v2;
    dilationRotationAcc += v;
    staticRotationAcc += v2;

    if (staticRotationAcc >= 2 * Math.PI) {
        hudData.staticOrbits++;
        staticRotationAcc -= 2 * Math.PI;
    }
    if (dilationRotationAcc >= 2 * Math.PI) {
        hudData.dilatedOrbits++;
        dilationRotationAcc -= 2 * Math.PI;
    }

    // Move the cubes around the gravity sphere
    movingCube.position.rotateAround(gravitySphere.position, new THREE.Vector3(0, Math.sin(v), 1), v);
    stationaryCube.position.rotateAround(gravitySphere.position, new THREE.Vector3(0, Math.sin(v2), 1), v2);
    hudData.dilationFactor = dilation_factor_moving * 1000;

    renderer.render(scene, camera);
}

animate();


animate();
