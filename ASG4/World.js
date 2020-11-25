var VSHADER_SOURCE = `
precision mediump float;

attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec2 a_UV;
attribute vec3 a_Normal;

varying vec4 v_Color;
varying vec2 v_UV;
varying vec3 v_Normal;
varying vec4 v_VertexPos;

uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_NormalMatrix;

void main() {
    v_Color = a_Color;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_VertexPos = u_ModelMatrix * a_Position;
}`;

// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;

varying vec4 v_Color;
varying vec2 v_UV;
varying vec3 v_Normal;
varying vec4 v_VertexPos;

uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;
uniform sampler2D u_Sampler3;
uniform sampler2D u_Sampler4;
uniform sampler2D u_Sampler5;
uniform sampler2D u_Sampler6;
uniform sampler2D u_Sampler7;
uniform int u_whichTexture;
uniform vec3 u_lightPos;
uniform vec3 u_cameraPos;
uniform bool u_lightOn;

void main() {
    
    if(u_whichTexture == -3) {
        gl_FragColor =  vec4((v_Normal+1.0)/2.0,1.0);

    } else if(u_whichTexture == -2) {
        gl_FragColor =  v_Color;

    } else if(u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV,1.0,1.0);

    } else if(u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);

    }else if(u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);

    }else if(u_whichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);

    }else if(u_whichTexture == 3) {
        gl_FragColor = texture2D(u_Sampler3, v_UV);

    }else if(u_whichTexture == 4) {
        gl_FragColor = texture2D(u_Sampler4, v_UV);

    }else if(u_whichTexture == 5) {
        gl_FragColor = texture2D(u_Sampler5, v_UV);

    }else if(u_whichTexture == 6) {
        gl_FragColor = texture2D(u_Sampler6, v_UV);

    }else if(u_whichTexture == 7) {
        gl_FragColor = texture2D(u_Sampler7, v_UV);

    } else {
        gl_FragColor = vec4(1,.2,.2,1);

    }

    vec3 lightVector =  u_lightPos - vec3(v_VertexPos);
    float r = length(lightVector);

    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);
    
    vec3 R = reflect(L, N);
    vec3 E = normalize(vec3(v_VertexPos) - u_cameraPos);

    vec3 spec = vec3(gl_FragColor) * pow(max(dot(E,R), 0.0), 5.0);
    vec3 diff = vec3(gl_FragColor) * nDotL * 0.7;
    vec3 amb = vec3(gl_FragColor) * 0.3;
    if(u_lightOn) {
        if (u_whichTexture != 1) {
            gl_FragColor = vec4(spec + diff+amb, 1.0);
        }
    }
    
}`;

// All Global Variables Here
let canvas;         // The canvas where things are being drawn
let gl;             // The WebGL variable used to control the page
let a_Position;     // A GLSL variable used to store the location of the point drawn
let a_Color;
let a_Normal;
let a_UV;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;
let u_Sampler6;
let u_Sampler7;
let u_lightPos;
let u_cameraPos;
let u_lightOn;

let u_ModelMatrix;    // A GLSL uniform shader variable that allows the size to change.
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_NormalMatrix;
let u_whichTexture;

let do_time = false;
let doNormals = false;

let g_lightPos = [0, 32, -2];
let g_lightOn = true;

let camera;
let light;

function main() {

    // Create canvas and setup WebGL
    setUpCanvas();

    // Initialize Shaders for WEBGL
    initAllShaders();

    // Register function (event handler) to be called on a mouse press
    setUpAllEvents();

    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0, 0, 1);
    initTextures();

    light = new Sphere(rgbaList(255, 255, 0));
    camera = new Camera();
    document.onkeydown = keydown;

    // // Clear <canvas>
    canvas.onclick = function () {
        canvas.requestPointerLock();
    };

    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

}

function lockChangeAlert() {
    if (document.pointerLockElement === canvas ||
        document.mozPointerLockElement === canvas) {
        document.addEventListener("mousemove", updatePosition, false);
    } else {
        document.removeEventListener("mousemove", updatePosition, false);
    }
}
function updatePosition(e) {

    camera.pan(-e.movementX, -e.movementY);
    renderAllShapes();

}

// Initialize Canvas/WebGl to start
function setUpCanvas() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    canvas.requestPointerLock = canvas.requestPointerLock ||
        canvas.mozRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock;

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl" || "experimental-webgl", { preserveDrawingBuffer: true });
    gl.enable(gl.BLEND)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

// Initialize shaders and all variables for GLSL
function initAllShaders() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of a_Color
    a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return;
    }

    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }


    // Get the storage location of u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    // Get the storage location of u_ViewMatrix
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {
        console.log('Failed to get the storage location of u_NormalMatrix');
        return;
    }

    // Get the storage location of u_ViewMatrix
    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log('Failed to get the storage location of u_lightPos');
        return;
    }

    // Get the storage location of u_ViewMatrix
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log('Failed to get the storage location of u_cameraPos');
        return;
    }

    // Get the storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return;
    }

    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
        console.log('Failed to get the storage location of u_Sampler3');
        return;
    }

    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    if (!u_Sampler4) {
        console.log('Failed to get the storage location of u_Sampler4');
        return;
    }

    u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
    if (!u_Sampler5) {
        console.log('Failed to get the storage location of u_Sampler5');
        return;
    }

    u_Sampler6 = gl.getUniformLocation(gl.program, 'u_Sampler6');
    if (!u_Sampler6) {
        console.log('Failed to get the storage location of u_Sampler6');
        return;
    }

    u_Sampler7 = gl.getUniformLocation(gl.program, 'u_Sampler7');
    if (!u_Sampler7) {
        console.log('Failed to get the storage location of u_Sampler7');
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
        console.log('Failed to get the storage location of u_lightOn');
        return;
    }


    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, identityM.elements);

}

// All UI actions will be connected here.
function setUpAllEvents() {
    document.getElementById('normalOn').onclick = function () { doNormals = true; renderAllShapes(); };

    document.getElementById('normalOff').onclick = function () { doNormals = false; renderAllShapes(); };

    document.getElementById('lightOn').onclick = function () { g_lightOn = true; renderAllShapes(); };

    document.getElementById('lightOff').onclick = function () { g_lightOn = false; renderAllShapes(); };

    document.getElementById('lightSlideX').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_lightPos[0] = this.value / 10; renderAllShapes(); } });

    document.getElementById('lightSlideY').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_lightPos[1] = this.value / 10; renderAllShapes(); } });

    document.getElementById('lightSlideZ').addEventListener('mousemove', function (ev) { if (ev.buttons) { g_lightPos[2] = this.value / 10; renderAllShapes(); } });
}

function keydown(ev) {
    switch (ev.keyCode) {
        case 65:
            camera.moveLeft();
            break;
        case 68:
            camera.moveRight();
            break;
        case 87:
            camera.moveForward();
            break;
        case 83:
            camera.moveBackward();
            break;
        case 81:
            camera.panLeft();
            break;
        case 69:
            camera.panRight();
            break;
        case 189:
            do_time = !do_time;
            break;
        case 32:
            // go up
            camera.moveUp();
            break;
        case 16:
            // go down
            camera.moveDown();
            break;
        default:
            break;
    }
    renderAllShapes();
}

// Get Point in WebGL form, not normal canvas
function coordsToWebGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return [x, y];
}

// Goes through the global lists and renders all points on the page

function renderAllShapes() {

    // Clear <canvas>
    let startTime = performance.now();
    let projMat = camera.projectionMatrix;
    let viewMat = camera.viewMatrix;

    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

    gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
    gl.uniform1i(u_lightOn, g_lightOn);

    light.matrix.setIdentity();
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-.5, -.5, -.5);
    light.matrix.translate(-.5, -.5, - .5);
    light.render();

    drawBase();
    drawMap();
    drawDog();
    if (do_time) {
        var dur = performance.now() - startTime;
        sendTextToHTML('MS: ' + Math.floor(dur) + " Blocks: " + baseBlocks.length + worldBlocks.length, 'fps');
    }

}

function tick() {
    renderAllShapes();
    requestAnimationFrame(tick);
}

function sendTextToHTML(text, id) {
    obj = document.getElementById(id);
    if (!obj) {
        return;
    }
    obj.innerHTML = text;
}

function rgbaList(r, g, b, a = 1) {
    return [r / 255, g / 255, b / 255, a]
}

function initTextures() {
    var image0 = new Image();  // Create the image object
    var image1 = new Image();
    var image2 = new Image();
    var image3 = new Image();  // Create the image object
    var image4 = new Image();
    var image5 = new Image();
    var image6 = new Image();
    var image7 = new Image();

    if (!image0 || !image1 || !image2 || !image3 || !image4 || !image5 || !image6 || !image7) {
        console.log('Failed to create the image object');
        return false;
    }
    image0.onload = function () { loadTexture(image0, u_Sampler0, 0); };
    image0.src = "./images/dirt.png";

    image1.onload = function () { loadTexture(image1, u_Sampler1, 1); };
    image1.src = "./images/skybox.png";

    image2.onload = function () { loadTexture(image2, u_Sampler2, 2); };
    image2.src = "./images/ground.png";

    image3.onload = function () { loadTexture(image3, u_Sampler3, 3); };
    image3.src = "./images/rock.png";

    image4.onload = function () { loadTexture(image4, u_Sampler4, 4); };
    image4.src = "./images/maze.png";

    image5.onload = function () { loadTexture(image5, u_Sampler5, 5); };
    image5.src = "./images/dirt.png";

    image6.onload = function () { loadTexture(image6, u_Sampler6, 6); };
    image6.src = "./images/dirt.png";

    image7.onload = function () { loadTexture(image7, u_Sampler7, 7); };
    image7.src = "./images/maze.png";

    return true;
}
var tex1 = false;
function loadTexture(image, sampler, texUnit = 0) {
    let texture = gl.createTexture();   // Create a texture object

    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    switch (texUnit) {
        case 0:
            gl.activeTexture(gl.TEXTURE0);
            break;
        case 1:
            gl.activeTexture(gl.TEXTURE1);
            break;
        case 2:
            gl.activeTexture(gl.TEXTURE2);
            break;
        case 3:
            gl.activeTexture(gl.TEXTURE3);
            break;
        case 4:
            gl.activeTexture(gl.TEXTURE4);
            break;
        case 5:
            gl.activeTexture(gl.TEXTURE5);
            break;
        case 6:
            gl.activeTexture(gl.TEXTURE6);
            break;
        case 7:
            gl.activeTexture(gl.TEXTURE7);
            break;
        default:
            gl.activeTexture(gl.TEXTURE8);
            break;
    }
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(sampler, texUnit);
    renderAllShapes();
}

let g_map = [
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,],
];


let worldBlocks = [];
let baseBlocks = [];
let dogBlocks = [];
function createMap() {
    for (let x = 0; x < 32; ++x) {
        for (let y = 0; y < 32; ++y) {
            if (g_map[y][x] != 0) {
                if (g_map[y][x] == 4) {
                    var block = new Cube();
                    block.textureNum = 3;
                    block.prevColor = 3;
                    block.matrix.translate(y - 15.5, 1.25, x - 15.5);
                    block.matrix.scale(1, 4, 1);
                    worldBlocks.push(block);
                    continue;
                }
                for (let i = 0; i < g_map[y][x]; ++i) {
                    var block = new Cube();
                    block.textureNum = 3;
                    block.prevColor = 3;
                    block.matrix.translate(y - 15.5, i - .25, x - 15.5);
                    worldBlocks.push(block);
                }

            }
        }
    }
}

function drawMap() {
    if (worldBlocks.length == 0) {
        createMap();
    }
    for (let i = 0; i < worldBlocks.length; ++i) {
        worldBlocks[i].textureNum = doNormals ? -3 : worldBlocks[i].prevColor;
        worldBlocks[i].render();
    }
}

function drawBase() {
    if (baseBlocks.length == 0) {
        generateBase();
    }
    for (let i = 0; i < baseBlocks.length; ++i) {
        baseBlocks[i].textureNum = doNormals ? -3 : baseBlocks[i].prevColor;
        baseBlocks[i].render();
    }
}

function drawDog() {
    if (dogBlocks.length == 0) {
        generateDog();
    }
    for (let i = 0; i < dogBlocks.length; ++i) {
        dogBlocks[i].textureNum = doNormals ? -3 : dogBlocks[i].prevColor;
        dogBlocks[i].render();
    }
}

function generateBase() {
    let ground = new Cube();
    ground.textureNum = 2;
    ground.prevColor = 2;
    ground.matrix.translate(0, -.755, 0);
    ground.matrix.scale(64, 0.02, 64);
    ground.matrix.rotate(90, 0, 1, 0);
    ground.render();
    baseBlocks.push(ground);

    let sky = new Cube();
    sky.textureNum = 1;
    sky.prevColor = 1;
    sky.matrix.scale(-1000, -1000, -1000);
    sky.render();
    baseBlocks.push(sky);

    let sphere = new Sphere();
    sphere.textureNum = 2;
    sphere.prevColor = 2;
    sphere.matrix.translate(0, 3, 0);
    // sphere.matrix.scale(2, 2, 2);
    sphere.render();
    baseBlocks.push(sphere);
}

function generateDog() {
    var body = new Cube(rgbaList(190, 187, 187));
    var tail = new Cube(rgbaList(199, 196, 197));
    var mane = new Cube(rgbaList(173, 167, 164));
    var head = new Cube(rgbaList(140, 137, 137));
    var mouth = new Cube(rgbaList(121, 103, 91));
    var snout = new Cube(rgbaList(146, 121, 102));
    var nose = new Cube(rgbaList(13, 14, 16));
    var jaw = new Cube(rgbaList(13, 14, 16));
    var leftEar = new Cube(rgbaList(160, 158, 158));
    var rightEar = new Cube(rgbaList(160, 158, 158));
    var leftIris = new Cube(rgbaList(184, 184, 184));
    var rightIris = new Cube(rgbaList(184, 184, 184));
    var leftPupil = new Cube(rgbaList(13, 14, 16));
    var rightPupil = new Cube(rgbaList(13, 14, 16));
    var flLeg = new Cube(rgbaList(146, 144, 145));
    var frLeg = new Cube(rgbaList(146, 144, 145));
    var blLeg = new Cube(rgbaList(146, 144, 145));
    var brLeg = new Cube(rgbaList(146, 144, 145));
    var boneMid = new Cube(rgbaList(227, 227, 227));
    var boneLT = new Cube(rgbaList(227, 227, 227));
    var boneLB = new Cube(rgbaList(227, 227, 227));
    var boneRT = new Cube(rgbaList(227, 227, 227));
    var boneRB = new Cube(rgbaList(227, 227, 227));
    var earFloofL = new Cube(rgbaList(13, 14, 16));
    var earFloofR = new Cube(rgbaList(13, 14, 16));

    var flToe1 = new Cube(rgbaList(86, 82, 78));
    var flToe2 = new Cube(rgbaList(199, 196, 193));
    var flToe3 = new Cube(rgbaList(86, 82, 78));
    var frToe1 = new Cube(rgbaList(86, 82, 78));
    var frToe2 = new Cube(rgbaList(199, 196, 193));
    var frToe3 = new Cube(rgbaList(86, 82, 78));
    var blToe1 = new Cube(rgbaList(86, 82, 78));
    var blToe2 = new Cube(rgbaList(199, 196, 193));
    var blToe3 = new Cube(rgbaList(86, 82, 78));
    var brToe1 = new Cube(rgbaList(86, 82, 78));
    var brToe2 = new Cube(rgbaList(199, 196, 193));
    var brToe3 = new Cube(rgbaList(86, 82, 78));

    var flFoot = new Cube(rgbaList(130, 125, 128));
    var frFoot = new Cube(rgbaList(130, 125, 128));
    var blFoot = new Cube(rgbaList(130, 125, 128));
    var brFoot = new Cube(rgbaList(130, 125, 128));

    body.matrix.setIdentity();
    body.matrix.scale(.4, .4, .8);
    body.render();

    tail.matrix.setIdentity();
    tail.matrix.rotate(-10, 1, 0, 0);
    tail.matrix.scale(.125, .125, .5);
    tail.matrix.translate(0, 0, 1.25);
    tail.render();

    mane.matrix.setIdentity();
    mane.matrix.set(body.matrix);
    mane.matrix.scale(1.2, 1.2, .35);
    mane.matrix.translate(0, 0, -1.5);
    mane.render();

    head.matrix.setIdentity();
    head.matrix.set(mane.matrix);
    head.matrix.scale(.8, .8, .5);
    head.matrix.translate(0, 0, -1.5);
    head.render();

    mouth.matrix.setIdentity();
    mouth.matrix.set(head.matrix);
    mouth.matrix.scale(1.021, .5001, 1);
    mouth.matrix.translate(0, -.5005, -0.002);
    mouth.render();

    snout.matrix.setIdentity();
    snout.matrix.set(head.matrix);
    snout.matrix.scale(.5001, .5001, 1);
    snout.matrix.translate(0, -0.5005, -1.0002);
    snout.render();

    nose.matrix.setIdentity();
    nose.matrix.set(snout.matrix);
    nose.matrix.scale(.5001, .5001, .5001);
    nose.matrix.translate(0, .52, -.65);
    nose.render();

    jaw.matrix.setIdentity();
    jaw.matrix.set(snout.matrix);
    jaw.matrix.scale(1.003, .3001, 1.003);
    jaw.matrix.translate(0, -1.005, 0);
    jaw.render();


    leftEar.matrix.setIdentity();
    leftEar.matrix.set(head.matrix);
    leftEar.matrix.scale(.33, .5, .33);
    leftEar.matrix.translate(-1, 1.125, 1);
    leftEar.render();

    rightEar.matrix.setIdentity();
    rightEar.matrix.set(head.matrix);
    rightEar.matrix.scale(.33, .5, .33);
    rightEar.matrix.translate(1, 1.125, 1);
    rightEar.render();

    earFloofL.matrix.setIdentity();
    earFloofL.matrix.set(leftEar.matrix);
    earFloofL.matrix.scale(.33, .5, .33);
    earFloofL.matrix.translate(0, 0, -1.5);
    earFloofL.render();

    earFloofR.matrix.setIdentity();
    earFloofR.matrix.set(rightEar.matrix);
    earFloofR.matrix.scale(.33, .5, .33);
    earFloofR.matrix.translate(0, 0, -1.5);
    earFloofR.render();

    leftIris.matrix.setIdentity();
    leftIris.matrix.set(head.matrix);
    leftIris.matrix.scale(.33, .2, .33);
    leftIris.matrix.translate(-1, .5, -1.5);
    leftIris.render();

    rightIris.matrix.setIdentity();
    rightIris.matrix.set(head.matrix);
    rightIris.matrix.scale(.33, .2, .33);
    rightIris.matrix.translate(1, 0.5, -1.5);
    rightIris.render();

    leftPupil.matrix.setIdentity();
    leftPupil.matrix.set(leftIris.matrix);
    leftPupil.matrix.scale(.503, 1.003, .503);
    leftPupil.matrix.translate(.5, 0, -1);
    leftPupil.render();

    rightPupil.matrix.setIdentity();
    rightPupil.matrix.set(rightIris.matrix);
    rightPupil.matrix.scale(.503, 1.003, .503);
    rightPupil.matrix.translate(-.5, 0, -1);
    rightPupil.render();

    flLeg.matrix.setIdentity();
    flLeg.matrix.set(body.matrix);
    flLeg.matrix.scale(.33, 1, .15);
    flLeg.matrix.translate(-.8, -.9, -1.5);
    flLeg.render();

    flFoot.matrix.setIdentity();
    flFoot.matrix.set(flLeg.matrix);
    flFoot.matrix.scale(1.01, .15, 1.4);
    flFoot.matrix.translate(0, -3.25, -0.1);
    flFoot.render();

    flToe1.matrix.setIdentity();
    flToe1.matrix.set(flFoot.matrix);
    flToe1.matrix.scale(.33, .8, .33);
    flToe1.matrix.translate(-1, -0.2, -1.9);
    flToe1.render();

    flToe2.matrix.setIdentity();
    flToe2.matrix.set(flFoot.matrix);
    flToe2.matrix.scale(.33, .8, .33);
    flToe2.matrix.translate(0, -0.2, -1.7);
    flToe2.render();

    flToe3.matrix.setIdentity();
    flToe3.matrix.set(flFoot.matrix);
    flToe3.matrix.scale(.33, .8, .33);
    flToe3.matrix.translate(1, -0.2, -1.9);
    flToe3.render();

    frLeg.matrix.setIdentity();
    frLeg.matrix.set(body.matrix);
    frLeg.matrix.scale(.33, 1, .15);
    frLeg.matrix.translate(.8, -.9, -1.5);
    frLeg.render();

    frFoot.matrix.setIdentity();
    frFoot.matrix.set(frLeg.matrix);
    frFoot.matrix.scale(1.01, .15, 1.4);
    frFoot.matrix.translate(0, -3.25, -0.1);
    frFoot.render();

    frToe1.matrix.setIdentity();
    frToe1.matrix.set(frFoot.matrix);
    frToe1.matrix.scale(.33, .8, .33);
    frToe1.matrix.translate(-1, -0.2, -1.9);
    frToe1.render();

    frToe2.matrix.setIdentity();
    frToe2.matrix.set(frFoot.matrix);
    frToe2.matrix.scale(.33, .8, .33);
    frToe2.matrix.translate(0, -0.2, -1.7);
    frToe2.render();

    frToe3.matrix.setIdentity();
    frToe3.matrix.set(frFoot.matrix);
    frToe3.matrix.scale(.33, .8, .33);
    frToe3.matrix.translate(1, -0.2, -1.9);
    frToe3.render();

    blLeg.matrix.setIdentity();
    blLeg.matrix.set(body.matrix);
    blLeg.matrix.scale(.33, 1, .15);
    blLeg.matrix.translate(-.8, -.9, 2.5);
    blLeg.render();

    blFoot.matrix.setIdentity();
    blFoot.matrix.set(blLeg.matrix);
    blFoot.matrix.scale(1.01, .15, 1.4);
    blFoot.matrix.translate(0, -3.25, -0.1);
    blFoot.render();

    blToe1.matrix.setIdentity();
    blToe1.matrix.set(blFoot.matrix);
    blToe1.matrix.scale(.33, .8, .33);
    blToe1.matrix.translate(-1, -0.2, -1.9);
    blToe1.render();

    blToe2.matrix.setIdentity();
    blToe2.matrix.set(blFoot.matrix);
    blToe2.matrix.scale(.33, .8, .33);
    blToe2.matrix.translate(0, -0.2, -1.7);
    blToe2.render();

    blToe3.matrix.setIdentity();
    blToe3.matrix.set(blFoot.matrix);
    blToe3.matrix.scale(.33, .8, .33);
    blToe3.matrix.translate(1, -0.2, -1.9);
    blToe3.render();

    brLeg.matrix.setIdentity();
    brLeg.matrix.set(body.matrix);
    brLeg.matrix.scale(.33, 1, .15);
    brLeg.matrix.translate(.8, -.9, 2.5);
    brLeg.render();

    brFoot.matrix.setIdentity();
    brFoot.matrix.set(brLeg.matrix);
    brFoot.matrix.scale(1.01, .15, 1.4);
    brFoot.matrix.translate(0, -3.25, -0.1);
    brFoot.render();

    brToe1.matrix.setIdentity();
    brToe1.matrix.set(brFoot.matrix);
    brToe1.matrix.scale(.33, .8, .33);
    brToe1.matrix.translate(-1, -0.2, -1.9);
    brToe1.render();

    brToe2.matrix.setIdentity();
    brToe2.matrix.set(brFoot.matrix);
    brToe2.matrix.scale(.33, .8, .33);
    brToe2.matrix.translate(0, -0.2, -1.7);
    brToe2.render();

    brToe3.matrix.setIdentity();
    brToe3.matrix.set(brFoot.matrix);
    brToe3.matrix.scale(.33, .8, .33);
    brToe3.matrix.translate(1, -0.2, -1.9);
    brToe3.render();

    boneMid.matrix.setIdentity();
    boneMid.matrix.set(jaw.matrix);
    boneMid.matrix.scale(1.5, .5, .5);
    boneMid.matrix.translate(0, -.1, -.7);


    boneLT.matrix.setIdentity();
    boneLT.matrix.set(boneMid.matrix);
    boneLT.matrix.scale(.25, 1.75, .5);
    boneLT.matrix.translate(-1.75, -.1, -.7);
    boneLT.matrix.rotate(-30, 0, 1, 0);


    boneLB.matrix.setIdentity();
    boneLB.matrix.set(boneMid.matrix);
    boneLB.matrix.scale(.25, 1.75, .5);
    boneLB.matrix.translate(-1.75, -.1, .7);
    boneLB.matrix.rotate(30, 0, 1, 0);


    boneRT.matrix.setIdentity();
    boneRT.matrix.set(boneMid.matrix);
    boneRT.matrix.scale(.25, 1.75, .5);
    boneRT.matrix.translate(1.75, -.1, -.7);
    boneRT.matrix.rotate(30, 0, 1, 0);


    boneRB.matrix.setIdentity();
    boneRB.matrix.set(boneMid.matrix);
    boneRB.matrix.scale(.25, 1.75, .5);
    boneRB.matrix.translate(1.75, -.1, .7);
    boneRB.matrix.rotate(-30, 0, 1, 0);

    boneMid.render();
    boneLT.render();
    boneLB.render();
    boneRT.render();
    boneRB.render();

    dogBlocks.push(
        body, tail, mane, head, mouth,
        snout, nose, jaw, leftEar, rightEar,
        leftIris, rightIris, leftPupil, rightPupil,
        flLeg, frLeg, blLeg, brLeg, boneMid, boneLT, boneLB, boneRT, boneRB, earFloofL, earFloofR, flToe1, flToe2, flToe3, frToe1, frToe2, frToe3, blToe1, blToe2, blToe3, brToe1, brToe2, brToe3, flFoot, frFoot, blFoot, brFoot);
}


/* TWO D MAP:
[68,69, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[67,67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[66,69, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[67,70, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[68,72, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[71,75, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[71,76, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[71,74, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[70,73, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[70,71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[69,68, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[68,67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[67,68, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[67,70, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[68,69, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[69,70, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[68,69, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[67,67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[66,68, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[67,70, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[68,72, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[69,73, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[70,71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[70,71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[69,69, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[70,69, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[70,69, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[71,73, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[72,75, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[73,74, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[71,70, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[68,68, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
[65,66, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],

execute as @a run tellraw @a [{"nbt": "Pos[1]", "entity": "@s"}]
*/