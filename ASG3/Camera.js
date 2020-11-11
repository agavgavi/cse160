class Camera {
    constructor() {
        canvas = document.getElementById('webgl');
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
        this.fov = 60;
        this.viewMatrix = new Matrix4().setLookAtV3(this.eye, this.at, this.up);
        this.projectionMatrix = new Matrix4().setPerspective(this.fov, canvas.width / canvas.height, .1, 1000);
        this.f = new Vector3();
    }

    moveForward(speed = 1) {
        let f = this.f;
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(speed);
        this.eye.add(f);
        this.at.add(f);
        this.viewMatrix = this.viewMatrix.setLookAtV3(this.eye, this.at, this.up);
    }

    moveBackward(speed = 1) {
        let b = this.f;
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(speed);
        this.eye.add(b);
        this.at.add(b);
        this.viewMatrix = this.viewMatrix.setLookAtV3(this.eye, this.at, this.up);
    }

    moveLeft(speed = 1) {
        let f = this.f;
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
        this.viewMatrix = this.viewMatrix.setLookAtV3(this.eye, this.at, this.up);
    }

    moveRight(speed = 1) {
        let f = this.f;
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
        this.viewMatrix = this.viewMatrix.setLookAtV3(this.eye, this.at, this.up);
    }

    panLeft(alpha = 3) {
        let f = this.f;
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        f_prime.add(this.eye);
        this.at = f_prime;
        this.viewMatrix = this.viewMatrix.setLookAtV3(this.eye, this.at, this.up);
    }

    panRight(alpha = 3) {
        let f = this.f;
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        f_prime.add(this.eye);
        this.at = f_prime;
        this.viewMatrix = this.viewMatrix.setLookAtV3(this.eye, this.at, this.up);
    }

}