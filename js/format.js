(function (global) {
  "use strict";

  var SUFFIXES = [
    "",
    "K",
    "M",
    "B",
    "T",
    "Qa",
    "Qi",
    "Sx",
    "Sp",
    "Oc",
    "No",
    "Dc"
  ];

  /**
   * Idle-game number format.
   * Integers (or 1 decimal if fractional) below 1000.
   * Then 1.2K / 1.5M / 2.3B style.
   */
  function formatNumber(n) {
    if (n == null || !isFinite(n)) n = 0;
    if (n < 0) n = 0;

    var abs = Math.abs(n);

    if (abs < 1000) {
      if (Math.abs(n - Math.round(n)) < 0.05) {
        return String(Math.round(n));
      }
      return n.toFixed(1);
    }

    var exp = Math.floor(Math.log(abs) / Math.log(1000));
    if (exp >= SUFFIXES.length) {
      return n.toExponential(2).replace("e+", "e");
    }

    var val = n / Math.pow(1000, exp);
    var str = val.toFixed(1);
    if (str.charAt(str.length - 2) === "." && str.charAt(str.length - 1) === "0") {
      str = str.slice(0, -2);
    }
    return str + SUFFIXES[exp];
  }

  function formatRate(n) {
    return formatNumber(n) + " / sec";
  }

  global.SoulgatherFormat = {
    formatNumber: formatNumber,
    formatRate: formatRate
  };
})(typeof window !== "undefined" ? window : globalThis);
