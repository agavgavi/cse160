import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import { PointerLockControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/PointerLockControls.js';
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
    renderer = new THREE.WebGLRenderer({ canvas, logarithmicDepthBuffer: true, });
    renderer.shadowMap.enabled = true;
    renderer.autoClearColor = false;
    renderer.physicallyCorrectLights = true;

    camera = makeCamera();
    camera.position.set(0, 1, 20);
    const controls = new PointerLockControls(camera, canvas);
    canvas.addEventListener('click', function () { controls.lock(); }, false);

    const onKeyDown = function (event) {
        switch (event.keyCode) {
            case 87: // w
                controls.moveForward(.25)
                break;
            case 65: // a
                controls.moveRight(-.25)
                break;
            case 83: // s
                controls.moveForward(-.25)
                break;
            case 68: // d
                controls.moveRight(.25)
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown, false);

    scene = new THREE.Scene();
    loader = new THREE.TextureLoader();
    createGround();

    const geometries = generateGeometries();

    loadObjects();
    createBackground();


    cubes = createScene(geometries);

    createLights();
    requestAnimationFrame(render);
}

function makeShape(geometry, attribute, x, doRot = true) {

    let material;
    if (typeof (attribute) === 'string') {
        material = new THREE.MeshPhongMaterial({ map: loader.load("resources/images/" + attribute) });
    } else if (typeof (attribute) === 'number') {
        material = new THREE.MeshPhongMaterial({ attribute });
    }
    const shapeObj = {};
    const shape = new THREE.Mesh(geometry, material);
    shape.castShadow = true;
    shape.receiveShadow = true;
    shape.position.set(2 + x, .5, 0);
    scene.add(shape);
    shapeObj['obj'] = shape;
    shapeObj['doRot'] = doRot;
    return shapeObj;
}

function makeCamera(fov = 45) {

    const aspect = canvas.width / canvas.height;
    const near = .1;
    const far = 100;
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
}

function render(time) {
    time *= 0.001;
    cubes.filter(shapeObj => shapeObj['doRot']).forEach((shapeObj, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        shapeObj['obj'].rotation.x = rot;
        shapeObj['obj'].rotation.y = rot;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
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

function loadObjects() {
    const objListC = [
        new Obj3D('windmill', [-10, 0, -10]),
        new Obj3D('astronaut', [5, 0, -5]),
        new Obj3D('telescope', [3, 1, -5]),
        new Obj3D('satellite', [-6, 0, 2.5], .2),
    ]
    objListC.forEach(function (value) {
        createObj(value.name, value.pos, value.scale);
    });

    // Astronaut model designed by Poly by Google: https://poly.google.com/view/dLHpzNdygsg
    // Telescope model designed by Don Carson: https://poly.google.com/view/3HJCpDzBQEw
    // Satellite Dish model designed by Poly by Google: https://poly.google.com/view/5iVbfDhRnN7

}

function createObj(path, pos, scale = [1, 1, 1]) {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(`resources/models/${path}/${path}.mtl`, (mtlParsedResult) => {
        const objLoader = new OBJLoader2();
        const mat = MtlObjBridge.addMaterialsFromMtlLoader(mtlParsedResult);
        objLoader.addMaterials(mat);
        objLoader.load(`resources/models/${path}/${path}.obj`, (root) => {
            root.position.set(pos[0], pos[1], pos[2]);
            root.scale.set(scale[0], scale[1], scale[2]);
            root.traverse((child) => {
                child.castShadow = true;
                child.receiveShadow = true;
            });
            scene.add(root);
        });
    });
}

function createLights() {
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
        light.castShadow = true;
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
}

function createGround(planeSize = 40) {
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
    mesh.receiveShadow = true;
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);
}

function createBackground() {
    const bgTexture = loader.load('resources/images/skybox.jpg', () => {
        const rt = new THREE.WebGLCubeRenderTarget(bgTexture.image.height);
        rt.fromEquirectangularTexture(renderer, bgTexture);

        scene.background = rt;
        scene.fog = new THREE.FogExp2('lightblue', .06, 100);
    });
}


function createScene(geometries) {
    return [makeShape(geometries['box'], "rock.png", 0), makeShape(geometries['sphere'], 'ground.png', 2, false), makeShape(geometries['sphere'], 0x44aa88, 4, false)];
}


class Obj3D {
    constructor(name, pos = [0, 0, 0], scale = 1) {
        this.name = name;
        this.pos = pos;
        this.scale = [scale, scale, scale];
    }
};

main();