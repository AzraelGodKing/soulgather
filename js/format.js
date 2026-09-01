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

  function isNumObj(n) {
    return n && typeof n === "object" && typeof n.m === "number" && typeof n.e === "number";
  }

  function trimFixed1(val) {
    var str = val.toFixed(1);
    if (str.charAt(str.length - 2) === "." && str.charAt(str.length - 1) === "0") {
      str = str.slice(0, -2);
    }
    return str;
  }

  function scientificFromME(m, e) {
    var abs = Math.abs(m);
    var sign = m < 0 ? "-" : "";
    if (!isFinite(abs) || abs === 0) return "0";
    var str = abs.toFixed(1);
    if (str.charAt(str.length - 2) === "." && str.charAt(str.length - 1) === "0") {
      str = str.slice(0, -2);
    }
    return sign + str + "e" + e;
  }

  /**
   * Format a SoulgatherNum {m,e} with the same K/M/B/T… suffixes, then 1.2e34.
   */
  function formatFromNum(num) {
    if (!isNumObj(num)) return formatNumber(num);
    var m = num.m;
    var e = num.e;
    if (!isFinite(m) || !isFinite(e)) return "0";
    if (m === 0) return "0";
    if (m < 0) m = 0;
    var log10 = Math.log(m) / Math.LN10 + e;
    if (!isFinite(log10)) return scientificFromME(m, e);
    if (log10 < 3) {
      var small = m * Math.pow(10, e);
      return formatNumber(small);
    }
    if (e >= 34 || log10 >= 36) {
      return scientificFromME(m, e);
    }
    var exp = Math.floor(log10 / 3);
    if (exp >= SUFFIXES.length) {
      return scientificFromME(m, e);
    }
    var val = m * Math.pow(10, e - 3 * exp);
    return trimFixed1(val) + SUFFIXES[exp];
  }

  /**
   * Idle-game number format.
   * Integers (or 1 decimal if fractional) below 1000.
   * Then 1.2K / 1.5M / 2.3B style.
   */
  function formatNumber(n) {
    if (isNumObj(n)) return formatFromNum(n);
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
    formatRate: formatRate,
    formatFromNum: formatFromNum
  };
})(typeof window !== "undefined" ? window : globalThis);
