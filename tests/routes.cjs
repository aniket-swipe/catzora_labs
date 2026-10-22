const fs = require("fs");
const { JSDOM, VirtualConsole } = require("jsdom");
const path = require("node:path");
const BUNDLE = path.join(__dirname, "..", "dist-smoke", "app.iife.js");
if (!fs.existsSync(BUNDLE)) {
  console.error("Build the smoke bundle first:  npm run build:smoke");
  process.exit(1);
}
const code = fs.readFileSync(BUNDLE, "utf8");

const routes = require("./routes.list.cjs");
let failures = 0;

function run(route) {
  return new Promise((resolve) => {
    const errors = [];
    const vc = new VirtualConsole();
    vc.on("jsdomError", (e) => errors.push("jsdomError: " + (e.stack || e.message)));
    vc.on("error", (...a) => errors.push("console.error: " + a.join(" ").slice(0, 400)));

    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
      runScripts: "dangerously",
      url: "https://local" + route,
      pretendToBeVisual: true,
      virtualConsole: vc,
    });
    const w = dom.window;
    w.matchMedia = (q) => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
    w.scrollTo = () => {};
    w.Element.prototype.scrollIntoView = function () {};

    const s = w.document.createElement("script");
    s.textContent = code;
    try { w.document.body.appendChild(s); } catch (e) { errors.push("throw: " + e.stack); }

    setTimeout(() => {
      const text = (w.document.getElementById("root").textContent || "").replace(/\s+/g, " ").trim();
      const ok = errors.length === 0 && text.length > 40;
      if (!ok) failures++;
      console.log(`${ok ? "PASS" : "FAIL"}  ${route}  (${text.length} chars)`);
      if (errors.length) console.log("      " + errors.slice(0, 2).join("\n      "));
      else if (text.length <= 40) console.log("      rendered: " + text);
      w.close();
      resolve();
    }, 900);
  });
}

(async () => {
  for (const r of routes) await run(r);
  console.log(failures ? `\n${failures} route(s) failed` : `\nall ${routes.length} routes passed`);
  process.exit(failures ? 1 : 0);
})();
