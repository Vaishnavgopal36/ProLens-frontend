import * as React from "react";
import { createProgram, hexToRgb } from "./ribbon-gl";
import type { RibbonPalette } from "./ribbon";

/**
 * 3D "fluid ribbon": the technique behind Stripe's gradient artwork.
 *
 * A finely subdivided plane is bent along a curved centre line from the
 * bottom-right up to the top centre. The vertex shader displaces every vertex
 * in 3D (layered sine folds + noise), recomputes surface normals from the
 * displaced geometry and lights it, so folds catch light and shadow like real
 * silk. The fragment shader blends the palette across the ribbon, adds fine
 * threads and frays the far edge. Three translucent layers give depth.
 */

const GRID_ALONG = 240;
const GRID_ACROSS = 56;

const VERTEX_SHADER = `#version 300 es
precision highp float;
in vec2 aUv;                 // x: along the ribbon 0..1, y: across it 0..1
uniform float uTime;
uniform vec2 uExtent;        // world half-extents (x, y)
uniform float uWidth;        // layer width multiplier
uniform float uPhase;        // per-layer phase offset
uniform float uOffset;       // sideways offset of the layer
out float vA;
out float vC;
out float vLight;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float vnoise(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
        mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
        mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

// The displaced 3D surface. xy = where the vertex lands on screen (world
// units), z = height of the fold (only used for lighting and parallax).
vec3 surface(float a, float c) {
  float t = uTime * 0.05;

  // Centre line: a quadratic curve from bottom-right to top centre whose
  // control point sways, so the whole ribbon appears to rotate sideways.
  vec2 S = vec2(1.05, -1.7);
  vec2 E = vec2(-0.22, 1.7);
  vec2 C = vec2(0.62 + 0.12 * sin(t * 2.1 + uPhase), 0.05 + 0.14 * sin(t * 1.6));
  float b = 1.0 - a;
  vec2 B = b * b * S + 2.0 * b * a * C + a * a * E;
  vec2 T = 2.0 * b * (C - S) + 2.0 * a * (E - C);

  vec2 Bw = B * uExtent;
  vec2 Tw = normalize(T * uExtent);
  vec2 N = vec2(-Tw.y, Tw.x);

  // Wide at the bottom-right, tapering toward the top centre.
  float W = uWidth * mix(1.0, 0.55, a) * min(uExtent.x, uExtent.y) * 1.55;

  // Folds: big slow swells, tighter ripples, and a little noise.
  float z = 0.22 * sin(a * 8.0 + c * 3.0 - t * 4.0 + uPhase)
          + 0.12 * sin(a * 15.0 - c * 5.0 + t * 5.5)
          + 0.16 * (vnoise(vec3(a * 4.0, c * 2.0, t * 2.0 + uPhase)) - 0.5);

  vec2 pos = Bw + N * ((c - 0.5 + uOffset) * W + z * 0.10 * W);

  // Slow overall rotation.
  float r = 0.10 * sin(t * 1.2);
  pos = mat2(cos(r), sin(r), -sin(r), cos(r)) * pos;
  return vec3(pos, z * 0.35);
}

void main() {
  vec3 P = surface(aUv.x, aUv.y);

  // Normal from the displaced surface (central differences).
  float e = 0.004;
  vec3 dA = surface(aUv.x + e, aUv.y) - surface(aUv.x - e, aUv.y);
  vec3 dC = surface(aUv.x, aUv.y + e) - surface(aUv.x, aUv.y - e);
  vec3 n = normalize(cross(dA, dC));
  if (n.z < 0.0) n = -n;

  vec3 L = normalize(vec3(-0.45, 0.65, 0.75));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  vLight = 0.66 + 0.50 * max(dot(n, L), 0.0)
         + 0.22 * pow(max(dot(n, H), 0.0), 22.0);

  vA = aUv.x;
  vC = aUv.y;
  gl_Position = vec4(P.xy / uExtent, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in float vA;
in float vC;
in float vLight;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uPal[6];
uniform float uAlpha;
uniform float uMix;          // how much to wash toward white
uniform float uShift;        // per-layer colour shift
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

vec3 palette(float t) {
  t = clamp(t, 0.0, 1.0) * 5.0;
  vec3 c = uPal[0];
  c = mix(c, uPal[1], smoothstep(0.0, 1.0, t));
  c = mix(c, uPal[2], smoothstep(1.0, 2.0, t));
  c = mix(c, uPal[3], smoothstep(2.0, 3.0, t));
  c = mix(c, uPal[4], smoothstep(3.0, 4.0, t));
  c = mix(c, uPal[5], smoothstep(4.0, 5.0, t));
  return c;
}

void main() {
  // Colour flows across the ribbon and ripples along it.
  float k = clamp(vC * 0.86 + 0.07 + 0.10 * sin(vA * 7.0 - uTime * 0.15 + uShift), 0.0, 1.0);
  vec3 col = palette(k) * vLight;

  // Fine silk threads running along the ribbon.
  float thread = noise(vec2(vA * 6.0, vC * 150.0));
  float coarse = noise(vec2(vA * 3.0 - uTime * 0.05, vC * 60.0));
  col *= 0.90 + 0.16 * thread + 0.08 * coarse;
  col = mix(col, vec3(1.0), uMix);

  // Crisp near edge, frayed far edge.
  float hair = noise(vec2(vA * 4.0 + 7.0, vC * 120.0));
  float edge = smoothstep(0.0, 0.03, vC)
             * (1.0 - smoothstep(0.90, 1.0, vC + (hair - 0.5) * 0.12));

  // Keep the far left calm so the logo stays clear.
  float left = smoothstep(0.04, 0.30, gl_FragCoord.x / uRes.x);
  // Fade both ends so they never show a hard cut.
  float ends = smoothstep(0.0, 0.10, vA) * (1.0 - smoothstep(0.90, 1.0, vA));
  outColor = vec4(col, edge * left * ends * uAlpha);
}`;

interface Layer {
  width: number;
  offset: number;
  phase: number;
  alpha: number;
  mix: number;
  shift: number;
}

// Back to front: a wide pale veil, the saturated main ribbon, a thin highlight.
const LAYERS: Layer[] = [
  { width: 1.22, offset: 0.02, phase: 3.0, alpha: 0.7, mix: 0.4, shift: 1.0 },
  { width: 1.0, offset: 0.0, phase: 0.0, alpha: 1.0, mix: 0.0, shift: 0.0 },
  { width: 0.26, offset: 0.14, phase: 1.5, alpha: 0.75, mix: 0.2, shift: 2.0 },
];

function buildMesh() {
  const uvs = new Float32Array(GRID_ALONG * GRID_ACROSS * 2);
  for (let i = 0; i < GRID_ALONG; i++) {
    for (let j = 0; j < GRID_ACROSS; j++) {
      const k = (i * GRID_ACROSS + j) * 2;
      uvs[k] = i / (GRID_ALONG - 1);
      uvs[k + 1] = j / (GRID_ACROSS - 1);
    }
  }
  const indices = new Uint32Array((GRID_ALONG - 1) * (GRID_ACROSS - 1) * 6);
  let n = 0;
  for (let i = 0; i < GRID_ALONG - 1; i++) {
    for (let j = 0; j < GRID_ACROSS - 1; j++) {
      const a = i * GRID_ACROSS + j;
      const b = a + 1;
      const c = a + GRID_ACROSS;
      const d = c + 1;
      indices.set([a, b, c, b, d, c], n);
      n += 6;
    }
  }
  return { uvs, indices };
}

interface Props {
  background: string;
  palette: RibbonPalette;
  onUnsupported: () => void;
}

export function FluidRibbonCanvas({
  background,
  palette,
  onUnsupported,
}: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: false });
    if (!gl) return onUnsupported();
    const built = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    if (!built) return onUnsupported();
    const { program, dispose } = built;
    gl.useProgram(program);

    // Geometry
    const { uvs, indices } = buildMesh();
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    const aUv = gl.getAttribLocation(program, "aUv");
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uTime = u("uTime");
    const uExtent = u("uExtent");
    const uRes = u("uRes");
    const uWidth = u("uWidth");
    const uPhase = u("uPhase");
    const uOffset = u("uOffset");
    const uAlpha = u("uAlpha");
    const uMix = u("uMix");
    const uShift = u("uShift");

    gl.uniform3fv(
      u("uPal"),
      new Float32Array(
        [
          palette.pale ?? "#DCEBFF",
          palette.blue,
          palette.amber,
          palette.orange,
          palette.coral,
          palette.purple,
        ].flatMap(hexToRgb),
      ),
    );

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const [br, bg, bb] = hexToRgb(background);
    gl.clearColor(br, bg, bb, 1);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const start = performance.now();
    let frame = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      // Landscape: height is the unit. Portrait: width is, so the ribbon
      // still crosses the whole screen on phones.
      const aspect = w / h;
      if (aspect >= 1) gl.uniform2f(uExtent, aspect, 1);
      else gl.uniform2f(uExtent, 1, 1 / aspect);
    };

    const draw = (now: number) => {
      gl.uniform1f(uTime, reduceMotion ? 14 : (now - start) / 1000 + 14);
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (const layer of LAYERS) {
        gl.uniform1f(uWidth, layer.width);
        gl.uniform1f(uOffset, layer.offset);
        gl.uniform1f(uPhase, layer.phase);
        gl.uniform1f(uAlpha, layer.alpha);
        gl.uniform1f(uMix, layer.mix);
        gl.uniform1f(uShift, layer.shift);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
      }
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(performance.now());
    });
    observer.observe(canvas);
    resize();
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteVertexArray(vao);
      dispose();
    };
  }, [background, palette, onUnsupported]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
