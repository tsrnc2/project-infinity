(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const CENTER = 110;

  const MONTH_SEALS = [
    ["January", "Point of Return", "One is the indivisible source. The seal begins with a single axis so every later pattern remembers its origin."],
    ["February", "Mirror Pair", "Two is relation. The seal opens as a pair of facing forms: self and other, vow and witness, question and answer."],
    ["March", "Triangle of Becoming", "Three is emergence. The triangle carries intention through body, mind, and spirit until it becomes action."],
    ["April", "Square Foundation", "Four is structure. The square marks the house, the rule, the table, and the daily discipline that holds growth."],
    ["May", "Living Star", "Five is embodied life. Its petals represent hand, foot, breath, hunger, and the work of care."],
    ["June", "Hexagon of Balance", "Six is harmony under pressure. The seal joins opposing sides into a stable field of service."],
    ["July", "Pilgrim Spiral", "Seven is the seeker. Its paths never sit flat; they climb through trial, rest, insight, and return."],
    ["August", "Double Wheel", "Eight is renewal through repetition. The doubled circuit shows practice returning at a higher turn."],
    ["September", "Ninefold Lamp", "Nine is ripening. The seal gathers what has grown and asks that it become wisdom, not pride."],
    ["October", "Decade Ring", "Ten is completion that becomes offering. The ring closes one labor and opens responsibility to the world."],
    ["November", "Hidden Pillar", "Eleven is the extra witness. It stands just beyond balance, guarding the truth that systems miss."],
    ["December", "Council Crown", "Twelve is the gathered year. The crown is community, memory, and the full circle before threshold days begin."]
  ];

  const DAY_SYMBOLS = [
    ["Source Point", "Begin with one clear act. The day belongs to initiation and undivided attention."],
    ["Twin Witness", "Practice in relation. Speak truth to one person and receive one truth in return."],
    ["Threefold Vow", "Join body, speech, and intention so the promise has three roots."],
    ["Foundation Mark", "Set a boundary, clean a space, or repair the base of the work."],
    ["Hand Star", "Let the body participate. Make, carry, mend, cook, write, or help."],
    ["Balanced Field", "Bring opposing duties into proportion without pretending they are the same."],
    ["Seeker's Step", "Take the difficult path that teaches more than comfort would teach."],
    ["Renewal Loop", "Repeat the practice with greater precision than the last time."],
    ["Ripening Lamp", "Protect what is growing. Do not harvest the work too early."],
    ["Offering Wheel", "Return one fruit of the work to the community."],
    ["Unseen Witness", "Look for the overlooked fact, person, cost, or blessing."],
    ["Council Ring", "Let the many parts of the self speak before making a decision."],
    ["Tone Crown", "Complete a tone cycle by turning insight into a named discipline."],
    ["Bridge of Seven", "Join two paths without erasing the difference between them."],
    ["Hearth Star", "Make devotion practical through food, shelter, rest, or welcome."],
    ["Fourfold Mirror", "Review the work through thought, feeling, action, and consequence."],
    ["Prime Gate", "Enter the day as something indivisible. Do not dilute the vow."],
    ["House Ring", "Remember the eighteen houses and ask which season your work belongs to."],
    ["Flame Crown", "Burn away the noble excuse that still prevents action."],
    ["Full Sign Wheel", "Honor the complete ring of twenty day signs and the duties of wholeness."],
    ["Triple Seven", "Let search, trial, and revelation form a single pilgrimage."],
    ["Double Witness", "Test the vow before both conscience and community."],
    ["Hidden Gate", "A prime day for guarded beginnings, private decisions, and clean exits."],
    ["Service Wheel", "Organize the work so help can be repeated, not merely felt."],
    ["Seed Square", "Plant a future inside a stable form. Patience is part of the symbol."],
    ["Twin Tone", "Let the thirteenth tone return in a second octave of discipline."],
    ["Deep Spiral", "Descend into the pattern beneath the pattern, then return with one usable truth."],
    ["Moon Ladder", "Climb by four weeks of seven steps: observe, test, mend, release."],
    ["Veiled Prime", "Guard the sacred from display. Not every transformation needs an audience."],
    ["Closing Ring", "Complete the month through gratitude, accounting, and release."],
    ["Outer Gate", "Stand at the edge of the known month and prepare the next passage."]
  ];

  const MONTH_COLORS = ["#c9912f", "#24706c", "#a2482e", "#486b3b", "#7b5fa7", "#b45d3a"];
  const DAY_COLORS = ["#24706c", "#a2482e", "#c9912f", "#486b3b", "#5f6fa7", "#8d6117"];

  function initGeometry() {
    renderMonthSeals();
    renderDaySymbols();
  }

  function renderMonthSeals() {
    const container = document.querySelector("#month-seals");
    if (!container) {
      return;
    }

    container.replaceChildren();
    MONTH_SEALS.forEach(([month, title, meaning], index) => {
      const sacredNumber = index + 1;
      const formula = `${sacredNumber} primary petals, 13 tone seeds, 20 sign notches, ${orbitCount(sacredNumber)} spherical orbit rings.`;
      container.append(createSealCard({
        number: sacredNumber,
        heading: `${month} - ${title}`,
        kicker: `Sacred number ${sacredNumber}`,
        meaning,
        formula,
        kind: "month"
      }));
    });
  }

  function renderDaySymbols() {
    const container = document.querySelector("#day-symbols");
    if (!container) {
      return;
    }

    container.replaceChildren();
    DAY_SYMBOLS.forEach(([title, meaning], index) => {
      const sacredNumber = index + 1;
      const formula = dayFormula(sacredNumber);
      container.append(createSealCard({
        number: sacredNumber,
        heading: `Day ${sacredNumber} - ${title}`,
        kicker: `Daily symbol ${sacredNumber}`,
        meaning,
        formula,
        kind: "day"
      }));
    });
  }

  function createSealCard({ number, heading, kicker, meaning, formula, kind }) {
    const card = document.createElement("article");
    const art = document.createElement("div");
    const copy = document.createElement("div");
    const title = document.createElement("h4");
    const numberLabel = document.createElement("span");
    const text = document.createElement("p");
    const formulaText = document.createElement("span");

    card.className = "seal-card";
    art.className = "seal-art";
    copy.className = "seal-copy";
    numberLabel.className = "seal-number";
    formulaText.className = "seal-formula";

    title.textContent = heading;
    numberLabel.textContent = kicker;
    text.textContent = meaning;
    formulaText.textContent = formula;

    art.append(createSealSvg(number, kind, heading));
    copy.append(title, numberLabel, text, formulaText);
    card.append(art, copy);
    return card;
  }

  function createSealSvg(number, kind, label) {
    const palette = kind === "month" ? MONTH_COLORS : DAY_COLORS;
    const svg = svgEl("svg", {
      viewBox: "0 0 220 220",
      role: "img",
      "aria-label": label
    });
    const title = svgEl("title");
    title.textContent = label;
    svg.append(title);

    const rings = orbitCount(number);
    drawOrbitRings(svg, rings);

    if (kind === "month") {
      drawMonthSeal(svg, number, palette);
    } else {
      drawDaySymbol(svg, number, palette);
    }

    svg.append(svgEl("circle", {
      cx: CENTER,
      cy: CENTER,
      r: kind === "month" ? 18 : 15,
      fill: "#fffaf1",
      stroke: "#1c1a17",
      "stroke-width": 1.4
    }));
    svg.append(svgEl("text", {
      x: CENTER,
      y: CENTER + 7,
      "text-anchor": "middle",
      "font-size": kind === "month" ? 22 : 18,
      "font-weight": 900,
      fill: "#1c1a17",
      "font-family": "Inter, system-ui, sans-serif"
    }, String(number)));

    return svg;
  }

  function drawOrbitRings(svg, rings) {
    for (let index = 0; index < rings; index += 1) {
      const radius = 31 + index * 17;
      svg.append(svgEl("circle", {
        cx: CENTER,
        cy: CENTER,
        r: radius,
        fill: "none",
        stroke: index % 2 === 0 ? "rgba(28, 26, 23, 0.18)" : "rgba(36, 112, 108, 0.24)",
        "stroke-width": index === rings - 1 ? 1.5 : 1,
        "stroke-dasharray": `${2 + index} ${7 + index}`
      }));
    }
  }

  function drawMonthSeal(svg, number, palette) {
    const petalRadius = 62;
    const rotation = -Math.PI / 2;
    const primary = palette[number % palette.length];
    const secondary = palette[(number + 2) % palette.length];

    for (let index = 0; index < number; index += 1) {
      const angle = rotation + (index / number) * Math.PI * 2;
      const location = point(petalRadius, angle);
      svg.append(svgEl("ellipse", {
        cx: location.x,
        cy: location.y,
        rx: 8,
        ry: 27,
        fill: primary,
        opacity: 0.64,
        transform: `rotate(${radiansToDegrees(angle) + 90} ${location.x} ${location.y})`
      }));
      svg.append(svgEl("line", {
        x1: CENTER,
        y1: CENTER,
        x2: location.x,
        y2: location.y,
        stroke: "rgba(28, 26, 23, 0.26)",
        "stroke-width": 1
      }));
    }

    drawRadialDots(svg, 13, 44, 2.4, "#1c1a17", 0.72, Math.PI / 13);
    drawRadialDots(svg, 20, 92, 2.2, secondary, 0.82, 0);
    drawChordPath(svg, Math.max(3, number), 73, starStep(Math.max(3, number)), "rgba(28, 26, 23, 0.34)");
  }

  function drawDaySymbol(svg, number, palette) {
    const outerRadius = 87;
    const innerRadius = 42 + (number % 5) * 4;
    const pointRadius = number > 24 ? 1.8 : number > 16 ? 2.2 : 2.8;
    const primary = palette[number % palette.length];
    const secondary = palette[(number + 3) % palette.length];

    if (number === 1) {
      svg.append(svgEl("circle", {
        cx: CENTER,
        cy: CENTER,
        r: 35,
        fill: primary,
        opacity: 0.28
      }));
    } else {
      drawChordPath(svg, number, outerRadius, starStep(number), `rgba(${hexToRgb(primary)}, 0.58)`);
      drawChordPath(svg, Math.max(3, digitalRoot(number) + 2), innerRadius, 2, "rgba(28, 26, 23, 0.24)");
    }

    drawRadialDots(svg, number, outerRadius, pointRadius, primary, 0.9, -Math.PI / 2);

    const factors = properDivisors(number);
    factors.slice(0, 6).forEach((factor, index) => {
      drawRadialDots(svg, factor, 24 + index * 8, 1.65, secondary, 0.72, Math.PI / factor);
    });

    if (isPrime(number)) {
      svg.append(svgEl("circle", {
        cx: CENTER,
        cy: CENTER,
        r: 71,
        fill: "none",
        stroke: secondary,
        "stroke-width": 2,
        "stroke-dasharray": "1 8",
        opacity: 0.86
      }));
    }
  }

  function drawRadialDots(svg, count, radius, dotRadius, color, opacity, rotation) {
    for (let index = 0; index < count; index += 1) {
      const angle = rotation + (index / count) * Math.PI * 2;
      const location = point(radius, angle);
      svg.append(svgEl("circle", {
        cx: round(location.x),
        cy: round(location.y),
        r: dotRadius,
        fill: color,
        opacity
      }));
    }
  }

  function drawChordPath(svg, count, radius, step, stroke) {
    const points = [];
    const visited = new Set();
    let cursor = 0;

    for (let index = 0; index < count; index += 1) {
      if (visited.has(cursor)) {
        break;
      }
      visited.add(cursor);
      points.push(point(radius, -Math.PI / 2 + (cursor / count) * Math.PI * 2));
      cursor = (cursor + step) % count;
    }

    if (points.length < 2) {
      return;
    }

    const path = points
      .map((location, index) => `${index === 0 ? "M" : "L"} ${round(location.x)} ${round(location.y)}`)
      .join(" ");

    svg.append(svgEl("path", {
      d: `${path} Z`,
      fill: "none",
      stroke,
      "stroke-width": 1.6,
      "stroke-linejoin": "round"
    }));
  }

  function dayFormula(number) {
    const factors = properDivisors(number);
    const root = digitalRoot(number);
    const step = number === 1 ? 1 : starStep(number);
    const type = isPrime(number)
      ? "prime path, one unbroken circuit"
      : factors.length
        ? `factor echoes ${factors.join(", ")}`
        : "source mark";
    return `${number} outer seeds, digital root ${root}, ${step}-step chord, ${type}.`;
  }

  function orbitCount(number) {
    return Math.min(6, Math.max(2, Math.ceil(number / 3) + 1));
  }

  function point(radius, angle) {
    return {
      x: CENTER + Math.cos(angle) * radius,
      y: CENTER + Math.sin(angle) * radius
    };
  }

  function starStep(number) {
    if (number < 3) {
      return 1;
    }
    let step = Math.max(2, Math.floor(number / 2) - 1);
    while (step > 1 && gcd(step, number) !== 1) {
      step -= 1;
    }
    return step;
  }

  function digitalRoot(number) {
    return ((number - 1) % 9) + 1;
  }

  function properDivisors(number) {
    const divisors = [];
    for (let value = 2; value < number; value += 1) {
      if (number % value === 0) {
        divisors.push(value);
      }
    }
    return divisors;
  }

  function isPrime(number) {
    if (number < 2) {
      return false;
    }
    for (let value = 2; value <= Math.sqrt(number); value += 1) {
      if (number % value === 0) {
        return false;
      }
    }
    return true;
  }

  function gcd(left, right) {
    let a = Math.abs(left);
    let b = Math.abs(right);
    while (b !== 0) {
      const next = a % b;
      a = b;
      b = next;
    }
    return a;
  }

  function svgEl(name, attrs = {}, text = "") {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    if (text) {
      element.textContent = text;
    }
    return element;
  }

  function hexToRgb(hex) {
    const value = hex.replace("#", "");
    const red = parseInt(value.slice(0, 2), 16);
    const green = parseInt(value.slice(2, 4), 16);
    const blue = parseInt(value.slice(4, 6), 16);
    return `${red}, ${green}, ${blue}`;
  }

  function radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  function round(number) {
    return Math.round(number * 100) / 100;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGeometry);
  } else {
    initGeometry();
  }
})();
