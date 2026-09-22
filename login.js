(() => {
  "use strict";

  const form = document.querySelector("#login-form");
  const status = document.querySelector("#login-status");
  const gate = document.querySelector("#https-gate");
  const submit = document.querySelector("#login-submit");

  if (!form || !status || !gate || !submit) {
    return;
  }

  const endpoint = form.dataset.loginEndpoint || "";
  const redirectTarget = form.dataset.loginRedirect || "index.html#members";
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const hasSecureTransport = window.location.protocol === "https:" || isLocalhost;

  if (window.location.protocol === "http:" && !isLocalhost) {
    const secureUrl = `https://${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`;
    gate.textContent = "Redirecting to HTTPS before login.";
    disableLogin("Login requires HTTPS. Redirecting to the secure page.");
    window.location.replace(secureUrl);
    return;
  }

  if (!hasSecureTransport) {
    disableLogin("Login is disabled until this page is served over HTTPS.");
  } else if (!endpoint) {
    disableLogin("Login is HTTPS-ready but disabled until data-login-endpoint is configured.");
  } else {
    gate.textContent = "Secure transport detected. Login endpoint is configured.";
    gate.classList.add("is-secure");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!hasSecureTransport) {
      status.textContent = "Use HTTPS before submitting login credentials.";
      return;
    }

    if (!endpoint) {
      status.textContent = "Set data-login-endpoint to a secure backend before enabling login.";
      return;
    }

    const payload = {
      email: document.querySelector("#login-email").value.trim(),
      password: document.querySelector("#login-password").value,
      rememberDevice: document.querySelector("#remember-device").checked
    };

    if (!payload.email || !payload.password) {
      status.textContent = "Email and password are required.";
      return;
    }

    submit.disabled = true;
    submit.textContent = "Logging in...";
    status.textContent = "Checking credentials...";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Login failed with status ${response.status}`);
      }

      const result = await response.json().catch(() => ({}));
      status.textContent = "Login successful. Opening member area.";
      window.location.assign(result.redirectUrl || redirectTarget);
    } catch (error) {
      status.textContent = "Login failed. Check your credentials or the login endpoint.";
    } finally {
      submit.disabled = false;
      submit.textContent = "Login";
    }
  });

  function disableLogin(message) {
    gate.textContent = message;
    gate.classList.remove("is-secure");
    submit.disabled = true;
  }
})();
