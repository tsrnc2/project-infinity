(() => {
  "use strict";

  const COUNTS = [
    {
      name: "The Solar Round",
      key: "Body",
      text: "The solar round is the outward discipline of the religion. Its eighteen houses give work a season, its five thresholds close the year with repair, and its leap Mirror Day reminds the community that correction is sacred."
    },
    {
      name: "The Sacred Pulse",
      key: "Spirit",
      text: "The sacred pulse joins thirteen tones to twenty day signs. It teaches that no day is empty: every dawn carries a task, a shape of attention, and a way to transform desire into practice."
    },
    {
      name: "The Moon Gates",
      key: "Mind",
      text: "The moon gates mark the inner weather of the month. They guide silence, confession, study, blessing, and release, so private change can move in rhythm with visible action."
    },
    {
      name: "The Sixty-Year Breath",
      key: "World",
      text: "The year sign combines polarity, element, and animal. It gives each year a public temperament: the way the community should build, repair, teach, protect, and renew its institutions."
    }
  ];

  const TONES = [
    ["Initiating", "Begin before certainty arrives. This tone blesses the first step, the first honest sentence, and the courage to enter unfinished work."],
    ["Gathering", "Bring scattered energy into one vessel. This tone asks for allies, materials, memories, and attention to be collected without hurry."],
    ["Naming", "Give the work its true name. This tone exposes the difference between a wish, a fear, an excuse, and a vow."],
    ["Shaping", "Make the vow visible through structure. This tone favors schedules, boundaries, tools, and the first repeatable form."],
    ["Testing", "Let pressure reveal what is real. This tone does not punish failure; it shows where the practice needs stronger roots."],
    ["Balancing", "Restore proportion. This tone joins discipline with mercy, solitude with community, and ambition with service."],
    ["Opening", "Allow the work to breathe. This tone invites listening, revision, and the humility to receive what was not planned."],
    ["Binding", "Commit the work to memory and relationship. This tone is for promises, witnesses, records, and shared accountability."],
    ["Ripening", "Protect what is becoming fruitful. This tone favors patience, refinement, teaching, and the quiet labor before harvest."],
    ["Offering", "Return the fruit of practice to the world. This tone asks what the transformation can repair beyond the self."],
    ["Clarifying", "Separate signal from noise. This tone is for clean speech, careful judgment, and the removal of false ornament."],
    ["Releasing", "Let the completed form pass away. This tone is not defeat; it is the dignity of closing what has served its purpose."],
    ["Transforming", "Cross the boundary into a new pattern. This tone seals the cycle and prepares the next beginning."]
  ];

  const SIGNS = [
    ["Spark", "The first flash of will. Spark days are for ignition, courage, and naming the change that wants to live."],
    ["Reed", "The hollow channel. Reed days are for humility, study, and becoming clear enough for truth to pass through."],
    ["Mirror", "The polished witness. Mirror days are for self-examination, confession, and seeing without distortion."],
    ["Root", "The hidden foundation. Root days are for ancestry, habits, health, and the unseen systems that hold a life upright."],
    ["Flame", "The heat of purification. Flame days burn away delay, resentment, and timid half-promises."],
    ["River", "The moving path. River days favor adaptation, forgiveness, travel, and emotion that has found direction."],
    ["Stone", "The durable vow. Stone days strengthen endurance, craft, law, shelter, and commitments built to carry weight."],
    ["Wind", "The breath of speech. Wind days govern messages, teaching, song, prayer, and the ethics of influence."],
    ["Deer", "The alert body. Deer days call for gentleness, movement, protection, and attention to vulnerability."],
    ["Star", "The distant guide. Star days favor long vision, navigation, beauty, and faithfulness to what is not yet near."],
    ["Bowl", "The vessel of receiving. Bowl days are for gratitude, hospitality, nourishment, and the discipline of enough."],
    ["Mountain", "The high witness. Mountain days invite perspective, solitude, pilgrimage, and the strength to stand above confusion."],
    ["Thread", "The line between people. Thread days bind stories, families, promises, and the repair of broken connection."],
    ["Sun", "The public light. Sun days are for visibility, leadership, celebration, and work that can survive being seen."],
    ["Cloud", "The merciful cover. Cloud days honor mystery, rest, grief, incubation, and the wisdom of not forcing revelation."],
    ["Hand", "The maker's blessing. Hand days are for skill, service, healing, construction, and the touch that changes matter."],
    ["Gate", "The guarded passage. Gate days mark decisions, initiations, thresholds, and the cost of entering a new life."],
    ["Maize", "The cultivated life. Maize days bless food, family, teaching, patience, and the daily work that feeds the future."],
    ["Drum", "The shared heartbeat. Drum days gather the community through rhythm, ceremony, courage, and collective memory."],
    ["Dawn", "The returning light. Dawn days close darkness without denying it and announce a renewed way forward."]
  ];

  const HOUSES = [
    ["Witness", "The first house teaches truthful sight. Its twenty days are used to record the present condition without drama, hiding, or accusation."],
    ["Refinement", "The second house chooses one rough pattern and files it down through repeated practice."],
    ["Seed", "The third house plants what cannot yet be seen. It favors preparation, study, and small beginnings."],
    ["River", "The fourth house loosens rigidity. It teaches adaptation, forgiveness, and movement around obstacles."],
    ["Mirror", "The fifth house requires direct self-knowledge. It is a season of examination, apology, and clean accounting."],
    ["Mountain", "The sixth house builds endurance. It is for difficult work, clear boundaries, and vows that must stand under weather."],
    ["Wind", "The seventh house purifies speech. Members review what they teach, repeat, post, promise, and withhold."],
    ["Hearth", "The eighth house tends belonging. It blesses food, domestic repair, mutual care, and ordinary warmth."],
    ["Craft", "The ninth house turns intention into skill. It is a season for making, training, and measurable improvement."],
    ["Vow", "The tenth house binds choice to action. It favors public commitments and the duties that follow them."],
    ["Gate", "The eleventh house marks initiation. It asks what must be left outside before entering the next life."],
    ["Offering", "The twelfth house gives the fruit away. Transformation becomes holy when it lessens another burden."],
    ["Thread", "The thirteenth house repairs connection. It is for reconciliation, memory, lineage, and honest conversation."],
    ["Lion", "The fourteenth house gives disciplined courage. It asks members to protect the vulnerable without worshiping power."],
    ["Lotus", "The fifteenth house honors beauty rising from difficulty. It is for art, tenderness, and dignity after struggle."],
    ["Sky", "The sixteenth house widens vision. It favors study, contemplation, planning, and the humility of scale."],
    ["Wheel", "The seventeenth house studies patterns. It reviews cycles, consequences, and the systems that turn beneath personal choices."],
    ["Flame", "The eighteenth house completes purification. It burns away excess before the threshold days begin."]
  ];


  const WEEKLY_VIRTUES = [
    ["Witness Day", "Begin the week by naming the truth without drama, hiding, or accusation."],
    ["Refinement Day", "Choose one pattern and practice one concrete correction."],
    ["Creation Day", "Make the inner change visible through useful work, learning, or craft."],
    ["Service Day", "Turn growth outward through aid, repair, protection, or practical care."],
    ["Rest Day", "Let the body recover and separate devotion from exhaustion."],
    ["Council Day", "Review promises, money, records, questions, and shared decisions."],
    ["Renewal Day", "Release what failed, give thanks, and prepare the next cycle of practice."]
  ];

  const THRESHOLDS = [
    ["Unbinding", "Release a burden, debt of speech, false role, or stale resentment before the year can close."],
    ["Silence", "Stop performing the self. Keep vigil, listen, and let the next vow arise without pressure."],
    ["Repair", "Mend one concrete thing: a tool, a room, a promise, a relationship, or a neglected duty."],
    ["Gratitude", "Name the visible and invisible help that made the year's transformation possible."],
    ["Renewal", "Prepare the vow of the next round. Renewal is chosen before celebration begins."],
    ["Mirror Day", "In leap years, this intercalary day belongs to recalibration. Nothing new is demanded; the whole community corrects the measure."]
  ];

  const MOON_GATES = [
    ["Seeded Silence", "Begin privately. A vow may be written, but it should not yet be defended."],
    ["Hidden Ember", "Protect the first warmth of intention from display and argument."],
    ["First Word", "Speak one true sentence to someone worthy of trust."],
    ["Gathering Bowl", "Collect what the work requires: time, tools, attention, and support."],
    ["Clean Floor", "Remove one obstacle from the physical space of practice."],
    ["Study Lamp", "Learn from a teacher, book, elder, failure, or craft."],
    ["Open Hand", "Ask for help without surrendering responsibility."],
    ["First Quarter", "Test the vow against reality and adjust the method."],
    ["Strong Back", "Carry the necessary weight without turning it into a performance."],
    ["True Measure", "Count honestly: days kept, days missed, harm done, progress made."],
    ["Kind Speech", "Repair the tone of communication before expanding the work."],
    ["Shared Table", "Nourish the body and the relationships that sustain discipline."],
    ["High Window", "Look beyond the immediate struggle and remember the wider purpose."],
    ["Bright Edge", "Clarify the difference between devotion and obsession."],
    ["Full Lamp", "Bring a hidden truth into clear view with courage and restraint."],
    ["Blessing Bowl", "Give thanks publicly or privately for what has become visible."],
    ["Softening", "Release the need to control every interpretation of the work."],
    ["Second Listening", "Hear criticism, grief, and silence without rushing to answer."],
    ["Repair Thread", "Reconnect one severed or neglected bond where repair is possible."],
    ["Useful Fire", "Turn intensity toward service instead of conflict."],
    ["Waning Crown", "Step back from attention and let the practice speak through results."],
    ["Last Quarter", "Cut away the method that no longer serves the vow."],
    ["Plain Meal", "Return to enough. Honor simplicity, appetite, and restraint."],
    ["Ash Review", "Study what burned, what survived, and what must not be repeated."],
    ["Quiet Gift", "Offer help without needing recognition."],
    ["Empty Room", "Make space for the next cycle by completing or releasing old tasks."],
    ["Ancestral Breath", "Remember the dead, the absent, and the unfinished work inherited from them."],
    ["Deep Water", "Let emotion move without making it law."],
    ["Closing Breath", "Exhale the month and refuse to carry needless residue forward."],
    ["Dark Gate", "Rest before beginning again. Darkness here is shelter, not failure."]
  ];

  const ELEMENTS = {
    Fire: "quickens courage, purification, and visible action",
    Earth: "steadies care, patience, shelter, and responsibility",
    Iron: "sharpens discernment, discipline, justice, and clean boundaries",
    Water: "deepens mercy, memory, adaptability, and honest feeling",
    Wood: "grows learning, repair, kinship, and long labor"
  };

  const ANIMALS = {
    Horse: "motion, courage, travel, and public momentum",
    Sheep: "care, tenderness, art, and communal gentleness",
    Monkey: "ingenuity, humor, strategy, and flexible intelligence",
    Bird: "message, pattern, ceremony, and watchful precision",
    Dog: "loyalty, protection, service, and moral alarm",
    Pig: "abundance, rest, appetite, and generous completion",
    Mouse: "beginnings, resourcefulness, hidden work, and survival",
    Ox: "labor, patience, weight, and faithful construction",
    Tiger: "risk, guardianship, force, and the refusal to submit to harm",
    Hare: "sensitivity, peace, quick perception, and careful retreat",
    Dragon: "vision, transformation, charisma, and storm-bearing power",
    Snake: "healing, secrecy, shedding, and precise renewal"
  };

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

  function initSupplement() {
    renderEntries("#count-text", COUNTS.map((count) => ({
      title: count.name,
      key: count.key,
      text: count.text
    })));
    renderEntries("#tone-text", TONES.map(([name, text], index) => ({
      title: `${index + 1}. ${name}`,
      key: "Tone",
      text
    })));
    renderEntries("#sign-text", SIGNS.map(([name, text], index) => ({
      title: `${index + 1}. ${name}`,
      key: "Day sign",
      text
    })));
    renderEntries("#house-text", [
      ...HOUSES.map(([name, text], index) => ({
        title: `${index + 1}. ${name}`,
        key: "20-day house",
        text
      })),
      ...THRESHOLDS.map(([name, text], index) => ({
        title: index < 5 ? `Threshold ${index + 1}. ${name}` : name,
        key: index < 5 ? "Closing day" : "Leap correction",
        text
      }))
    ]);
    renderEntries("#moon-text", MOON_GATES.map(([name, text], index) => ({
      title: `Gate ${index + 1}. ${name}`,
      key: "Lunar day",
      text
    })));
    renderYearSigns();
  }

  function renderEntries(selector, entries) {
    const container = document.querySelector(selector);
    if (!container) {
      return;
    }

    container.replaceChildren();
    entries.forEach((entry) => {
      const item = document.createElement("div");
      const title = document.createElement("strong");
      const body = document.createElement("span");
      item.className = "doctrine-entry";
      title.textContent = entry.title;
      body.innerHTML = `<em>${entry.key}.</em> ${entry.text}`;
      item.append(title, body);
      container.append(item);
    });
  }

  function renderYearSigns() {
    const container = document.querySelector("#year-text");
    if (!container) {
      return;
    }

    container.replaceChildren();
    for (let index = 0; index < 60; index += 1) {
      const polarity = YEAR_POLARITIES[index % 2];
      const element = YEAR_ELEMENTS[Math.floor(index / 2) % YEAR_ELEMENTS.length];
      const animal = YEAR_ANIMALS[index % YEAR_ANIMALS.length];
      const item = document.createElement("div");
      const title = document.createElement("strong");
      const body = document.createElement("span");
      const polarityText = polarity === "Dawn"
        ? "Dawn years turn the sign outward into beginning, declaration, and visible motion."
        : "Dusk years turn the sign inward into completion, integration, and careful repair.";

      item.className = "year-sign";
      title.textContent = `${index + 1}. ${polarity} ${element} ${animal}`;
      body.textContent = `${capitalize(ELEMENTS[element])}; ${ANIMALS[animal]}. ${polarityText}`;
      item.append(title, body);
      container.append(item);
    }
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSupplement);
  } else {
    initSupplement();
  }
})();
