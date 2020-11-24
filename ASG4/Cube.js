class Cube {
    constructor(color_list = [1, 0, 0, 1]) {
        this.type = 'cube';
        this.color = color_list;
        this.matrix = new Matrix4();
        this.textureNum = -2;

        // Break down of information per line
        // 0-2: XYZ
        // 3-4: UV
        // 5-8: RGBA
        this.verticies = generateVerticies(this.color);
    }

    render() {
        drawCube(this.verticies, this.matrix, this.textureNum);
    }

};
var vertexBuffer = null;
function drawCube(verticies, matrix, texNum) {

    if (vertexBuffer == null) {
        initCubeBuffer();
    }

    gl.bufferData(gl.ARRAY_BUFFER, verticies, gl.STATIC_DRAW);
    gl.uniform1i(u_whichTexture, texNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, verticies.length / 9);
}

function initCubeBuffer() {

    // Create a buffer object
    vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    let FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);


    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 9 * FLOAT_SIZE, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 9 * FLOAT_SIZE, 3 * FLOAT_SIZE);
    gl.enableVertexAttribArray(a_UV);

    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 9 * FLOAT_SIZE, 5 * FLOAT_SIZE);
    gl.enableVertexAttribArray(a_Color);
}

function generateVerticies(color) {
    // Break down of information per line
    // 0-2: XYZ
    // 3-4: UV
    // 5-8: RGBA
    let verticies = new Float32Array([
        // Front 
        -0.5, -0.5, -0.5, 0, 0, color[0], color[1], color[2], color[3],
        0.5, 0.5, -0.5, 1, 1, color[0], color[1], color[2], color[3],
        0.5, -0.5, -0.5, 1, 0, color[0], color[1], color[2], color[3],
        -0.5, -0.5, -0.5, 0, 0, color[0], color[1], color[2], color[3],
        -0.5, 0.5, -0.5, 0, 1, color[0], color[1], color[2], color[3],
        0.5, 0.5, -0.5, 1, 1, color[0], color[1], color[2], color[3],
        // Back
        -0.5, -0.5, 0.5, 0, 0, color[0], color[1], color[2], color[3],
        0.5, 0.5, 0.5, 1, 1, color[0], color[1], color[2], color[3],
        0.5, -0.5, 0.5, 1, 0, color[0], color[1], color[2], color[3],
        -0.5, -0.5, 0.5, 0, 0, color[0], color[1], color[2], color[3],
        -0.5, 0.5, 0.5, 0, 1, color[0], color[1], color[2], color[3],
        0.5, 0.5, 0.5, 1, 1, color[0], color[1], color[2], color[3],
        // Left
        -0.5, -0.5, -0.5, 0, 0, color[0], color[1], color[2], color[3],
        -0.5, 0.5, 0.5, 1, 1, color[0], color[1], color[2], color[3],
        -0.5, -0.5, 0.5, 1, 0, color[0], color[1], color[2], color[3],
        -0.5, -0.5, -0.5, 0, 0, color[0], color[1], color[2], color[3],
        -0.5, 0.5, -0.5, 0, 1, color[0], color[1], color[2], color[3],
        -0.5, 0.5, 0.5, 1, 1, color[0], color[1], color[2], color[3],
        // Right
        0.5, -0.5, -0.5, 0, 0, color[0], color[1], color[2], color[3],
        0.5, 0.5, 0.5, 1, 1, color[0], color[1], color[2], color[3],
        0.5, -0.5, 0.5, 1, 0, color[0], color[1], color[2], color[3],
        0.5, -0.5, -0.5, 0, 0, color[0], color[1], color[2], color[3],
        0.5, 0.5, -0.5, 0, 1, color[0], color[1], color[2], color[3],
        0.5, 0.5, 0.5, 1, 1, color[0], color[1], color[2], color[3],
        // Top
        -0.5, 0.5, -0.5, 0, 0, color[0], color[1], color[2], color[3],
        0.5, 0.5, 0.5, 1, 1, color[0], color[1], color[2], color[3],
        0.5, 0.5, -0.5, 1, 0, color[0], color[1], color[2], color[3],
        -0.5, 0.5, -0.5, 0, 0, color[0], color[1], color[2], color[3],
        -0.5, 0.5, 0.5, 0, 1, color[0], color[1], color[2], color[3],
        0.5, 0.5, 0.5, 1, 1, color[0], color[1], color[2], color[3],
        // Bottom
        -0.5, -0.5, -0.5, 0, 0, color[0], color[1], color[2], color[3],
        0.5, -0.5, 0.5, 1, 1, color[0], color[1], color[2], color[3],
        0.5, -0.5, -0.5, 1, 0, color[0], color[1], color[2], color[3],
        -0.5, -0.5, -0.5, 0, 0, color[0], color[1], color[2], color[3],
        -0.5, -0.5, 0.5, 0, 1, color[0], color[1], color[2], color[3],
        0.5, -0.5, 0.5, 1, 1, color[0], color[1], color[2], color[3]
    ]);
    return verticies;
}