import { GameObject, Sprite } from "./gameObject";

const VERTEX_SOURCE = `#version 300 es
uniform float aspect;

in vec4 v_position;

out vec2 uv;

void main() {
    uv = vec2(v_position.x * aspect, v_position.y);
    gl_Position = v_position;
}`;

const BACKGROUND_SOURCE = `#version 300 es
precision highp float;

uniform vec3 cameraPos;
uniform vec3 cameraXBasis;
uniform vec3 cameraYBasis;

in vec2 uv;

out vec4 outColor;

void main() {
    float dx = uv.x / 0.9;
    float dy = uv.y / 0.9;
    float magSq = dx * dx + dy * dy;

    if (magSq < 1.0) {
        float value = magSq * 0.2;
        vec3 screenPos = vec3(uv.x, uv.y, sqrt(1.0 - magSq));
        vec3 pos = cameraXBasis * screenPos.x + cameraYBasis * screenPos.y + cameraPos * screenPos.z;
        if(pos.x > 0. ^^ pos.y > 0. ^^ pos.z > 0.) {
            value += 0.05;
        }
        outColor = vec4(value, value, value, 1.0);
    } else {
        float value = 0.2 / magSq;
        outColor = vec4(value, value, 0.1 + value * 2.0, 1.0);
    }
}`;

const SPRITE_SOURCE = `#version 300 es
precision highp float;

uniform vec3 cameraPos;
uniform vec3 cameraXBasis;
uniform vec3 cameraYBasis;

uniform vec3 spritePos;
uniform vec3 spriteXBasis;
uniform vec3 spriteYBasis;

uniform sampler2D tex;

in vec2 uv;

out vec4 outColor;

void main() {
    float dx = uv.x / 0.9;
    float dy = uv.y / 0.9;
    float magSq = dx * dx + dy * dy;

    if (magSq < 1.) {
        vec3 screenPos = vec3(uv.x, uv.y, sqrt(1.0 - magSq));
        vec3 pos = cameraXBasis * screenPos.x + cameraYBasis * screenPos.y + cameraPos * screenPos.z;
        float xDot = dot(pos, spriteXBasis);
        float yDot = -dot(pos, spriteYBasis);
        float zDot = dot(pos, spritePos);
        if(zDot > 0. && abs(xDot) < 0.1 && abs(yDot) < 0.1) {
            vec2 spriteUV = vec2(xDot + 0.1, yDot + 0.1) / 0.2;
            outColor = texture(tex, spriteUV); 
        }
    }
}`;

let cvs: HTMLCanvasElement;
let gl: WebGL2RenderingContext;

let vertexBuffer: WebGLBuffer;
let backgroundShader: WebGLProgram;
let spriteShader: WebGLProgram;

function compileShader(vertexSource: string, fragmentSource: string): WebGLProgram {
    let vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(`Error compiling vertex shader: ${gl.getShaderInfoLog(vertexShader)}`);
    }

    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error(`Error compiling fragment shader: ${gl.getShaderInfoLog(fragmentShader)}`);
    }

    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`Error linking shader program: ${gl.getProgramInfoLog(program)}`);
    }
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    let positionIndex = gl.getAttribLocation(program, "v_position");
    gl.vertexAttribPointer(positionIndex, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionIndex);

    return program;
}

function setCameraUniforms(shader: WebGLProgram, camera: GameObject) {
    gl.uniform1f(gl.getUniformLocation(shader, "aspect"), cvs.width / cvs.height);
    gl.uniform3f(gl.getUniformLocation(shader, "cameraPos"), camera.position.x, camera.position.y, camera.position.z);
    gl.uniform3f(gl.getUniformLocation(shader, "cameraXBasis"), camera.xBasis.x, camera.xBasis.y, camera.xBasis.z);
    gl.uniform3f(gl.getUniformLocation(shader, "cameraYBasis"), camera.yBasis.x, camera.yBasis.y, camera.yBasis.z);
}

function setSpriteUniforms(shader: WebGLProgram, sprite: Sprite) {
    gl.bindTexture(gl.TEXTURE_2D, sprite.texture);
    gl.uniform1i(gl.getUniformLocation(shader, "tex"), 0);

    gl.uniform3f(gl.getUniformLocation(shader, "spritePos"), sprite.position.x, sprite.position.y, sprite.position.z);
    gl.uniform3f(gl.getUniformLocation(shader, "spriteXBasis"), sprite.xBasis.x, sprite.xBasis.y, sprite.xBasis.z);
    gl.uniform3f(gl.getUniformLocation(shader, "spriteYBasis"), sprite.yBasis.x, sprite.yBasis.y, sprite.yBasis.z);
}

export function beginFrame(camera: GameObject) {
    gl.useProgram(backgroundShader);
    setCameraUniforms(backgroundShader, camera);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.useProgram(spriteShader);
    setCameraUniforms(spriteShader, camera);
}

export function drawSprite(sprite: Sprite) {
    gl.useProgram(spriteShader);
    setSpriteUniforms(spriteShader, sprite);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export function initRenderer(canvas: HTMLCanvasElement) {
    cvs = canvas;
    gl = cvs.getContext("webgl2")!;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
        1, -1,
        1, 1,
        1, 1,
        -1, 1,
        -1, -1
    ]), gl.STATIC_DRAW);

    backgroundShader = compileShader(VERTEX_SOURCE, BACKGROUND_SOURCE);
    spriteShader = compileShader(VERTEX_SOURCE, SPRITE_SOURCE);
}

export function loadTexture(src: string): WebGLTexture {
    let tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let img = new Image();
    img.src = src;
    img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    };
    return tex;
}

export function updateRendererSize() {
    gl.viewport(0, 0, cvs.width, cvs.height);
}