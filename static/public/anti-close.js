// anti-close.js

(function () {
  let warnEnabled = true;

  window.enableAntiClose = function () {
    warnEnabled = true;
  };

  window.disableAntiClose = function () {
    warnEnabled = false;
  };

  window.addEventListener("beforeunload", function (e) {
    if (!warnEnabled) return;

    e.preventDefault();
    e.returnValue = "";
  });
})();
