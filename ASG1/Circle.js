
class Circle {
    constructor(segments = 10) {
        this.type = 'circle';
        this.pos = [0.0, 0.0, 0.0];
        this.color = [1.0, 0, 0, 1.0];
        this.size = 10.0;
        this.segments = segments;
    }

    render() {
        var xy = this.pos;
        var size = this.size;
        var rgba = this.color;

        // Pass the size to GLSL
        gl.uniform1f(u_PointSize, size);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Draw
        let delta = this.size / 200;
        let angleStep = 360 / this.segments;
        for (var angle = 0; angle < 360; angle += angleStep) {
            let center = [xy[0], xy[1]];
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle * Math.PI / 180) * delta, Math.sin(angle * Math.PI / 180) * delta];
            let vec2 = [Math.cos(angle2 * Math.PI / 180) * delta, Math.sin(angle2 * Math.PI / 180) * delta];
            let pt1 = [center[0] + vec1[0], center[1] + vec1[1]];
            let pt2 = [center[0] + vec2[0], center[1] + vec2[1]];

            drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
        }
    }
};