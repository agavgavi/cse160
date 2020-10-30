
class Cube {
    constructor() {
        this.type = 'circle';
        // this.pos = [0, 0, 0];
        this.color = [1, 0, 0, 1];
        // this.size = 10;
        // this.segments = segments;
        this.matrix = new Matrix4();
    }

    render() {
        // var xy = this.pos;
        // var size = this.size;
        var rgba = this.color;

        // Pass the size to GLSL
        // gl.uniform4f(u_PointSize, size);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Draw

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        // FRONT -----------------------------------------------------
        drawTriangle3D([0, 0, 0, 1, 1, 0, 1, 0, 0]);
        drawTriangle3D([0, 0, 0, 0, 1, 0, 1, 1, 0]);

        // BACK -----------------------------------------------------
        drawTriangle3D([0, 0, 1, 1, 1, 1, 1, 0, 1]);
        drawTriangle3D([0, 0, 1, 0, 1, 1, 1, 1, 1]);

        // LEFT -----------------------------------------------------
        drawTriangle3D([0, 0, 0, 1, 1, 0, 1, 0, 0]);
        drawTriangle3D([0, 0, 0, 0, 1, 0, 1, 1, 0]);

        // RIGHT -----------------------------------------------------
        drawTriangle3D([0, 0, 0, 1, 1, 0, 1, 0, 0]);
        drawTriangle3D([0, 0, 0, 0, 1, 0, 1, 1, 0]);

        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
        // UP -----------------------------------------------------
        drawTriangle3D([0, 1, 0, 1, 1, 1, 1, 1, 0]);
        drawTriangle3D([0, 1, 0, 0, 1, 1, 1, 1, 1]);

        // DOWN -----------------------------------------------------
        drawTriangle3D([0, 0, 0, 1, 0, 1, 1, 0, 0]);
        drawTriangle3D([0, 0, 0, 0, 0, 1, 1, 0, 1]);
    }
};