
import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const root = document.querySelector("#scene");

const scene = new THREE.Scene();
scene.background = new THREE.Color("#94c9ed");
scene.fog = new THREE.Fog("#94c9ed", 40, 180);

const camera = new THREE.PerspectiveCamera(
  65, 1, 0.1, 500
);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(root.clientWidth, root.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
root.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x657080, 2));

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(-10, 20, 10);
scene.add(sun);

// 지면
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshStandardMaterial({ color: "#527d4d" })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.12;
scene.add(ground);

// 도로
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 500),
  new THREE.MeshStandardMaterial({ color: "#343941" })
);
road.rotation.x = -Math.PI / 2;
road.position.z = -180;
scene.add(road);

// 차선
const marks = [];
for (let z = -420; z < 30; z += 12) {
  const mark = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.03, 5),
    new THREE.MeshStandardMaterial({ color: "#ffffff" })
  );
  mark.position.set(0, 0.025, z);
  scene.add(mark);
  marks.push(mark);
}

// 자동차
const car = new THREE.Group();
scene.add(car);

const body = new THREE.Mesh(
  new THREE.BoxGeometry(2, 0.65, 4),
  new THREE.MeshStandardMaterial({
    color: "#dc3545",
    metalness: 0.25,
    roughness: 0.35
  })
);
body.position.y = 0.7;
car.add(body);

const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(1.45, 0.7, 1.8),
  new THREE.MeshStandardMaterial({
    color: "#8cc7df",
    metalness: 0.3,
    roughness: 0.2
  })
);
cabin.position.set(0, 1.35, -0.25);
car.add(cabin);

const wheels = [];
for (const x of [-1, 1]) {
  for (const z of [-1.25, 1.25]) {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.24, 20),
      new THREE.MeshStandardMaterial({ color: "#17191c" })
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.38, z);
    car.add(wheel);
    wheels.push(wheel);
  }
}

// 풍경 오브젝트
const trees = new THREE.Group();
scene.add(trees);

function createTree(x, z) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.25, 1.5, 8),
    new THREE.MeshStandardMaterial({ color: "#65472f" })
  );
  trunk.position.y = 0.75;
  tree.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 3, 8),
    new THREE.MeshStandardMaterial({ color: "#28613b" })
  );
  leaves.position.y = 2.5;
  tree.add(leaves);

  tree.position.set(x, 0, z);
  trees.add(tree);
  return tree;
}

const treeObjects = [];
for (let z = -400; z < 30; z += 14) {
  treeObjects.push(createTree(-10, z));
  treeObjects.push(createTree(10, z - 7));
}

// 산
const mountains = new THREE.Group();
scene.add(mountains);

for (let i = 0; i < 24; i++) {
  const mountain = new THREE.Mesh(
    new THREE.ConeGeometry(9, 20 + Math.random() * 15, 5),
    new THREE.MeshStandardMaterial({ color: "#91a5b1" })
  );
  mountain.position.set(
    (i % 2 ? 1 : -1) * (25 + Math.random() * 25),
    8,
    -50 - i * 14
  );
  mountains.add(mountain);
}

let driving = true;
let thirdPerson = true;
let elapsed = 0;
let speed = 40;
let place = "snow";
let weather = "sunny";
let daytime = "day";

const timer = new THREE.Clock();

function updateWorld() {
  const settings = {
    snow: ["#b8d1e5", "#e9eef2", "#dce6ed", "#315b40"],
    beach: ["#6fc8ed", "#e6cf91", "#53a8ad", "#34845b"],
    forest: ["#8bb4a1", "#426b42", "#496e54", "#205334"],
    city: ["#a1a9b9", "#6e747b", "#737e8b", "#3e6648"]
  };

  const colors = settings[place];

  scene.background.set(colors[0]);
  scene.fog.color.set(colors[0]);
  ground.material.color.set(colors[1]);
  mountains.children.forEach(m => m.material.color.set(colors[2]));

  treeObjects.forEach(tree => {
    tree.children[1].material.color.set(colors[3]);
  });

  sun.color.set("#ffffff");

  if (daytime === "sunset") {
    scene.background.set("#e99a79");
    scene.fog.color.set("#e99a79");
    sun.color.set("#ffcc99");
  }

  if (daytime === "night") {
    scene.background.set("#10182e");
    scene.fog.color.set("#10182e");
    sun.color.set("#8798c7");
  }

  scene.fog.near = weather === "fog" ? 5 : 40;
  scene.fog.far = weather === "fog" ? 45 : 180;

  if (weather === "snow") {
    ground.material.color.set("#dce6ed");
  }
}

function updateClock() {
  const now = new Date();
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  document.querySelector("#clock").textContent =
    new Intl.DateTimeFormat("ko-KR", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(now);
}

document.querySelector("#camera").onclick = () => {
  thirdPerson = !thirdPerson;
  document.querySelector("#camera").textContent =
    thirdPerson ? "1인칭 전환" : "3인칭 전환";
};

document.querySelector("#drive").onclick = () => {
  driving = !driving;
  document.querySelector("#drive").textContent =
    driving ? "자율주행 정지" : "자율주행 시작";
  document.querySelector("#driveStatus").textContent =
    driving ? "AUTOPILOT · ACTIVE" : "PAUSED";
  document.querySelector("#message").textContent =
    driving ? "주행 중입니다." : "주행을 정지했습니다.";
};

document.querySelector("#cruise").oninput = event => {
  speed = Number(event.target.value);
  document.querySelector("#speed").textContent =
    `속도 ${speed} km/h`;
};

document.querySelector("#place").onchange = event => {
  place = event.target.value;
  updateWorld();
};

document.querySelector("#weather").onchange = event => {
  weather = event.target.value;
  updateWorld();
};

document.querySelector("#daytime").onchange = event => {
  daytime = event.target.value;
  updateWorld();
};

document.querySelector("#musicForm").onsubmit = event => {
  event.preventDefault();
  try {
    const url = new URL(document.querySelector("#musicUrl").value);
    if (!["https:", "http:"].includes(url.protocol)) throw Error();
    window.open(url.href, "_blank", "noopener,noreferrer");
  } catch {
    alert("올바른 음악 링크를 입력해 주세요.");
  }
};

function resize() {
  const width = root.clientWidth;
  const height = root.clientHeight;
  if (!width || !height) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener("resize", resize);

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(timer.getDelta(), 0.05);

  if (driving) {
    elapsed += delta;
    const movement = speed / 3.6 * delta;

    marks.forEach(mark => {
      mark.position.z += movement;
      if (mark.position.z > 10) mark.position.z -= 450;
    });

    treeObjects.forEach(tree => {
      tree.position.z += movement;
      if (tree.position.z > 15) tree.position.z -= 430;
    });

    mountains.children.forEach(m => {
      m.position.z += movement * 0.15;
      if (m.position.z > 0) m.position.z -= 360;
    });

    wheels.forEach(wheel => {
      wheel.rotation.x += movement * 2;
    });
  }

  if (thirdPerson) {
    camera.position.set(car.position.x, 4.5, 8.5);
    camera.lookAt(0, 0.8, -8);
  } else {
    camera.position.set(0, 1.55, -0.1);
    camera.lookAt(0, 1.3, -25);
  }

  renderer.render(scene, camera);
}

updateWorld();
updateClock();
setInterval(updateClock, 250);
resize();
animate();
