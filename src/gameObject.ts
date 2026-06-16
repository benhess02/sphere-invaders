import { Vec3 } from "./vec3";

export class GameObject {
    position: Vec3;
    xBasis: Vec3;
    yBasis: Vec3;

    constructor() {
        this.position = new Vec3(0, 0, -1);
        this.xBasis = new Vec3(1, 0, 0);
        this.yBasis = new Vec3(0, 1, 0);
    }

    copyFrom(other: GameObject) {
        this.position.copyFrom(other.position);
        this.xBasis.copyFrom(other.xBasis);
        this.yBasis.copyFrom(other.yBasis);
    }

    correctBasis() {
        let yDotNormal = this.position.dot(this.yBasis);
        this.yBasis.addScaled(this.position, -yDotNormal).normalize();
        this.xBasis.cross(this.position, this.yBasis);
    }

    move(dx: number, dy: number) {
        if (dx == 0 && dy == 0) {
            return;
        }
        this.position.addScaled(this.xBasis, dx).addScaled(this.yBasis, dy);
        this.position.normalize();
        this.correctBasis();
    }

    rotate(radians: number) {
        if (radians == 0) {
            return;
        }
        this.yBasis.addScaled(this.yBasis, Math.cos(radians) - 1);
        this.yBasis.addScaled(this.xBasis, -Math.sin(radians));
        this.correctBasis();
    }

    lerp(target: GameObject, t: number) {
        this.position.lerp(target.position, t);
        this.position.normalize();
        this.yBasis.lerp(target.yBasis, t);
        this.correctBasis();
    }

    pointTowards(target: Vec3) {
        let newYBasis = target.copy().sub(this.position);
        if (Math.abs(this.yBasis.dot(newYBasis)) > 0.001) {
            this.yBasis = newYBasis;
            this.correctBasis();
        }
    }

    invert() {
        this.position.mulN(-1);
        this.xBasis.mulN(-1);
        this.yBasis.mulN(-1);
    }
}

export class Sprite extends GameObject {
    texture: WebGLTexture;

    constructor(texture: WebGLTexture) {
        super();
        this.texture = texture;
    }
}