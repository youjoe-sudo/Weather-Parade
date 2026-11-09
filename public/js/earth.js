import * as THREE from "../vendor/three.module.js";

let renderer;
let scene;
let camera;
let earthGroup;
let cloudMesh;
let frameId = 0;
let resizeObserver;
let intersectionObserver;
let lastTime = 0;
let isVisible = true;
let initialized = false;

const TEXTURE_BASE = "assets/textures/";

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function makeStarfield() {
  const random = seededRandom(37021);
  const count = 620;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 13 + random() * 16;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xd7efff,
    size: 0.035,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

function makeAtmosphere() {
  const material = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.1);
        gl_FragColor = vec4(0.12, 0.58, 2.0, 1.0) * intensity * 0.72;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });

  return new THREE.Mesh(new THREE.SphereGeometry(2.17, 64, 64), material);
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

function showFallback(stage) {
  const fallback = stage?.querySelector("#earth-fallback");
  const canvas = stage?.querySelector("#earth-canvas");
  if (fallback) fallback.hidden = false;
  if (canvas) canvas.hidden = true;
}

function resize() {
  const stage = document.querySelector("#earth-stage");
  if (!renderer || !stage) return;
  const width = Math.max(stage.clientWidth, 1);
  const height = Math.max(stage.clientHeight, 1);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function renderFrame(time) {
  if (!renderer) return;
  const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
  lastTime = time;

  if (isVisible) {
    earthGroup.rotation.y += delta * 0.034;
    cloudMesh.rotation.y += delta * 0.041;
    renderer.render(scene, camera);
  }

  frameId = requestAnimationFrame(renderFrame);
}

async function loadTexture(loader, file, color = true) {
  const texture = await loader.loadAsync(`${TEXTURE_BASE}${file}`);
  if (color) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

export async function initEarth() {
  if (initialized) return;
  const stage = document.querySelector("#earth-stage");
  const canvas = document.querySelector("#earth-canvas");
  if (!stage || !canvas) return;

  if (!supportsWebGL()) {
    showFallback(stage);
    return;
  }

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(33, 1, 0.1, 80);
    camera.position.set(0, 0, 6.1);

    earthGroup = new THREE.Group();
    earthGroup.rotation.z = -0.24;
    earthGroup.rotation.y = 2.45;
    scene.add(earthGroup);

    const loader = new THREE.TextureLoader();
    const [earthMap, normalMap, specularMap, cloudMap] = await Promise.all([
      loadTexture(loader, "earth_atmos_2048.jpg"),
      loadTexture(loader, "earth_normal_2048.jpg", false),
      loadTexture(loader, "earth_specular_2048.jpg", false),
      loadTexture(loader, "earth_clouds_1024.png"),
    ]);

    const earthGeometry = new THREE.SphereGeometry(2, 96, 96);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthMap,
      normalMap,
      normalScale: new THREE.Vector2(0.68, 0.68),
      specularMap,
      specular: new THREE.Color(0x2d6f9c),
      shininess: 18,
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);

    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudMap,
      transparent: true,
      opacity: 0.66,
      depthWrite: false,
      emissive: new THREE.Color(0x0c213f),
      emissiveIntensity: 0.18,
    });

    cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(2.014, 96, 96), cloudMaterial);
    cloudMesh.rotation.y = 0.55;
    earthGroup.add(cloudMesh);

    scene.add(makeAtmosphere());

    const ambient = new THREE.AmbientLight(0xffffff, 0.42);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xfff8ec, 2.65);
    sunLight.position.set(-4.8, 2.8, 4.4);
    scene.add(sunLight);

    const fill = new THREE.DirectionalLight(0x5aa7d9, 0.34);
    fill.position.set(4.5, -2.2, -3.4);
    scene.add(fill);

    scene.add(makeStarfield());

    resize();
    renderer.render(scene, camera);
    canvas.classList.add("is-ready");
    initialized = true;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reducedMotion) {
      frameId = requestAnimationFrame(renderFrame);
    }

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    if ("IntersectionObserver" in window) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          isVisible = entries.some((entry) => entry.isIntersecting);
        },
        { threshold: 0.02 },
      );
      intersectionObserver.observe(stage);
    }

    document.addEventListener("visibilitychange", () => {
      isVisible = !document.hidden;
      if (document.hidden && frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      } else if (!document.hidden && !reducedMotion && initialized && !frameId) {
        lastTime = 0;
        frameId = requestAnimationFrame(renderFrame);
      }
    });
  } catch (error) {
    console.warn("Earth visualization unavailable; using static fallback.", error);
    showFallback(stage);
  }
}

export function destroyEarth() {
  if (frameId) cancelAnimationFrame(frameId);
  frameId = 0;
  if (resizeObserver) resizeObserver.disconnect();
  if (intersectionObserver) intersectionObserver.disconnect();
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  scene = null;
  camera = null;
  initialized = false;
}
