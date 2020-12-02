import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import { OBJLoader2 } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/OBJLoader2.js';
import { MTLLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/MTLLoader.js';
import { MtlObjBridge } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';

let camera;
let scene;
let loader;
let cubes;
let renderer;
let canvas;
function main() {
    canvas = document.querySelector("#webgl");
    renderer = new THREE.WebGLRenderer({
        canvas,
        logarithmicDepthBuffer: true,
    });
    renderer.autoClearColor = false;
    renderer.physicallyCorrectLights = true;
    const fov = 60;

    camera = makeCamera();
    camera.position.set(0, 10, 20);
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    scene = new THREE.Scene();

    {
        const planeSize = 40;
        const loader = new THREE.TextureLoader();
        const texture = loader.load('./resources/images/ground.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
    }


    const geometries = generateGeometries();

    const mtlLoader = new MTLLoader();
    mtlLoader.load('resources/models/windmill/windmill.mtl', (mtlParsedResult) => {
        const objLoader = new OBJLoader2();
        const mat = MtlObjBridge.addMaterialsFromMtlLoader(mtlParsedResult);
        mat.Material.side = THREE.DoubleSide;
        objLoader.addMaterials(mat);
        objLoader.load('resources/models/windmill/windmill.obj', (root) => {
            root.position.set(-10, 0, -10);
            scene.add(root);
        });
    });


    loader = new THREE.TextureLoader();
    const bgTexture = loader.load('resources/images/skybox.jpg', () => {
        const rt = new THREE.WebGLCubeRenderTarget(bgTexture.image.height);
        rt.fromEquirectangularTexture(renderer, bgTexture);

        scene.background = rt;
    });


    cubes = [makeShape(geometries['box'], 0x44aa88, 0, true), makeShape(geometries['sphere'], 0x44aa88, 2, true, 'ground.png'),];

    {
        const color = 0x012c9f;
        const intensity = 1;
        const light = new THREE.SpotLight(color, intensity);
        light.power = 800;
        light.decay = 1;
        light.distance = Infinity;
        light.position.set(20, 10, 20);
        light.target.position.set(0, 0, 0);
        scene.add(light);
        scene.add(light.target);

        const helper = new THREE.SpotLightHelper(light);
        scene.add(helper);

        function updateLight() {
            light.target.updateMatrixWorld();
            helper.update();
        }
        updateLight();
    }
    {
        const color = 0x650b94;
        const intensity = 2;
        const light = new THREE.PointLight(color, intensity);
        light.power = 800;
        light.decay = 1;
        light.distance = Infinity;
        light.position.set(0, 10, 0);
        scene.add(light);

        const helper = new THREE.PointLightHelper(light);
        scene.add(helper);

        function updateLight() {
            helper.update();
        }
        updateLight();
    }
    {
        const color = 0xed0da1;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-20, 10, -20);
        light.target.position.set(2, 0, 0);
        scene.add(light);
        scene.add(light.target);
        const helper = new THREE.DirectionalLightHelper(light);
        scene.add(helper);

        function updateLight() {
            light.target.updateMatrixWorld();
            helper.update();
        }
        updateLight()
    }
    requestAnimationFrame(render);
}

function makeShape(geometry, color, x, loadImage = false, url = "dirt.png") {

    const material = loadImage ? new THREE.MeshPhongMaterial({ map: loader.load("resources/images/" + url) }) : new THREE.MeshPhongMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(2 + x, .5, 0);
    scene.add(cube);

    return cube;
}

function makeCamera(fov = 45) {

    const aspect = canvas.width / canvas.height;
    const near = .1;
    const far = 100;
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
}

function render(time) {
    time *= 0.001;
    // cubes.forEach((cube, ndx) => {
    //     const speed = 1 + ndx * .1;
    //     const rot = time * speed;
    //     cube.rotation.x = rot;
    //     cube.rotation.y = rot;
    // });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

function generateCubes(geometry) {
    let cubes = [
        makeShape(geometry, 0x44aa88, 0, true),
        makeShape(geometry, 0x8844aa, -2, true, "ground.png"),
        makeShape(geometry, 0xaa8844, 2)
    ];
    return cubes;
}


function generateGeometries() {
    let geometries = {};
    const boxSize = 1;
    const coneR = 1;
    const coneH = 1;
    const coneSeg = 27;

    const cylR = 1;
    const cylH = 1;
    const cylSeg = 27;

    const sphR = 1;
    const sphW = 27;
    const sphH = 27;

    const tetR = 1;

    geometries['box'] = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    geometries['cone'] = new THREE.ConeBufferGeometry(coneR, coneH, coneSeg);
    geometries['cylinder'] = new THREE.CylinderBufferGeometry(cylR, cylR, cylH, cylSeg);
    geometries['sphere'] = new THREE.SphereBufferGeometry(sphR, sphW, sphH);
    geometries['tetrahedron'] = new THREE.TetrahedronBufferGeometry(tetR);

    return geometries;
}
main();