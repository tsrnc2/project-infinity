(() => {
  "use strict";

  const DEG = Math.PI / 180;
  const SVG_NS = "http://www.w3.org/2000/svg";

  const SOLAR_STATIONS = [
    ["Observe", "Witness"], ["Name", "Witness"], ["Measure", "Witness"],
    ["Test", "Refine"], ["Divide", "Refine"], ["Reconcile", "Refine"],
    ["Imagine", "Create"], ["Form", "Create"], ["Build", "Create"],
    ["Offer", "Serve"], ["Bind", "Serve"], ["Return", "Serve"]
  ];

  const PRACTICES = {
    Witness: {
      verb: "See clearly",
      copy: "Begin with the condition that actually exists. Separate observation from interpretation before choosing a response.",
      action: "Write three factual sentences about the present situation. Do not defend, predict, or explain them.",
      question: "What is true before I decide what I want the truth to mean?",
      rite: "Rite of Witness"
    },
    Refine: {
      verb: "Make one correction",
      copy: "Use pressure and measurement to reshape one chosen pattern without turning correction into punishment.",
      action: "Choose one behavior, define the smallest measurable correction, and perform it once today.",
      question: "Which change is small enough to practice and important enough to measure?",
      rite: "Circle of Refinement"
    },
    Create: {
      verb: "Make change visible",
      copy: "Give inner transformation a form that can be inspected, improved, taught, repaired, or shared.",
      action: "Produce or repair one concrete artifact: a page, meal, tool, plan, lesson, space, or piece of useful work.",
      question: "What can exist tonight that did not exist this morning because I practiced?",
      rite: "Offering of Work"
    },
    Serve: {
      verb: "Carry the gain outward",
      copy: "Complete the cycle by directing skill, attention, time, or material help beyond the self while preserving consent.",
      action: "Use one resource, skill, or block of time to reduce another person's burden without taking away their agency.",
      question: "Who or what can benefit from the strength I have built?",
      rite: "Service Action"
    }
  };

  const MOON_GATES = [
    ["Seed", "intention"], ["Emergence", "first action"], ["Trial", "testing"],
    ["Ripening", "refinement"], ["Revelation", "visibility"], ["Offering", "sharing"],
    ["Release", "subtraction"], ["Silence", "rest and return"]
  ];

  const ASPECTS = [
    [0, "Union", "combination"],
    [60, "Exchange", "cooperation"],
    [90, "Trial", "constraint and refinement"],
    [120, "Accord", "integration"],
    [180, "Mirror", "contrast and opposing perspective"]
  ];

  const PLANET_SYMBOLS = {
    Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
    Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆"
  };

  // JPL Table 1 approximate Keplerian elements and rates, valid 1800-2050.
  // Each pair is [value at J2000, rate per Julian century].
  const ELEMENTS = {
    Mercury: [[0.38709927,0.00000037],[0.20563593,0.00001906],[7.00497902,-0.00594749],[252.25032350,149472.67411175],[77.45779628,0.16047689],[48.33076593,-0.12534081]],
    Venus: [[0.72333566,0.00000390],[0.00677672,-0.00004107],[3.39467605,-0.00078890],[181.97909950,58517.81538729],[131.60246718,0.00268329],[76.67984255,-0.27769418]],
    Earth: [[1.00000261,0.00000562],[0.01671123,-0.00004392],[-0.00001531,-0.01294668],[100.46457166,35999.37244981],[102.93768193,0.32327364],[0,0]],
    Mars: [[1.52371034,0.00001847],[0.09339410,0.00007882],[1.84969142,-0.00813131],[-4.55343205,19140.30268499],[-23.94362959,0.44441088],[49.55953891,-0.29257343]],
    Jupiter: [[5.20288700,-0.00011607],[0.04838624,-0.00013253],[1.30439695,-0.00183714],[34.39644051,3034.74612775],[14.72847983,0.21252668],[100.47390909,0.20469106]],
    Saturn: [[9.53667594,-0.00125060],[0.05386179,-0.00050991],[2.48599187,0.00193609],[49.95424423,1222.49362201],[92.59887831,-0.41897216],[113.66242448,-0.28867794]],
    Uranus: [[19.18916464,-0.00196176],[0.04725744,-0.00004397],[0.77263783,-0.00242939],[313.23810451,428.48202785],[170.95427630,0.40805281],[74.01692503,0.04240589]],
    Neptune: [[30.06992276,0.00026291],[0.00859048,0.00005105],[1.77004347,0.00035372],[-55.12002969,218.45945325],[44.96476227,-0.32241464],[131.78422574,-0.00508664]]
  };

  const BODY_ORDER = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
  const PLANET_ORDER = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];

  const state = { date: localNoon(new Date()) };

  function init() {
    bindControls();
    render();
  }

  function bindControls() {
    document.querySelector("#almanac-prev")?.addEventListener("click", () => shiftDay(-1));
    document.querySelector("#almanac-next")?.addEventListener("click", () => shiftDay(1));
    document.querySelector("#almanac-today")?.addEventListener("click", () => {
      state.date = localNoon(new Date());
      render();
    });
    document.querySelector("#almanac-date")?.addEventListener("change", (event) => {
      const parsed = parseDate(event.target.value);
      if (parsed) {
        state.date = parsed;
        render();
      }
    });
    document.querySelector("#copy-daily-practice")?.addEventListener("click", copyDailyPractice);
  }

  function shiftDay(amount) {
    const next = new Date(state.date);
    next.setDate(next.getDate() + amount);
    state.date = localNoon(next);
    render();
  }

  function render() {
    const sky = skyForDate(state.date);
    const stationIndex = Math.floor(sky.Sun / 30) % 12;
    const station = SOLAR_STATIONS[stationIndex];
    const practice = PRACTICES[station[1]];
    const elongation = normalize(sky.Moon - sky.Sun);
    const moon = moonState(elongation);
    const relationships = relationshipsFor(sky);
    const active = relationships.filter((item) => item.orb <= 3);
    const strongest = active[0] || relationships[0];

    setText("#daily-gregorian", new Intl.DateTimeFormat(undefined, {
      weekday: "long", month: "long", day: "numeric", year: "numeric"
    }).format(state.date));
    setValue("#almanac-date", dateInputValue(state.date));
    setText("#daily-stage", station[1]);
    setText("#daily-stage-verb", practice.verb);
    setText("#daily-station", "Solar station " + (stationIndex + 1) + " · " + station[0]);
    setText("#daily-moon", moon.name + " · " + moon.phase);
    setText("#daily-concordance", active.length ? strongest.name : "Open sky");
    setText("#daily-concordance-detail", active.length
      ? strongest.a + "–" + strongest.b + " · " + formatDegrees(strongest.separation) + " · orb " + strongest.orb.toFixed(1) + "°"
      : "No major relationship is within the 3° daily orb.");
    setText("#practice-copy", practice.copy);
    setText("#practice-action", practice.action);
    setText("#practice-question", practice.question);
    setText("#practice-rite", practice.rite);
    setText("#solar-longitude", formatDegrees(sky.Sun));
    setText("#moon-longitude", formatDegrees(sky.Moon));
    setText("#moon-elongation", formatDegrees(elongation));
    setText("#moon-illumination", Math.round(moon.illumination * 100) + "%");
    setText("#sky-model-date", "Computed for " + dateInputValue(state.date) + " at 12:00 local civil time");

    markActivePractice(station[1]);
    renderPlanets(sky);
    renderRelationships(relationships);
    renderSeal(sky, stationIndex, station, moon, active);
    renderJournalCard(practice, station, moon, strongest, active.length > 0);
  }

  function skyForDate(date) {
    const jd = julianDay(date);
    const T = (jd - 2451545.0) / 36525;
    const earth = heliocentricVector("Earth", T);
    const sky = {};

    sky.Sun = longitudeFromVector({ x: -earth.x, y: -earth.y, z: -earth.z });
    PLANET_ORDER.forEach((name) => {
      const vector = heliocentricVector(name, T);
      sky[name] = longitudeFromVector({
        x: vector.x - earth.x,
        y: vector.y - earth.y,
        z: vector.z - earth.z
      });
    });
    sky.Moon = moonLongitude(jd);
    return sky;
  }

  function heliocentricVector(name, T) {
    const p = ELEMENTS[name];
    const a = evolve(p[0], T);
    const e = evolve(p[1], T);
    const I = evolve(p[2], T) * DEG;
    const L = evolve(p[3], T);
    const peri = evolve(p[4], T);
    const node = evolve(p[5], T);
    const omega = (peri - node) * DEG;
    const O = node * DEG;
    const M = signedDegrees(L - peri);
    const E = solveKepler(M, e) * DEG;
    const xp = a * (Math.cos(E) - e);
    const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
    const cosw = Math.cos(omega);
    const sinw = Math.sin(omega);
    const cosO = Math.cos(O);
    const sinO = Math.sin(O);
    const cosI = Math.cos(I);
    const sinI = Math.sin(I);

    return {
      x: (cosw*cosO - sinw*sinO*cosI)*xp + (-sinw*cosO - cosw*sinO*cosI)*yp,
      y: (cosw*sinO + sinw*cosO*cosI)*xp + (-sinw*sinO + cosw*cosO*cosI)*yp,
      z: (sinw*sinI)*xp + (cosw*sinI)*yp
    };
  }

  function solveKepler(meanAnomaly, e) {
    let E = meanAnomaly + (180 / Math.PI) * e * Math.sin(meanAnomaly * DEG);
    for (let i = 0; i < 12; i += 1) {
      const deltaM = meanAnomaly - (E - (180 / Math.PI) * e * Math.sin(E * DEG));
      const deltaE = deltaM / (1 - e * Math.cos(E * DEG));
      E += deltaE;
      if (Math.abs(deltaE) <= 0.000001) break;
    }
    return E;
  }

  function moonLongitude(jd) {
    const T = (jd - 2451545.0) / 36525;
    const Lp = normalize(218.3164477 + 481267.88123421*T - 0.0015786*T*T);
    const D = normalize(297.8501921 + 445267.1114034*T - 0.0018819*T*T);
    const M = normalize(357.5291092 + 35999.0502909*T - 0.0001536*T*T);
    const Mp = normalize(134.9633964 + 477198.8675055*T + 0.0087414*T*T);

    return normalize(
      Lp
      + 6.289 * sinDeg(Mp)
      + 1.274 * sinDeg(2*D - Mp)
      + 0.658 * sinDeg(2*D)
      + 0.214 * sinDeg(2*Mp)
      - 0.186 * sinDeg(M)
      - 0.059 * sinDeg(2*D - 2*Mp)
      - 0.057 * sinDeg(2*D - M - Mp)
      + 0.053 * sinDeg(2*D + Mp)
      + 0.046 * sinDeg(2*D - M)
      + 0.041 * sinDeg(M - Mp)
      - 0.035 * sinDeg(D)
      - 0.031 * sinDeg(M + Mp)
    );
  }

  function moonState(elongation) {
    const gateIndex = Math.round(elongation / 45) % 8;
    const gate = MOON_GATES[gateIndex];
    const phaseNames = [
      "New / dark region", "Waxing crescent", "First-quarter region", "Waxing gibbous",
      "Full region", "Waning gibbous", "Last-quarter region", "Waning crescent"
    ];
    return {
      name: gate[0] + " Gate",
      meaning: gate[1],
      phase: phaseNames[gateIndex],
      illumination: (1 - Math.cos(elongation * DEG)) / 2,
      index: gateIndex
    };
  }

  function relationshipsFor(sky) {
    const rows = [];
    for (let i = 0; i < BODY_ORDER.length; i += 1) {
      for (let j = i + 1; j < BODY_ORDER.length; j += 1) {
        const a = BODY_ORDER[i];
        const b = BODY_ORDER[j];
        const separation = angularSeparation(sky[a], sky[b]);
        let best = null;
        ASPECTS.forEach((aspect) => {
          const orb = Math.abs(separation - aspect[0]);
          if (!best || orb < best.orb) {
            best = { angle: aspect[0], name: aspect[1], meaning: aspect[2], orb };
          }
        });
        rows.push({ a, b, separation, ...best });
      }
    }
    return rows.sort((left, right) => left.orb - right.orb);
  }

  function renderPlanets(sky) {
    const target = document.querySelector("#planet-longitudes");
    if (!target) return;
    target.replaceChildren();
    BODY_ORDER.forEach((name) => {
      const item = document.createElement("li");
      const symbol = document.createElement("span");
      const label = document.createElement("strong");
      const value = document.createElement("em");
      symbol.className = "planet-symbol";
      symbol.textContent = PLANET_SYMBOLS[name];
      label.textContent = name;
      value.textContent = formatDegrees(sky[name]);
      item.append(symbol, label, value);
      target.append(item);
    });
  }

  function renderRelationships(rows) {
    const target = document.querySelector("#relationship-list");
    if (!target) return;
    target.replaceChildren();
    rows.slice(0, 6).forEach((row) => {
      const item = document.createElement("article");
      if (row.orb <= 3) item.classList.add("is-active");
      const label = document.createElement("span");
      const title = document.createElement("strong");
      const note = document.createElement("p");
      label.textContent = row.orb <= 3 ? "Active · orb " + row.orb.toFixed(1) + "°" : "Nearest · orb " + row.orb.toFixed(1) + "°";
      title.textContent = PLANET_SYMBOLS[row.a] + " " + row.a + " · " + row.name + " · " + PLANET_SYMBOLS[row.b] + " " + row.b;
      note.textContent = formatDegrees(row.separation) + " separation · Transformation meaning: " + row.meaning + ".";
      item.append(label, title, note);
      target.append(item);
    });
  }

  function renderSeal(sky, stationIndex, station, moon, active) {
    const target = document.querySelector("#daily-seal");
    if (!target) return;
    target.replaceChildren();

    const svg = svgEl("svg", { viewBox: "0 0 260 260", role: "img", "aria-label": "Daily sky seal showing solar station, Moon elongation, planets, and active angular relationships" });
    svg.append(svgEl("circle", { cx: 130, cy: 130, r: 112, class: "seal-orbit outer" }));
    svg.append(svgEl("circle", { cx: 130, cy: 130, r: 88, class: "seal-orbit" }));
    svg.append(svgEl("circle", { cx: 130, cy: 130, r: 48, class: "seal-core-ring" }));

    for (let i = 0; i < 12; i += 1) {
      const angle = i * 30;
      const p1 = polar(104, angle);
      const p2 = polar(i === stationIndex ? 116 : 111, angle);
      svg.append(svgEl("line", {
        x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
        class: i === stationIndex ? "seal-tick active" : "seal-tick"
      }));
    }

    const positions = {};
    BODY_ORDER.forEach((name, index) => {
      const radius = name === "Sun" ? 72 : name === "Moon" ? 94 : 82 + (index % 2) * 7;
      positions[name] = polar(radius, sky[name]);
    });

    active.slice(0, 3).forEach((row) => {
      const a = positions[row.a];
      const b = positions[row.b];
      svg.append(svgEl("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: "seal-relation" }));
    });

    BODY_ORDER.forEach((name) => {
      const p = positions[name];
      const group = svgEl("g", { class: "seal-body body-" + name.toLowerCase() });
      group.append(svgEl("circle", { cx: p.x, cy: p.y, r: name === "Sun" || name === "Moon" ? 9 : 6 }));
      const text = svgEl("text", { x: p.x, y: p.y + 1.5, "text-anchor": "middle", "dominant-baseline": "middle" });
      text.textContent = PLANET_SYMBOLS[name];
      group.append(text);
      svg.append(group);
    });

    const stage = svgEl("text", { x: 130, y: 124, class: "seal-stage", "text-anchor": "middle" });
    stage.textContent = station[1].slice(0, 1);
    const stationText = svgEl("text", { x: 130, y: 145, class: "seal-station", "text-anchor": "middle" });
    stationText.textContent = String(stationIndex + 1).padStart(2, "0") + " · " + moon.name.replace(" Gate", "");
    svg.append(stage, stationText);
    target.append(svg);
  }

  function renderJournalCard(practice, station, moon, strongest, hasActive) {
    const target = document.querySelector("#daily-journal-text");
    if (!target) return;
    const relation = hasActive
      ? strongest.a + "–" + strongest.b + " " + strongest.name.toLowerCase()
      : "no tight major concordance";
    target.textContent =
      station[1] + " · " + station[0] + " station · " + moon.name + ". " +
      practice.question + " Practice: " + practice.action + " Sky note: " + relation + ".";
  }

  async function copyDailyPractice() {
    const text = document.querySelector("#daily-journal-text")?.textContent || "";
    const status = document.querySelector("#copy-status");
    try {
      await navigator.clipboard.writeText(text);
      if (status) status.textContent = "Copied.";
    } catch (error) {
      if (status) status.textContent = "Copy unavailable; select the text manually.";
    }
  }

  function markActivePractice(active) {
    document.querySelectorAll("[data-practice-stage]").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.practiceStage === active);
    });
  }

  function evolve(pair, T) { return pair[0] + pair[1] * T; }
  function sinDeg(value) { return Math.sin(value * DEG); }
  function normalize(value) { return ((value % 360) + 360) % 360; }
  function signedDegrees(value) {
    const n = normalize(value);
    return n > 180 ? n - 360 : n;
  }
  function angularSeparation(a, b) {
    const diff = Math.abs(normalize(a) - normalize(b));
    return diff > 180 ? 360 - diff : diff;
  }
  function longitudeFromVector(vector) {
    return normalize(Math.atan2(vector.y, vector.x) / DEG);
  }
  function julianDay(date) { return date.getTime() / 86400000 + 2440587.5; }
  function formatDegrees(value) { return normalize(value).toFixed(1) + "°"; }
  function dateInputValue(date) {
    const y = String(date.getFullYear()).padStart(4, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }
  function parseDate(value) {
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    return localNoon(new Date(parts[0], parts[1] - 1, parts[2]));
  }
  function localNoon(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  }
  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  }
  function setValue(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.value = value;
  }
  function polar(radius, degrees) {
    const angle = (degrees - 90) * DEG;
    return { x: 130 + Math.cos(angle) * radius, y: 130 + Math.sin(angle) * radius };
  }
  function svgEl(name, attrs) {
    const el = document.createElementNS(SVG_NS, name);
    Object.entries(attrs || {}).forEach(([key, value]) => el.setAttribute(key, value));
    return el;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();