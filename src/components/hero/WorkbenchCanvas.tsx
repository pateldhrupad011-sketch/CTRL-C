"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, Line, Text } from "@react-three/drei";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import gsap from "gsap";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Theme } from "@/lib/theme";
import { COPIES, C_KEY, CTRL_KEY, KEY_H, MAT, PAPER, PENCIL, RING, TRACES } from "./layout";
import { scenePalettes, type ScenePalette } from "./scene-palette";

export type StageInput = { px: number; py: number; scroll: number };

type CanvasProps = {
  theme: Theme;
  animate: boolean;
  frameloop: "always" | "demand" | "never";
  input: RefObject<StageInput>;
  compact: boolean;
  onReady: () => void;
  onFail: () => void;
};

const LEGEND_FONT = "/fonts/BricolageGrotesque-700.woff";
const damp = THREE.MathUtils.damp;

/* ─────────────────────────── geometry helpers ─────────────────────────── */

function taper(geometry: THREE.BufferGeometry, h: number, amount: number) {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) + h / 2) / h;
    const s = 1 - amount * t;
    pos.setX(i, pos.getX(i) * s);
    pos.setZ(i, pos.getZ(i) * s);
  }
  pos.needsUpdate = true;
  geometry.translate(0, h / 2, 0);
  return geometry;
}

function useKeycapGeometry(w: number, d: number) {
  return useMemo(() => taper(new RoundedBoxGeometry(w, KEY_H, d, 5, 0.09), KEY_H, C_KEY.taper), [w, d]);
}

/** Corner of a tapered key outline in its local space. 0..3 = −x−z, +x−z, +x+z, −x+z. */
function keyCorner(i: number, top: boolean, w: number, d: number) {
  const s = top ? 1 - C_KEY.taper : 1;
  const sx = i === 1 || i === 2 ? 1 : -1;
  const sz = i === 2 || i === 3 ? 1 : -1;
  return new THREE.Vector3((sx * w * s) / 2, top ? KEY_H : 0, (sz * d * s) / 2);
}

/** Back-left, front-right and back-right corners get construction lines. */
const PROJECTED_CORNERS = [0, 2, 1];

/* ─────────────────────────── canvas textures ─────────────────────────── */

function monoFamily() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim();
  return v || "ui-monospace, monospace";
}

function drawMat(ctx: CanvasRenderingContext2D, w: number, h: number, pal: ScenePalette, mono: string) {
  const ppu = w / MAT.w;
  ctx.fillStyle = pal.mat;
  ctx.fillRect(0, 0, w, h);

  ctx.lineWidth = 2;
  for (let u = 0.2; u < MAT.w; u += 0.2) {
    const major = Math.abs(u / 1.2 - Math.round(u / 1.2)) < 0.01;
    ctx.strokeStyle = major ? pal.matGridMajor : pal.matGrid;
    ctx.beginPath();
    ctx.moveTo(u * ppu, 0);
    ctx.lineTo(u * ppu, h);
    ctx.stroke();
  }
  for (let v = 0.2; v < MAT.d; v += 0.2) {
    const major = Math.abs(v / 1.2 - Math.round(v / 1.2)) < 0.01;
    ctx.strokeStyle = major ? pal.matGridMajor : pal.matGrid;
    ctx.beginPath();
    ctx.moveTo(0, v * ppu);
    ctx.lineTo(w, v * ppu);
    ctx.stroke();
  }

  // 45° cutting guides from the front-left corner
  ctx.strokeStyle = pal.matGridMajor;
  ctx.setLineDash([10, 14]);
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(h * 0.95, h * 0.05);
  ctx.stroke();
  ctx.setLineDash([]);

  // ruler ticks along the front and left edges
  ctx.strokeStyle = pal.matInk;
  ctx.fillStyle = pal.matInk;
  ctx.font = `500 ${Math.round(ppu * 0.075)}px ${mono}`;
  for (let i = 0; i <= MAT.w * 10; i++) {
    const x = (i / 10) * ppu;
    const len = i % 10 === 0 ? ppu * 0.12 : i % 5 === 0 ? ppu * 0.08 : ppu * 0.045;
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x, h - len);
    ctx.stroke();
    if (i % 10 === 0 && i > 0 && i < MAT.w * 10) ctx.fillText(String(i / 10), x + 6, h - ppu * 0.1);
  }
  for (let i = 0; i <= MAT.d * 10; i++) {
    const y = h - (i / 10) * ppu;
    const len = i % 10 === 0 ? ppu * 0.12 : i % 5 === 0 ? ppu * 0.08 : ppu * 0.045;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(len, y);
    ctx.stroke();
  }

  ctx.font = `500 ${Math.round(ppu * 0.07)}px ${mono}`;
  ctx.fillText("CTRL C · WORKBENCH · REV. A", w - ppu * 2.15, ppu * 0.18);
  ctx.fillText("SCALE 1 : 1   UNIT = 1 KEY", w - ppu * 2.15, ppu * 0.3);
}

function drawPaper(ctx: CanvasRenderingContext2D, w: number, h: number, pal: ScenePalette, mono: string) {
  const ppu = w / PAPER.w;
  ctx.fillStyle = pal.paper;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = pal.paperGrid;
  ctx.lineWidth = 1.5;
  for (let x = 0; x < w; x += ppu * 0.1) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += ppu * 0.1) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const cx = w / 2;
  const P = (u: number) => u * ppu;
  ctx.strokeStyle = pal.paperInk;
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";

  // front elevation of a keycap
  const fy = P(0.95);
  ctx.beginPath();
  ctx.moveTo(cx - P(0.55), fy + P(0.42));
  ctx.lineTo(cx + P(0.55), fy + P(0.42));
  ctx.lineTo(cx + P(0.43), fy);
  ctx.lineTo(cx - P(0.43), fy);
  ctx.closePath();
  ctx.stroke();

  // plan view
  const py = P(1.75);
  ctx.strokeRect(cx - P(0.45), py, P(0.9), P(0.9));
  ctx.lineWidth = 2.5;
  ctx.strokeRect(cx - P(0.36), py + P(0.09), P(0.72), P(0.72));
  ctx.beginPath();
  ctx.arc(cx, py + P(0.45), P(0.2), Math.PI * 0.25, Math.PI * 1.75);
  ctx.stroke();

  // dimensions
  ctx.strokeStyle = pal.paperDim;
  ctx.fillStyle = pal.paperDim;
  ctx.lineWidth = 2;
  const dy = fy + P(0.6);
  ctx.beginPath();
  ctx.moveTo(cx - P(0.55), dy);
  ctx.lineTo(cx + P(0.55), dy);
  ctx.moveTo(cx - P(0.55), dy - P(0.06));
  ctx.lineTo(cx - P(0.55), dy + P(0.06));
  ctx.moveTo(cx + P(0.55), dy - P(0.06));
  ctx.lineTo(cx + P(0.55), dy + P(0.06));
  ctx.moveTo(cx + P(0.7), fy);
  ctx.lineTo(cx + P(0.7), fy + P(0.42));
  ctx.stroke();
  ctx.font = `500 ${Math.round(P(0.085))}px ${mono}`;
  ctx.textAlign = "center";
  ctx.fillText("1.00 u", cx, dy + P(0.15));
  ctx.textAlign = "left";
  ctx.fillText("0.56", cx + P(0.76), fy + P(0.25));

  // title block
  ctx.strokeStyle = pal.paperInk;
  ctx.fillStyle = pal.paperInk;
  ctx.lineWidth = 2.5;
  const tbx = w - P(1.05);
  const tby = h - P(0.42);
  ctx.strokeRect(tbx, tby, P(0.9), P(0.3));
  ctx.font = `600 ${Math.round(P(0.075))}px ${mono}`;
  ctx.fillText("KEY / SKETCH 00", tbx + P(0.06), tby + P(0.13));
  ctx.font = `500 ${Math.round(P(0.06))}px ${mono}`;
  ctx.fillText("CTRL C · DRAFT", tbx + P(0.06), tby + P(0.235));

  ctx.font = `600 ${Math.round(P(0.11))}px ${mono}`;
  ctx.fillText("v0 → ?", P(0.15), P(0.32));
}

const FALLBACK_MONO = "ui-monospace, monospace";

function subscribeFonts(onChange: () => void) {
  document.fonts?.addEventListener("loadingdone", onChange);
  return () => document.fonts?.removeEventListener("loadingdone", onChange);
}

let loadedMono: string | null = null;

/** Latches once fonts have loaded: later font loads flip `status` back to "loading". */
function getMonoSnapshot() {
  if (loadedMono) return loadedMono;
  if (document.fonts?.status !== "loaded") return FALLBACK_MONO;
  loadedMono = monoFamily();
  return loadedMono;
}

/** The page's mono family once web fonts have loaded, so canvas labels repaint with it. */
function useMonoFamily() {
  return useSyncExternalStore(subscribeFonts, getMonoSnapshot, () => FALLBACK_MONO);
}

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number, pal: ScenePalette, mono: string) => void;

function useCanvasTexture(width: number, height: number, draw: Draw, pal: ScenePalette) {
  const gl = useThree((s) => s.gl);
  const mono = useMonoFamily();
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) draw(ctx, width, height, pal, mono);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    return tex;
  }, [width, height, gl, draw, pal, mono]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/* ─────────────────────────── scene objects ─────────────────────────── */

function Mat({ pal }: { pal: ScenePalette }) {
  const map = useCanvasTexture(2048, Math.round((2048 * MAT.d) / MAT.w), drawMat, pal);
  return (
    <group>
      <mesh position={[0, -MAT.t / 2, 0]}>
        <boxGeometry args={[MAT.w, MAT.t, MAT.d]} />
        <meshStandardMaterial color={pal.matEdge} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0005, 0]}>
        <planeGeometry args={[MAT.w, MAT.d]} />
        <meshStandardMaterial map={map} roughness={0.92} metalness={0} />
      </mesh>
    </group>
  );
}

function Paper({ pal }: { pal: ScenePalette }) {
  const map = useCanvasTexture(1024, Math.round((1024 * PAPER.d) / PAPER.w), drawPaper, pal);
  return (
    <group position={[PAPER.x, 0.006, PAPER.z]} rotation={[0, -PAPER.rot, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[PAPER.w, PAPER.d]} />
        <meshStandardMaterial map={map} roughness={0.95} />
      </mesh>
    </group>
  );
}

function Pencil({ pal }: { pal: ScenePalette }) {
  const body = PENCIL.length - 0.2;
  return (
    <group position={[PENCIL.x, 0.05, PENCIL.z]} rotation={[0, -PENCIL.rot, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.1, 0, 0]}>
        <cylinderGeometry args={[0.048, 0.048, body, 6]} />
        <meshStandardMaterial color={pal.pencil} roughness={0.5} flatShading />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 2]} position={[body / 2 - 0.1 + 0.075, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.048, 0.15, 6]} />
        <meshStandardMaterial color="#d9b98a" roughness={0.8} flatShading />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 2]} position={[body / 2 - 0.1 + 0.165, 0, 0]}>
        <coneGeometry args={[0.013, 0.035, 6]} />
        <meshStandardMaterial color="#2b2a30" roughness={0.4} />
      </mesh>
    </group>
  );
}

function Traces({ pal }: { pal: ScenePalette }) {
  return (
    <group position={[0, 0.004, 0]}>
      {TRACES.map((trace, i) => (
        <group key={i}>
          <Line
            points={trace.map(([x, z]) => [x, 0, z] as [number, number, number])}
            color={pal.trace}
            lineWidth={2}
            transparent
            opacity={0.95}
          />
          {[trace[0], trace[trace.length - 1]].map(([x, z], j) => (
            <mesh key={j} position={[x, 0.003, z]}>
              <cylinderGeometry args={[0.05, 0.05, 0.008, 20]} />
              <meshStandardMaterial color={pal.trace} roughness={0.35} metalness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Keycap({
  spec,
  color,
  legend,
  legendColor,
  legendSize,
  legendPosition,
}: {
  spec: typeof CTRL_KEY;
  color: string;
  legend: string;
  legendColor: string;
  legendSize: number;
  legendPosition: [number, number];
}) {
  const geometry = useKeycapGeometry(spec.w, spec.d);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <group position={[spec.x, 0, spec.z]}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color={color}
          roughness={0.48}
          clearcoat={0.35}
          clearcoatRoughness={0.6}
        />
      </mesh>
      <Text
        font={LEGEND_FONT}
        characters="CtrlC"
        fontSize={legendSize}
        color={legendColor}
        anchorX={legend === "C" ? "center" : "left"}
        anchorY="middle"
        position={[legendPosition[0], KEY_H + 0.002, legendPosition[1]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {legend}
      </Text>
    </group>
  );
}

function CopyStack({
  pal,
  animate,
  separation,
}: {
  pal: ScenePalette;
  animate: boolean;
  separation: RefObject<number>;
}) {
  const geometry = useMemo(
    () => taper(new THREE.BoxGeometry(C_KEY.w, KEY_H, C_KEY.d), KEY_H, C_KEY.taper),
    [],
  );
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  const copyRefs = useRef<(THREE.Group | null)[]>([]);
  const ringRef = useRef<THREE.Group>(null);
  const projRef = useRef<THREE.LineSegments>(null);
  const dashedRef = useRef<THREE.LineSegments>(null);

  const projGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(3 * 2 * 3), 3));
    return g;
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      edges.dispose();
      projGeometry.dispose();
    },
    [geometry, edges, projGeometry],
  );

  useLayoutEffect(() => {
    dashedRef.current?.computeLineDistances();
  }, []);

  const time = useRef(0);
  useFrame((_, delta) => {
    if (animate) time.current += delta;
    const t = time.current;
    const sep = separation.current ?? 0;

    COPIES.forEach((c, i) => {
      const g = copyRefs.current[i];
      if (!g) return;
      const bob = animate ? Math.sin(t * 0.9 + i * 1.3) * 0.035 : 0;
      g.position.set(C_KEY.x + c.dx, c.y - KEY_H / 2 + bob + sep * (i + 1) * 0.55, C_KEY.z + c.dz);
      g.rotation.y = -c.rot - sep * (i + 1) * 0.12;
    });

    const ring = ringRef.current;
    if (ring) {
      const bob = animate ? Math.sin(t * 0.7 + 2) * 0.05 : 0;
      ring.position.set(C_KEY.x + RING.dx, RING.y + bob + sep * 1.6, C_KEY.z + RING.dz);
      ring.rotation.y = 0.5 + (animate ? Math.sin(t * 0.35) * 0.28 : 0) + sep * 0.5;
      ring.rotation.x = animate ? Math.sin(t * 0.5) * 0.05 : 0;
    }

    const last = copyRefs.current[COPIES.length - 1];
    const proj = projRef.current;
    if (last && proj) {
      const arr = proj.geometry.attributes.position as THREE.BufferAttribute;
      last.updateMatrix();
      PROJECTED_CORNERS.forEach((idx, k) => {
        const from = keyCorner(idx, true, C_KEY.w, C_KEY.d);
        const to = keyCorner(idx, false, C_KEY.w, C_KEY.d).applyMatrix4(last.matrix);
        arr.setXYZ(k * 2, from.x + C_KEY.x, from.y, from.z + C_KEY.z);
        arr.setXYZ(k * 2 + 1, to.x, to.y, to.z);
      });
      arr.needsUpdate = true;
      proj.computeLineDistances();
    }
  });

  return (
    <group>
      <lineSegments ref={projRef} geometry={projGeometry}>
        <lineDashedMaterial color={pal.projection} dashSize={0.06} gapSize={0.06} transparent opacity={0.85} />
      </lineSegments>

      {COPIES.map((c, i) => (
        <group
          key={i}
          ref={(el) => {
            copyRefs.current[i] = el;
          }}
          position={[C_KEY.x + c.dx, c.y - KEY_H / 2, C_KEY.z + c.dz]}
          rotation={[0, -c.rot, 0]}
        >
          <mesh geometry={geometry} renderOrder={2}>
            <meshBasicMaterial
              color={pal.wireFill}
              transparent
              opacity={pal.wireFillOpacity * (i === 0 ? 1.3 : 0.8)}
              depthWrite={false}
            />
          </mesh>
          {i === 0 ? (
            <lineSegments geometry={edges}>
              <lineBasicMaterial color={pal.wire} transparent opacity={0.95} />
            </lineSegments>
          ) : (
            <lineSegments ref={dashedRef} geometry={edges}>
              <lineDashedMaterial color={pal.wire} dashSize={0.07} gapSize={0.05} transparent opacity={0.75} />
            </lineSegments>
          )}
        </group>
      ))}

      <group ref={ringRef} position={[C_KEY.x + RING.dx, RING.y, C_KEY.z + RING.dz]} rotation={[0, 0.5, 0]}>
        <Remix pal={pal} />
      </group>
    </group>
  );
}

function Remix({ pal }: { pal: ScenePalette }) {
  const ends = useMemo(() => {
    const a = Math.PI / 4;
    return [
      [Math.cos(a) * RING.r, Math.sin(a) * RING.r],
      [Math.cos(-a) * RING.r, Math.sin(-a) * RING.r],
    ] as const;
  }, []);
  const material = (
    <meshStandardMaterial
      color={pal.ring}
      emissive={pal.ring}
      emissiveIntensity={pal.ringEmissive}
      roughness={0.4}
      metalness={0}
    />
  );
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[RING.r, RING.tube, 28, 96, Math.PI * 1.5]} />
        {material}
      </mesh>
      {ends.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <sphereGeometry args={[RING.tube, 28, 20]} />
          {material}
        </mesh>
      ))}
      <pointLight color={pal.ring} intensity={pal.ringGlow} distance={3.2} decay={2} position={[0, 0, 0.4]} />
    </group>
  );
}

function Tag({
  position,
  num,
  text,
  end = false,
}: {
  position: [number, number, number];
  num: string;
  text: string;
  end?: boolean;
}) {
  return (
    <Html position={position} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
      <div
        className="scene-tag"
        style={{
          transform: end ? "translate(-100%, -50%)" : "translate(0, -50%)",
          flexDirection: end ? "row-reverse" : "row",
        }}
      >
        <span>
          <b>{num}</b> {text}
        </span>
      </div>
    </Html>
  );
}

/* ─────────────────────────── rig ─────────────────────────── */

const TARGET = new THREE.Vector3(0.55, 1.0, 0.15);
const SPIN_SECONDS = 32;

/** Turns its children a full circle around the vertical axis through TARGET, forever. */
function Turntable({ animate, children }: { animate: boolean; children: ReactNode }) {
  const spin = useRef<THREE.Group>(null);

  useEffect(() => {
    const g = spin.current;
    if (!g || !animate) return;
    const tween = gsap.to(g.rotation, { y: Math.PI * 2, duration: SPIN_SECONDS, ease: "none", repeat: -1 });
    return () => {
      tween.kill();
      g.rotation.y = 0;
    };
  }, [animate]);

  return (
    <group ref={spin} position={[TARGET.x, 0, TARGET.z]}>
      <group position={[-TARGET.x, 0, -TARGET.z]}>{children}</group>
    </group>
  );
}

function Workbench({
  theme,
  animate,
  input,
  compact,
}: Pick<CanvasProps, "theme" | "animate" | "input" | "compact">) {
  const pal = scenePalettes[theme];
  const group = useRef<THREE.Group>(null);
  const smooth = useRef({ px: 0, py: 0, scroll: 0 });
  const separation = useRef(0);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const base = useMemo(() => {
    const aspect = size.width / Math.max(1, size.height);
    const dist = aspect >= 1 ? 15.5 / Math.min(aspect, 1.35) ** 0.35 : 15.5 / aspect ** 0.72;
    const az = 0.52;
    const el = compact ? 0.5 : 0.46;
    return new THREE.Vector3(
      TARGET.x + Math.sin(az) * Math.cos(el) * dist,
      TARGET.y + Math.sin(el) * dist,
      TARGET.z + Math.cos(az) * Math.cos(el) * dist,
    );
  }, [size.width, size.height, compact]);

  useFrame((_, dt) => {
    const s = smooth.current;
    const inp = input.current;
    const k = animate ? 1 : 0;
    s.px = damp(s.px, (inp?.px ?? 0) * k, 2.6, dt);
    s.py = damp(s.py, (inp?.py ?? 0) * k, 2.6, dt);
    s.scroll = damp(s.scroll, (inp?.scroll ?? 0) * k, 5, dt);
    separation.current = s.scroll;

    if (group.current) {
      group.current.rotation.y = s.px * 0.09 + s.scroll * 0.18;
      group.current.rotation.x = s.py * 0.03;
    }
    camera.position.set(base.x + s.px * 0.35, base.y - s.py * 0.25 + s.scroll * 1.6, base.z);
    camera.lookAt(TARGET.x, TARGET.y + s.scroll * 0.6, TARGET.z);
  });

  return (
    <>
      <hemisphereLight args={[pal.hemiSky, pal.hemiGround, pal.hemi]} />
      <directionalLight position={[-4, 8, 5]} intensity={pal.key} color={pal.keyColor} />
      <directionalLight position={[6, 3, -6]} intensity={pal.rim} color={pal.rimColor} />
      <Environment key={theme} resolution={64} frames={1}>
        <Lightformer form="rect" intensity={pal.env} position={[0, 6, 3]} rotation-x={Math.PI / 2} scale={[9, 5, 1]} />
        <Lightformer
          form="rect"
          intensity={pal.envRim}
          color={pal.rimColor}
          position={[6, 2, -4]}
          rotation-y={-Math.PI / 3}
          scale={[3, 3, 1]}
        />
      </Environment>

      <group ref={group}>
        <Turntable animate={animate}>
          <Mat pal={pal} />
          <ContactShadows
            key={`ground-${theme}`}
            position={[0, -MAT.t - 0.002, 0]}
            width={MAT.w + 3}
            height={MAT.d + 3}
            resolution={256}
            blur={3.2}
            far={0.4}
            opacity={pal.groundOpacity}
            color={pal.ground}
            frames={1}
          />
          <ContactShadows
            key={`bench-${theme}`}
            position={[0, 0.0015, 0]}
            width={MAT.w}
            height={MAT.d}
            resolution={512}
            blur={2}
            far={0.8}
            opacity={pal.contactOpacity}
            color={pal.contact}
            frames={1}
          />
          <Paper pal={pal} />
          <Pencil pal={pal} />
          <Traces pal={pal} />
          <Keycap
            spec={CTRL_KEY}
            color={pal.keyCtrl}
            legend="Ctrl"
            legendColor={pal.keyCtrlLegend}
            legendSize={0.2}
            legendPosition={[-0.43, 0.22]}
          />
          <Keycap
            spec={C_KEY}
            color={pal.keyC}
            legend="C"
            legendColor={pal.keyCLegend}
            legendSize={0.44}
            legendPosition={[0, 0.02]}
          />
          <CopyStack pal={pal} animate={animate} separation={separation} />

          <Tag position={[PAPER.x - 0.7, 0.05, PAPER.z - 1.2]} num="01" text="Sketch" end />
          <Tag position={[CTRL_KEY.x - 0.55, 0.02, CTRL_KEY.z + 0.95]} num="02" text="Build" end />
          <Tag position={[C_KEY.x + 0.85, COPIES[0].y + 0.05, C_KEY.z]} num="03" text="Copy" />
          <Tag position={[C_KEY.x + RING.dx + RING.r + 0.3, RING.y + 0.15, C_KEY.z + RING.dz]} num="04" text="Remix" />
        </Turntable>
      </group>
    </>
  );
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(onReady));
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return null;
}

export default function WorkbenchCanvas({
  theme,
  animate,
  frameloop,
  input,
  compact,
  onReady,
  onFail,
}: CanvasProps) {
  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, 1.75]}
      flat
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 24, near: 0.5, far: 60, position: [8, 8, 14] }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", onFail, { once: true });
      }}
    >
      <Suspense fallback={null}>
        <Workbench theme={theme} animate={animate} input={input} compact={compact} />
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
