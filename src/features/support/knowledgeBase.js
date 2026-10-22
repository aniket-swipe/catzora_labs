/** The chatbot answers only from this list. Anything it cannot match is escalated. */
export const knowledgeBase = [
  {
    keywords: ["refund", "money back", "cancel payment", "charged twice", "double"],
    answer:
      "Refunds go back to the original payment method within 5–7 working days. If the charge was a duplicate, we refund the extra one in full with no deduction. Share the transaction ID and I'll raise it right away.",
  },
  {
    keywords: ["invoice", "gst", "receipt", "bill"],
    answer:
      "Invoices for every billing cycle are under Settings → Billing → Invoices, and include your GST details if they're saved on the account. I can also email the last invoice to the address on file.",
  },
  {
    keywords: ["invite", "team", "add user", "member", "teammate"],
    answer:
      "To add teammates: Settings → Team → Invite, enter their email and pick a role. The invite link is valid for 7 days. Admins can invite; members can't.",
  },
  {
    keywords: ["crash", "bug", "not working", "error", "freeze"],
    answer:
      "Sorry about that. Two things usually fix it: update to the latest version, then clear the app cache. If it still happens, tell me your device and OS version and I'll pass the details to engineering with your session log.",
  },
  {
    keywords: ["password", "login", "sign in", "locked"],
    answer:
      "Use “Forgot password” on the sign-in screen for a reset link. If your workspace uses single sign-on, the reset happens with your identity provider instead — your admin can confirm which applies.",
  },
  {
    keywords: ["price", "pricing", "plan", "upgrade", "cost"],
    answer:
      "Plans are billed monthly or annually and you can switch any time. Upgrades apply immediately, downgrades at the end of the cycle. Annual works out cheaper over a year.",
  },
  {
    keywords: ["human", "agent", "person", "speak to", "someone"],
    answer:
      "Of course — handing this to a human now. Someone from the support team will pick it up, and they'll have this whole conversation in front of them so you won't need to repeat yourself.",
  },
];

export function answerQuestion(question) {
  const lower = question.toLowerCase();
  const hit = knowledgeBase.find((entry) => entry.keywords.some((k) => lower.includes(k)));
  if (hit) return { text: hit.answer, confidence: 0.93, source: "Knowledge base" };
  return {
    text:
      "I'm not confident enough to answer that one. Rather than guess, I'll pass it to a human on the support team along with what you've told me. If you can add any detail — account email, what you were doing when it happened — it'll speed things up.",
    confidence: 0.34,
    source: "Escalated",
  };
}
