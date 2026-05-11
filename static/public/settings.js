// =========================
// SETTINGS STORAGE CORE
// =========================

const Settings = {
  get(key, fallback) {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// =========================
// DEFAULT SETTINGS
// =========================

if (localStorage.getItem("init_settings") !== "true") {
  Settings.set("particles", true);
  Settings.set("particleColor", "#ffffff");
  Settings.set("notifications", true);
  Settings.set("cloak", "none");
  Settings.set("panicURL", "https://google.com");
  Settings.set("panicKey", "Escape");
  localStorage.setItem("init_settings", "true");
}

// =========================
// PARTICLES CONTROL
// =========================

function applyParticles() {
  const enabled = Settings.get("particles", true);

  const canvas = document.getElementById("particles-js");

  if (!enabled) {
    if (canvas) canvas.style.display = "none";
    return;
  }

  if (canvas) canvas.style.display = "block";
}

// =========================
// TAB CLOAK
// =========================

function applyCloak() {
  const mode = Settings.get("cloak", "none");

  const data = {
    none: { title: "bxsh", icon: "/images/logo.gif" },
    google: { title: "Google", icon: "https://www.google.com/favicon.ico" },
    drive: { title: "Google Drive", icon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png" }
  };

  const selected = data[mode];
  if (!selected) return;

  document.title = selected.title;

  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.href = selected.icon;
}

// =========================
// PANIC KEY
// =========================

document.addEventListener("keydown", (e) => {
  const key = Settings.get("panicKey", "Escape");
  const url = Settings.get("panicURL", "https://google.com");

  if (e.key === key) {
    window.location.href = url;
  }
});

// =========================
// APPLY ON LOAD
// =========================

window.addEventListener("DOMContentLoaded", () => {
  applyParticles();
  applyCloak();
});
