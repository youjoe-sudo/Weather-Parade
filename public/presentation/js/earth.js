import * as THREE from "../../vendor/three.module.js";

/**
 * Presentation-only Earth visual.
 * Adapted from the Weather Parade app hero, isolated to the deck cover.
 */

const TEXTURE_BASE = "../../assets/textures/";

let renderer = null;
let scene = null;
let camera = null;
let earthGroup = null;
let cloudMesh = null;
let frameId = 0;
let resizeObserver = null;
let intersectionObserver = null;
let lastTime = 0;
let initialized = false;
let isVisible = true;
let reducedMotion = false;

let pointerX = 0;
let pointerY = 0;
let targetX = 0;
let targetY = 0;

function supportsWebGL() {
  try {
    const probe = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (probe.getContext("webgl2") || probe.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function makeStarfield() {
  const random = seededRandom(9317);
  const count = 540;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 12 + random() * 15;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xd7efff,
      size: 0.032,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    }),
  );
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
        float intensity = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
        gl_FragColor = vec4(0.12, 0.58, 2.0, 1.0) * intensity * 0.7;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });

  return new THREE.Mesh(new THREE.SphereGeometry(2.18, 64, 64), material);
}

function resize() {
  const stage = document.querySelector("#deck-earth-stage");
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
    pointerX += (targetX - pointerX) * 0.045;
    pointerY += (targetY - pointerY) * 0.045;

    if (earthGroup) {
      earthGroup.rotation.y += delta * 0.038;
      earthGroup.rotation.x = 0.12 + pointerY * 0.16;
    }
    if (cloudMesh) cloudMesh.rotation.y += delta * 0.047;

    camera.position.x = pointerX * 0.22;
    camera.position.y = -pointerY * 0.16;
    camera.lookAt(0, 0, 0);

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

function showFallback() {
  document.querySelector("#deck-earth-stage")?.classList.remove("is-live");
}

export async function initDeckEarth() {
  if (initialized) return;
  const stage = document.querySelector("#deck-earth-stage");
  const canvas = document.querySelector("#deck-earth-canvas");
  if (!stage || !canvas) return;

  if (!supportsWebGL()) {
    showFallback();
    return;
  }

  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    earthGroup.rotation.z = -0.22;
    earthGroup.rotation.y = 2.35;
    scene.add(earthGroup);

    const loader = new THREE.TextureLoader();
    const [earthMap, normalMap, specularMap, cloudMap] = await Promise.all([
      loadTexture(loader, "earth_atmos_2048.jpg"),
      loadTexture(loader, "earth_normal_2048.jpg", false),
      loadTexture(loader, "earth_specular_2048.jpg", false),
      loadTexture(loader, "earth_clouds_1024.png"),
    ]);

    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthMap,
      normalMap,
      normalScale: new THREE.Vector2(0.7, 0.7),
      specularMap,
      specular: new THREE.Color(0x2d6f9c),
      shininess: 20,
    });

    earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(2, 96, 96), earthMaterial));

    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudMap,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      emissive: new THREE.Color(0x0c213f),
      emissiveIntensity: 0.16,
    });

    cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(2.015, 96, 96), cloudMaterial);
    cloudMesh.rotation.y = 0.55;
    earthGroup.add(cloudMesh);

    scene.add(makeAtmosphere());
    scene.add(new THREE.AmbientLight(0xffffff, 0.44));

    const sunLight = new THREE.DirectionalLight(0xfff8ec, 2.7);
    sunLight.position.set(-4.8, 2.8, 4.4);
    scene.add(sunLight);

    const fill = new THREE.DirectionalLight(0x5aa7d9, 0.32);
    fill.position.set(4.5, -2.2, -3.4);
    scene.add(fill);

    scene.add(makeStarfield());

    resize();
    renderer.render(scene, camera);
    stage.classList.add("is-live");
    initialized = true;

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

    const visual = stage.closest(".cover__visual");
    if (visual && !reducedMotion) {
      visual.addEventListener("pointermove", (event) => {
        const rect = visual.getBoundingClientRect();
        targetX = (event.clientX - rect.left) / rect.width - 0.5;
        targetY = (event.clientY - rect.top) / rect.height - 0.5;
      });
      visual.addEventListener("pointerleave", () => {
        targetX = 0;
        targetY = 0;
      });
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
    console.warn("Deck Earth visual unavailable; using the static fallback.", error);
    showFallback();
  }
}

export function destroyDeckEarth() {
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
  earthGroup = null;
  cloudMesh = null;
  initialized = false;
}
