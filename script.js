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

  const SOLAR_ARCS = [
    ["Kindling Arc", "The will gathers first light and chooses direction."],
    ["Ascent Arc", "Discipline climbs through pressure, repetition, and visible effort."],
    ["Harvest Arc", "Practice ripens into useful work, offering, and responsibility."],
    ["Descent Arc", "The year turns inward for review, release, repair, and renewal."]
  ];

  const SOLAR_PATHS = [
    ["Witness Path", "See the real condition before trying to change it."],
    ["Refinement Path", "Train one chosen pattern until will becomes discipline."],
    ["Creation Path", "Make the inner change visible through useful work."],
    ["Service Path", "Turn personal growth into protection, aid, and repair."],
    ["Renewal Path", "Release excess and prepare the next vow."]
  ];

  const LUNAR_WATCHES = [
    ["Hidden Watch", "Private intention, protection of the seed, and quiet beginning."],
    ["Testing Watch", "First pressure, adjustment, learning, and truthful measure."],
    ["Illumined Watch", "Full visibility, offering, gratitude, and public clarity."],
    ["Releasing Watch", "Completion, simplification, grief, rest, and the dark gate."]
  ];

  const LUNAR_TIDES = [
    ["Dark Tide", "Stillness before the vow is spoken."],
    ["Waxing Tide", "The will gathers strength and form."],
    ["Full Tide", "Truth is visible and must be handled carefully."],
    ["Waning Tide", "The work releases what it cannot carry forward."]
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

  const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const WEEKLY_VIRTUES = [
    ["Witness Day", "Name the truth without drama, hiding, or accusation."],
    ["Refinement Day", "Choose one pattern and practice one concrete correction."],
    ["Creation Day", "Make inner change visible through useful work, learning, or craft."],
    ["Service Day", "Turn growth outward through aid, repair, protection, or practical care."],
    ["Rest Day", "Let the body recover and separate devotion from exhaustion."],
    ["Council Day", "Review promises, money, records, questions, and shared decisions."],
    ["Renewal Day", "Release what failed, give thanks, and prepare the next cycle."]
  ];

  const MONTH_SYMBOLS = [
    ["January", "Point of Return", "Begin again after endings and choose the first honest step."],
    ["February", "Mirror Pair", "Study relationship, reflection, and the two-sided nature of change."],
    ["March", "Triangle of Becoming", "Give intention a third point: action."],
    ["April", "Square Foundation", "Build a stable place where practice can survive pressure."],
    ["May", "Living Star", "Let growth branch outward through skill, beauty, and repair."],
    ["June", "Hexagon of Balance", "Restore proportion between body, work, rest, and service."],
    ["July", "Pilgrim Spiral", "Travel inward and outward without losing the center."],
    ["August", "Double Wheel", "Coordinate personal discipline with shared responsibility."],
    ["September", "Ninefold Lamp", "Clarify learning, memory, and the light carried into darker work."],
    ["October", "Decade Ring", "Review the cycle of choices and close what has matured."],
    ["November", "Hidden Pillar", "Strengthen quiet commitments before they are seen."],
    ["December", "Council Crown", "Gather testimony, gratitude, correction, and public record."]
  ];

  const CIVIL_DAY_SYMBOLS = [
    "Source Point", "Twin Witness", "Threefold Vow", "Foundation Mark", "Hand Star", "Balanced Field",
    "Seeker's Step", "Renewal Loop", "Ripening Lamp", "Offering Wheel", "Unseen Witness", "Council Ring",
    "Tone Crown", "Bridge of Seven", "Hearth Star", "Fourfold Mirror", "Prime Gate", "House Ring",
    "Flame Crown", "Full Sign Wheel", "Triple Seven", "Double Witness", "Hidden Gate", "Service Wheel",
    "Seed Square", "Twin Tone", "Deep Spiral", "Moon Ladder", "Veiled Prime", "Closing Ring", "Outer Gate"
  ];

  const MOON_GATE_SYMBOLS = [
    {
      name: "Seeded Silence",
      advanced: "Your core begins in protected intention: transformation starts before it is visible.",
      question: "What quiet intention needs protection before it is spoken?"
    },
    {
      name: "Hidden Ember",
      advanced: "Your core preserves first heat: small discipline must be guarded from noise and display.",
      question: "What small flame am I feeding without needing applause?"
    },
    {
      name: "First Word",
      advanced: "Your core turns inward truth into speech: one clean sentence can begin repair.",
      question: "What true sentence is ready to be said without force?"
    },
    {
      name: "Gathering Bowl",
      advanced: "Your core gathers tools, allies, and attention before demanding movement.",
      question: "What do I need to gather before I ask myself to change?"
    },
    {
      name: "Clean Floor",
      advanced: "Your core clears the ground: obstruction, clutter, and unfinished tasks shape the soul.",
      question: "What one obstacle can I remove so practice has room?"
    },
    {
      name: "Study Lamp",
      advanced: "Your core learns before it judges: humility turns information into guidance.",
      question: "What source should I learn from before I decide I know enough?"
    },
    {
      name: "Open Hand",
      advanced: "Your core receives help without surrendering agency: cooperation begins with consent.",
      question: "Where can I ask for help while keeping my choice intact?"
    },
    {
      name: "First Quarter",
      advanced: "Your core is tested by first pressure: vows become real when they meet resistance.",
      question: "What adjustment would make my vow strong enough for pressure?"
    },
    {
      name: "Strong Back",
      advanced: "Your core carries necessary weight: responsibility is sacred when it is chosen freely.",
      question: "What burden is truly mine, and what burden am I pretending to own?"
    },
    {
      name: "True Measure",
      advanced: "Your core counts honestly: fantasy loses power when the numbers are named.",
      question: "What fact, pattern, or cost needs a clean measure today?"
    },
    {
      name: "Kind Speech",
      advanced: "Your core repairs through speech: tone can either open truth or lock it away.",
      question: "How can I speak truth in a way that keeps repair possible?"
    },
    {
      name: "Shared Table",
      advanced: "Your core seeks nourishment and belonging: bodies and bonds must be fed honestly.",
      question: "What ordinary care would make relationship more livable today?"
    },
    {
      name: "High Window",
      advanced: "Your core remembers scale: a wider purpose can calm a crowded moment.",
      question: "What larger purpose should guide this small decision?"
    },
    {
      name: "Bright Edge",
      advanced: "Your core clarifies devotion and obsession: intensity needs a boundary to become holy.",
      question: "Where has devotion crossed into control, craving, or performance?"
    },
    {
      name: "Full Lamp",
      advanced: "Your core brings hidden truth into view: visibility asks for care, not spectacle.",
      question: "What truth is ready to be seen, and who can hold it safely?"
    },
    {
      name: "Blessing Bowl",
      advanced: "Your core receives gratitude: what is visible must be blessed before it is used.",
      question: "What help, grace, or progress have I failed to name?"
    },
    {
      name: "Softening",
      advanced: "Your core releases control of meaning: not every sign belongs to you to command.",
      question: "Where can I soften my interpretation and listen again?"
    },
    {
      name: "Second Listening",
      advanced: "Your core hears after the first answer: deeper listening protects freedom.",
      question: "What did I miss because I was preparing my response?"
    },
    {
      name: "Repair Thread",
      advanced: "Your core reconnects where possible: repair is specific, voluntary, and patient.",
      question: "What thread can I mend without demanding the other person move first?"
    },
    {
      name: "Useful Fire",
      advanced: "Your core turns intensity toward service: heat becomes holy when it reduces harm.",
      question: "How can I use this intensity to help rather than consume?"
    },
    {
      name: "Waning Crown",
      advanced: "Your core steps back from attention: leadership must know when to become quiet.",
      question: "Where do I need less attention and more integrity?"
    },
    {
      name: "Last Quarter",
      advanced: "Your core cuts away what no longer serves: endings protect the next beginning.",
      question: "What must be reduced, ended, or simplified for the vow to survive?"
    },
    {
      name: "Plain Meal",
      advanced: "Your core returns to enough: ordinary sufficiency is a form of freedom.",
      question: "What is enough for today, even if my appetite asks for more?"
    },
    {
      name: "Ash Review",
      advanced: "Your core studies what burned and survived: failure can become instruction without becoming identity.",
      question: "What did this difficulty teach without defining who I am?"
    },
    {
      name: "Quiet Gift",
      advanced: "Your core serves without recognition: unseen help purifies motive.",
      question: "What good can I do without needing to be seen doing it?"
    },
    {
      name: "Empty Room",
      advanced: "Your core completes tasks to make space: closure is an act of mercy.",
      question: "What unfinished thing is taking up inner room?"
    },
    {
      name: "Ancestral Breath",
      advanced: "Your core remembers inherited work: lineage is honored by conscious choice, not repetition alone.",
      question: "What inherited pattern should I bless, revise, or release?"
    },
    {
      name: "Deep Water",
      advanced: "Your core lets feeling move without ruling: emotion is real, but it is not the whole command.",
      question: "What feeling needs movement rather than obedience?"
    },
    {
      name: "Closing Breath",
      advanced: "Your core exhales the month: release prepares the soul for a cleaner vow.",
      question: "What am I ready to exhale before the next beginning?"
    },
    {
      name: "Dark Gate",
      advanced: "Your core rests before beginning again: darkness can protect renewal from urgency.",
      question: "Where does my transformation need rest instead of pressure?"
    }
  ];

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
    viewMonth: new Date().getMonth(),
    birthDate: readStoredBirthDate()
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
    const birthInput = document.querySelector("#birth-moon-date");
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
    if (birthInput) {
      if (state.birthDate) {
        birthInput.value = formatDateInput(state.birthDate);
      }
      birthInput.addEventListener("change", () => {
        const parsed = parseDateInput(birthInput.value);
        state.birthDate = parsed ? stripTime(parsed) : null;
        storeBirthDate(state.birthDate);
        renderSelectedDate();
      });
    }
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
    const commonSymbolList = document.querySelector("#common-symbol-list");
    const solarCycleList = document.querySelector("#solar-cycle-list");
    const lunarCycleList = document.querySelector("#lunar-cycle-list");
    const birthMoonReading = document.querySelector("#birth-moon-reading");

    dateInput.value = formatDateInput(state.selectedDate);
    title.textContent = `${info.mainLabel}, ${info.yearLabel}`;
    detail.textContent = `${FULL_DATE_FORMAT.format(state.selectedDate)} is day ${info.dayOfYear + 1} of a ${info.daysInYear}-day transformation year.`;
    houseMetric.textContent = info.house.fullLabel;
    pulseMetric.textContent = `Tone ${info.pulse.tone} ${info.pulse.toneName}, ${info.pulse.sign}`;
    moonMetric.textContent = `Gate ${info.moon.day}, ${moonGateSymbol(info.moon.day).name}, ${info.moon.phase}`;
    yearMetric.textContent = info.yearCycle;
    renderCommonSymbols(commonSymbolList, info);
    renderCycleLayers(solarCycleList, lunarCycleList, info);
    renderBirthMoonReading(birthMoonReading, info);

    holidays.replaceChildren();
    if (info.holidays.length === 0) {
      const note = document.createElement("div");
      note.className = "holiday-note";
      note.innerHTML = "<strong>Ordinary practice day</strong><span>Follow the common symbols, tone, house, and moon gate for the day.</span>";
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


  function renderCommonSymbols(target, info) {
    if (!target) {
      return;
    }

    renderLayerList(target, [
      ["Daily symbol", `${info.symbols.daily.label}: ${info.symbols.daily.name}`, info.symbols.daily.note],
      ["Weekly symbol", `${info.symbols.weekly.label}: ${info.symbols.weekly.name}`, info.symbols.weekly.note],
      ["Monthly symbol", `${info.symbols.monthly.label}: ${info.symbols.monthly.name}`, info.symbols.monthly.note],
      ["Yearly symbol", info.symbols.yearly.name, info.symbols.yearly.note]
    ]);
  }

  function renderCycleLayers(solarTarget, lunarTarget, info) {
    if (solarTarget) {
      renderLayerList(solarTarget, [
        ["Year Day", `Day ${info.dayOfYear + 1} of ${info.daysInYear}`, "The solar body of the year."],
        ["Solar Arc", `${info.solar.arc.name}, day ${info.solar.arc.day}`, info.solar.arc.note],
        ["Solar Path", `${info.solar.path.name}, day ${info.solar.path.day}`, info.solar.path.note],
        ["House Circuit", `${info.house.fullLabel}`, "The 20-day house shaping visible discipline."],
        ["Correction", info.solar.correction.name, info.solar.correction.note]
      ]);
    }

    if (lunarTarget) {
      renderLayerList(lunarTarget, [
        ["Lunation", info.lunar.lunationLabel, "The counted moon cycle from the founding epoch."],
        ["Moon Gate", `Gate ${info.moon.day} of 30: ${moonGateSymbol(info.moon.day).name}`, "The lunar day used for inner practice."],
        ["Lunar Watch", `${info.lunar.watch.name}, day ${info.lunar.watch.day}`, info.lunar.watch.note],
        ["Moon Phase", info.moon.phase, "The visible face of the moon cycle."],
        ["Lunar Tide", info.lunar.tide.name, info.lunar.tide.note]
      ]);
    }
  }
  function renderBirthMoonReading(target, selectedInfo) {
    if (!target) {
      return;
    }

    target.replaceChildren();
    const birthInput = document.querySelector("#birth-moon-date");
    if (birthInput) {
      birthInput.value = state.birthDate ? formatDateInput(state.birthDate) : "";
    }

    if (!state.birthDate) {
      const empty = document.createElement("p");
      empty.className = "empty-reading";
      empty.textContent = "Choose a birth date to reveal the core moon symbol, daily advanced meaning, and self-question.";
      target.append(empty);
      return;
    }

    const birthInfo = transformFromDate(state.birthDate);
    const core = moonGateSymbol(birthInfo.moon.day);
    const daily = moonGateSymbol(selectedInfo.moon.day);
    const relation = birthMoonRelation(birthInfo.moon.day, selectedInfo.moon.day);

    appendBirthMoonRow(
      target,
      "Core symbol",
      `Gate ${birthInfo.moon.day}: ${core.name}`,
      `Born under ${birthInfo.moon.phase}, ${birthInfo.lunar.watch.name}. ${core.advanced}`
    );
    appendBirthMoonRow(
      target,
      "Daily moon contact",
      `Gate ${selectedInfo.moon.day}: ${daily.name} - ${relation.name}`,
      `${relation.meaning} ${daily.advanced}`
    );
    appendBirthMoonRow(
      target,
      "Self-question",
      relation.question,
      daily.question,
      "self-question"
    );
  }

  function appendBirthMoonRow(target, label, value, note, extraClass = "") {
    const row = document.createElement("div");
    const strong = document.createElement("strong");
    const span = document.createElement("span");
    const em = document.createElement("em");
    row.className = `birth-moon-row ${extraClass}`.trim();
    strong.textContent = label;
    span.textContent = value;
    em.textContent = note;
    row.append(strong, span, em);
    target.append(row);
  }

  function moonGateSymbol(day) {
    return MOON_GATE_SYMBOLS[positiveModulo(day - 1, MOON_GATE_SYMBOLS.length)];
  }

  function birthMoonRelation(coreDay, dailyDay) {
    const offset = positiveModulo(dailyDay - coreDay, 30);
    if (offset === 0) {
      return {
        name: "Core return",
        meaning: "The daily gate returns directly to the birth moon core; identity, habit, and private intention are close to the surface.",
        question: "How can I honor my core pattern without being trapped by it?"
      };
    }
    if (offset <= 3) {
      return {
        name: "Kindling contact",
        meaning: "The day activates the first movement after the core symbol; begin gently and protect the young form of the work.",
        question: "What small beginning follows naturally from my birth moon core?"
      };
    }
    if (offset <= 7) {
      return {
        name: "Testing contact",
        meaning: "The day tests the core symbol through pressure, schedule, and honest measure.",
        question: "Where does my core symbol need structure instead of mood?"
      };
    }
    if (offset <= 14) {
      return {
        name: "Rising contact",
        meaning: "The day draws the core symbol outward into speech, relationship, learning, and visible practice.",
        question: "How should my inner symbol become visible without becoming performance?"
      };
    }
    if (offset === 15) {
      return {
        name: "Mirror contact",
        meaning: "The day stands opposite the core symbol; what is hidden in the birth pattern asks to be witnessed by contrast.",
        question: "What opposite truth balances my usual way of changing?"
      };
    }
    if (offset <= 22) {
      return {
        name: "Integration contact",
        meaning: "The day asks the core symbol to release control and turn experience into usable wisdom.",
        question: "What can I integrate now that I no longer need to defend?"
      };
    }
    if (offset <= 28) {
      return {
        name: "Release contact",
        meaning: "The day helps the core symbol simplify, complete, forgive, and clear space before renewal.",
        question: "What does my core symbol need to release so the next vow can breathe?"
      };
    }
    return {
      name: "Dark gate contact",
      meaning: "The day brings the core symbol to its threshold of rest; renewal is near but should not be forced.",
      question: "Where should I rest before beginning again?"
    };
  }


  function renderLayerList(target, rows) {
    target.replaceChildren();
    rows.forEach(([label, value, note]) => {
      const item = document.createElement("li");
      const strong = document.createElement("strong");
      const wrapper = document.createElement("span");
      const em = document.createElement("em");
      strong.textContent = label;
      wrapper.textContent = value;
      em.textContent = note;
      wrapper.append(em);
      item.append(strong, wrapper);
      target.append(item);
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
    const solar = solarCycle(transformYear.dayOfYear, daysInTransformYear(transformYear.year), house);
    const lunar = lunarCycle(moon);
    const symbols = commonSymbolsFromDate(date, transformYear.year);
    const info = {
      diffDays,
      year: transformYear.year,
      yearLabel: displayYear(transformYear.year),
      yearCycle: symbols.yearly.name,
      symbols,
      dayOfYear: transformYear.dayOfYear,
      daysInYear: daysInTransformYear(transformYear.year),
      house,
      pulse,
      moon,
      solar,
      lunar,
      mainLabel: house.fullLabel,
      holidays: []
    };

    info.holidays = holidaysFor(info);
    return info;
  }

  function commonSymbolsFromDate(date, transformYear) {
    const dayIndex = date.getDate() - 1;
    const weekIndex = date.getDay();
    const monthIndex = date.getMonth();
    const weekly = WEEKLY_VIRTUES[weekIndex];
    const monthly = MONTH_SYMBOLS[monthIndex];
    const yearName = yearCycle(transformYear);

    return {
      daily: {
        label: `Civil Day ${dayIndex + 1}`,
        name: CIVIL_DAY_SYMBOLS[dayIndex],
        note: "The day-of-month seal for journals, altars, meeting notes, and daily practice cards."
      },
      weekly: {
        label: WEEKDAY_NAMES[weekIndex],
        name: weekly[0],
        note: weekly[1]
      },
      monthly: {
        label: monthly[0],
        name: monthly[1],
        note: monthly[2]
      },
      yearly: {
        label: displayYear(transformYear),
        name: yearName,
        note: `${displayYear(transformYear)} in the 60-year breath; this sign names the larger public temperament of the year.`
      }
    };
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


  function solarCycle(dayOfYear, daysInYear, house) {
    const arc = segmentFrom(dayOfYear, daysInYear, SOLAR_ARCS);
    const path = segmentFrom(dayOfYear, daysInYear, SOLAR_PATHS);
    let correction = {
      name: "House Day",
      note: `The day is inside the ${house.name} house of ordinary solar practice.`
    };

    if (house.kind === "threshold") {
      correction = {
        name: `${house.name} Threshold`,
        note: "The ordinary houses are complete; this day closes, repairs, and prepares the year."
      };
    } else if (house.kind === "leap") {
      correction = {
        name: "Mirror Day Correction",
        note: "The leap correction recalibrates the calendar before the next round."
      };
    }

    return { arc, path, correction };
  }

  function lunarCycle(moon) {
    const watchIndex = moon.day <= 7 ? 0 : moon.day <= 14 ? 1 : moon.day <= 22 ? 2 : 3;
    const watchStart = watchIndex === 0 ? 1 : watchIndex === 1 ? 8 : watchIndex === 2 ? 15 : 23;
    const tide = lunarTide(moon.day);
    return {
      lunationLabel: displayLunation(moon.lunation),
      watch: {
        name: LUNAR_WATCHES[watchIndex][0],
        note: LUNAR_WATCHES[watchIndex][1],
        day: moon.day - watchStart + 1
      },
      tide
    };
  }

  function lunarTide(day) {
    if (day <= 2 || day >= 29) {
      return { name: LUNAR_TIDES[0][0], note: LUNAR_TIDES[0][1] };
    }
    if (day <= 14) {
      return { name: LUNAR_TIDES[1][0], note: LUNAR_TIDES[1][1] };
    }
    if (day <= 16) {
      return { name: LUNAR_TIDES[2][0], note: LUNAR_TIDES[2][1] };
    }
    return { name: LUNAR_TIDES[3][0], note: LUNAR_TIDES[3][1] };
  }

  function segmentFrom(dayOfYear, daysInYear, segments) {
    const index = Math.min(segments.length - 1, Math.floor(dayOfYear * segments.length / daysInYear));
    const start = Math.floor(daysInYear * index / segments.length);
    const end = Math.floor(daysInYear * (index + 1) / segments.length) - 1;
    return {
      name: segments[index][0],
      note: segments[index][1],
      day: dayOfYear - start + 1,
      span: end - start + 1
    };
  }

  function displayLunation(lunation) {
    if (lunation >= 0) {
      return `Lunation ${lunation + 1} AT`;
    }
    return `Lunation ${Math.abs(lunation)} BT`;
  }


  function moonInfo(diffDays) {
    const lunation = Math.floor(diffDays / SYNODIC_MONTH);
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

    return { day, phase, lunation, age };
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
    return `${FULL_DATE_FORMAT.format(date)}. ${info.mainLabel}, ${info.yearLabel}. Daily symbol ${info.symbols.daily.name}. Weekly symbol ${info.symbols.weekly.name}. Monthly symbol ${info.symbols.monthly.name}. Yearly symbol ${info.symbols.yearly.name}. Tone ${info.pulse.tone} ${info.pulse.sign}.${holidayText}`;
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
  function readStoredBirthDate() {
    try {
      const stored = window.localStorage?.getItem("transformationBirthMoonDate");
      const parsed = parseDateInput(stored || "");
      return parsed ? stripTime(parsed) : null;
    } catch (error) {
      return null;
    }
  }

  function storeBirthDate(date) {
    try {
      if (date) {
        window.localStorage?.setItem("transformationBirthMoonDate", formatDateInput(date));
      } else {
        window.localStorage?.removeItem("transformationBirthMoonDate");
      }
    } catch (error) {
      // Local storage is optional; the reading still works for the current page session.
    }
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

  const PSEUDONYM_GIVEN_NAMES = [
    "Ari", "Bryn", "Cai", "Dara", "Eli", "Ira", "Jalen", "Kira", "Lior", "Mara", "Nico", "Orin",
    "Pax", "Rian", "Sage", "Tala", "Uma", "Vera", "Wren", "Zion"
  ];
  const PSEUDONYM_FAMILY_NAMES = [
    "Ash", "Bright", "Cedar", "Dawn", "Ember", "Field", "Harbor", "Hearth", "Lantern", "Moon",
    "North", "River", "Rowan", "Sol", "Stone", "Vale", "Vow", "West", "Willow", "Witness"
  ];

  function initJoinForm() {
    const form = document.querySelector("#join-form");
    const status = document.querySelector("#form-status");
    const emailLink = document.querySelector("#email-link");
    const pseudonymButton = document.querySelector("#assigned-pseudonym-refresh");
    const submitButton = form?.querySelector("button[type='submit']");
    const endpoint = form?.dataset.registrationEndpoint || "";
    const registrationKind = form?.dataset.registrationKind || "membership";
    const storageKey = "transformation-membership-signup";
    const fields = {
      name: document.querySelector("#name"),
      email: document.querySelector("#email"),
      emailCode: document.querySelector("#email-code"),
      phone: document.querySelector("#phone"),
      phoneCode: document.querySelector("#phone-code"),
      preferredName: document.querySelector("#preferred-name"),
      assignedPseudonym: document.querySelector("#assigned-pseudonym"),
      membershipPath: document.querySelector("#membership-path"),
      location: document.querySelector("#member-location"),
      transformation: document.querySelector("#transformation"),
      serviceInterest: document.querySelector("#service-interest"),
      consent: document.querySelector("#registration-consent")
    };

    if (!form || !status || !emailLink) {
      return;
    }

    const verification = createVerificationState(form, fields);

    loadSavedIntention(fields, storageKey);
    ensureAssignedPseudonym(fields);
    resetVerification(verification.email, "A code is required before signup.");
    resetVerification(verification.phone, "A code is required before signup.");
    syncEmailLink(fields, emailLink, verification);

    pseudonymButton?.addEventListener("click", () => {
      fields.assignedPseudonym.value = createMemberPseudonym();
      syncEmailLink(fields, emailLink, verification);
      status.textContent = "Assigned member pseudonym updated.";
    });

    fields.email?.addEventListener("input", () => {
      resetVerification(verification.email, "Email changed. Send a new code before signup.");
      syncEmailLink(fields, emailLink, verification);
    });
    fields.phone?.addEventListener("input", () => {
      resetVerification(verification.phone, "Phone changed. Send a new code before signup.");
      syncEmailLink(fields, emailLink, verification);
    });

    verification.email.sendButton?.addEventListener("click", () => requestVerificationCode(verification.email, status));
    verification.email.verifyButton?.addEventListener("click", () => confirmVerificationCode(verification.email, status, fields, emailLink, verification));
    verification.phone.sendButton?.addEventListener("click", () => requestVerificationCode(verification.phone, status));
    verification.phone.verifyButton?.addEventListener("click", () => confirmVerificationCode(verification.phone, status, fields, emailLink, verification));

    Object.values(fields).forEach((field) => {
      if (field === fields.email || field === fields.phone) {
        return;
      }
      field?.addEventListener("input", () => syncEmailLink(fields, emailLink, verification));
      field?.addEventListener("change", () => syncEmailLink(fields, emailLink, verification));
    });

    emailLink.addEventListener("click", (event) => {
      if (!validateRegistration(fields, status, verification)) {
        event.preventDefault();
        return;
      }

      saveIntention(readIntention(fields, registrationKind, verification), status, storageKey);
      syncEmailLink(fields, emailLink, verification);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const intention = readIntention(fields, registrationKind, verification);

      if (!validateRegistration(fields, status, verification)) {
        return;
      }

      saveIntention(intention, status, storageKey);
      syncEmailLink(fields, emailLink, verification);

      if (!endpoint) {
        status.textContent = "Opening email membership signup draft.";
        window.location.href = emailLink.href;
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Signing up...";
      }
      status.textContent = "Submitting membership signup...";

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(intention)
        });

        if (!response.ok) {
          throw new Error(`Registration failed with status ${response.status}`);
        }

        status.textContent = "Membership signup sent. Check your email for the next step.";
        form.reset();
        localStorage.removeItem(storageKey);
        ensureAssignedPseudonym(fields);
        resetVerification(verification.email, "A code is required before signup.");
        resetVerification(verification.phone, "A code is required before signup.");
        syncEmailLink(fields, emailLink, verification);
      } catch (error) {
        status.textContent = "Signup could not be sent. Use Email Signup instead.";
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Sign Up";
        }
      }
    });
  }

  function createVerificationState(form, fields) {
    return {
      email: {
        type: "email",
        label: "Email",
        valueField: fields.email,
        codeField: fields.emailCode,
        sendButton: document.querySelector("#email-code-button"),
        verifyButton: document.querySelector("#email-verify-button"),
        panel: document.querySelector('[data-verification-panel="email"]'),
        status: document.querySelector("#email-verification-status"),
        state: document.querySelector("#email-verification-state"),
        requestEndpoint: form.dataset.emailCodeEndpoint || "",
        verifyEndpoint: form.dataset.emailVerifyEndpoint || "",
        verified: false,
        verifiedValue: "",
        demoCode: ""
      },
      phone: {
        type: "phone",
        label: "Phone",
        valueField: fields.phone,
        codeField: fields.phoneCode,
        sendButton: document.querySelector("#phone-code-button"),
        verifyButton: document.querySelector("#phone-verify-button"),
        panel: document.querySelector('[data-verification-panel="phone"]'),
        status: document.querySelector("#phone-verification-status"),
        state: document.querySelector("#phone-verification-state"),
        requestEndpoint: form.dataset.phoneCodeEndpoint || "",
        verifyEndpoint: form.dataset.phoneVerifyEndpoint || "",
        verified: false,
        verifiedValue: "",
        demoCode: ""
      }
    };
  }

  async function requestVerificationCode(channel, status) {
    const value = channel.valueField?.value.trim() || "";
    if (!validateVerificationTarget(channel, value)) {
      return;
    }

    setVerificationBusy(channel, true);
    try {
      if (channel.requestEndpoint) {
        const response = await fetch(channel.requestEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ type: channel.type, value })
        });
        if (!response.ok) {
          throw new Error(`${channel.label} code request failed with status ${response.status}`);
        }
        channel.demoCode = "";
        channel.status.textContent = `${channel.label} code sent. Enter the code to verify.`;
        status.textContent = `${channel.label} verification code sent.`;
      } else {
        channel.demoCode = createVerificationCode();
        channel.status.textContent = `Demo mode code: ${channel.demoCode}. Configure ${channel.type} endpoints for live delivery.`;
        status.textContent = `${channel.label} demo verification code generated.`;
      }
      channel.verified = false;
      channel.verifiedValue = "";
      updateVerificationState(channel);
    } catch (error) {
      channel.status.textContent = `${channel.label} code could not be sent. Try again or check the endpoint.`;
      status.textContent = `${channel.label} verification failed to start.`;
    } finally {
      setVerificationBusy(channel, false);
    }
  }

  async function confirmVerificationCode(channel, status, fields, emailLink, verification) {
    const value = channel.valueField?.value.trim() || "";
    const code = channel.codeField?.value.trim() || "";
    if (!validateVerificationTarget(channel, value)) {
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      channel.status.textContent = "Enter the 6-digit verification code.";
      return;
    }

    setVerificationBusy(channel, true);
    try {
      if (channel.verifyEndpoint) {
        const response = await fetch(channel.verifyEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ type: channel.type, value, code })
        });
        if (!response.ok) {
          throw new Error(`${channel.label} code verification failed with status ${response.status}`);
        }
      } else if (code !== channel.demoCode) {
        channel.status.textContent = "Code does not match the current demo code.";
        return;
      }

      channel.verified = true;
      channel.verifiedValue = value;
      channel.status.textContent = `${channel.label} verified.`;
      status.textContent = `${channel.label} verified.`;
      updateVerificationState(channel);
      syncEmailLink(fields, emailLink, verification);
    } catch (error) {
      channel.verified = false;
      channel.verifiedValue = "";
      channel.status.textContent = `${channel.label} could not be verified. Check the code and try again.`;
      status.textContent = `${channel.label} verification failed.`;
      updateVerificationState(channel);
    } finally {
      setVerificationBusy(channel, false);
    }
  }

  function validateVerificationTarget(channel, value) {
    if (!value) {
      channel.status.textContent = `${channel.label} is required before requesting a code.`;
      return false;
    }
    if (channel.type === "email" && !channel.valueField.checkValidity()) {
      channel.status.textContent = "Enter a valid email address before requesting a code.";
      return false;
    }
    if (channel.type === "phone" && value.replace(/\D/g, "").length < 7) {
      channel.status.textContent = "Enter a valid phone number before requesting a code.";
      return false;
    }
    return true;
  }

  function resetVerification(channel, message) {
    if (!channel) {
      return;
    }
    channel.verified = false;
    channel.verifiedValue = "";
    channel.demoCode = "";
    if (channel.codeField) {
      channel.codeField.value = "";
    }
    if (channel.status) {
      channel.status.textContent = message;
    }
    updateVerificationState(channel);
  }

  function updateVerificationState(channel) {
    if (channel.state) {
      channel.state.textContent = channel.verified ? "Verified" : "Unverified";
    }
    channel.panel?.classList.toggle("is-verified", channel.verified);
  }

  function setVerificationBusy(channel, busy) {
    if (channel.sendButton) {
      channel.sendButton.disabled = busy;
    }
    if (channel.verifyButton) {
      channel.verifyButton.disabled = busy;
    }
  }

  function createVerificationCode() {
    return String(randomInt(0, 999999)).padStart(6, "0");
  }

  function ensureAssignedPseudonym(fields) {
    if (fields.assignedPseudonym && !fields.assignedPseudonym.value.trim()) {
      fields.assignedPseudonym.value = createMemberPseudonym();
    }
  }

  function createMemberPseudonym() {
    const given = PSEUDONYM_GIVEN_NAMES[randomIndex(PSEUDONYM_GIVEN_NAMES.length)];
    const family = PSEUDONYM_FAMILY_NAMES[randomIndex(PSEUDONYM_FAMILY_NAMES.length)];
    const number = String(randomInt(100, 999));
    return `${given} ${family} ${number}`;
  }

  function randomIndex(length) {
    return randomInt(0, length - 1);
  }

  function randomInt(min, max) {
    const range = max - min + 1;
    const cryptoApi = window.crypto || window.msCrypto;
    if (cryptoApi?.getRandomValues) {
      const values = new Uint32Array(1);
      cryptoApi.getRandomValues(values);
      return min + (values[0] % range);
    }
    return min + Math.floor(Math.random() * range);
  }

  function validateRegistration(fields, status, verification) {
    if (!fields.name.value.trim() || !fields.email.value.trim() || !fields.phone.value.trim() || !fields.assignedPseudonym.value.trim() || !fields.membershipPath.value || !fields.transformation.value.trim()) {
      status.textContent = "Name, email, phone, assigned pseudonym, membership path, and first transformation are required.";
      return false;
    }

    if (!verification.email.verified || verification.email.verifiedValue !== fields.email.value.trim()) {
      status.textContent = "Verify your email before signing up.";
      return false;
    }

    if (!verification.phone.verified || verification.phone.verifiedValue !== fields.phone.value.trim()) {
      status.textContent = "Verify your phone number before signing up.";
      return false;
    }

    if (!fields.consent?.checked) {
      status.textContent = "Consent is required before signup.";
      return false;
    }

    return true;
  }

  function readIntention(fields, registrationKind, verification) {
    return {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      preferredName: fields.preferredName.value.trim(),
      assignedPseudonym: fields.assignedPseudonym.value.trim(),
      membershipPath: fields.membershipPath.value,
      location: fields.location.value.trim(),
      transformation: fields.transformation.value.trim(),
      serviceInterest: fields.serviceInterest.value.trim(),
      emailVerified: Boolean(verification.email.verified),
      phoneVerified: Boolean(verification.phone.verified),
      verificationMode: verification.email.verifyEndpoint && verification.phone.verifyEndpoint ? "endpoint" : "local-demo-or-partial-endpoint",
      consent: Boolean(fields.consent?.checked),
      kind: registrationKind,
      source: "homepage-membership-signup",
      savedAt: new Date().toISOString()
    };
  }

  function saveIntention(intention, status, storageKey) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(intention));
    } catch (error) {
      status.textContent = "Signup prepared. Browser storage is unavailable.";
    }
  }

  function loadSavedIntention(fields, storageKey) {
    try {
      const saved = localStorage.getItem(storageKey) || localStorage.getItem("transformation-intention");
      if (!saved) {
        return;
      }
      const intention = JSON.parse(saved);
      fields.name.value = intention.name || "";
      fields.email.value = intention.email || "";
      fields.phone.value = intention.phone || "";
      fields.preferredName.value = intention.preferredName || "";
      fields.assignedPseudonym.value = intention.assignedPseudonym || "";
      fields.membershipPath.value = intention.membershipPath || "";
      fields.location.value = intention.location || "";
      fields.transformation.value = intention.transformation || "";
      fields.serviceInterest.value = intention.serviceInterest || "";
      if (fields.consent) {
        fields.consent.checked = Boolean(intention.consent);
      }
    } catch (error) {
      // Ignore invalid local storage data.
    }
  }

  function syncEmailLink(fields, emailLink, verification) {
    const subject = encodeURIComponent("Membership Signup");
    const body = encodeURIComponent([
      `Name: ${fields.name.value.trim()}`,
      `Email: ${fields.email.value.trim()}`,
      `Email verified: ${verification.email.verified ? "yes" : "no"}`,
      `Phone: ${fields.phone.value.trim()}`,
      `Phone verified: ${verification.phone.verified ? "yes" : "no"}`,
      `Preferred public name: ${fields.preferredName.value.trim() || "not provided"}`,
      `Assigned member pseudonym: ${fields.assignedPseudonym.value.trim() || "not assigned"}`,
      `Membership path: ${fields.membershipPath.value || "not selected"}`,
      `Local circle or city: ${fields.location.value.trim() || "not provided"}`,
      `Consent: ${fields.consent?.checked ? "yes" : "no"}`,
      "",
      "First transformation:",
      fields.transformation.value.trim(),
      "",
      "Service interest:",
      fields.serviceInterest.value.trim() || "not provided"
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
