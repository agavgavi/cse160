
class Cube {
    constructor(color_list = [1, 0, 0, 1]) {
        this.type = 'cube';
        this.color = color_list;
        this.matrix = new Matrix4();
        this.verticies = new Float32Array([
            // Front 
            -0.5, -0.5, -0.5, this.color[0] * 1, this.color[1] * 1, this.color[2] * 1, this.color[3],
            0.5, 0.5, -0.5, this.color[0] * 1, this.color[1] * 1, this.color[2] * 1, this.color[3],
            0.5, -0.5, -0.5, this.color[0] * 1, this.color[1] * 1, this.color[2] * 1, this.color[3],
            -0.5, -0.5, -0.5, this.color[0] * 1, this.color[1] * 1, this.color[2] * 1, this.color[3],
            -0.5, 0.5, -0.5, this.color[0] * 1, this.color[1] * 1, this.color[2] * 1, this.color[3],
            0.5, 0.5, -0.5, this.color[0] * 1, this.color[1] * 1, this.color[2] * 1, this.color[3],
            // Back
            -0.5, -0.5, 0.5, this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8, this.color[3],
            0.5, 0.5, 0.5, this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8, this.color[3],
            0.5, -0.5, 0.5, this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8, this.color[3],
            -0.5, -0.5, 0.5, this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8, this.color[3],
            -0.5, 0.5, 0.5, this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8, this.color[3],
            0.5, 0.5, 0.5, this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8, this.color[3],
            // Left
            -0.5, -0.5, -0.5, this.color[0] * 0.9, this.color[1] * 0.9, this.color[2] * 0.9, this.color[3],
            -0.5, 0.5, 0.5, this.color[0] * 0.9, this.color[1] * 0.9, this.color[2] * 0.9, this.color[3],
            -0.5, -0.5, 0.5, this.color[0] * 0.9, this.color[1] * 0.9, this.color[2] * 0.9, this.color[3],
            -0.5, -0.5, -0.5, this.color[0] * 0.9, this.color[1] * 0.9, this.color[2] * 0.9, this.color[3],
            -0.5, 0.5, -0.5, this.color[0] * 0.9, this.color[1] * 0.9, this.color[2] * 0.9, this.color[3],
            -0.5, 0.5, 0.5, this.color[0] * 0.9, this.color[1] * 0.9, this.color[2] * 0.9, this.color[3],
            // Right
            0.5, -0.5, -0.5, this.color[0] * 0.7, this.color[1] * 0.7, this.color[2] * 0.7, this.color[3],
            0.5, 0.5, 0.5, this.color[0] * 0.7, this.color[1] * 0.7, this.color[2] * 0.7, this.color[3],
            0.5, -0.5, 0.5, this.color[0] * 0.7, this.color[1] * 0.7, this.color[2] * 0.7, this.color[3],
            0.5, -0.5, -0.5, this.color[0] * 0.7, this.color[1] * 0.7, this.color[2] * 0.7, this.color[3],
            0.5, 0.5, -0.5, this.color[0] * 0.7, this.color[1] * 0.7, this.color[2] * 0.7, this.color[3],
            0.5, 0.5, 0.5, this.color[0] * 0.7, this.color[1] * 0.7, this.color[2] * 0.7, this.color[3],
            // Top
            -0.5, 0.5, -0.5, this.color[0] * 0.95, this.color[1] * 0.95, this.color[2] * 0.95, this.color[3],
            0.5, 0.5, 0.5, this.color[0] * 0.95, this.color[1] * 0.95, this.color[2] * 0.95, this.color[3],
            0.5, 0.5, -0.5, this.color[0] * 0.95, this.color[1] * 0.95, this.color[2] * 0.95, this.color[3],
            -0.5, 0.5, -0.5, this.color[0] * 0.95, this.color[1] * 0.95, this.color[2] * 0.95, this.color[3],
            -0.5, 0.5, 0.5, this.color[0] * 0.95, this.color[1] * 0.95, this.color[2] * 0.95, this.color[3],
            0.5, 0.5, 0.5, this.color[0] * 0.95, this.color[1] * 0.95, this.color[2] * 0.95, this.color[3],
            // Bottom
            -0.5, -0.5, -0.5, this.color[0] * 0.5, this.color[1] * 0.5, this.color[2] * 0.5, this.color[3],
            0.5, -0.5, 0.5, this.color[0] * 0.5, this.color[1] * 0.5, this.color[2] * 0.5, this.color[3],
            0.5, -0.5, -0.5, this.color[0] * 0.5, this.color[1] * 0.5, this.color[2] * 0.5, this.color[3],
            -0.5, -0.5, -0.5, this.color[0] * 0.5, this.color[1] * 0.5, this.color[2] * 0.5, this.color[3],
            -0.5, -0.5, 0.5, this.color[0] * 0.5, this.color[1] * 0.5, this.color[2] * 0.5, this.color[3],
            0.5, -0.5, 0.5, this.color[0] * 0.5, this.color[1] * 0.5, this.color[2] * 0.5, this.color[3]
        ]);
    }

    render() {
        drawCube(this.verticies, this.matrix);
    }

};

function drawCube(verticies, matrix) {

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    let FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, verticies, gl.STATIC_DRAW);

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 7 * FLOAT_SIZE, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 7 * FLOAT_SIZE, 3 * FLOAT_SIZE);
    gl.enableVertexAttribArray(a_Color);

    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, verticies.length / 7);
}


function makeArray(color) {
    return new Float32Array([
        // Front 
        -0.5, -0.5, -0.5, color[0] * 1, color[1] * 1, color[2] * 1, color[3],
        0.5, 0.5, -0.5, color[0] * 1, color[1] * 1, color[2] * 1, color[3],
        0.5, -0.5, -0.5, color[0] * 1, color[1] * 1, color[2] * 1, color[3],
        -0.5, -0.5, -0.5, color[0] * 1, color[1] * 1, color[2] * 1, color[3],
        -0.5, 0.5, -0.5, color[0] * 1, color[1] * 1, color[2] * 1, color[3],
        0.5, 0.5, -0.5, color[0] * 1, color[1] * 1, color[2] * 1, color[3],
        // Back
        -0.5, -0.5, 0.5, color[0] * 0.8, color[1] * 0.8, color[2] * 0.8, color[3],
        0.5, 0.5, 0.5, color[0] * 0.8, color[1] * 0.8, color[2] * 0.8, color[3],
        0.5, -0.5, 0.5, color[0] * 0.8, color[1] * 0.8, color[2] * 0.8, color[3],
        -0.5, -0.5, 0.5, color[0] * 0.8, color[1] * 0.8, color[2] * 0.8, color[3],
        -0.5, 0.5, 0.5, color[0] * 0.8, color[1] * 0.8, color[2] * 0.8, color[3],
        0.5, 0.5, 0.5, color[0] * 0.8, color[1] * 0.8, color[2] * 0.8, color[3],
        // Left
        -0.5, -0.5, -0.5, color[0] * 0.9, color[1] * 0.9, color[2] * 0.9, color[3],
        -0.5, 0.5, 0.5, color[0] * 0.9, color[1] * 0.9, color[2] * 0.9, color[3],
        -0.5, -0.5, 0.5, color[0] * 0.9, color[1] * 0.9, color[2] * 0.9, color[3],
        -0.5, -0.5, -0.5, color[0] * 0.9, color[1] * 0.9, color[2] * 0.9, color[3],
        -0.5, 0.5, -0.5, color[0] * 0.9, color[1] * 0.9, color[2] * 0.9, color[3],
        -0.5, 0.5, 0.5, color[0] * 0.9, color[1] * 0.9, color[2] * 0.9, color[3],
        // Right
        0.5, -0.5, -0.5, color[0] * 0.7, color[1] * 0.7, color[2] * 0.7, color[3],
        0.5, 0.5, 0.5, color[0] * 0.7, color[1] * 0.7, color[2] * 0.7, color[3],
        0.5, -0.5, 0.5, color[0] * 0.7, color[1] * 0.7, color[2] * 0.7, color[3],
        0.5, -0.5, -0.5, color[0] * 0.7, color[1] * 0.7, color[2] * 0.7, color[3],
        0.5, 0.5, -0.5, color[0] * 0.7, color[1] * 0.7, color[2] * 0.7, color[3],
        0.5, 0.5, 0.5, color[0] * 0.7, color[1] * 0.7, color[2] * 0.7, color[3],
        // Top
        -0.5, 0.5, -0.5, color[0] * 0.95, color[1] * 0.95, color[2] * 0.95, color[3],
        0.5, 0.5, 0.5, color[0] * 0.95, color[1] * 0.95, color[2] * 0.95, color[3],
        0.5, 0.5, -0.5, color[0] * 0.95, color[1] * 0.95, color[2] * 0.95, color[3],
        -0.5, 0.5, -0.5, color[0] * 0.95, color[1] * 0.95, color[2] * 0.95, color[3],
        -0.5, 0.5, 0.5, color[0] * 0.95, color[1] * 0.95, color[2] * 0.95, color[3],
        0.5, 0.5, 0.5, color[0] * 0.95, color[1] * 0.95, color[2] * 0.95, color[3],
        // Bottom
        -0.5, -0.5, -0.5, color[0] * 0.5, color[1] * 0.5, color[2] * 0.5, color[3],
        0.5, -0.5, 0.5, color[0] * 0.5, color[1] * 0.5, color[2] * 0.5, color[3],
        0.5, -0.5, -0.5, color[0] * 0.5, color[1] * 0.5, color[2] * 0.5, color[3],
        -0.5, -0.5, -0.5, color[0] * 0.5, color[1] * 0.5, color[2] * 0.5, color[3],
        -0.5, -0.5, 0.5, color[0] * 0.5, color[1] * 0.5, color[2] * 0.5, color[3],
        0.5, -0.5, 0.5, color[0] * 0.5, color[1] * 0.5, color[2] * 0.5, color[3]
    ]);
}