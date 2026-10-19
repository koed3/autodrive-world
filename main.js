
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const $ = id => document.getElementById(id);
const game = $("game");
const loading = $("loading");

const scene = new THREE.Scene();
scene.background = new THREE.Color("#9fc8df");
scene.fog = new THREE.Fog("#9fc8df", 65, 300);

const camera = new THREE.PerspectiveCamera(66, 1, 0.1, 700);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
game.prepend(renderer.domElement);

// 조명
const ambient = new THREE.HemisphereLight(0xe4f2ff, 0x46564c, 1.9);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffefda, 2.4);
sun.position.set(-30, 55, 25);
scene.add(sun);

function standard(color, roughness = 0.85, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addBox(parent, x, y, z, w, h, d, color, roughness = 0.85) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    standard(color, roughness)
  );
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function addCone(parent, x, y, z, radius, height, color, sides = 8) {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height, sides),
    standard(color)
  );
  mesh.position.set(x, y + height / 2, z);
  parent.add(mesh);
  return mesh;
}

// 절차적으로 만든 아스팔트 질감
function createAsphaltTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#393c40";
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 9000; i++) {
    const v = Math.floor(35 + Math.random() * 65);
    ctx.fillStyle = `rgba(${v},${v},${v},${Math.random() * 0.28})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 40);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 지면
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1200, 1200),
  standard("#648d68")
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.18;
scene.add(ground);

// 도로 표면
const roadMaterial = new THREE.MeshStandardMaterial({
  map: createAsphaltTexture(),
  color: "#ffffff",
  roughness: 0.95,
  metalness: 0
});

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(13, 1000),
  roadMaterial
);
road.rotation.x = -Math.PI / 2;
road.position.set(0, -0.055, -300);
scene.add(road);

// 도로 가장자리 선
for (const x of [-6.1, 6.1]) {
  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(0.14, 1000),
    new THREE.MeshBasicMaterial({ color: "#f2eee0" })
  );
  line.rotation.x = -Math.PI / 2;
  line.position.set(x, 0.012, -300);
  scene.add(line);
}

// 중앙 차선
const laneMarks = [];
for (let i = 0; i < 48; i++) {
  const mark = new THREE.Mesh(
    new THREE.PlaneGeometry(0.15, 5.5),
    new THREE.MeshBasicMaterial({ color: "#fffdf2" })
  );
  mark.rotation.x = -Math.PI / 2;
  mark.position.set(0, 0.018, 8 - i * 10);
  scene.add(mark);
  laneMarks.push(mark);
}

// 도로 가장자리 반사 표지
const roadPosts = [];
for (let i = 0; i < 44; i++) {
  for (const x of [-6.8, 6.8]) {
    const post = new THREE.Group();
    addBox(post, x, 0.65, 0, 0.12, 1.3, 0.12, "#e8e9e5");
    addBox(post, x, 0.9, -0.01, 0.14, 0.2, 0.14, "#e94d4d");
    post.position.z = 5 - i * 11;
    scene.add(post);
    roadPosts.push(post);
  }
}

// 바다와 모래
const sea = new THREE.Mesh(
  new THREE.PlaneGeometry(260, 1000),
  standard("#168dbb", 0.3, 0.12)
);
sea.rotation.x = -Math.PI / 2;
sea.position.set(43, -0.13, -300);
scene.add(sea);

const sand = new THREE.Mesh(
  new THREE.PlaneGeometry(260, 1000),
  standard("#e5ce94")
);
sand.rotation.x = -Math.PI / 2;
sand.position.set(-43, -0.14, -300);
scene.add(sand);

const waves = [];
for (let i = 0; i < 45; i++) {
  const wave = new THREE.Mesh(
    new THREE.PlaneGeometry(12 + Math.random() * 12, 0.12),
    new THREE.MeshBasicMaterial({
      color: "#c3f1ff",
      transparent: true,
      opacity: 0.55
    })
  );
  wave.rotation.x = -Math.PI / 2;
  wave.position.set(27 + Math.random() * 27, -0.04, 5 - i * 10);
  scene.add(wave);
  waves.push(wave);
}

// 자동차 모델
const car = new THREE.Group();
scene.add(car);

const paint = standard("#c93443", 0.28, 0.4);
const glass = standard("#18384f", 0.18, 0.25);
const tireMaterial = standard("#17191d", 0.95);
const rimMaterial = standard("#aab6c0", 0.28, 0.7);

function carBox(x, y, z, w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  car.add(mesh);
  return mesh;
}

carBox(0, 0.8, 0, 2.1, 0.58, 4.15, paint);
carBox(0, 1.32, -0.28, 1.58, 0.73, 2.0, glass);
carBox(0, 1.02, -1.38, 1.82, 0.13, 1.15, paint);
carBox(0, 1.04, 1.53, 1.76, 0.13, 0.65, paint);
carBox(0, 1.51, -1.14, 1.3, 0.4, 0.06, standard("#8db6ca", 0.2));
carBox(0, 1.5, 0.69, 1.3, 0.4, 0.06, glass);

// 앞유리 기둥
for (const x of [-0.7, 0.7]) {
  const pillar = carBox(x, 1.45, -1.13, 0.08, 0.54, 0.1, paint);
  pillar.rotation.x = -0.12;
}

const wheels = [];
for (const x of [-1.06, 1.06]) {
  for (const z of [-1.32, 1.3]) {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.24, 24),
      tireMaterial
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.4, z);
    car.add(wheel);
    wheels.push(wheel);

    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.25, 16),
      rimMaterial
    );
    rim.rotation.z = Math.PI / 2;
    rim.position.copy(wheel.position);
    car.add(rim);
  }
}

const headlights = [];
for (const x of [-0.68, 0.68]) {
  const lamp = carBox(x, 0.95, -2.09, 0.42, 0.15, 0.07,
    new THREE.MeshBasicMaterial({ color: "#fff1c0" }));
  headlights.push(lamp);
  carBox(x, 0.95, 2.09, 0.4, 0.15, 0.07,
    new THREE.MeshBasicMaterial({ color: "#ff263e" }));
}

// 전조등 빛
const headlightLights = [];
for (const x of [-0.68, 0.68]) {
  const light = new THREE.SpotLight("#fff1c8", 0, 55, Math.PI / 5, 0.5, 1.5);
  light.position.set(x, 0.95, -2);
  light.target.position.set(x, 0, -30);
  car.add(light);
  car.add(light.target);
  headlightLights.push(light);
}
car.position.set(0, 0, 3);

// 풍경 구간: 각 구간을 재활용해 도로가 끝없이 이어지는 효과
const segments = [];
const SEGMENT_LENGTH = 20;
const SEGMENT_COUNT = 24;
let currentPlace = "snow";
let currentWeather = "sunny";
let currentTime = "day";

function addTree(parent, x, z, scale = 1, snowy = false) {
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);
  tree.scale.setScalar(scale);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.23, 1.8, 8),
    standard("#6d452b")
  );
  trunk.position.y = 0.9;
  tree.add(trunk);

  addCone(tree, 0, 1.45, 0, 1.05, 2.2,
    snowy ? "#315748" : "#185e3d");
  addCone(tree, 0, 2.25, 0, 0.75, 1.8,
    snowy ? "#e7f0f4" : "#287b4d");

  if (snowy) addCone(tree, 0, 2.9, 0, 0.38, 1.0, "#f8fbff");
  parent.add(tree);
}

function addPalm(parent, x, z, scale = 1) {
  const palm = new THREE.Group();
  palm.position.set(x, 0, z);
  palm.scale.setScalar(scale);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.2, 3.8, 8),
    standard("#95663d")
  );
  trunk.position.y = 1.9;
  trunk.rotation.z = -0.07;
  palm.add(trunk);

  for (let i = 0; i < 7; i++) {
    const angle = i * Math.PI * 2 / 7;
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.07, 1.9),
      standard("#23834c")
    );
    leaf.position.set(Math.sin(angle) * 0.58, 3.7, Math.cos(angle) * 0.58);
    leaf.rotation.y = angle;
    leaf.rotation.x = -0.25;
    palm.add(leaf);
  }
  parent.add(palm);
}

function addMountain(parent, x, z, radius, height, color) {
  const mountain = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height, 6),
    standard(color)
  );
  mountain.position.set(x, height / 2 - 0.1, z);
  mountain.rotation.y = 0.2;
  parent.add(mountain);

  const snowCap = new THREE.Mesh(
    new THREE.ConeGeometry(radius * 0.33, height * 0.26, 6),
    standard("#edf5fa")
  );
  snowCap.position.set(x, height * 0.79, z);
  snowCap.rotation.y = 0.2;
  parent.add(snowCap);
}

function addBuilding(parent, x, z, width, height, color) {
  addBox(parent, x, height / 2 - 0.1, z,
    width, height, width * 0.88, color);

  const rows = Math.min(10, Math.floor(height / 1.7));
  const cols = Math.max(2, Math.floor(width / 0.9));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const windowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.23, 0.32),
        new THREE.MeshBasicMaterial({
          color: Math.random() > 0.3 ? "#87cde5" : "#f3d69a"
        })
      );
      windowMesh.position.set(
        x - width / 2 + (c + 0.65) * width / (cols + 0.25),
        0.7 + r * 1.45,
        z - width * 0.445
      );
      parent.add(windowMesh);
    }
  }
}

function addStreetLamp(parent, x, z) {
  addBox(parent, x, 2, z, 0.12, 4, 0.12, "#5a626c");
  addBox(parent, x + (x < 0 ? 0.35 : -0.35), 3.9, z,
    0.8, 0.1, 0.12, "#5a626c");
  addBox(parent, x + (x < 0 ? 0.68 : -0.68), 3.82, z,
    0.34, 0.12, 0.24, "#fff0bd");
}

function makeSegment(index) {
  const group = new THREE.Group();
  group.position.z = 8 - index * SEGMENT_LENGTH;

  if (currentPlace === "snow") {
    addMountain(group, -23, -8, 13, 25, "#a9c0cf");
    addMountain(group, 25, -12, 15, 29, "#91aabb");
    addTree(group, -9.5, -3, 1.0, true);
    addTree(group, 10.5, -8, 1.1, true);
    addTree(group, -14, -15, 0.85, true);
    addTree(group, 15, -2, 0.9, true);
  }

  if (currentPlace === "beach") {
    addPalm(group, -10.5, -3, 1);
    addPalm(group, -15, -11, 0.85);
    addPalm(group, -11, -17, 0.8);
    addBox(group, -22, 0.3, -9, 2, 0.6, 2, "#d5bd83");
  }

  if (currentPlace === "forest") {
    addTree(group, -10, -2, 1.15);
    addTree(group, 10, -6, 1.2);
    addTree(group, -15, -12, 1.0);
    addTree(group, 16, -14, 1.1);
    addTree(group, -11, -17, 0.9);
    addTree(group, 12, -1, 0.95);
  }

  if (currentPlace === "city") {
    const colors = ["#52677e", "#66788b", "#485a70", "#7b8793"];
    addBuilding(group, -12, -4, 5, 12 + Math.random() * 12,
      colors[Math.floor(Math.random() * colors.length)]);
    addBuilding(group, 13, -9, 5, 14 + Math.random() * 15,
      colors[Math.floor(Math.random() * colors.length)]);
    addBuilding(group, -17, -16, 5, 16 + Math.random() * 10, "#596b7d");
    addBuilding(group, 18, -2, 5, 12 + Math.random() * 12, "#596b7d");
    addStreetLamp(group, -7.4, -6);
    addStreetLamp(group, 7.4, -14);
  }

  scene.add(group);
  return group;
}

function clearSegments() {
  for (const segment of segments) {
    scene.remove(segment);
    segment.traverse(object => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
        else object.material.dispose();
      }
    });
  }
  segments.length = 0;
}

function rebuildScenery() {
  clearSegments();
  for (let i = 0; i < SEGMENT_COUNT; i++) segments.push(makeSegment(i));

  sea.visible = currentPlace === "beach";
  sand.visible = currentPlace === "beach";
  waves.forEach(wave => wave.visible = currentPlace === "beach");

  $("sceneTitle").textContent = {
    snow: "알파인 설산 도로",
    beach: "해안 드라이브",
    forest: "깊은 숲속 도로",
    city: "현대 도시 드라이브"
  }[currentPlace];

  updateGroundColor();
}

function updateGroundColor() {
  let color = {
    snow: "#dce6ec",
    beach: "#d7bd83",
    forest: "#477449",
    city: "#555e62"
  }[currentPlace];

  if (currentTime === "night") {
    color = {
      snow: "#687986",
      beach: "#645c4b",
      forest: "#1d392b",
      city: "#30373b"
    }[currentPlace];
  }
  ground.material.color.set(color);
}

// 날씨 입자
const PARTICLE_COUNT = 900;
const particlePositions = new Float32Array(PARTICLE_COUNT * 3);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 70;
  particlePositions[i * 3 + 1] = Math.random() * 35;
  particlePositions[i * 3 + 2] = -Math.random() * 220;
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlePositions, 3)
);

const particles = new THREE.Points(
  particleGeometry,
  new THREE.PointsMaterial({
    color: "#e8f5ff",
    size: 0.16,
    transparent: true,
    opacity: 0.8,
    depthWrite: false
  })
);
scene.add(particles);

// 시간·날씨 환경 설정
function updateEnvironment() {
  let sky = {
    snow: "#9fc5dc",
    beach: "#68c6e9",
    forest: "#8ab9a1",
    city: "#9db9d3"
  }[currentPlace];

  let fogColor = sky;
  let ambientPower = 1.9;
  let sunPower = 2.4;

  if (currentTime === "sunset") {
    sky = "#e99f7e";
    fogColor = "#e7b39a";
    ambientPower = 1.35;
    sunPower = 1.7;
  }

  if (currentTime === "night") {
    sky = "#081426";
    fogColor = "#142238";
    ambientPower = 0.55;
    sunPower = 0.25;
  }

  if (currentWeather === "rain") {
    if (currentTime !== "night") sky = "#667b8b";
    fogColor = "#7d909d";
    ambientPower *= 0.85;
    sunPower *= 0.6;
  }

  if (currentWeather === "snow") {
    if (currentPlace !== "beach" && currentTime !== "night") sky = "#b9ceda";
    fogColor = "#dbe6ed";
    sunPower *= 0.8;
  }

  if (currentWeather === "fog") {
    sky = currentTime === "night" ? "#273143" : "#b9c4c9";
    fogColor = sky;
  }

  scene.background.set(sky);
  scene.fog.color.set(fogColor);
  scene.fog.near = currentWeather === "fog" ? 5 : 65;
  scene.fog.far = currentWeather === "fog" ? 85 : 300;

  ambient.intensity = ambientPower;
  sun.intensity = sunPower;
  sun.position.set(-30, currentTime === "night" ? 12 : 55, 25);

  updateGroundColor();

  headlightLights.forEach(light => {
    light.intensity = currentTime === "night" ? 3.5 : 0;
  });

  particles.visible = currentWeather === "rain" || currentWeather === "snow";
  if (currentWeather === "rain") {
    particles.material.color.set("#b7d9ee");
    particles.material.size = 0.09;
    particles.material.opacity = 0.65;
  } else {
    particles.material.color.set("#ffffff");
    particles.material.size = 0.2;
    particles.material.opacity = 0.9;
  }

  $("weatherLabel").textContent = {
    sunny: "☀️ 맑음",
    rain: "🌧️ 비",
    snow: "❄️ 눈",
    fog: "🌫️ 안개"
  }[currentWeather];

  $("timeLabel").textContent = {
    day: "🌞 낮",
    sunset: "🌇 노을",
    night: "🌙 밤"
  }[currentTime];

  $("message").textContent =
    `${$("place").selectedOptions[0].textContent} · ` +
    `${$("weather").selectedOptions[0].textContent} · ` +
    `${$("daytime").selectedOptions[0].textContent}`;
}

// 조작
let driving = false;
let firstPerson = false;
let currentSpeed = 0;
let targetSpeed = 80;

function setDriving(value) {
  driving = value;
  $("drive").textContent = driving ? "Ⅱ 주행 일시 정지" : "▶ 자율주행 시작";
  $("driveStatus").textContent = driving ? "가상 주행 중" : "대기 중";
  $("driveStatus").classList.toggle("active", driving);
  if (!driving) currentSpeed = 0;
}

$("drive").addEventListener("click", () => setDriving(!driving));
$("stop").addEventListener("click", () => setDriving(false));

$("camera").addEventListener("click", () => {
  firstPerson = !firstPerson;
  $("cameraLabel").textContent = firstPerson ? "운전자 시점" : "3인칭 시점";
  $("crosshair").classList.toggle("visible", firstPerson);
});

$("cruise").addEventListener("input", event => {
  targetSpeed = Number(event.target.value);
  $("cruiseValue").textContent = targetSpeed;
});

$("place").addEventListener("change", event => {
  currentPlace = event.target.value;
  rebuildScenery();
  updateEnvironment();
});

$("weather").addEventListener("change", event => {
  currentWeather = event.target.value;
  updateEnvironment();
});

$("daytime").addEventListener("change", event => {
  currentTime = event.target.value;
  updateEnvironment();
});

$("musicButton").addEventListener("click", () => {
  try {
    const url = new URL($("musicUrl").value.trim());
    if (!["https:", "http:"].includes(url.protocol)) throw new Error();
    window.open(url.href, "_blank", "noopener,noreferrer");
  } catch {
    $("message").textContent = "올바른 http 또는 https 음악 링크를 입력해 주세요.";
  }
});

// 기기의 현지 시각
function updateClock() {
  $("clock").textContent = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date());
}
updateClock();
setInterval(updateClock, 1000);

// 화면 크기에 맞게 렌더러 조정
function resize() {
  const width = game.clientWidth;
  const height = game.clientHeight;
  if (!width || !height) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
window.addEventListener("resize", resize);

// 게임 루프
const timer = new THREE.Clock();
let elapsed = 0;

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(timer.getDelta(), 0.05);
  elapsed += delta;

  if (driving) {
    currentSpeed += (targetSpeed - currentSpeed) * Math.min(1, delta * 1.6);
  } else {
    currentSpeed = 0;
  }

  $("speed").textContent = Math.round(currentSpeed);

  const movement = driving ? currentSpeed * delta * 0.72 : 0;

  if (driving) {
    // 차선과 도로 반사 표지가 뒤로 움직입니다.
    laneMarks.forEach(mark => {
      mark.position.z += movement;
      if (mark.position.z > 12) mark.position.z -= 480;
    });

    roadPosts.forEach(post => {
      post.position.z += movement;
      if (post.position.z > 12) post.position.z -= 484;
    });

    // 풍경 구간 재활용
    segments.forEach(segment => {
      segment.position.z += movement;
      if (segment.position.z > 18) {
        segment.position.z -= SEGMENT_COUNT * SEGMENT_LENGTH;
      }
    });

    waves.forEach(wave => {
      wave.position.z += movement * 0.65;
      if (wave.position.z > 12) wave.position.z -= 450;
    });

    wheels.forEach(wheel => {
      wheel.rotation.x += movement * 0.65;
    });

    // 아주 작은 차체 흔들림
    car.position.x = Math.sin(elapsed * 0.5) * 0.035;
    car.rotation.z = Math.sin(elapsed * 0.5) * 0.004;
  }

  // 비와 눈의 낙하
  const positions = particleGeometry.attributes.position.array;
  if (particles.visible) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = i * 3;
      positions[p + 1] -= delta * (currentWeather === "rain" ? 23 : 4.5);
      positions[p + 2] += driving ? movement * 0.65 : 0;

      if (positions[p + 1] < 0 || positions[p + 2] > 8) {
        positions[p] = (Math.random() - 0.5) * 70;
        positions[p + 1] = 18 + Math.random() * 20;
        positions[p + 2] = -Math.random() * 220;
      }
    }
    particleGeometry.attributes.position.needsUpdate = true;
  }

  // 카메라 두 시점
  if (firstPerson) {
    camera.position.set(car.position.x, 1.9, 1.35);
    camera.lookAt(car.position.x, 1.75, -32);
  } else {
    camera.position.set(car.position.x + 0.5, 6.3, 13.5);
    camera.lookAt(car.position.x, 0.7, -16);
  }

  renderer.render(scene, camera);
}

// 초기화
try {
  rebuildScenery();
  updateEnvironment();
  resize();
  loading.classList.add("hidden");
  animate();
} catch (error) {
  console.error("AutoDrive World 초기화 오류:", error);
  loading.textContent = "3D 화면을 불러오지 못했습니다. 인터넷 연결과 브라우저 호환성을 확인해 주세요.";
}