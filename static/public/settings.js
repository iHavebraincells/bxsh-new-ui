    let allowInternalNavigation = false;

    document.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (link && link.hostname === window.location.hostname) allowInternalNavigation = true;
    });

    window.navigateInternal = (url) => {
        allowInternalNavigation = true;
        window.location.href = url;
    };

    const antiOn = document.getElementById("antiCloseOn");
    const antiOff = document.getElementById("antiCloseOff");

    function updateAntiClose(state, skipStorage = false) {
        if (!skipStorage) localStorage.setItem("antiClose", state);
            antiOn?.classList.toggle("active", state === "on");
            antiOff?.classList.toggle("active", state === "off");
    }

    window.addEventListener("beforeunload", e => {
        if (localStorage.getItem("antiClose") === "on" && !allowInternalNavigation) {
            e.preventDefault();
            e.returnValue = "";
        }
    });

    window.addEventListener("storage", e => {
        if (e.key === "antiClose") updateAntiClose(e.newValue, true);
    });

    antiOn?.addEventListener("click", () => updateAntiClose("on"));
    antiOff?.addEventListener("click", () => updateAntiClose("off"));

    updateAntiClose(localStorage.getItem("antiClose") || "off", true);


    const canvas = document.getElementById("particles");
    const ctx = canvas ? canvas.getContext("2d") : null;
    
    let animationId = null;
    let particlesEnabled = localStorage.getItem("particles") !== "off";
    let particleColor = localStorage.getItem("particleColor") || "#ffffff";

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const particles = Array.from({length: 80}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        s: Math.random() * 0.6 + 0.2,
        o: Math.random() * 0.5 + 0.3
    }));

    function animateParticles() {
        if (!particlesEnabled) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const currentHex = localStorage.getItem("particleColor") || "#ffffff";

        particles.forEach(p => {
            p.y -= p.s;
            if (p.y < -10) p.y = canvas.height + 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(currentHex, p.o);
            ctx.fill();
        });

        animationId = requestAnimationFrame(animateParticles);
    }

    function setParticles(state) {
        particlesEnabled = state === "on";
        localStorage.setItem("particles", state);
        document.getElementById("particlesOn")?.classList.toggle("active", state === "on");
        document.getElementById("particlesOff")?.classList.toggle("active", state === "off");

        if (particlesEnabled) {
            canvas.style.display = "block";
            if (animationId) cancelAnimationFrame(animationId);
            animateParticles();
        } else {
            canvas.style.display = "none";
            if (animationId) cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    document.getElementById("particlesOn")?.addEventListener("click", () => setParticles("on"));
    document.getElementById("particlesOff")?.addEventListener("click", () => setParticles("off"));
    setParticles(particlesEnabled ? "on" : "off");

    const colorPicker = document.getElementById("particleColorPicker");
    if (colorPicker) {
        colorPicker.value = particleColor;
        colorPicker.addEventListener("input", () => {
            particleColor = colorPicker.value;
            localStorage.setItem("particleColor", particleColor);
            if (particlesEnabled && !animationId) animateParticles();
        });
    }

    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }


    const batteryDisplay = document.getElementById("battery");
    const batteryOn = document.getElementById("batteryOn");
    const batteryOff = document.getElementById("batteryOff");

    function updateBattery(state) {
        if (batteryDisplay) batteryDisplay.style.opacity = state === "on" ? 1 : 0;
        batteryOn?.classList.toggle("active", state === "on");
        batteryOff?.classList.toggle("active", state === "off");
        localStorage.setItem("battery", state);

    }

    batteryOn?.addEventListener("click", () => updateBattery("on"));
    batteryOff?.addEventListener("click", () => updateBattery("off"));

    updateBattery(localStorage.getItem("battery") || "off", true);

    const notificationsOn = document.getElementById("notificationsOn");
    const notificationsOff = document.getElementById("notificationsOff");

    function refreshNotificationButtons() {
        const enabled = localStorage.getItem("notificationsEnabled") !== "false";
        notificationsOn?.classList.toggle("active", enabled);
        notificationsOff?.classList.toggle("active", !enabled);
    }

    notificationsOn?.addEventListener("click", () => {
        localStorage.setItem("notificationsEnabled", "true");
        window.notificationsEnabled = true;

        const container = document.getElementById("notificationContainer");
        if (container) container.style.display = "flex";

        refreshNotificationButtons();

        createNotification("notifications enabled");
    });

    notificationsOff?.addEventListener("click", () => {
        localStorage.setItem("notificationsEnabled", "false");
        window.notificationsEnabled = false;

        const container = document.getElementById("notificationContainer");
        if (container) {
            container.innerHTML = "";
            container.style.display = "none";
        }

        refreshNotificationButtons();
    });

    window.addEventListener("storage", e => {
        if (e.key === "notificationsEnabled") refreshNotificationButtons();
    });

    refreshNotificationButtons();

    const bindBtn = document.getElementById("bindPanicKey");
    const panicLabel = document.getElementById("panicLabel");
    const panicSite = document.getElementById("panicSite");
    const customInput = document.getElementById("customPanicURL");
    let binding = false;
    let ignoreNext = null;

    panicLabel.textContent = `panic key: ${localStorage.getItem("panicKey") || "none"}`;

    function normalizeURL(url) {
        if (!url) return "";
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;
        return url;
    }

    panicSite?.addEventListener("change", () => {
        localStorage.setItem("panicSite", panicSite.value);
        customInput.style.display = panicSite.value === "__custom__" ? "block" : "none";
    });

    customInput?.addEventListener("input", () => {
        localStorage.setItem("panicCustomURL", normalizeURL(customInput.value.trim()));
    });

    bindBtn?.addEventListener("click", () => {
        binding = true;
        bindBtn.textContent = "press a key...";
    });

    document.addEventListener("keydown", e => {
        if (binding) {
            e.preventDefault();
            const key = e.key.toUpperCase();
            ignoreNext = key;
            localStorage.setItem("panicKey", key);
            panicLabel.textContent = `panic key: ${key}`;
            bindBtn.textContent = "bind key";
            binding = false;
            createNotification(`successfully binded to ${key}`);
            return;
        }

        const panicKey = localStorage.getItem("panicKey");
        if (!panicKey || e.key.toUpperCase() !== panicKey) return;
        if (ignoreNext === e.key.toUpperCase()) { ignoreNext = null; return; }

        const site = localStorage.getItem("panicSite");
        if (site === "__custom__") {
            const url = normalizeURL(localStorage.getItem("panicCustomURL"));
            if (url) window.location.replace(url);
        } else if (site) window.location.replace(site);
    });

    window.addEventListener("storage", e => {
        if (["panicKey", "panicSite", "panicCustomURL"].includes(e.key)) {
            panicLabel.textContent = `panic key: ${localStorage.getItem("panicKey") || "none"}`;
        }
    });

    const cloakSelect = document.getElementById("cloak");
    const customTitleInput = document.getElementById("customcloaktitle");
    const customFaviconInput = document.getElementById("customcloakfavicon");

    const cloaks = {
        none: { title: "vertex", favicon: "/images/favicon.ico" },
        mykaty: { title: "MyKaty", favicon: "https://clouddrivecdn.classlink.com/favicons/1145/icon/favicon.ico?1768682671181" },
        google: { title: "Google", favicon: "https://www.google.com/favicon.ico" },
        "google drive": { title: "Home - Google Drive", favicon: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png" },
        wayground: { title: "Wayground", favicon: "https://wayground.com/favicon.ico" },
        aware: { title: "Student", favicon: "https://static.schoolobjects.com/images/favicon-32x32.png" },
        "microsoft 365": { title: "Apps | M365 Copilot", favicon: "https://res.cdn.office.net/officehub/images/content/images/favicon_copilot-4370172aa6.ico" },
        kahoot: { title: "Kahoot!", favicon: "https://kahoot.it/favicon.ico" },
        gimkit: { title: "Gimkit", favicon: "https://www.gimkit.com/favicon.png" },
        blooket: { title: "Blooket", favicon: "https://www.blooket.com/favicon.ico" }
    };

    function setFavicon(url) {
        let link = document.querySelector("link[rel='icon']");
        if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
        link.href = url;
    }

    function applyCloak(val = localStorage.getItem("cloak") || "none") {
        if (val === "custom") {
            const title = localStorage.getItem("customCloakTitle");
            const favicon = localStorage.getItem("customCloakFavicon");
            if (title) document.title = title;
            if (favicon) setFavicon(favicon);
        } else {
            const cloak = cloaks[val];
            if (!cloak) return;
            document.title = cloak.title;
            setFavicon(cloak.favicon);
        }
    }

    cloakSelect?.addEventListener("change", () => {
        const val = cloakSelect.value;
        localStorage.setItem("cloak", val);
        customTitleInput.style.display = val === "custom" ? "block" : "none";
        customFaviconInput.style.display = val === "custom" ? "block" : "none";
        applyCloak(val);
    });

    customTitleInput?.addEventListener("input", () => {
        localStorage.setItem("customCloakTitle", customTitleInput.value);
        document.title = customTitleInput.value;
    });

    customFaviconInput?.addEventListener("input", () => {
        localStorage.setItem("customCloakFavicon", customFaviconInput.value);
        setFavicon(customFaviconInput.value);
    });

    window.addEventListener("storage", e => {
        if (["cloak", "customCloakTitle", "customCloakFavicon"].includes(e.key)) applyCloak();
    });

    applyCloak();
    if (cloakSelect) cloakSelect.value = localStorage.getItem("cloak");


    const slider = document.getElementById("noiseSlider");
    const thumb = document.getElementById("noiseThumb");
    const valueLabel = document.getElementById("noiseValue");
    const noiseOverlay = document.querySelector(".skibidi");
    let noiseStrength = Number(localStorage.getItem("noiseStrength")) || 0;

    function applyNoise(val) {
        val = Math.max(0, Math.min(100, val));

        noiseStrength = Math.round(val);

        if (noiseOverlay) {
            noiseOverlay.style.opacity = (noiseStrength / 100).toFixed(2);
        }

        localStorage.setItem("noiseStrength", noiseStrength);
    }

    function setSlider(val) {
        val = Math.max(0, Math.min(100, val));
        noiseStrength = Math.round(val);

        if (thumb) thumb.style.left = `${noiseStrength}%`;
        if (valueLabel) valueLabel.textContent = `${noiseStrength}%`;

        applyNoise(noiseStrength);
    }
    setSlider(noiseStrength);

    function handlePointer(e) {
        const rect = slider.getBoundingClientRect();
        let percent = ((e.clientX - rect.left) / rect.width) * 100;
        setSlider(Math.round(percent));
    }

    slider.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        slider.setPointerCapture(e.pointerId);
        handlePointer(e);
    });

    slider.addEventListener("pointermove", (e) => {
        if (slider.hasPointerCapture(e.pointerId)) handlePointer(e);
    });

    slider.addEventListener("pointerup", (e) => slider.releasePointerCapture(e.pointerId));

    let dragging = false;
    thumb.addEventListener("mouseenter", () => thumb.classList.add("hovered"));
    thumb.addEventListener("mouseleave", () => { if (!dragging) thumb.classList.remove("hovered"); });
    thumb.addEventListener("pointerdown", () => { dragging = true; thumb.classList.add("hovered"); });
    document.addEventListener("pointerup", () => { dragging = false; thumb.classList.remove("hovered"); });

    const blankCloakBtn = document.getElementById("blankCloak");
    blankCloakBtn?.addEventListener("click", () => {
        const newWin = window.open("", "_blank");
        if (!newWin) return;
        newWin.document.write(`
            <html>
            <head>
                <title>vertex</title>
                <style>
                    html, body { margin:0; padding:0; overflow:hidden; height:100%; }
                    iframe { border:none; width:100%; height:100%; }
                </style>
            </head>
            <body>
                <iframe src="${window.location.href}"></iframe>
            </body>
            </html>
        `);
        newWin.document.close();
    });

// sync across tabs
window.addEventListener("storage", e => {
    if (e.key === "debugMode") {
        setDebug(e.newValue, true);
    }
});
