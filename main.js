
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ---------- 기본 설정 ----------
const game = document.getElementById("game");
const loading = document.getElementById("loading");

const scene = new THREE.Scene();
scene.background = new THREE.Color("#9ac9e5");
scene.fog = new THREE.Fog("#9ac9e5", 70, 300);

const camera = new THREE.PerspectiveCamera(
  65,
  game.clientWidth / game.clientHeight,
  0.1,
  700
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(game.clientWidth, game.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
game.prepend(renderer.domElement);

// 조명
const ambientLight = new THREE.HemisphereLight(0xffffff, 0x52616b, 2.1);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
sunLight.position.set(-25, 45, 20);
scene.add(sunLight);

// ---------- 공통 오브젝트 ----------
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshStandardMaterial({ color: "#6b9870", roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.12;
scene.add(ground);

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(13, 700),
  new THREE.MeshStandardMaterial({ color: "#30343a", roughness: 0.95 })
);
road.rotation.x = -Math.PI / 2;
road.position.set(0, -0.04, -180);
scene.add(road);

// 도로 가장자리 선
const edgeLines = [];
for (const x of [-6.25, 6.25]) {
  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(0.16, 700),
    new THREE.MeshBasicMaterial({ color: "#f4f0d9" })
  );
  line.rotation.x = -Math.PI / 2;
  line.position.set(x, 0.015, -180);
  scene.add(line);
  edgeLines.push(line);
}

// 차선 점선
const laneMarks = [];
for (let i = 0; i < 36; i++) {
  const mark = new THREE.Mesh(
    new THREE.PlaneGeometry(0.16, 5.5),
    new THREE.MeshBasicMaterial({ color: "#ffffff" })
  );
  mark.rotation.x = -Math.PI / 2;
  mark.position.set(0, 0.02, -i * 10);
  scene.add(mark);
  laneMarks.push(mark);
}

// 자동차
const car = new THREE.Group();
scene.add(car);

const bodyMaterial = new THREE.MeshStandardMaterial({
  color: "#e13d4f",
  metalness: 0.35,
  roughness: 0.35
});
const glassMaterial = new THREE.MeshStandardMaterial({
  color: "#17334b",
  metalness: 0.3,
  roughness: 0.2
});

const body = new THREE.Mesh(
  new THREE.BoxGeometry(2.15, 0.65, 4.1),
  bodyMaterial
);
body.position.y = 0.82;
car.add(body);

const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(1.55, 0.72, 1.9),
  glassMaterial
);
cabin.position.set(0, 1.47, -0.25);
car.add(cabin);

const hood = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 0.12, 1.15),
  bodyMaterial
);
hood.position.set(0, 1.05, -1.35);
car.add(hood);

const wheels = [];
const wheelGeometry = new THREE.CylinderGeometry(0.39, 0.39, 0.25, 20);
const wheelMaterial = new THREE.MeshStandardMaterial({
  color: "#15171c",
  roughness: 0.85
});

for (const x of [-1.08, 1.08]) {
  for (const z of [-1.28, 1.3]) {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.43, z);
    car.add(wheel);
    wheels.push(wheel);
  }
}

function addHeadlight(x) {
  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.17, 0.08),
    new THREE.MeshBasicMaterial({ color: "#fff2bc" })
  );
  lamp.position.set(x, 0.94, -2.08);
  car.add(lamp);
}
addHeadlight(-0.65);
addHeadlight(0.65);

// 자동차 뒤쪽 빨간 램프
for (const x of [-0.68, 0.68]) {
  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.16, 0.08),
    new THREE.MeshBasicMaterial({ color: "#ff253c" })
  );
  lamp.position.set(x, 0.95, 2.08);
  car.add(lamp);
}

car.position.set(0, 0, 3);

// ---------- 풍경 생성 ----------
const scenery = new THREE.Group();
scene.add(scenery);

function material(color, roughness = 1) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

function addBox(x, y, z, w, h, d, color, parent = scenery) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    material(color, 0.9)
  );
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function addCone(x, y, z, radius, height, color, parent = scenery) {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height, 7),
    material(color)
  );
  mesh.position.set(x, y + height / 2, z);
  parent.add(mesh);
  return mesh;
}

function addTree(x, z, scale = 1, snowy = false) {
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);
  tree.scale.setScalar(scale);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.27, 2.0, 7),
    material("#6b4228")
  );
  trunk.position.y = 1;
  tree.add(trunk);

  const leafColor = snowy ? "#315b4b" : "#176247";
  addCone(0, 2.2, 0, 1.15, 2.6, leafColor, tree);
  addCone(0, 3.15, 0, 0.82, 2.15, snowy ? "#e9f4f7" : "#237957", tree);

  if (snowy) {
    addCone(0, 3.75, 0, 0.45, 1.2, "#f4fbff", tree);
  }

  scenery.add(tree);
}

function addMountain(x, z, radius, height, color) {
  const mountain = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height, 5),
    material(color)
  );
  mountain.position.set(x, height / 2 - 0.1, z);
  mountain.rotation.y = 0.3;
  scenery.add(mountain);

  // 산 정상의 눈
  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(radius * 0.34, height * 0.29, 5),
    material("#f1f7fb")
  );
  cap.position.set(x, height * 0.82, z);
  cap.rotation.y = 0.3;
  scenery.add(cap);
}

function addBuilding(x, z, width, height, color) {
  const building = addBox(
    x, height / 2 - 0.1, z,
    width, height, width * 0.85, color
  );

  // 건물 정면의 창문
  const rows = Math.min(12, Math.floor(height / 1.5));
  const cols = Math.max(2, Math.floor(width / 0.8));

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const windowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.22, 0.34),
        new THREE.MeshBasicMaterial({
          color: Math.random() > 0.25 ? "#8fd4e8" : "#f5d98a"
        })
      );
      windowMesh.position.set(
        x - width / 2 + (col + 0.7) * width / (cols + 0.4),
        0.65 + row * 1.25,
        z - width * 0.43 - 0.01
      );
      scenery.add(windowMesh);
    }
  }
  return building;
}

function addPalm(x, z, scale = 1) {
  const palm = new THREE.Group();
  palm.position.set(x, 0, z);
  palm.scale.setScalar(scale);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.22, 4.1, 8),
    material("#8e653c")
  );
  trunk.position.y = 2.05;
  trunk.rotation.z = -0.06;
  palm.add(trunk);

  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.08, 2.2),
      material("#238b58")
    );
    leaf.position.set(
      Math.sin(i * Math.PI / 3.5) * 0.7,
      4.0,
      Math.cos(i * Math.PI / 3.5) * 0.7
    );
    leaf.rotation.y = i * Math.PI / 3.5;
    leaf.rotation.x = -0.25;
    palm.add(leaf);
  }

  scenery.add(palm);
}

function addStreetLamp(x, z) {
  addBox(x, 2.2, z, 0.12, 4.4, 0.12, "#4c5662");
  addBox(x + (x < 0 ? 0.35 : -0.35), 4.3, z, 0.8, 0.12, 0.12, "#4c5662");

  const light = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.12, 0.25),
    new THREE.MeshBasicMaterial({ color: "#fff1b0" })
  );
  light.position.set(x + (x < 0 ? 0.65 : -0.65), 4.22, z);
  scenery.add(light);
}

// 바다와 모래는 풍경 선택 시 표시
const sea = new THREE.Mesh(
  new THREE.PlaneGeometry(260, 700),
  new THREE.MeshStandardMaterial({
    color: "#168dc0",
    roughness: 0.35,
    metalness: 0.1
  })
);
sea.rotation.x = -Math.PI / 2;
sea.position.set(38, -0.08, -180);
scene.add(sea);

const beachSand = new THREE.Mesh(
  new THREE.PlaneGeometry(260, 700),
  material("#e5cd8c")
);
beachSand.rotation.x = -Math.PI / 2;
beachSand.position.set(-38, -0.09, -180);
scene.add(beachSand);

// 바다의 파도 선
const waves = [];
for (let i = 0; i < 36; i++) {
  const wave = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 0.18),
    new THREE.MeshBasicMaterial({
      color: "#b4efff",
      transparent: true,
      opacity: 0.65
    })
  );
  wave.rotation.x = -Math.PI / 2;
  wave.position.set(25 + Math.random() * 25, -0.04, -i * 10);
  scene.add(wave);
  waves.push(wave);
}

function clearScenery() {
  while (scenery.children.length) {
    const object = scenery.children[0];
    scenery.remove(object);
    object.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}

const palettes = {
  snow: {
    sky: "#9cc7e3",
    ground: "#e5edf1",
    road: "#343a40",
    fog: "#dbe7ed",
    title: "설원 드라이브"
  },
  beach: {
    sky: "#66c8ed",
    ground: "#e7ce91",
    road: "#55565a",
    fog: "#b7e3ef",
    title: "해변 드라이브"
  },
  forest: {
    sky: "#8bbca5",
    ground: "#42774b",
    road: "#303a37",
    fog: "#9cb9a3",
    title: "숲속 드라이브"
  },
  city: {
    sky: "#9bb6d3",
    ground: "#626d70",
    road: "#292e35",
    fog: "#b6c5d5",
    title: "도심 드라이브"
  }
};

let currentPlace = "snow";
let currentWeather = "sunny";
let currentTime = "day";

function buildScenery(place) {
  clearScenery();

  if (place === "snow") {
    // 멀리 보이는 거대한 눈 덮인 산
    for (let i = 0; i < 14; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      addMountain(
        side * (18 + Math.random() * 28),
        -35 - i * 34,
        10 + Math.random() * 10,
        18 + Math.random() * 24,
        i % 2 ? "#9db6c8" : "#b5cbd8"
      );
    }

    for (let z = 10; z > -360; z -= 17) {
      addTree(-9 - Math.random() * 6, z, 0.9 + Math.random() * 0.6, true);
      addTree(9 + Math.random() * 6, z - 5, 0.9 + Math.random() * 0.6, true);
    }
  }

  if (place === "beach") {
    // 야자수와 모래 언덕
    for (let z = 10; z > -360; z -= 19) {
      addPalm(-10 - Math.random() * 5, z, 0.8 + Math.random() * 0.5);
      if (Math.random() > 0.25) {
        addPalm(-19 - Math.random() * 5, z - 6, 0.65 + Math.random() * 0.4);
      }
      addBox(-23, 0.4, z - 4, 1.2, 0.8, 1.5, "#d5bb7d");
    }

    for (let z = 5; z > -360; z -= 30) {
      addBox(12, 0.5, z, 1.1, 1, 1.2, "#e2cc96");
    }
  }

  if (place === "forest") {
    // 여러 크기의 나무가 도로 양쪽에 빽빽하게 배치됨
    for (let z = 12; z > -370; z -= 9) {
      addTree(-9 - Math.random() * 10, z, 0.8 + Math.random() * 1.1);
      addTree(9 + Math.random() * 10, z - 3, 0.8 + Math.random() * 1.1);

      if (Math.random() > 0.25) {
        addTree(-18 - Math.random() * 8, z - 5, 0.7 + Math.random() * 0.8);
        addTree(18 + Math.random() * 8, z - 7, 0.7 + Math.random() * 0.8);
      }
    }
  }

  if (place === "city") {
    // 높이가 서로 다른 빌딩 숲
    for (let z = 12; z > -370; z -= 15) {
      addBuilding(-12 - Math.random() * 7, z, 4 + Math.random() * 4,
        10 + Math.random() * 27, ["#52677e", "#68798c", "#48566b"][Math.floor(Math.random() * 3)]);

      addBuilding(12 + Math.random() * 7, z - 7, 4 + Math.random() * 4,
        12 + Math.random() * 30, ["#566b80", "#7d8c9b", "#4b5d72"][Math.floor(Math.random() * 3)]);

      if (Math.random() > 0.35) {
        addStreetLamp(-7.3, z - 3);
        addStreetLamp(7.3, z - 10);
      }
    }
  }

  sea.visible = place === "beach";
  beachSand.visible = place === "beach";
  waves.forEach(w => w.visible = place === "beach");

  // 숲과 산 풍경에서는 도로 양옆의 초록 지면을 강조
  updatePalette();
}

// ---------- 날씨와 시간 ----------
function updatePalette() {
  const palette = palettes[currentPlace];

  let sky = palette.sky;
  let groundColor = palette.ground;
  let fogColor = palette.fog;
  let roadColor = palette.road;
  let ambient = 2.0;
  let sun = 2.4;
  let fogDensity = null;

  if (currentTime === "sunset") {
    sky = "#e99b79";
    fogColor = "#e9a68a";
    ambient = 1.25;
    sun = 1.7;
  }

  if (currentTime === "night") {
    sky = "#071326";
    fogColor = "#101c31";
    groundColor = currentPlace === "snow" ? "#647586" : "#202c31";
    roadColor = "#171c25";
    ambient = 0.48;
    sun = 0.25;
  }

  if (currentWeather === "rain") {
    if (currentTime !== "night") sky = "#657887";
    fogColor = "#8294a0";
    roadColor = "#242d35";
    sun *= 0.55;
    ambient *= 0.85;
  }

  if (currentWeather === "snow") {
    if (currentPlace !== "beach") groundColor = "#e4edf3";
    if (currentTime !== "night") sky = "#b7cbd8";
    fogColor = "#d6e0e7";
    sun *= 0.8;
  }

  if (currentWeather === "fog") {
    sky = currentTime === "night" ? "#252d3c" : "#b5c0c5";
    fogColor = sky;
    fogDensity = 0.018;
    sun *= 0.55;
  }

  scene.background.set(sky);
  scene.fog.color.set(fogColor);
  scene.fog.near = currentWeather === "fog" ? 8 : 70;
  scene.fog.far = currentWeather === "fog" ? 95 : 300;

  ground.material.color.set(groundColor);
  road.material.color.set(roadColor);
  ambientLight.intensity = ambient;
  sunLight.intensity = sun;

  if (currentTime === "night") {
    sunLight.position.set(-10, 10, 10);
  } else {
    sunLight.position.set(-25, 45, 20);
  }

  // 야간 자동차 전조등
  car.children.forEach((child) => {
    if (child.material && child.material.color) {
      const c = child.material.color;
      if (child.geometry.type === "BoxGeometry" && child.position.z < -1.8) {
        c.set(currentTime === "night" ? "#fff8d2" : "#fff2bc");
      }
    }
  });

  document.getElementById("sceneTitle").textContent = palettes[currentPlace].title;
  document.getElementById("weatherLabel").textContent = {
    sunny: "☀️ 맑음",
    rain: "🌧️ 비",
    snow: "❄️ 눈",
    fog: "🌫️ 안개"
  }[currentWeather];

  document.getElementById("timeLabel").textContent = {
    day: "🌞 낮",
    sunset: "🌇 노을",
    night: "🌙 밤"
  }[currentTime];

  document.getElementById("message").textContent =
    `${palettes[currentPlace].title} · ${document.getElementById("weather").selectedOptions[0].textContent} · ${document.getElementById("daytime").selectedOptions[0].textContent}`;

  updateWeatherParticles();
}

// ---------- 비와 눈 ----------
const particleCount = 1500;
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 90;
  particlePositions[i * 3 + 1] = Math.random() * 45;
  particlePositions[i * 3 + 2] = -Math.random() * 300;
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlePositions, 3)
);

const weatherParticles = new THREE.Points(
  particleGeometry,
  new THREE.PointsMaterial({
    color: "#dcecf5",
    size: 0.14,
    transparent: true,
    opacity: 0.85
  })
);
scene.add(weatherParticles);

function updateWeatherParticles() {
  weatherParticles.visible = currentWeather === "rain" || currentWeather === "snow";

  if (currentWeather === "rain") {
    weatherParticles.material.color.set("#a7d7f0");
    weatherParticles.material.size = 0.1;
    weatherParticles.material.opacity = 0.55;
  } else {
    weatherParticles.material.color.set("#ffffff");
    weatherParticles.material.size = 0.22;
    weatherParticles.material.opacity = 0.9;
  }
}

// ---------- 카메라와 조작 ----------
let driving = false;
let firstPerson = false;
let currentSpeed = 0;
let targetSpeed = 80;

const driveButton = document.getElementById("drive");
const stopButton = document.getElementById("stop");
const cameraButton = document.getElementById("camera");
const speedLabel = document.getElementById("speed");
const cruise = document.getElementById("cruise");
const cruiseValue = document.getElementById("cruiseValue");
const driveStatus = document.getElementById("driveStatus");
const cameraLabel = document.getElementById("cameraLabel");

function setDriving(value) {
  driving = value;
  driveButton.textContent = driving ? "Ⅱ 자율주행 일시 정지" : "▶ 자율주행 시작";
  driveStatus.textContent = driving ? "자율주행 중" : "대기 중";
  driveStatus.classList.toggle("active", driving);

  if (!driving) {
    currentSpeed = 0;
    speedLabel.textContent = "0";
  }
}

driveButton.addEventListener("click", () => setDriving(!driving));
stopButton.addEventListener("click", () => setDriving(false));

cameraButton.addEventListener("click", () => {
  firstPerson = !firstPerson;
  cameraLabel.textContent = firstPerson ? "운전자 시점" : "3인칭 시점";
});

cruise.addEventListener("input", () => {
  targetSpeed = Number(cruise.value);
  cruiseValue.textContent = targetSpeed;
});

// 풍경·날씨·시간 변경
document.getElementById("place").addEventListener("change", (event) => {
  currentPlace = event.target.value;
  buildScenery(currentPlace);
});

document.getElementById("weather").addEventListener("change", (event) => {
  currentWeather = event.target.value;
  updatePalette();
});

document.getElementById("daytime").addEventListener("change", (event) => {
  currentTime = event.target.value;
  updatePalette();
});

// 음악 링크 열기
document.getElementById("musicButton").addEventListener("click", () => {
  const value = document.getElementById("musicUrl").value.trim();

  if (!value) {
    document.getElementById("message").textContent = "먼저 음악 링크를 입력해 주세요.";
    return;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("Invalid protocol");
    }
    window.open(url.href, "_blank", "noopener,noreferrer");
  } catch {
    document.getElementById("message").textContent = "올바른 http 또는 https 음악 링크를 입력해 주세요.";
  }
});

// ---------- 실시간 시계 ----------
function updateClock() {
  document.getElementById("clock").textContent =
    new Intl.DateTimeFormat("ko-KR", {
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

// ---------- 화면 크기 대응 ----------
function resizeRenderer() {
  const width = game.clientWidth;
  const height = game.clientHeight;
  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
window.addEventListener("resize", resizeRenderer);

// ---------- 게임 실행 ----------
const clock = new THREE.Clock();
let elapsed = 0;

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  elapsed += delta;

  if (driving) {
    currentSpeed += (targetSpeed - currentSpeed) * Math.min(1, delta * 1.8);
  } else {
    currentSpeed = 0;
  }

  speedLabel.textContent = Math.round(currentSpeed);

  const movement = driving ? currentSpeed * delta * 0.85 : 0;

  if (driving) {
    laneMarks.forEach((mark) => {
      mark.position.z += movement;
      if (mark.position.z > 12) mark.position.z -= 360;
    });

    scenery.children.forEach((object) => {
      object.position.z += movement;
      if (object.position.z > 16) object.position.z -= 390;
    });

    waves.forEach((wave) => {
      wave.position.z += movement * 0.7;
      if (wave.position.z > 12) wave.position.z -= 360;
    });

    wheels.forEach((wheel) => {
      wheel.rotation.x += movement * 0.7;
    });

    car.position.x = Math.sin(elapsed * 0.35) * 0.12;
    car.rotation.z = Math.sin(elapsed * 0.35) * 0.008;
  }

  // 비와 눈이 떨어지는 움직임
  const positions = weatherParticles.geometry.attributes.position.array;

  if (weatherParticles.visible) {
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      positions[idx + 1] -= delta * (currentWeather === "rain" ? 24 : 5);
      positions[idx + 2] += driving ? movement * 0.7 : 0;

      if (positions[idx + 1] < 0 || positions[idx + 2] > 8) {
        positions[idx] = (Math.random() - 0.5) * 90;
        positions[idx + 1] = 20 + Math.random() * 25;
        positions[idx + 2] = -Math.random() * 300;
      }
    }
    weatherParticles.geometry.attributes.position.needsUpdate = true;
  }

  // 카메라 전환
  if (firstPerson) {
    camera.position.set(car.position.x, 2.0, 1.25);
    camera.lookAt(car.position.x, 1.8, -35);
  } else {
    camera.position.set(car.position.x + 0.5, 6.5, 13);
    camera.lookAt(car.position.x, 0.8, -18);
  }

  // 안개는 풍경의 원근감을 조절합니다.
  renderer.render(scene, camera);
}

// 최초 환경 구성
buildScenery(currentPlace);
updatePalette();
resizeRenderer();
loading.classList.add("hidden");
animate();
