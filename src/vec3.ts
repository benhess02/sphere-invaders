export class Vec3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    copy(): Vec3 {
        return new Vec3(this.x, this.y, this.z);
    }

    copyFrom(other: Vec3) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
    }

    magSq(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    mag(): number {
        return Math.sqrt(this.magSq());
    }

    normalize(): this {
        let m = this.mag();
        if (m != 0) {
            this.divN(m);
        }
        return this;
    }

    dot(other: Vec3): number {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    cross(a: Vec3, b: Vec3): this {
        this.x = a.y * b.z - a.z * b.y;
        this.y = a.z * b.x - a.x * b.z;
        this.z = a.x * b.y - a.y * b.x;
        return this;
    }

    lerp(target: Vec3, t: number): this {
        this.x += (target.x - this.x) * t;
        this.y += (target.y - this.y) * t;
        this.z += (target.z - this.z) * t;
        return this;
    }

    add(other: Vec3): this {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
        return this;
    }

    sub(other: Vec3): this {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
        return this;
    }

    mul(other: Vec3): this {
        this.x *= other.x;
        this.y *= other.y;
        this.z *= other.z;
        return this;
    }

    mulN(n: number): this {
        this.x *= n;
        this.y *= n;
        this.z *= n;
        return this;
    }

    addScaled(other: Vec3, scale: number): this {
        this.x += other.x * scale;
        this.y += other.y * scale;
        this.z += other.z * scale;
        return this;
    }

    div(other: Vec3): this {
        this.x /= other.x;
        this.y /= other.y;
        this.z /= other.z;
        return this;
    }

    divN(n: number): this {
        this.x /= n;
        this.y /= n;
        this.z /= n;
        return this;
    }
}