if (window.createNotification) {
    console.warn("notifications.js already loaded");
}

const notificationChannel = new BroadcastChannel("nexus_notifications");

if (typeof window.notificationsEnabled === "undefined") {
    window.notificationsEnabled =
        localStorage.getItem("notificationsEnabled") !== "false";
}

window.addEventListener("storage", (e) => {
    if (e.key === "notificationsEnabled") {
        window.notificationsEnabled = e.newValue !== "false";

        const container = document.getElementById("notificationContainer");
        if (container) {
            container.style.display =
                window.notificationsEnabled ? "flex" : "none";
        }
    }
});

window.getNotificationContainer = function () {
    let container = document.getElementById("notificationContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "notificationContainer";

        Object.assign(container.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            display: window.notificationsEnabled ? "flex" : "none",
            flexDirection: "column-reverse",
            gap: "10px",
            zIndex: 9999,
            pointerEvents: "none"
        });

        document.body.appendChild(container);
    }

    return container;
};

window.createNotification = function (
    message,
    duration = 3000,
    _fromOtherTab = false
) {
    if (!window.notificationsEnabled) return;

    const text =
        typeof message === "string"
            ? message
            : message?.text || "Notification";

    const notifDuration =
        typeof message === "object"
            ? message.duration || 3000
            : duration;

    const container = window.getNotificationContainer();

    const notif = document.createElement("div");

    Object.assign(notif.style, {
        background: "rgba(28,28,28,0.9)",
        color: "white",
        padding: "12px 16px",
        borderRadius: "12px",
        border: "1px solid #202020",
        fontFamily: "Montserrat, sans-serif",
        fontSize: "14px",
        minWidth: "150px",
        position: "relative",
        overflow: "hidden",
        opacity: "0",
        transform: "translateX(100%)",
        transition: "transform 0.3s ease, opacity 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        pointerEvents: "auto"
    });

    notif.innerText = text;

    const progress = document.createElement("div");
    Object.assign(progress.style, {
        position: "absolute",
        bottom: "0",
        left: "0",
        height: "4px",
        background: "#ff5e00",
        width: "100%",
        transition: `width ${notifDuration}ms linear`,
        borderRadius: "8px"
    });

    notif.appendChild(progress);
    container.appendChild(notif);

    notif.getBoundingClientRect();

    requestAnimationFrame(() => {
        notif.style.transform = "translateX(0)";
        notif.style.opacity = "1";
        progress.style.width = "0%";
    });

    setTimeout(() => {
        notif.style.transform = "translateX(100%)";
        notif.style.opacity = "0";

        setTimeout(() => notif.remove(), 300);
    }, notifDuration);

    if (!_fromOtherTab) {
        notificationChannel.postMessage({
            text,
            duration: notifDuration,
            _fromOtherTab: true
        });
    }
};

notificationChannel.onmessage = (e) => {
    if (e.data._fromOtherTab) {
        window.createNotification(
            { text: e.data.text, duration: e.data.duration },
            e.data.duration,
            true
        );
    }
};

const originalSetItem = localStorage.setItem;

localStorage.setItem = function (key, value) {
    const oldValue = localStorage.getItem(key);

    originalSetItem.apply(this, arguments);
    
    if (oldValue === value) return;

    if (value === "on" || value === "off") {
        if (window.notificationsEnabled) {
            createNotification(
                `${key.replace(/([A-Z])/g, " $1").toLowerCase()} ${
                    value === "on" ? "enabled" : "disabled"
                }`
            );
        }
    }
};
