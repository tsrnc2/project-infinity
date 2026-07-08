(() => {
  "use strict";

  const form = document.querySelector("#donation-form");
  const status = document.querySelector("#pledge-status");
  const emailLink = document.querySelector("#donation-email-link");

  if (!form || !status || !emailLink) {
    return;
  }

  const fields = {
    name: document.querySelector("#donor-name"),
    email: document.querySelector("#donor-email"),
    type: document.querySelector("#gift-type"),
    amount: document.querySelector("#gift-amount"),
    note: document.querySelector("#gift-note")
  };

  loadSavedPledge();
  syncEmailLink();

  Object.values(fields).forEach((field) => {
    field.addEventListener("input", syncEmailLink);
    field.addEventListener("change", syncEmailLink);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const pledge = readPledge();

    try {
      localStorage.setItem("transformation-donation-pledge", JSON.stringify({
        ...pledge,
        savedAt: new Date().toISOString()
      }));
      status.textContent = "Pledge saved in this browser.";
    } catch (error) {
      status.textContent = "Pledge prepared. Browser storage is unavailable.";
    }

    syncEmailLink();
  });

  function readPledge() {
    return {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      type: fields.type.value,
      amount: fields.amount.value.trim(),
      note: fields.note.value.trim()
    };
  }

  function loadSavedPledge() {
    try {
      const saved = localStorage.getItem("transformation-donation-pledge");
      if (!saved) {
        return;
      }
      const pledge = JSON.parse(saved);
      fields.name.value = pledge.name || "";
      fields.email.value = pledge.email || "";
      fields.type.value = pledge.type || fields.type.value;
      fields.amount.value = pledge.amount || "";
      fields.note.value = pledge.note || "";
    } catch (error) {
      // Ignore invalid local storage data.
    }
  }

  function syncEmailLink() {
    const pledge = readPledge();
    const subject = encodeURIComponent("Donation Pledge");
    const body = encodeURIComponent([
      `Name: ${pledge.name}`,
      `Email: ${pledge.email}`,
      `Gift type: ${pledge.type}`,
      `Amount or contribution: ${pledge.amount}`,
      "",
      "Note:",
      pledge.note
    ].join("\n"));
    emailLink.href = `mailto:founding-circle@example.com?subject=${subject}&body=${body}`;
  }
})();
