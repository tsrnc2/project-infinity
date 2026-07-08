(() => {
  "use strict";

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const EPOCH_DAY = Math.floor(Date.UTC(2026, 6, 8) / MS_PER_DAY);
  const SYNODIC_MONTH = 29.530588853;

  const HOUSE_NAMES = [
    "Witness",
    "Refinement",
    "Seed",
    "River",
    "Mirror",
    "Mountain",
    "Wind",
    "Hearth",
    "Craft",
    "Vow",
    "Gate",
    "Offering",
    "Thread",
    "Lion",
    "Lotus",
    "Sky",
    "Wheel",
    "Flame"
  ];

  const THRESHOLD_DAYS = [
    {
      name: "Unbinding",
      holiday: "Threshold of Unbinding",
      note: "Release a burden that no longer serves the work."
    },
    {
      name: "Silence",
      holiday: "Threshold of Silence",
      note: "Keep a quiet vigil and listen before acting."
    },
    {
      name: "Repair",
      holiday: "Threshold of Repair",
      note: "Mend one relationship, object, promise, or practice."
    },
    {
      name: "Gratitude",
      holiday: "Threshold of Gratitude",
      note: "Name the help that made transformation possible."
    },
    {
      name: "Renewal",
      holiday: "Threshold of Renewal",
      note: "Prepare the next vow before the year turns."
    }
  ];

  const ANNUAL_HOLIDAYS = [
    {
      day: 0,
      name: "Dawn of Turning",
      type: "high",
      note: "Open the year with witness, intention, and a first act."
    },
    {
      day: 12,
      name: "Thirteen Vows",
      type: "high",
      note: "Complete the first tone cycle by naming thirteen commitments."
    },
    {
      day: 51,
      name: "First Kinship Station",
      type: "minor",
      note: "Share one honest account of change with another person."
    },
    {
      day: 103,
      name: "Rite of Refinement",
      type: "high",
      note: "Choose one pattern and reshape it through repeated action."
    },
    {
      day: 155,
      name: "Creation Fire",
      type: "high",
      note: "Present a work made from the discipline of the year."
    },
    {
      day: 207,
      name: "Service Procession",
      type: "high",
      note: "Turn personal renewal into visible help for others."
    },
    {
      day: 259,
      name: "Long Pulse Remembrance",
      type: "high",
      note: "Honor the 260-day sacred count that runs beneath the solar year."
    },
    {
      day: 360,
      name: "Threshold of Unbinding",
      type: "high",
      note: THRESHOLD_DAYS[0].note
    },
    {
      day: 361,
      name: "Threshold of Silence",
      type: "high",
      note: THRESHOLD_DAYS[1].note
    },
    {
      day: 362,
      name: "Threshold of Repair",
      type: "high",
      note: THRESHOLD_DAYS[2].note
    },
    {
      day: 363,
      name: "Threshold of Gratitude",
      type: "high",
      note: THRESHOLD_DAYS[3].note
    },
    {
      day: 364,
      name: "Threshold of Renewal",
      type: "high",
      note: THRESHOLD_DAYS[4].note
    },
    {
      day: 365,
      name: "Mirror Day",
      type: "high",
      leapOnly: true,
      note: "The intercalary day for recalibration in leap years."
    }
  ];

  const SACRED_SIGNS = [
    "Spark",
    "Reed",
    "Mirror",
    "Root",
    "Flame",
    "River",
    "Stone",
    "Wind",
    "Deer",
    "Star",
    "Bowl",
    "Mountain",
    "Thread",
    "Sun",
    "Cloud",
    "Hand",
    "Gate",
    "Maize",
    "Drum",
    "Dawn"
  ];

  const TONE_NAMES = [
    "Initiating",
    "Gathering",
    "Naming",
    "Shaping",
    "Testing",
    "Balancing",
    "Opening",
    "Binding",
    "Ripening",
    "Offering",
    "Clarifying",
    "Releasing",
    "Transforming"
  ];

  const YEAR_ANIMALS = [
    "Horse",
    "Sheep",
    "Monkey",
    "Bird",
    "Dog",
    "Pig",
    "Mouse",
    "Ox",
    "Tiger",
    "Hare",
    "Dragon",
    "Snake"
  ];

  const YEAR_ELEMENTS = ["Fire", "Earth", "Iron", "Water", "Wood"];
  const YEAR_POLARITIES = ["Dawn", "Dusk"];

  const MONTH_FORMAT = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric"
  });

  const FULL_DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const state = {
    selectedDate: stripTime(new Date()),
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth()
  };

  function init() {
    initCanvas();
    initCalendar();
    initJoinForm();
  }

  function initCalendar() {
    const selected = state.selectedDate;
    state.viewYear = selected.getFullYear();
    state.viewMonth = selected.getMonth();

    const previous = document.querySelector("#prev-month");
    const next = document.querySelector("#next-month");
    const today = document.querySelector("#today-button");
    const dateInput = document.querySelector("#calendar-date");
    const grid = document.querySelector("#calendar-grid");

    previous.addEventListener("click", () => shiftMonth(-1));
    next.addEventListener("click", () => shiftMonth(1));
    today.addEventListener("click", () => {
      setSelectedDate(stripTime(new Date()), true);
    });
    dateInput.addEventListener("change", () => {
      const parsed = parseDateInput(dateInput.value);
      if (parsed) {
        setSelectedDate(parsed, true);
      }
    });
    grid.addEventListener("click", (event) => {
      const button = event.target.closest(".calendar-day");
      if (!button) {
        return;
      }
      const parsed = parseDateInput(button.dataset.date);
      if (parsed) {
        setSelectedDate(parsed, true);
      }
    });

    renderHolidayList();
    renderCalendar();
  }

  function setSelectedDate(date, syncView) {
    state.selectedDate = stripTime(date);
    if (syncView) {
      state.viewYear = state.selectedDate.getFullYear();
      state.viewMonth = state.selectedDate.getMonth();
    }
    renderCalendar();
  }

  function shiftMonth(delta) {
    const nextMonth = new Date(state.viewYear, state.viewMonth + delta, 1);
    state.viewYear = nextMonth.getFullYear();
    state.viewMonth = nextMonth.getMonth();
    renderCalendar();
  }

  function renderCalendar() {
    renderSelectedDate();
    renderGrid();
  }

  function renderSelectedDate() {
    const info = transformFromDate(state.selectedDate);
    const dateInput = document.querySelector("#calendar-date");
    const title = document.querySelector("#transformation-date");
    const detail = document.querySelector("#transformation-detail");
    const houseMetric = document.querySelector("#metric-house");
    const pulseMetric = document.querySelector("#metric-pulse");
    const moonMetric = document.querySelector("#metric-moon");
    const yearMetric = document.querySelector("#metric-year");
    const holidays = document.querySelector("#selected-holidays");

    dateInput.value = formatDateInput(state.selectedDate);
    title.textContent = `${info.mainLabel}, ${info.yearLabel}`;
    detail.textContent = `${FULL_DATE_FORMAT.format(state.selectedDate)} is day ${info.dayOfYear + 1} of a ${info.daysInYear}-day transformation year.`;
    houseMetric.textContent = info.house.fullLabel;
    pulseMetric.textContent = `Tone ${info.pulse.tone} ${info.pulse.toneName}, ${info.pulse.sign}`;
    moonMetric.textContent = `Gate ${info.moon.day}, ${info.moon.phase}`;
    yearMetric.textContent = info.yearCycle;

    holidays.replaceChildren();
    if (info.holidays.length === 0) {
      const note = document.createElement("div");
      note.className = "holiday-note";
      note.innerHTML = "<strong>Ordinary practice day</strong><span>Follow the tone, house, and moon gate for the day.</span>";
      holidays.append(note);
      return;
    }

    info.holidays.forEach((holiday) => {
      const note = document.createElement("div");
      note.className = "holiday-note";
      const strong = document.createElement("strong");
      const span = document.createElement("span");
      strong.textContent = holiday.name;
      span.textContent = holiday.note;
      note.append(strong, span);
      holidays.append(note);
    });
  }

  function renderGrid() {
    const title = document.querySelector("#calendar-month-title");
    const grid = document.querySelector("#calendar-grid");
    const firstOfMonth = new Date(state.viewYear, state.viewMonth, 1);
    const start = new Date(state.viewYear, state.viewMonth, 1 - firstOfMonth.getDay());
    const today = stripTime(new Date());

    title.textContent = MONTH_FORMAT.format(firstOfMonth);
    grid.replaceChildren();

    for (let index = 0; index < 42; index += 1) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
      const info = transformFromDate(date);
      const button = document.createElement("button");
      const top = document.createElement("span");
      const gregorian = document.createElement("span");
      const yearDay = document.createElement("span");
      const pulse = document.createElement("span");
      const stack = document.createElement("span");

      button.type = "button";
      button.className = "calendar-day";
      button.dataset.date = formatDateInput(date);
      button.setAttribute("aria-label", buildDayAriaLabel(date, info));

      if (date.getMonth() !== state.viewMonth) {
        button.classList.add("is-outside");
      }
      if (sameDay(date, state.selectedDate)) {
        button.classList.add("is-selected");
        button.setAttribute("aria-pressed", "true");
      }
      if (sameDay(date, today)) {
        button.classList.add("is-today");
      }
      if (info.holidays.some((holiday) => holiday.type === "high")) {
        button.classList.add("has-high");
      }

      top.className = "day-top";
      gregorian.className = "greg-day";
      gregorian.textContent = date.getDate();
      top.append(gregorian);

      yearDay.className = "trans-day";
      yearDay.textContent = info.house.shortLabel;
      pulse.className = "pulse-day";
      pulse.textContent = `${info.pulse.tone}.${info.pulse.sign}`;
      stack.className = "holiday-stack";

      info.holidays.slice(0, 2).forEach((holiday) => {
        const chip = document.createElement("span");
        chip.className = `holiday-chip ${holiday.type}`;
        chip.textContent = holiday.shortName || holiday.name;
        stack.append(chip);
      });

      if (info.holidays.length > 2) {
        const chip = document.createElement("span");
        chip.className = "holiday-chip minor";
        chip.textContent = `+${info.holidays.length - 2}`;
        stack.append(chip);
      }

      button.append(top, yearDay, pulse, stack);
      grid.append(button);
    }
  }

  function renderHolidayList() {
    const list = document.querySelector("#holiday-list");
    list.replaceChildren();

    ANNUAL_HOLIDAYS.forEach((holiday) => {
      const item = document.createElement("li");
      const dayLabel = holiday.leapOnly ? "Leap Mirror Day" : solarPositionLabel(holiday.day);
      item.textContent = `${dayLabel} - ${holiday.name}`;
      list.append(item);
    });
  }

  function transformFromDate(date) {
    const diffDays = dayNumber(date) - EPOCH_DAY;
    const transformYear = yearAndDayFromDiff(diffDays);
    const house = houseFromDay(transformYear.dayOfYear);
    const pulse = sacredPulse(diffDays);
    const moon = moonInfo(diffDays);
    const info = {
      diffDays,
      year: transformYear.year,
      yearLabel: displayYear(transformYear.year),
      yearCycle: yearCycle(transformYear.year),
      dayOfYear: transformYear.dayOfYear,
      daysInYear: daysInTransformYear(transformYear.year),
      house,
      pulse,
      moon,
      mainLabel: house.fullLabel,
      holidays: []
    };

    info.holidays = holidaysFor(info);
    return info;
  }

  function yearAndDayFromDiff(diffDays) {
    let year = 1;
    let dayOfYear = diffDays;

    if (dayOfYear >= 0) {
      while (dayOfYear >= daysInTransformYear(year)) {
        dayOfYear -= daysInTransformYear(year);
        year += 1;
      }
    } else {
      while (dayOfYear < 0) {
        year -= 1;
        dayOfYear += daysInTransformYear(year);
      }
    }

    return { year, dayOfYear };
  }

  function daysInTransformYear(year) {
    return isLeapTransformYear(year) ? 366 : 365;
  }

  function isLeapTransformYear(year) {
    const cycleYear = year > 0 ? year : 1 - year;
    return cycleYear % 4 === 0 && (cycleYear % 100 !== 0 || cycleYear % 400 === 0);
  }

  function houseFromDay(dayOfYear) {
    if (dayOfYear < 360) {
      const houseIndex = Math.floor(dayOfYear / 20);
      const houseDay = (dayOfYear % 20) + 1;
      const name = HOUSE_NAMES[houseIndex];
      return {
        kind: "house",
        name,
        day: houseDay,
        fullLabel: `${name} ${houseDay}`,
        shortLabel: `${name} ${houseDay}`
      };
    }

    if (dayOfYear < 365) {
      const threshold = THRESHOLD_DAYS[dayOfYear - 360];
      return {
        kind: "threshold",
        name: threshold.name,
        day: dayOfYear - 359,
        fullLabel: `${threshold.name} Threshold`,
        shortLabel: `Threshold ${dayOfYear - 359}`
      };
    }

    return {
      kind: "leap",
      name: "Mirror Day",
      day: 1,
      fullLabel: "Mirror Day",
      shortLabel: "Mirror Day"
    };
  }

  function sacredPulse(diffDays) {
    const toneIndex = positiveModulo(diffDays, 13);
    const signIndex = positiveModulo(diffDays, 20);
    return {
      tone: toneIndex + 1,
      toneName: TONE_NAMES[toneIndex],
      sign: SACRED_SIGNS[signIndex],
      position: positiveModulo(diffDays, 260)
    };
  }

  function moonInfo(diffDays) {
    const age = positiveModuloFloat(diffDays, SYNODIC_MONTH);
    const day = Math.min(30, Math.floor((age / SYNODIC_MONTH) * 30) + 1);
    let phase = "Waxing";

    if (day <= 2) {
      phase = "Dark Moon";
    } else if (day <= 7) {
      phase = "Waxing Crescent";
    } else if (day <= 9) {
      phase = "First Quarter";
    } else if (day <= 14) {
      phase = "Waxing Gibbous";
    } else if (day <= 16) {
      phase = "Full Moon";
    } else if (day <= 22) {
      phase = "Waning Gibbous";
    } else if (day <= 24) {
      phase = "Last Quarter";
    } else {
      phase = "Waning Crescent";
    }

    return { day, phase };
  }

  function yearCycle(year) {
    const cycleIndex = positiveModulo(year - 1, 60);
    const polarity = YEAR_POLARITIES[cycleIndex % 2];
    const element = YEAR_ELEMENTS[Math.floor(cycleIndex / 2) % YEAR_ELEMENTS.length];
    const animal = YEAR_ANIMALS[cycleIndex % YEAR_ANIMALS.length];
    return `${polarity} ${element} ${animal}`;
  }

  function holidaysFor(info) {
    const holidays = [];

    ANNUAL_HOLIDAYS.forEach((holiday) => {
      if (holiday.leapOnly && !isLeapTransformYear(info.year)) {
        return;
      }
      if (holiday.day === info.dayOfYear) {
        holidays.push({ ...holiday, shortName: shortHolidayName(holiday.name) });
      }
    });

    if (info.house.kind === "house" && info.house.day === 1 && info.dayOfYear !== 0) {
      holidays.push({
        name: `Opening of ${info.house.name}`,
        shortName: "House Opening",
        type: "minor",
        note: `Begin the 20-day house of ${info.house.name}.`
      });
    }

    if (info.pulse.position === 0 && info.diffDays !== 0) {
      holidays.push({
        name: "Sacred Pulse Opening",
        shortName: "Pulse Opens",
        type: "high",
        note: "Begin a new 260-day cycle of tone and sign."
      });
    } else if (info.pulse.position === 259) {
      holidays.push({
        name: "Sacred Pulse Completion",
        shortName: "Pulse Closes",
        type: "high",
        note: "Close the 260-day cycle with review, offering, and release."
      });
    } else if ((info.pulse.position + 1) % 52 === 0) {
      holidays.push({
        name: "Pulse Station",
        shortName: "Station",
        type: "minor",
        note: "Pause at one of the five stations of the sacred count."
      });
    }

    if (info.moon.day === 1) {
      holidays.push({
        name: "Silent Gate",
        shortName: "New Moon",
        type: "lunar",
        note: "Set a private intention at the opening of the moon gate."
      });
    } else if (info.moon.day === 15) {
      holidays.push({
        name: "Lamp of Clarity",
        shortName: "Full Moon",
        type: "lunar",
        note: "Bring a hidden truth into speech, art, or service."
      });
    } else if (info.moon.day === 30) {
      holidays.push({
        name: "Closing Breath",
        shortName: "Moon Close",
        type: "lunar",
        note: "Release the month before the next gate opens."
      });
    }

    return uniqueHolidays(holidays);
  }

  function uniqueHolidays(holidays) {
    const seen = new Set();
    return holidays.filter((holiday) => {
      if (seen.has(holiday.name)) {
        return false;
      }
      seen.add(holiday.name);
      return true;
    });
  }

  function shortHolidayName(name) {
    return name
      .replace("Threshold of ", "")
      .replace("Dawn of ", "")
      .replace("Long Pulse ", "Pulse ");
  }

  function solarPositionLabel(day) {
    if (day < 360) {
      const house = HOUSE_NAMES[Math.floor(day / 20)];
      return `${house} ${(day % 20) + 1}`;
    }
    if (day < 365) {
      return `Threshold ${day - 359}`;
    }
    return "Mirror Day";
  }

  function displayYear(year) {
    if (year > 0) {
      return `Year ${year} AT`;
    }
    return `Year ${1 - year} BT`;
  }

  function buildDayAriaLabel(date, info) {
    const holidayText = info.holidays.length
      ? ` Holidays: ${info.holidays.map((holiday) => holiday.name).join(", ")}.`
      : "";
    return `${FULL_DATE_FORMAT.format(date)}. ${info.mainLabel}, ${info.yearLabel}. Tone ${info.pulse.tone} ${info.pulse.sign}.${holidayText}`;
  }

  function stripTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function dayNumber(date) {
    return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);
  }

  function sameDay(left, right) {
    return left.getFullYear() === right.getFullYear()
      && left.getMonth() === right.getMonth()
      && left.getDate() === right.getDate();
  }

  function formatDateInput(date) {
    const year = String(date.getFullYear()).padStart(4, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseDateInput(value) {
    if (!value) {
      return null;
    }
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      return null;
    }
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function positiveModulo(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function positiveModuloFloat(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function initJoinForm() {
    const form = document.querySelector("#join-form");
    const status = document.querySelector("#form-status");
    const emailLink = document.querySelector("#email-link");
    const fields = {
      name: document.querySelector("#name"),
      email: document.querySelector("#email"),
      transformation: document.querySelector("#transformation")
    };

    if (!form || !status || !emailLink) {
      return;
    }

    loadSavedIntention(fields);
    syncEmailLink(fields, emailLink);

    Object.values(fields).forEach((field) => {
      field.addEventListener("input", () => syncEmailLink(fields, emailLink));
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const intention = {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        transformation: fields.transformation.value.trim(),
        savedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem("transformation-intention", JSON.stringify(intention));
        status.textContent = "Intention saved in this browser.";
      } catch (error) {
        status.textContent = "Intention prepared. Browser storage is unavailable.";
      }

      syncEmailLink(fields, emailLink);
    });
  }

  function loadSavedIntention(fields) {
    try {
      const saved = localStorage.getItem("transformation-intention");
      if (!saved) {
        return;
      }
      const intention = JSON.parse(saved);
      fields.name.value = intention.name || "";
      fields.email.value = intention.email || "";
      fields.transformation.value = intention.transformation || "";
    } catch (error) {
      // Ignore invalid local storage data.
    }
  }

  function syncEmailLink(fields, emailLink) {
    const subject = encodeURIComponent("Founding Circle Intention");
    const body = encodeURIComponent([
      `Name: ${fields.name.value.trim()}`,
      `Email: ${fields.email.value.trim()}`,
      "",
      "Transformation:",
      fields.transformation.value.trim()
    ].join("\n"));
    emailLink.href = `mailto:founding-circle@example.com?subject=${subject}&body=${body}`;
  }

  function initCanvas() {
    const canvas = document.querySelector("#transformation-canvas");
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cssWidth = 0;
    let cssHeight = 0;
    let animationFrame = null;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      cssWidth = Math.max(1, rect.width);
      cssHeight = Math.max(1, rect.height);
      canvas.width = Math.floor(cssWidth * scale);
      canvas.height = Math.floor(cssHeight * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      draw(performance.now());
    }

    function draw(time) {
      context.clearRect(0, 0, cssWidth, cssHeight);
      context.fillStyle = "#171411";
      context.fillRect(0, 0, cssWidth, cssHeight);

      const centerX = cssWidth * 0.68;
      const centerY = cssHeight * 0.48;
      const radius = Math.min(cssWidth, cssHeight) * 0.34;
      const rotation = time * 0.00006;
      const colors = ["#c9912f", "#24706c", "#a2482e", "#486b3b", "#fffaf1"];

      context.save();
      context.translate(centerX, centerY);
      context.rotate(rotation);

      for (let ring = 0; ring < 4; ring += 1) {
        context.beginPath();
        context.arc(0, 0, radius - ring * 34, 0, Math.PI * 2);
        context.strokeStyle = ring % 2 === 0 ? "rgba(201, 145, 47, 0.35)" : "rgba(255, 250, 241, 0.18)";
        context.lineWidth = ring === 0 ? 2 : 1;
        context.stroke();
      }

      for (let segment = 0; segment < 20; segment += 1) {
        const start = (segment / 20) * Math.PI * 2;
        const end = ((segment + 0.72) / 20) * Math.PI * 2;
        context.beginPath();
        context.arc(0, 0, radius, start, end);
        context.strokeStyle = colors[segment % colors.length];
        context.lineWidth = 7;
        context.stroke();
      }

      for (let marker = 0; marker < 13; marker += 1) {
        const angle = (marker / 13) * Math.PI * 2;
        const inner = radius * 0.42;
        const outer = radius * 0.86;
        context.beginPath();
        context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        context.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        context.strokeStyle = "rgba(255, 250, 241, 0.22)";
        context.lineWidth = 1;
        context.stroke();
      }

      context.rotate(-rotation * 2.1);
      for (let animal = 0; animal < 12; animal += 1) {
        const angle = (animal / 12) * Math.PI * 2;
        const dotRadius = animal % 2 === 0 ? 4 : 2.5;
        context.beginPath();
        context.arc(Math.cos(angle) * radius * 0.58, Math.sin(angle) * radius * 0.58, dotRadius, 0, Math.PI * 2);
        context.fillStyle = colors[(animal + 2) % colors.length];
        context.fill();
      }

      context.beginPath();
      context.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
      context.fillStyle = "rgba(255, 250, 241, 0.85)";
      context.fill();
      context.beginPath();
      context.arc(radius * 0.055, -radius * 0.02, radius * 0.18, 0, Math.PI * 2);
      context.fillStyle = "#171411";
      context.fill();

      context.restore();

      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    }

    window.addEventListener("resize", resize);
    resize();

    if (reducedMotion && animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
