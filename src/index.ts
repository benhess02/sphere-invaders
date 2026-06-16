import { GameObject, Sprite } from "./gameObject";
import { beginFrame, drawSprite, initRenderer, loadTexture, updateRendererSize } from "./renderer";
import { Vec3 } from "./vec3";

const cvs = document.querySelector<HTMLCanvasElement>("#cvs")!;

let invaderTexture: WebGLTexture;
let playerTexture: WebGLTexture;

let time = 0;
let dt = 0;

let keysDown: string[] = [];

class Player extends Sprite {
    constructor() {
        super(playerTexture);
    }

    update() {
        let movement = new Vec3();
        if (keysDown.includes("w") || keysDown.includes("arrowup")) {
            movement.y += 1;
        }
        if (keysDown.includes("s") || keysDown.includes("arrowdown")) {
            movement.y -= 1;
        }
        if (keysDown.includes("a")) {
            movement.x -= 1;
        }
        if (keysDown.includes("d")) {
            movement.x += 1;
        }
        movement.normalize().mulN(dt);

        let rotation = 0;
        if (keysDown.includes("q") || keysDown.includes("arrowleft")) {
            rotation += 1;
        }
        if (keysDown.includes("e") || keysDown.includes("arrowright")) {
            rotation -= 1;
        }
        this.move(movement.x, movement.y);
        this.rotate(rotation * 1.5 * dt);
    }
}

class Invader extends Sprite {
    mode: number = 0;

    constructor() {
        super(invaderTexture);
    }

    update() {
        this.pointTowards(player.position);
        if (this.mode == 0) {
            this.move(0, 0.3 * dt);
        } else {
            this.move(0.3 * this.mode * dt, 0);
        }

        if (Math.random() < dt) {
            this.mode = Math.floor(Math.random() * 3) - 1;
        }
    }
}

let player: Player;
let camera = new GameObject();

let invaders: Invader[] = [];

function init() {
    initRenderer(cvs);
    playerTexture = loadTexture("player.png");
    invaderTexture = loadTexture("invader.png");

    player = new Player();
}

function update(newTime: number) {
    requestAnimationFrame(update);
    dt = Math.min((newTime - time) / 1000, 0.1);
    time = newTime;

    beginFrame(camera);

    drawSprite(player);

    for (let i = 0; i < invaders.length; i++) {
        drawSprite(invaders[i]);
    }

    player.update();

    for (let i = 0; i < invaders.length; i++) {
        invaders[i].update();
    }

    camera.lerp(player, 5 * dt);
}

function updateSize() {
    cvs.width = cvs.clientWidth;
    cvs.height = cvs.clientHeight;
    updateRendererSize();
}

setInterval(() => {
    if (invaders.length < 100) {
        let invader = new Invader();
        invader.copyFrom(player);
        invader.invert();
        invaders.push(invader);
    }
}, 2000);

document.addEventListener("keydown", (ev) => {
    let key = ev.key.toLowerCase();
    if (!keysDown.includes(key)) {
        keysDown.push(key);
    }
});

document.addEventListener("keyup", (ev) => {
    let index = keysDown.indexOf(ev.key.toLowerCase());
    if (index >= 0) {
        keysDown.splice(index, 1);
    }
});

window.addEventListener("blur", () => {
    while (keysDown.length > 0) {
        keysDown.pop();
    }
});

init();
window.addEventListener("resize", updateSize);
updateSize();
update(0.01);