(function (global) {
  "use strict";

  /**
   * Mantissa + exponent: value = m × 10^e, 1 ≤ |m| < 10 (or m = 0, e = 0).
   * Idle-safe arithmetic so costs and stocks never become Infinity/NaN.
   */

  function make(m, e) {
    return normalize(m, e);
  }

  function normalize(m, e) {
    m = Number(m);
    e = Number(e);
    if (!isFinite(e)) e = 0;
    if (m === 0 || !isFinite(m)) {
      if (m === 0) return { m: 0, e: 0 };
      return { m: m, e: 0 };
    }
    e = Math.floor(e);
    var sign = m < 0 ? -1 : 1;
    m = Math.abs(m);
    var adj;
    if (m >= 10 || m < 1) {
      adj = Math.floor(Math.log(m) / Math.LN10);
      if (!isFinite(adj)) {
        return { m: sign * m, e: 0 };
      }
      m = m / Math.pow(10, adj);
      e += adj;
    }
    if (m >= 10) {
      m /= 10;
      e += 1;
    }
    if (m < 1 && m > 0) {
      m *= 10;
      e -= 1;
    }
    if (m === 0 || !isFinite(m)) {
      if (m === 0) return { m: 0, e: 0 };
      return { m: sign * m, e: 0 };
    }
    return { m: sign * m, e: e };
  }

  function fromNumber(n) {
    n = Number(n);
    if (n === 0 || !isFinite(n)) {
      if (n === 0) return { m: 0, e: 0 };
      return { m: n, e: 0 };
    }
    return normalize(n, 0);
  }

  function fromString(s) {
    s = String(s).trim();
    if (!s) return fromNumber(0);
    var match = /^([+-]?(?:\d+\.?\d*|\.\d+))(?:e([+-]?\d+))?$/i.exec(s);
    if (!match) {
      var asN = Number(s);
      return fromNumber(asN);
    }
    var mant = Number(match[1]);
    var exp = match[2] != null ? parseInt(match[2], 10) : 0;
    if (!isFinite(mant)) return fromNumber(mant);
    if (!isFinite(exp)) exp = 0;
    return normalize(mant, exp);
  }

  function from(v) {
    if (v == null) return fromNumber(0);
    if (typeof v === "number") return fromNumber(v);
    if (typeof v === "string") return fromString(v);
    if (typeof v === "object") {
      if (typeof v.m === "number") return normalize(v.m, v.e || 0);
    }
    return fromNumber(Number(v) || 0);
  }

  function clone(a) {
    a = from(a);
    return { m: a.m, e: a.e };
  }

  function isZero(a) {
    a = from(a);
    return a.m === 0;
  }

  function numIsFinite(a) {
    a = from(a);
    return isFinite(a.m) && isFinite(a.e);
  }

  function toNumber(a) {
    a = from(a);
    if (!numIsFinite(a)) return a.m;
    if (a.m === 0) return 0;
    if (a.e > 308) return a.m > 0 ? Infinity : -Infinity;
    if (a.e < -324) return 0;
    var n = a.m * Math.pow(10, a.e);
    if (!isFinite(n)) return a.m > 0 ? Infinity : -Infinity;
    return n;
  }

  function add(a, b) {
    a = from(a);
    b = from(b);
    if (!numIsFinite(a) || !numIsFinite(b)) {
      return fromNumber(toNumber(a) + toNumber(b));
    }
    if (isZero(a)) return clone(b);
    if (isZero(b)) return clone(a);
    if (a.e < b.e) {
      var t = a;
      a = b;
      b = t;
    }
    var de = a.e - b.e;
    if (de > 16) return clone(a);
    var bm = b.m / Math.pow(10, de);
    return normalize(a.m + bm, a.e);
  }

  function sub(a, b) {
    b = from(b);
    return add(a, { m: -b.m, e: b.e });
  }

  function mul(a, b) {
    a = from(a);
    b = from(b);
    if (!numIsFinite(a) || !numIsFinite(b)) {
      return fromNumber(toNumber(a) * toNumber(b));
    }
    if (isZero(a) || isZero(b)) return { m: 0, e: 0 };
    return normalize(a.m * b.m, a.e + b.e);
  }

  function div(a, b) {
    a = from(a);
    b = from(b);
    if (isZero(b)) {
      if (isZero(a)) return { m: NaN, e: 0 };
      return { m: a.m >= 0 ? Infinity : -Infinity, e: 0 };
    }
    if (isZero(a)) return { m: 0, e: 0 };
    if (!numIsFinite(a) || !numIsFinite(b)) {
      return fromNumber(toNumber(a) / toNumber(b));
    }
    return normalize(a.m / b.m, a.e - b.e);
  }

  function cmp(a, b) {
    a = from(a);
    b = from(b);
    if (a.m === 0 && b.m === 0) return 0;
    if (!numIsFinite(a) || !numIsFinite(b)) {
      var na = toNumber(a);
      var nb = toNumber(b);
      if (na > nb) return 1;
      if (na < nb) return -1;
      return 0;
    }
    if (a.m < 0 && b.m >= 0) return -1;
    if (a.m >= 0 && b.m < 0) return 1;
    if (a.m === 0) return b.m > 0 ? -1 : 1;
    if (b.m === 0) return a.m > 0 ? 1 : -1;
    var sign = a.m > 0 ? 1 : -1;
    if (a.e !== b.e) return (a.e > b.e ? 1 : -1) * sign;
    if (a.m === b.m) return 0;
    return a.m > b.m ? sign : -sign;
  }

  function max(a, b) {
    return cmp(a, b) >= 0 ? from(a) : from(b);
  }

  function min(a, b) {
    return cmp(a, b) <= 0 ? from(a) : from(b);
  }

  function floor(a) {
    a = from(a);
    if (!numIsFinite(a)) return clone(a);
    if (isZero(a)) return { m: 0, e: 0 };
    if (a.e < 0) {
      if (a.m >= 0) return { m: 0, e: 0 };
      return fromNumber(-1);
    }
    if (a.e >= 15) return clone(a);
    return fromNumber(Math.floor(toNumber(a)));
  }

  function intPow(base, n) {
    var result = fromNumber(1);
    var b = clone(base);
    var k = n;
    while (k > 0) {
      if (k % 2 === 1) result = mul(result, b);
      b = mul(b, b);
      k = Math.floor(k / 2);
    }
    return result;
  }

  function pow(base, exp) {
    base = from(base);
    if (exp && typeof exp === "object" && typeof exp.m === "number") {
      exp = toNumber(exp);
    }
    exp = Number(exp);
    if (!isFinite(exp)) return { m: NaN, e: 0 };
    if (exp === 0) return fromNumber(1);
    if (isZero(base)) {
      if (exp > 0) return { m: 0, e: 0 };
      return { m: Infinity, e: 0 };
    }
    var integer = Math.floor(exp) === exp;
    if (numIsFinite(base) && base.e < 15 && Math.abs(exp) < 100) {
      var bn = toNumber(base);
      if (isFinite(bn) && bn >= 0) {
        var pn = Math.pow(bn, exp);
        if (isFinite(pn)) return fromNumber(pn);
      }
    }
    if (integer && exp > 0 && exp < 48 && numIsFinite(base) && base.e < 8) {
      return intPow(base, exp);
    }
    if (base.m < 0 && !integer) return { m: NaN, e: 0 };
    var log10 = exp * (Math.log(Math.abs(base.m)) / Math.LN10 + base.e);
    if (!isFinite(log10)) {
      if (log10 === Infinity) return { m: base.m < 0 && integer && Math.abs(exp) % 2 === 1 ? -Infinity : Infinity, e: 0 };
      if (log10 === -Infinity) return { m: 0, e: 0 };
      return { m: NaN, e: 0 };
    }
    var e = Math.floor(log10);
    var frac = log10 - e;
    var m = Math.pow(10, frac);
    if (base.m < 0 && integer && Math.abs(exp) % 2 === 1) m = -m;
    return normalize(m, e);
  }

  function ownedFloor(owned) {
    var n = floor(from(owned));
    if (cmp(n, 0) < 0) return 0;
    if (n.e > 12) return n;
    return Math.max(0, Math.floor(toNumber(n) || 0));
  }

  function cost(base, mult, owned) {
    base = Number(base);
    mult = Number(mult);
    if (!isFinite(base) || base < 0) base = 0;
    if (!isFinite(mult) || mult <= 0) mult = 1;
    var nRaw = ownedFloor(owned);
    var n;
    if (typeof nRaw === "object") {
      var log10n = add(fromNumber(Math.log(base || 1) / Math.LN10), mul(nRaw, fromNumber(Math.log(mult) / Math.LN10)));
      return floor(pow(fromNumber(10), toNumber(log10n)));
    }
    n = nRaw;
    if (n === 0) return fromNumber(Math.floor(base));
    var log10 = Math.log(base || 1) / Math.LN10 + n * (Math.log(mult) / Math.LN10);
    if (isFinite(log10) && log10 < 15) {
      return fromNumber(Math.floor(base * Math.pow(mult, n)));
    }
    if (isFinite(log10) && log10 < 308) {
      var v = base * Math.pow(mult, n);
      if (isFinite(v)) return fromNumber(Math.floor(v));
    }
    return floor(mul(fromNumber(base), pow(fromNumber(mult), n)));
  }

  function dump(a) {
    a = from(a);
    return { m: a.m, e: a.e };
  }

  function load(v) {
    if (v == null) return fromNumber(0);
    if (typeof v === "number") return fromNumber(v);
    if (typeof v === "string") return fromString(v);
    if (typeof v === "object" && typeof v.m === "number") return normalize(v.m, v.e || 0);
    return fromNumber(Number(v) || 0);
  }

  global.SoulgatherNum = {
    fromNumber: fromNumber,
    fromString: fromString,
    from: from,
    toNumber: toNumber,
    add: add,
    sub: sub,
    mul: mul,
    div: div,
    pow: pow,
    cmp: cmp,
    max: max,
    min: min,
    floor: floor,
    isFinite: numIsFinite,
    isZero: isZero,
    clone: clone,
    cost: cost,
    dump: dump,
    load: load,
    make: make
  };
})(typeof window !== "undefined" ? window : globalThis);
