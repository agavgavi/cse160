import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';

let camera;
let scene;
let loader;
let cubes;
let renderer;
function main() {
    const canvas = document.querySelector("#webgl");
    renderer = new THREE.WebGLRenderer({ canvas });
    const fov = 60;
    const aspect = canvas.width / canvas.height;
    const near = .1;
    const far = 1000;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    scene = new THREE.Scene();

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;

    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    loader = new THREE.TextureLoader();


    cubes = generateCubes(geometry);



    requestAnimationFrame(render);
}

function makeCube(geometry, color, x, loadImage = false, url = "dirt.png") {

    const material = loadImage ? new THREE.MeshPhongMaterial({ map: loader.load("resources/images/" + url) }) : new THREE.MeshPhongMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.position.x = x;

    return cube;
}

function render(time) {
    time *= 0.001;
    cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

function generateCubes(geometry) {
    let cubes = [
        makeCube(geometry, 0x44aa88, 0, true),
        makeCube(geometry, 0x8844aa, -2, true, "ground.png"),
        makeCube(geometry, 0xaa8844, 2)
    ];
    return cubes;
}

main();