import * as THREE from './vendor/three.module.min.js';

const mount = document.querySelector('[data-planet-pinwheel]');

if (mount) {
  const canvas = mount.querySelector('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 120);
  camera.position.set(0, 10.5, 24);

  const rootGroup = new THREE.Group();
  rootGroup.rotation.x = -0.42;
  rootGroup.rotation.z = -0.18;
  scene.add(rootGroup);

  const ambient = new THREE.AmbientLight(0xf7eee0, 1.25);
  scene.add(ambient);

  const sunLight = new THREE.PointLight(0xffd08a, 4.2, 80, 1.6);
  sunLight.position.set(0, 0, 2.5);
  scene.add(sunLight);

  const rim = new THREE.DirectionalLight(0x88e6dd, 1.8);
  rim.position.set(-8, 10, 14);
  scene.add(rim);

  const planetData = [
    { name: 'Mercury', radius: 3.0, size: 0.28, color: 0xb9b0a2, phase: 0.10, speed: 1.80 },
    { name: 'Venus', radius: 4.3, size: 0.42, color: 0xd8b56e, phase: 0.94, speed: 1.52 },
    { name: 'Earth', radius: 5.7, size: 0.46, color: 0x4f9edc, phase: 1.72, speed: 1.28 },
    { name: 'Mars', radius: 7.0, size: 0.36, color: 0xc66b49, phase: 2.45, speed: 1.06 },
    { name: 'Jupiter', radius: 8.7, size: 0.86, color: 0xd1a573, phase: 3.19, speed: 0.82 },
    { name: 'Saturn', radius: 10.4, size: 0.76, color: 0xd8c184, phase: 3.92, speed: 0.68, ring: true },
    { name: 'Uranus', radius: 12.0, size: 0.58, color: 0x8bd2d2, phase: 4.72, speed: 0.56 },
    { name: 'Neptune', radius: 13.7, size: 0.56, color: 0x5b73d9, phase: 5.48, speed: 0.46 },
  ];

  const materials = {
    arm: new THREE.LineBasicMaterial({ color: 0xc9912f, transparent: true, opacity: 0.52 }),
    orbit: new THREE.LineBasicMaterial({ color: 0xfffaf1, transparent: true, opacity: 0.18 }),
    spoke: new THREE.LineBasicMaterial({ color: 0x2f7f79, transparent: true, opacity: 0.42 }),
  };

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 48, 48),
    new THREE.MeshStandardMaterial({
      color: 0xffc35a,
      emissive: 0xff8f2d,
      emissiveIntensity: 1.8,
      roughness: 0.38,
      metalness: 0.05,
    }),
  );
  rootGroup.add(sun);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(1.55, 1.95, 96),
    new THREE.MeshBasicMaterial({ color: 0xffd68d, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
  );
  halo.rotation.x = Math.PI / 2;
  rootGroup.add(halo);

  function spiralPoint(radius, theta, lift = 0) {
    const wave = Math.sin(theta * 1.7) * 0.8 + Math.cos(theta * 0.9) * 0.35;
    return new THREE.Vector3(Math.cos(theta) * radius, wave + lift, Math.sin(theta) * radius);
  }

  function createLabel(text) {
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 64;
    const ctx = labelCanvas.getContext('2d');
    ctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
    ctx.font = '700 26px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(23, 20, 17, 0.78)';
    ctx.fillRect(20, 10, 216, 44);
    ctx.strokeStyle = 'rgba(255, 250, 241, 0.72)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 10, 216, 44);
    ctx.fillStyle = '#fffaf1';
    ctx.fillText(text, 128, 32);
    const texture = new THREE.CanvasTexture(labelCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.scale.set(2.2, 0.55, 1);
    return sprite;
  }

  function makeOrbit(radius, index) {
    const points = [];
    for (let i = 0; i <= 160; i += 1) {
      const theta = (i / 160) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
    }
    const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), materials.orbit);
    orbit.rotation.x = 0.52 + index * 0.035;
    orbit.rotation.z = -0.26 + index * 0.05;
    rootGroup.add(orbit);
  }

  const planets = [];
  planetData.forEach((planet, index) => {
    const theta = planet.phase + index * 0.62;
    const position = spiralPoint(planet.radius, theta, index * 0.05);

    makeOrbit(planet.radius, index);

    const armPoints = [
      spiralPoint(1.35, theta - 0.55, 0),
      spiralPoint(planet.radius * 0.48, theta - 0.24, 0.2),
      spiralPoint(planet.radius, theta, 0.35),
    ];
    const curve = new THREE.CatmullRomCurve3(armPoints);
    rootGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)), materials.arm));

    rootGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), position]), materials.spoke));

    const body = new THREE.Mesh(
      new THREE.SphereGeometry(planet.size, 32, 24),
      new THREE.MeshStandardMaterial({
        color: planet.color,
        roughness: 0.58,
        metalness: 0.08,
        emissive: planet.color,
        emissiveIntensity: 0.08,
      }),
    );
    body.position.copy(position);
    body.userData.base = position.clone();
    body.userData.speed = planet.speed;
    body.userData.phase = planet.phase;
    rootGroup.add(body);

    if (planet.ring) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(planet.size * 1.35, planet.size * 1.9, 80),
        new THREE.MeshBasicMaterial({ color: 0xe7d4a4, transparent: true, opacity: 0.62, side: THREE.DoubleSide }),
      );
      ring.rotation.x = 1.15;
      ring.rotation.z = -0.34;
      body.add(ring);
    }

    const label = createLabel(planet.name);
    label.position.copy(position.clone().add(new THREE.Vector3(0, planet.size + 0.68, 0)));
    label.userData.parentPlanet = body;
    rootGroup.add(label);
    planets.push({ body, label, size: planet.size });
  });

  const starGeometry = new THREE.BufferGeometry();
  const starPositions = [];
  for (let i = 0; i < 380; i += 1) {
    const r = 18 + Math.random() * 24;
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 18;
    starPositions.push(Math.cos(theta) * r, y, Math.sin(theta) * r);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ color: 0xfffaf1, size: 0.04, transparent: true, opacity: 0.7 }),
  );
  scene.add(stars);

  let targetRotationY = 0;
  let targetRotationX = -0.42;
  let pointerDown = false;
  let previousX = 0;
  let previousY = 0;

  function resize() {
    const rect = mount.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width));
    const height = Math.max(360, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 700 ? 29 : 24;
    camera.position.y = width < 700 ? 12.5 : 10.5;
    camera.updateProjectionMatrix();
  }

  function onPointerDown(event) {
    pointerDown = true;
    previousX = event.clientX;
    previousY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (!pointerDown) return;
    const dx = event.clientX - previousX;
    const dy = event.clientY - previousY;
    previousX = event.clientX;
    previousY = event.clientY;
    targetRotationY += dx * 0.008;
    targetRotationX = THREE.MathUtils.clamp(targetRotationX + dy * 0.004, -1.05, 0.3);
  }

  function onPointerUp(event) {
    pointerDown = false;
    canvas.releasePointerCapture?.(event.pointerId);
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    if (!pointerDown) targetRotationY += 0.0022;
    rootGroup.rotation.y += (targetRotationY - rootGroup.rotation.y) * 0.045;
    rootGroup.rotation.x += (targetRotationX - rootGroup.rotation.x) * 0.055;
    sun.rotation.y = t * 0.42;
    halo.rotation.z = t * 0.18;
    stars.rotation.y = t * 0.006;
    planets.forEach(({ body, label, size }) => {
      body.rotation.y += 0.012 * body.userData.speed;
      body.position.y = body.userData.base.y + Math.sin(t * body.userData.speed + body.userData.phase) * 0.16;
      label.position.copy(body.position).add(new THREE.Vector3(0, size + 0.68, 0));
    });
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
