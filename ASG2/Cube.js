
class Cube {
    constructor(segments = 10) {
        this.type = 'circle';
        // this.pos = [0.0, 0.0, 0.0];
        this.color = [1.0, 0, 0, 1.0];
        // this.size = 10.0;
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
        drawTriangle3D([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0]);
        drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0]);
    }
};