(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const CENTER = 60;
  const COLORS = ["#c9912f", "#24706c", "#a2482e", "#486b3b", "#7b5fa7", "#8d6117"];

  const COUNTS = [
    ["Solar Round", "Body", "The 365-day discipline of houses, thresholds, and correction."],
    ["Sacred Pulse", "Spirit", "The 260-day pairing of tone and sign that gives every day a task."],
    ["Moon Gates", "Mind", "The inner lunar rhythm of intention, reflection, release, and rest."],
    ["Year Breath", "World", "The 60-year pattern of polarity, element, and animal temperament."]
  ];

  const TONES = [
    ["Initiating", "Begin before certainty arrives."],
    ["Gathering", "Collect attention, tools, and allies."],
    ["Naming", "Give the vow its true name."],
    ["Shaping", "Make the vow visible through structure."],
    ["Testing", "Let pressure reveal what is real."],
    ["Balancing", "Restore proportion and mercy."],
    ["Opening", "Allow revision and listening."],
    ["Binding", "Commit the work to memory and relationship."],
    ["Ripening", "Protect what is becoming fruitful."],
    ["Offering", "Return the fruit to the world."],
    ["Clarifying", "Separate signal from noise."],
    ["Releasing", "Close what has served its purpose."],
    ["Transforming", "Cross into the next pattern."]
  ];

  const SIGNS = [
    ["Spark", "Ignition, courage, and first will."],
    ["Reed", "Humility, study, and clear channel."],
    ["Mirror", "Witness, confession, and clear sight."],
    ["Root", "Foundation, health, ancestry, and habit."],
    ["Flame", "Purification, action, and refusal of delay."],
    ["River", "Adaptation, feeling, forgiveness, and movement."],
    ["Stone", "Endurance, shelter, law, and durable vow."],
    ["Wind", "Speech, teaching, song, and influence."],
    ["Deer", "Gentleness, movement, alertness, and protection."],
    ["Star", "Vision, beauty, navigation, and distance."],
    ["Bowl", "Receiving, gratitude, enough, and nourishment."],
    ["Mountain", "Perspective, solitude, pilgrimage, and height."],
    ["Thread", "Connection, story, kinship, and repair."],
    ["Sun", "Visibility, leadership, celebration, and truth."],
    ["Cloud", "Mystery, rest, grief, and incubation."],
    ["Hand", "Skill, healing, construction, and useful touch."],
    ["Gate", "Decision, initiation, boundary, and passage."],
    ["Maize", "Food, patience, family, and cultivated life."],
    ["Drum", "Ceremony, courage, rhythm, and shared memory."],
    ["Dawn", "Return, renewed light, and the next beginning."]
  ];

  const HOUSES = [
    ["Witness", "Truthful sight and honest record."],
    ["Refinement", "One pattern reshaped by repeated practice."],
    ["Seed", "Preparation, study, and small beginnings."],
    ["River", "Adaptation, forgiveness, and movement."],
    ["Mirror", "Examination, apology, and clean accounting."],
    ["Mountain", "Endurance, boundaries, and difficult work."],
    ["Wind", "Speech, teaching, and ethical influence."],
    ["Hearth", "Belonging, food, domestic repair, and care."],
    ["Craft", "Skill, measurable improvement, and making."],
    ["Vow", "Public promise and the duties that follow."],
    ["Gate", "Initiation and the cost of entering."],
    ["Offering", "The fruit of change given away."],
    ["Thread", "Reconciliation, lineage, and connection."],
    ["Lion", "Disciplined courage and protection."],
    ["Lotus", "Beauty and dignity rising from struggle."],
    ["Sky", "Vision, study, scale, and contemplation."],
    ["Wheel", "Patterns, systems, cycles, and consequence."],
    ["Flame", "Completion, purification, and release of excess."]
  ];

  const THRESHOLDS = [
    ["Unbinding", "Release a stale burden before the year closes."],
    ["Silence", "Listen before the next vow is born."],
    ["Repair", "Mend one concrete promise, object, or relationship."],
    ["Gratitude", "Name the help that made change possible."],
    ["Renewal", "Prepare the next vow before the year turns."],
    ["Mirror Day", "Leap correction, recalibration, and clean measure."]
  ];

  const MOON_GATES = [
    ["Seeded Silence", "Begin privately."],
    ["Hidden Ember", "Protect first intention."],
    ["First Word", "Speak one true sentence."],
    ["Gathering Bowl", "Collect what practice requires."],
    ["Clean Floor", "Remove one obstacle."],
    ["Study Lamp", "Learn from a source."],
    ["Open Hand", "Ask for help."],
    ["First Quarter", "Test and adjust."],
    ["Strong Back", "Carry necessary weight."],
    ["True Measure", "Count honestly."],
    ["Kind Speech", "Repair communication."],
    ["Shared Table", "Nourish body and bond."],
    ["High Window", "Remember the wider purpose."],
    ["Bright Edge", "Clarify devotion and obsession."],
    ["Full Lamp", "Bring truth into view."],
    ["Blessing Bowl", "Give thanks for what is visible."],
    ["Softening", "Release control of interpretation."],
    ["Second Listening", "Hear without rushing."],
    ["Repair Thread", "Reconnect where possible."],
    ["Useful Fire", "Turn intensity toward service."],
    ["Waning Crown", "Step back from attention."],
    ["Last Quarter", "Cut away what no longer serves."],
    ["Plain Meal", "Return to enough."],
    ["Ash Review", "Study what burned and survived."],
    ["Quiet Gift", "Help without recognition."],
    ["Empty Room", "Make space by completing tasks."],
    ["Ancestral Breath", "Remember inherited work."],
    ["Deep Water", "Let feeling move without ruling."],
    ["Closing Breath", "Exhale the month."],
    ["Dark Gate", "Rest before beginning again."]
  ];

  const MONTHS = [
    ["January", "Point of Return"], ["February", "Mirror Pair"], ["March", "Triangle of Becoming"],
    ["April", "Square Foundation"], ["May", "Living Star"], ["June", "Hexagon of Balance"],
    ["July", "Pilgrim Spiral"], ["August", "Double Wheel"], ["September", "Ninefold Lamp"],
    ["October", "Decade Ring"], ["November", "Hidden Pillar"], ["December", "Council Crown"]
  ];

  const CIVIL_DAYS = [
    "Source Point", "Twin Witness", "Threefold Vow", "Foundation Mark", "Hand Star", "Balanced Field",
    "Seeker's Step", "Renewal Loop", "Ripening Lamp", "Offering Wheel", "Unseen Witness", "Council Ring",
    "Tone Crown", "Bridge of Seven", "Hearth Star", "Fourfold Mirror", "Prime Gate", "House Ring",
    "Flame Crown", "Full Sign Wheel", "Triple Seven", "Double Witness", "Hidden Gate", "Service Wheel",
    "Seed Square", "Twin Tone", "Deep Spiral", "Moon Ladder", "Veiled Prime", "Closing Ring", "Outer Gate"
  ];

  const ELEMENTS = ["Fire", "Earth", "Iron", "Water", "Wood"];
  const ANIMALS = ["Horse", "Sheep", "Monkey", "Bird", "Dog", "Pig", "Mouse", "Ox", "Tiger", "Hare", "Dragon", "Snake"];
  const POLARITIES = ["Dawn", "Dusk"];

  function init() {
    renderCards("#count-symbol-grid", COUNTS.map(([name, key, text], index) => entry(name, key, text, index + 1, "count")), true);
    renderCards("#tone-symbol-grid", TONES.map(([name, text], index) => entry(name, `Tone ${index + 1}`, text, index + 1, "tone")));
    renderCards("#sign-symbol-grid", SIGNS.map(([name, text], index) => entry(name, `Sign ${index + 1}`, text, index + 1, "sign")));
    renderCards("#house-symbol-grid", HOUSES.map(([name, text], index) => entry(name, `House ${index + 1}`, text, index + 1, "house")));
    renderCards("#threshold-symbol-grid", THRESHOLDS.map(([name, text], index) => entry(name, index === 5 ? "Leap" : `Threshold ${index + 1}`, text, index + 19, "threshold")), true);
    renderCards("#moon-symbol-grid", MOON_GATES.map(([name, text], index) => entry(name, `Moon Gate ${index + 1}`, text, index + 1, "moon")));
    renderCards("#month-symbol-grid", MONTHS.map(([month, name], index) => entry(`${month}: ${name}`, `Month ${index + 1}`, `${index + 1} primary petals with 13 tone seeds and 20 sign notches.`, index + 1, "month")));
    renderCards("#civil-day-symbol-grid", CIVIL_DAYS.map((name, index) => entry(name, `Civil Day ${index + 1}`, `The day ${index + 1} mark for journals, altars, notes, and daily practice cards.`, index + 1, "civil")));
    renderYears();
    renderPulseMatrix();
  }

  function entry(name, label, text, number, family) {
    return { name, label, text, number, family };
  }

  function renderCards(selector, entries, compact = false) {
    const target = document.querySelector(selector);
    if (!target) {
      return;
    }
    target.replaceChildren();
    entries.forEach((item) => target.append(createCard(item, compact)));
  }

  function renderYears() {
    const target = document.querySelector("#year-symbol-grid");
    if (!target) {
      return;
    }
    target.replaceChildren();
    for (let index = 0; index < 60; index += 1) {
      const polarity = POLARITIES[index % 2];
      const element = ELEMENTS[Math.floor(index / 2) % ELEMENTS.length];
      const animal = ANIMALS[index % ANIMALS.length];
      const text = `${polarity} directs the year ${polarity === "Dawn" ? "outward" : "inward"}; ${element} gives its element; ${animal} gives its public temperament.`;
      target.append(createCard(entry(`${polarity} ${element} ${animal}`, `Year ${index + 1}`, text, index + 1, "year"), true));
    }
  }

  function renderPulseMatrix() {
    const target = document.querySelector("#pulse-matrix-grid");
    if (!target) {
      return;
    }
    target.replaceChildren();
    target.append(matrixHeader(""));
    SIGNS.forEach(([name], index) => target.append(matrixHeader(`${index + 1}. ${name}`)));

    TONES.forEach(([toneName], toneIndex) => {
      target.append(matrixHeader(`${toneIndex + 1}. ${toneName}`, true));
      SIGNS.forEach(([signName], signIndex) => {
        const dayNumber = toneIndex * 20 + signIndex + 1;
        const cell = document.createElement("div");
        const mark = document.createElement("div");
        const title = document.createElement("strong");
        const subtitle = document.createElement("span");
        cell.className = "matrix-cell";
        mark.className = "matrix-mark";
        title.textContent = `${toneIndex + 1} ${signName}`;
        subtitle.textContent = `Pulse ${dayNumber}: ${toneName}`;
        mark.append(createSymbolSvg(dayNumber, "pulse", `${toneName} ${signName}`));
        cell.append(mark, title, subtitle);
        target.append(cell);
      });
    });
  }

  function createCard(item, compact) {
    const card = document.createElement("article");
    const art = document.createElement("div");
    const copy = document.createElement("div");
    const title = document.createElement("h4");
    const label = document.createElement("span");
    const body = document.createElement("p");
    const formula = document.createElement("code");
    card.className = compact ? "system-symbol-card compact" : "system-symbol-card";
    art.className = "system-symbol-art";
    copy.className = "system-symbol-copy";
    title.textContent = item.name;
    label.textContent = item.label;
    body.textContent = item.text;
    formula.textContent = formulaFor(item);
    art.append(createSymbolSvg(item.number, item.family, item.name));
    copy.append(title, label, body, formula);
    card.append(art, copy);
    return card;
  }

  function formulaFor(item) {
    if (item.family === "tone") {
      return `${item.number} ray tone`;
    }
    if (item.family === "sign") {
      return `${item.number} of 20 sign ring`;
    }
    if (item.family === "moon") {
      return `gate ${item.number} of 30`;
    }
    if (item.family === "year") {
      return `${item.number} of 60-year breath`;
    }
    if (item.family === "civil") {
      return `${item.number} day seeds`;
    }
    return `${item.number} sacred-number mark`;
  }

  function matrixHeader(text, tone = false) {
    const cell = document.createElement("div");
    const strong = document.createElement("strong");
    cell.className = tone ? "matrix-cell tone-header" : "matrix-cell header";
    strong.textContent = text;
    cell.append(strong);
    return cell;
  }

  function createSymbolSvg(number, family, label) {
    const svg = svgEl("svg", { viewBox: "0 0 120 120", role: "img", "aria-label": label });
    const title = svgEl("title");
    title.textContent = label;
    svg.append(title);
    svg.append(svgEl("circle", { cx: CENTER, cy: CENTER, r: 52, fill: "#fbf5ec", stroke: "#d8c5aa", "stroke-width": 2 }));
    drawRings(svg, number);
    drawFamilyShape(svg, number, family);
    svg.append(svgEl("circle", { cx: CENTER, cy: CENTER, r: 10, fill: "#fffaf1", stroke: "#1c1a17", "stroke-width": 1.2 }));
    return svg;
  }

  function drawRings(svg, number) {
    const count = Math.min(4, Math.max(1, Math.ceil(number / 15)));
    for (let index = 0; index < count; index += 1) {
      svg.append(svgEl("circle", {
        cx: CENTER,
        cy: CENTER,
        r: 18 + index * 9,
        fill: "none",
        stroke: index % 2 ? "rgba(36,112,108,0.28)" : "rgba(28,26,23,0.18)",
        "stroke-width": 1,
        "stroke-dasharray": `${2 + index} ${5 + index}`
      }));
    }
  }

  function drawFamilyShape(svg, number, family) {
    const points = family === "pulse" ? 5 + (number % 8) : Math.min(31, Math.max(3, number));
    const radius = family === "year" ? 44 : 40;
    const color = COLORS[number % COLORS.length];
    drawStar(svg, points, radius, stepFor(points), color);
    drawDots(svg, family === "sign" ? 20 : family === "tone" ? 13 : Math.min(30, Math.max(4, number)), 48, color);
  }

  function drawStar(svg, points, radius, step, color) {
    const locations = [];
    const visited = new Set();
    let cursor = 0;
    for (let index = 0; index < points; index += 1) {
      if (visited.has(cursor)) {
        break;
      }
      visited.add(cursor);
      locations.push(point(radius, -Math.PI / 2 + cursor / points * Math.PI * 2));
      cursor = (cursor + step) % points;
    }
    if (locations.length < 2) {
      return;
    }
    const d = locations.map((location, index) => `${index ? "L" : "M"} ${round(location.x)} ${round(location.y)}`).join(" ");
    svg.append(svgEl("path", { d: `${d} Z`, fill: "none", stroke: color, "stroke-width": 3, "stroke-linejoin": "round", opacity: 0.72 }));
  }

  function drawDots(svg, count, radius, color) {
    for (let index = 0; index < count; index += 1) {
      const location = point(radius, -Math.PI / 2 + index / count * Math.PI * 2);
      svg.append(svgEl("circle", { cx: round(location.x), cy: round(location.y), r: 1.8, fill: color, opacity: 0.85 }));
    }
  }

  function stepFor(points) {
    let step = Math.max(2, Math.floor(points / 2) - 1);
    while (step > 1 && gcd(step, points) !== 1) {
      step -= 1;
    }
    return step;
  }

  function point(radius, angle) {
    return { x: CENTER + Math.cos(angle) * radius, y: CENTER + Math.sin(angle) * radius };
  }

  function gcd(left, right) {
    let a = Math.abs(left);
    let b = Math.abs(right);
    while (b) {
      const next = a % b;
      a = b;
      b = next;
    }
    return a;
  }

  function svgEl(name, attrs = {}) {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  function round(value) {
    return Math.round(value * 100) / 100;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
