import * as React from "react";
import { cn } from "@/lib/utils";
import { createProgram, hexToRgb } from "./ribbon-gl";
import { FluidRibbonCanvas } from "./fluid-ribbon-canvas";

/**
 * Animated backdrop in the style of Stripe's sign-in page, in two styles:
 *
 *  - "fluid" (default): a true 3D mesh; see fluid-ribbon-canvas.tsx.
 *  - "silk": a crisp, threaded ribbon that runs from the
 *    bottom-right up to the top-left centre, sweeping and rotating slowly.
 *    Drawn on the GPU by one fragment shader: no blur, no per-frame layout.
 *  - "mesh": the soft CSS version described below.
 *
 * Mesh: a stream of heavily blurred colour blobs runs from the bottom-right corner
 * up to the top-left centre of the page. Blobs are multiplied into each other
 * so the colours melt together, and each one drifts on a slow transform-only
 * loop (translate3d / rotate / scale), which stays on the GPU: no layout or
 * paint work per frame. Animation keyframes live in tailwind.config.js.
 *
 * Purely decorative: aria-hidden, never intercepts pointer events, and the
 * motion is disabled for users who prefer reduced motion.
 */

/**
 * Colour stops of the ribbon, in order across its width. The names come from
 * Stripe's palette, but any colours work: `pale` is the feathered leading
 * edge, then blue -> amber -> orange -> coral -> purple.
 */
export interface RibbonPalette {
  pale?: string;
  blue: string;
  amber: string;
  orange: string;
  coral: string;
  purple: string;
}

/**
 * The ribbon in our own brand colours, taken straight from the light-theme
 * scales in src/styles/tokens.css so the login page matches the app. It uses
 * the light steps of each scale only (no dark navy), which keeps the artwork
 * bright, and gold appears once, as a soft sliver.
 *
 *   pale    --teal-50    #edf7f7   feathered leading edge
 *   blue    --teal-200   #a8dada
 *   amber   --teal-400   #3ea3a4   main body (teal supports at ~15%)
 *   orange  --navy-300   #8e9fb2   navy tint, never full navy
 *   coral   --gold-300   #f7ce6f   dimmed gold accent (~5%)
 *   purple  --navy-200   #bcc7d2
 *
 * If the tokens change, update these hexes to match.
 */
export const BRAND_LIGHT_PALETTE: RibbonPalette = {
  pale: "#edf7f7",
  blue: "#a8dada",
  amber: "#3ea3a4",
  orange: "#8e9fb2",
  coral: "#f7ce6f",
  purple: "#bcc7d2",
};

/** Stripe's sign-in palette. */
export const STRIPE_PALETTE: RibbonPalette = {
  coral: "#FF4F81",
  orange: "#FF8453",
  purple: "#7F56D9",
  amber: "#FFD15C",
  blue: "#60A5FA",
};

interface Blob {
  /** Centre of the blob as a % of the page. */
  x: number;
  y: number;
  /** Diameter in vmax so the stream scales with any screen. */
  size: number;
  colors: [keyof RibbonPalette, keyof RibbonPalette];
  animation: string;
  opacity: number;
}

// Ordered along the diagonal: bottom-right → top-left centre.
const BLOBS: Blob[] = [
  {
    x: 98,
    y: 102,
    size: 58,
    colors: ["amber", "orange"],
    animation: "animate-ribbon-a",
    opacity: 0.85,
  },
  {
    x: 100,
    y: 62,
    size: 46,
    colors: ["coral", "orange"],
    animation: "animate-ribbon-d",
    opacity: 0.7,
  },
  {
    x: 84,
    y: 80,
    size: 50,
    colors: ["orange", "coral"],
    animation: "animate-ribbon-b",
    opacity: 0.8,
  },
  {
    x: 70,
    y: 56,
    size: 52,
    colors: ["coral", "purple"],
    animation: "animate-ribbon-c",
    opacity: 0.75,
  },
  {
    x: 56,
    y: 34,
    size: 48,
    colors: ["purple", "blue"],
    animation: "animate-ribbon-e",
    opacity: 0.65,
  },
  {
    x: 42,
    y: 12,
    size: 46,
    colors: ["blue", "purple"],
    animation: "animate-ribbon-a",
    opacity: 0.6,
  },
  {
    x: 92,
    y: 6,
    size: 40,
    colors: ["amber", "coral"],
    animation: "animate-ribbon-d",
    opacity: 0.65,
  },
];

// ---------------------------------------------------------------------------
// "silk" variant: crisp, threaded ribbons drawn by a fragment shader (WebGL2).
// ---------------------------------------------------------------------------

const VERTEX_SHADER = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uBg;
uniform vec3 uPal[6]; // pale blue, blue, amber, orange, coral, purple
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

// Walks the palette: pale blue -> blue -> amber -> orange -> coral -> purple.
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

// One broad silk band. Colour changes ACROSS the band (pale blue -> amber ->
// orange -> coral -> purple); fine threads run ALONG it. The left edge is
// crisp, the right edge frays into hair-like strands.
vec4 band(vec2 p, vec2 anchor, float widthScale, float t, float seed) {
  // Axis points from the bottom-right up to the top centre, and drifts a
  // little so the whole band appears to rotate sideways.
  float tilt = 0.07 * sin(t * 1.3 + seed) + 0.04 * sin(t * 0.6);
  vec2 axis = normalize(vec2(-0.62 + tilt, 0.79));
  vec2 perp = vec2(axis.y, -axis.x);
  vec2 d = p - anchor;
  float v = dot(d, axis);   // along the band
  float u = dot(d, perp);   // across the band

  // Gentle S-curve plus a travelling swell.
  u -= 0.16 * v * v + 0.05 * sin(v * 2.2 - t * 4.0 + seed) + 0.04 * sin(t * 1.1 + seed);

  float w = 0.78 * widthScale;
  float s = u / w;            // -0.5 .. 0.5 inside the band

  // Colour across the band, rippling as it travels toward the top centre.
  float k = s + 0.5 + 0.06 * sin(v * 2.6 - t * 6.0 + seed);
  vec3 col = palette(clamp(k, 0.0, 1.0));

  // Fine silk threads running along the band.
  float fine = noise(vec2(v * 1.1 + seed, u * 380.0));
  float mid = noise(vec2(v * 1.6 - t * 3.0, u * 70.0 + seed));
  // Brightness pulses that travel along the band (bottom-right -> top).
  float flow = 0.5 + 0.5 * sin(v * 7.0 - t * 30.0 + seed);
  col *= 0.80 + 0.30 * fine + 0.14 * mid + 0.06 * flow;
  col = mix(col, vec3(1.0), 0.10 * smoothstep(0.30, 0.5, abs(s)));

  // Left edge: crisp with a pale fuzz. Right edge: frayed strands.
  float hairL = noise(vec2(v * 2.2, u * 260.0));
  float hairR = noise(vec2(v * 1.4 + 9.0, u * 240.0));
  float aa = fwidth(u) / w * 1.2;
  float left = smoothstep(-0.5 - aa, -0.5 + aa + 0.015, s + (hairL - 0.5) * 0.03);
  float right = 1.0 - smoothstep(0.40, 0.50, s + (hairR - 0.5) * 0.22);
  return vec4(col, left * right);
}

void main() {
  // Landscape: scale by height. Portrait: scale by width so the band still
  // crosses the whole screen.
  float portrait = step(uRes.x, uRes.y);
  float unit = mix(uRes.y, uRes.x * 1.25, portrait);
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / unit;
  float t = uTime * 0.05;

  vec3 col = uBg;

  vec2 anchor = mix(vec2(0.36, 0.0), vec2(0.06, 0.0), portrait);
  // Back layer: a wider, paler band behind for depth.
  vec4 back = band(p, anchor + vec2(0.10, -0.06), 1.15, t * 0.8, 3.0);
  col = mix(col, mix(back.rgb, vec3(1.0), 0.35), back.a * 0.55);
  // Front layer: the main saturated band.
  vec4 front = band(p, anchor, 1.0, t, 0.0);
  col = mix(col, front.rgb, front.a);

  // Keep the far left calm so the logo stays clear.
  float visible = smoothstep(-0.70, -0.18, p.x + 0.5 * portrait);
  outColor = vec4(mix(uBg, col, visible), 1.0);
}`;

function SilkCanvas({
  background,
  palette,
  onUnsupported,
}: {
  background: string;
  palette: RibbonPalette;
  onUnsupported: () => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) return onUnsupported();

    const built = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    if (!built) return onUnsupported();
    const { program, dispose } = built;
    gl.useProgram(program);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    gl.uniform3f(
      gl.getUniformLocation(program, "uBg"),
      ...hexToRgb(background),
    );
    // A pale tint leads the ribbon, like Stripe's feathered left edge.
    const paleBlue = palette.pale ?? "#DCEBFF";
    gl.uniform3fv(
      gl.getUniformLocation(program, "uPal"),
      new Float32Array(
        [
          paleBlue,
          palette.blue,
          palette.amber,
          palette.orange,
          palette.coral,
          palette.purple,
        ].flatMap(hexToRgb),
      ),
    );

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
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    const draw = (now: number) => {
      gl.uniform1f(uTime, reduceMotion ? 14 : (now - start) / 1000 + 14);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
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
      dispose();
    };
  }, [background, palette, onUnsupported]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}

interface RibbonBackdropProps {
  /**
   * "fluid": 3D displaced-mesh ribbon with real lighting (WebGL2), the
   *          technique Stripe uses. Default.
   * "silk":  flatter shader-drawn ribbon (WebGL2).
   * "mesh":  soft blurred colour blobs (pure CSS).
   */
  variant?: "fluid" | "silk" | "mesh";
  /** Page colour under the artwork. */
  background?: string;
  palette?: RibbonPalette;
  className?: string;
}

export function RibbonBackdrop({
  variant = "fluid",
  background = "#f6f9fc",
  palette = STRIPE_PALETTE,
  className,
}: RibbonBackdropProps) {
  // No WebGL2? Fall back to the CSS mesh so the page still looks intentional.
  const [glFailed, setGlFailed] = React.useState(false);
  const handleUnsupported = React.useCallback(() => setGlFailed(true), []);

  if (variant !== "mesh" && !glFailed) {
    return (
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0", className)}
        style={{ backgroundColor: background }}
      >
        {variant === "fluid" ? (
          <FluidRibbonCanvas
            background={background}
            palette={palette}
            onUnsupported={handleUnsupported}
          />
        ) : (
          <SilkCanvas
            background={background}
            palette={palette}
            onUnsupported={handleUnsupported}
          />
        )}
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 isolate overflow-hidden",
        className,
      )}
      style={{ backgroundColor: background }}
    >
      {BLOBS.map((blob, i) => (
        // The wrapper only positions; the inner element is the one animated,
        // so the animation's transform never fights the centring offset.
        <div
          key={i}
          className="absolute"
          style={{
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            width: `${blob.size}vmax`,
            height: `${blob.size}vmax`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className={cn(
              "h-full w-full rounded-full mix-blend-multiply blur-[100px] will-change-transform motion-reduce:animate-none",
              blob.animation,
            )}
            style={{
              opacity: blob.opacity,
              background: `radial-gradient(circle at 50% 50%, ${palette[blob.colors[0]]} 0%, ${palette[blob.colors[1]]} 42%, transparent 70%)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

interface RibbonProps extends RibbonBackdropProps {
  children: React.ReactNode;
}

/**
 * Full-page wrapper: animated gradient behind, your content in front
 * (z-10). Children lay out in a flex column, so a page can place its own
 * header, centred card and footer:
 *
 *   <Ribbon>
 *     <header />
 *     <main className="flex flex-1 items-center justify-center" />
 *   </Ribbon>
 */
export function Ribbon({ children, className, ...backdrop }: RibbonProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-dvh w-full flex-col overflow-hidden",
        className,
      )}
    >
      <RibbonBackdrop {...backdrop} />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
