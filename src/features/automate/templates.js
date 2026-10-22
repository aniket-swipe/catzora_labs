/** Starter workflows. "Use template" copies one into the builder as a draft. */
export const workflowTemplates = [
  {
    id: "t-lead",
    name: "Inbound lead → CRM",
    category: "Sales",
    summary: "Score and route every form submission, then notify the right rep.",
    steps: [
      { type: "Trigger", description: "New form submission" },
      { type: "AI step", description: "Classify intent and score the lead" },
      { type: "Condition", description: "Score is 70 or above" },
      { type: "Action", description: "Create CRM record" },
      { type: "Action", description: "Notify the sales channel" },
    ],
  },
  {
    id: "t-invoice",
    name: "Invoice intake",
    category: "Finance",
    summary: "Read invoices from an inbox, extract the numbers, route for approval.",
    steps: [
      { type: "Trigger", description: "Email with attachment" },
      { type: "AI step", description: "Extract vendor, amount and due date" },
      { type: "Condition", description: "Amount above the threshold" },
      { type: "Approval", description: "Finance head" },
      { type: "Action", description: "Write to the accounting sheet" },
    ],
  },
  {
    id: "t-triage",
    name: "Support triage",
    category: "Support",
    summary: "Classify every incoming ticket and send it to the right queue.",
    steps: [
      { type: "Trigger", description: "New ticket created" },
      { type: "AI step", description: "Classify category, priority and sentiment" },
      { type: "Condition", description: "Angry or high priority" },
      { type: "Action", description: "Route to the queue and set the SLA" },
    ],
  },
  {
    id: "t-digest",
    name: "Weekly digest",
    category: "Reporting",
    summary: "Pull the week's numbers, summarise them, send on a schedule.",
    steps: [
      { type: "Trigger", description: "Every Monday at 09:00" },
      { type: "Action", description: "Pull metrics from the source" },
      { type: "AI step", description: "Summarise the changes worth noting" },
      { type: "Action", description: "Send to the leadership group" },
    ],
  },
  {
    id: "t-publish",
    name: "Content publish",
    category: "Marketing",
    summary: "Take an approved draft through review, SEO checks and publish.",
    steps: [
      { type: "Trigger", description: "Draft marked ready" },
      { type: "AI step", description: "Check tone and SEO basics" },
      { type: "Approval", description: "Editor sign-off" },
      { type: "Action", description: "Publish to the CMS" },
      { type: "Action", description: "Schedule social posts" },
    ],
  },
  {
    id: "t-employee",
    name: "Employee onboarding",
    category: "HR",
    summary: "Create accounts, send the welcome pack, schedule week-one check-ins.",
    steps: [
      { type: "Trigger", description: "Offer accepted" },
      { type: "Action", description: "Create accounts and access" },
      { type: "AI step", description: "Draft a personalised welcome note" },
      { type: "Action", description: "Send the onboarding checklist" },
      { type: "Delay", description: "Wait 7 days, then schedule a check-in" },
    ],
  },
  {
    id: "t-churn",
    name: "Churn-risk watch",
    category: "Customer success",
    summary: "Watch usage drops and raise an account review before renewal.",
    steps: [
      { type: "Trigger", description: "Weekly usage snapshot" },
      { type: "Condition", description: "Usage down more than 40%" },
      { type: "AI step", description: "Summarise what changed" },
      { type: "Action", description: "Create an account review task" },
    ],
  },
  {
    id: "t-refund",
    name: "Refund request",
    category: "Finance",
    summary: "Validate the request, check policy, route for approval, confirm.",
    steps: [
      { type: "Trigger", description: "Refund requested" },
      { type: "AI step", description: "Check against the refund policy" },
      { type: "Condition", description: "Within the policy window" },
      { type: "Approval", description: "Finance" },
      { type: "Action", description: "Confirm to the customer" },
    ],
  },
];

export const STEP_TYPES = ["Trigger", "AI step", "Condition", "Action", "Approval", "Delay"];

export const STEP_TONES = {
  Trigger: "accent",
  "AI step": "create",
  Condition: "warning",
  Action: "success",
  Approval: "hire",
  Delay: "neutral",
};
