const fs = require("fs");
const { JSDOM, VirtualConsole } = require("jsdom");
const path = require("node:path");
const BUNDLE = path.join(__dirname, "..", "dist-smoke", "app.iife.js");
if (!fs.existsSync(BUNDLE)) {
  console.error("Build the smoke bundle first:  npm run build:smoke");
  process.exit(1);
}
const code = fs.readFileSync(BUNDLE, "utf8");

function boot(route) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => errors.push("jsdomError: " + (e.stack || e.message)));
  vc.on("error", (...a) => errors.push("console.error: " + a.join(" ").slice(0, 300)));
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    runScripts: "dangerously", url: "https://local" + route, pretendToBeVisual: true, virtualConsole: vc,
  });
  const w = dom.window;
  w.matchMedia = (q) => ({ matches: false, media: q, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
  w.scrollTo = () => {};
  w.Element.prototype.scrollIntoView = function () {};
  Object.defineProperty(w.navigator, "clipboard", { value: { writeText: async () => {} }, configurable: true });
  const s = w.document.createElement("script");
  s.textContent = code;
  w.document.body.appendChild(s);
  return { w, errors };
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const byText = (w, sel, text) => [...w.document.querySelectorAll(sel)].find((n) => n.textContent.trim().includes(text));
const setInput = (w, el, value) => {
  const proto = el.tagName === "TEXTAREA" ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
  el.dispatchEvent(new w.Event("input", { bubbles: true }));
};

let failures = 0;
function check(name, ok, detail) {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail && !ok ? "\n      " + detail : ""}`);
}

(async () => {
  // 1. Run a report-style generator tool end to end
  {
    const { w, errors } = boot("/app/grow/visibility");
    await wait(600);
    const inputs = w.document.querySelectorAll("input.field, textarea.field");
    setInput(w, inputs[0], "catzoralabs.com");
    setInput(w, inputs[1], "ai content tools");
    await wait(100);
    byText(w, "button", "Check AI visibility").click();
    await wait(3200);
    const text = w.document.getElementById("root").textContent;
    check("report tool produces a result", text.includes("Prompt-by-prompt result"), text.slice(0, 200));
    check("report tool throws no errors", errors.length === 0, errors[0]);
    check("result actions appear", !!byText(w, "button", "Save draft"));
    w.close();
  }

  // 2. Chatbot answers and escalates
  {
    const { w, errors } = boot("/app/support/chatbot");
    await wait(600);
    const chip = byText(w, "button", "I was charged twice");
    chip.click();
    await wait(1400);
    const text = w.document.getElementById("root").textContent;
    check("chatbot answers from the knowledge base", text.includes("original payment method"), text.slice(-200));
    check("chatbot throws no errors", errors.length === 0, errors[0]);
    w.close();
  }

  // 3. Ticket triage classifies
  {
    const { w, errors } = boot("/app/support/triage");
    await wait(600);
    byText(w, "button", "Classify inbox").click();
    await wait(2600);
    const text = w.document.getElementById("root").textContent;
    check("triage classifies tickets", text.includes("Churn risk") && text.includes("Billing"), text.slice(0, 200));
    check("triage throws no errors", errors.length === 0, errors[0]);
    w.close();
  }

  // 4. Workflow builder adds a step
  {
    const { w, errors } = boot("/app/automate/workflows");
    await wait(600);
    const input = [...w.document.querySelectorAll("input.field")].find((i) => i.placeholder?.includes("What happens"));
    setInput(w, input, "Send a summary to finance");
    await wait(100);
    byText(w, "button", "Add").click();
    await wait(400);
    const text = w.document.getElementById("root").textContent;
    check("workflow builder adds a step", text.includes("Send a summary to finance"), text.slice(0, 200));
    check("workflow builder throws no errors", errors.length === 0, errors[0]);
    w.close();
  }

  // 5. ATS board moves a candidate
  {
    const { w, errors } = boot("/app/hire/ats");
    await wait(600);
    const fwd = w.document.querySelector('button[aria-label^="Move"][aria-label$="forward a stage"]');
    check("ATS renders stage controls", !!fwd);
    if (fwd) { fwd.click(); await wait(300); }
    check("ATS throws no errors", errors.length === 0, errors[0]);
    w.close();
  }

  // 6. AI Writing produces three editable variants
  {
    const { w, errors } = boot("/app/create/writing");
    await wait(600);
    setInput(w, w.document.getElementById("w-topic"), "Diwali offer with zero processing fee");
    await wait(100);
    byText(w, "button", "Write it").click();
    await wait(2600);
    const text = w.document.getElementById("root").textContent;
    check("writing produces variants", text.includes("A — the benefit") && text.includes("C — the proof"), text.slice(0, 200));
    check("writing throws no errors", errors.length === 0, errors[0]);
    w.close();
  }

  // 7. Design Studio suggests headlines and saves to the gallery
  {
    const { w, errors } = boot("/app/create/design");
    await wait(600);
    byText(w, "button", "Save").click();
    await wait(300);
    const text = w.document.getElementById("root").textContent;
    check("design saves to gallery", text.includes("2 saved"), text.slice(0, 300));
    check("design throws no errors", errors.length === 0, errors[0]);
    w.close();
  }

  // 8. SEO audit runs, opens a finding and re-scores when resolved
  {
    const { w, errors } = boot("/app/grow/seo");
    await wait(600);
    setInput(w, w.document.getElementById("seo-url"), "example.com");
    await wait(100);
    byText(w, "button", "Start audit").click();
    await wait(4600);
    let text = w.document.getElementById("root").textContent;
    check("audit produces findings", text.includes("Health score") && text.includes("Missing page title"), text.slice(0, 200));
    byText(w, "button", "Missing page title").click();
    await wait(200);
    byText(w, "button", "Mark as resolved").click();
    await wait(300);
    text = w.document.getElementById("root").textContent;
    check("resolving an issue is reflected", text.includes("1 resolved"), text.slice(0, 300));
    check("audit throws no errors", errors.length === 0, errors[0]);
    w.close();
  }

  // 9. Social post is generated and scheduled
  {
    const { w, errors } = boot("/app/grow/social");
    await wait(600);
    setInput(w, w.document.getElementById("s-topic"), "hiring faster with small teams");
    await wait(100);
    byText(w, "button", "Generate post").click();
    await wait(2000);
    byText(w, "button", "Schedule").click();
    await wait(300);
    const tab = byText(w, "button", "All posts");
    tab.click();
    await wait(200);
    const text = w.document.getElementById("root").textContent;
    check("scheduled post appears in the list", text.includes("5 of 5"), text.slice(0, 400));
    check("social throws no errors", errors.length === 0, errors[0]);
    w.close();
  }

  // 10. Blog ideas go into the pipeline
  {
    const { w, errors } = boot("/app/grow/blog");
    await wait(600);
    setInput(w, w.document.getElementById("b-topic"), "personal loans");
    await wait(100);
    byText(w, "button", "Get topic ideas").click();
    await wait(1600);
    byText(w, "button", "Add to calendar").click();
    await wait(300);
    const text = w.document.getElementById("root").textContent;
    check("blog idea joins the pipeline", text.includes("beginner's guide to personal loans"), text.slice(0, 300));
    check("blog throws no errors", errors.length === 0, errors[0]);
    w.close();
  }

  // 11. A new job is created with a generated description
  {
    const { w, errors } = boot("/app/hire/jobs");
    await wait(600);
    byText(w, "button", "New job").click();
    await wait(200);
    setInput(w, w.document.getElementById("j-title"), "Frontend Engineer");
    setInput(w, w.document.getElementById("j-loc"), "Pune");
    await wait(100);
    byText(w, "button", "Generate description").click();
    await wait(1400);
    byText(w, "button", "Create job").click();
    await wait(300);
    const text = w.document.getElementById("root").textContent;
    check("new job appears", text.includes("Frontend Engineer"), text.slice(0, 300));
    check("jobs throws no errors", errors.length === 0, errors[0]);
    w.close();
  }

  // 12. A demo AI interview session takes an answer
  {
    const { w, errors } = boot("/app/hire/interviews");
    await wait(600);
    byText(w, "button", "Try demo session").click();
    await wait(200);
    setInput(w, w.document.getElementById("iv-answer"), "I moved our webhooks to a queue and added idempotency keys so retries were safe.");
    await wait(100);
    w.document.querySelector('button[aria-label="Send answer"]').click();
    await wait(1000);
    const text = w.document.body.textContent;
    check("interviewer replies", text.includes("Next question"), text.slice(-300));
    check("interviews throw no errors", errors.length === 0, errors[0]);
    w.close();
  }

  console.log(failures ? `\n${failures} check(s) failed` : "\nall interaction checks passed");
  process.exit(failures ? 1 : 0);
})();
