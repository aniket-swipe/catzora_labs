import { Briefcase, ClipboardCheck, FileSignature, Mic, SquareKanban, UserPlus, Users } from "lucide-react";
import { pageItem } from "../studio-utils.js";
import { ACTIVE_STAGES } from "./stages.js";
import { HireOverview } from "./Overview.jsx";
import { JobsPage } from "./Jobs.jsx";
import { CandidatesPage } from "./Candidates.jsx";
import { AtsBoardPage } from "./AtsBoard.jsx";
import { InterviewsPage } from "./Interviews.jsx";
import { AssessmentsPage } from "./Assessments.jsx";
import { HrToolsPage } from "./HrTools.jsx";

export const hireStudio = {
  key: "hire",
  label: "Hire",
  title: "Hire",
  tagline: "Recruitment Studio",
  description:
    "Run hiring end to end — jobs, candidates, a pipeline board, AI interviews, assessments and the documents around the offer.",
  icon: UserPlus,
  base: "/app/hire",
  overview: HireOverview,
  items: [
    pageItem({
      slug: "jobs",
      icon: Briefcase,
      navLabel: "Job Management",
      navDescription: "Roles and descriptions",
      title: "Job Management",
      description: "Create roles, generate descriptions and required skills, and manage each opening.",
      component: JobsPage,
    }),
    pageItem({
      slug: "candidates",
      icon: Users,
      navLabel: "Candidates",
      navDescription: "Directory and matching",
      title: "Candidates",
      description: "Search and filter everyone who applied, and rank people against a role.",
      component: CandidatesPage,
    }),
    pageItem({
      slug: "ats",
      icon: SquareKanban,
      navLabel: "Applicant Tracking",
      navDescription: "Pipeline board",
      title: "Applicant Tracking",
      description: "The pipeline as a drag-and-drop board, from application to hire.",
      component: AtsBoardPage,
    }),
    pageItem({
      slug: "interviews",
      icon: Mic,
      navLabel: "AI Interviews",
      navDescription: "Setup, sessions, scoring",
      title: "AI Interviews",
      description: "Role-specific questions, a weighted rubric, a live session and a scorecard.",
      component: InterviewsPage,
    }),
    pageItem({
      slug: "assessments",
      icon: ClipboardCheck,
      navLabel: "Assessments",
      navDescription: "MCQ and skill tests",
      title: "Quizzes & Assessments",
      description: "Build tests, preview them as a candidate, assign them and review results.",
      component: AssessmentsPage,
    }),
    pageItem({
      slug: "hr-tools",
      icon: FileSignature,
      navLabel: "HR Tools",
      navDescription: "Offers, invites, FAQ bot",
      title: "HR Tools",
      description: "Offer letters with a review gate, interview invitations, a candidate FAQ bot and templates.",
      component: HrToolsPage,
    }),
  ],
  stats: (store) => [
    { label: "Open positions", value: store.jobs.filter((j) => j.status === "Active").length, sub: `${store.jobs.length} roles in total` },
    { label: "In pipeline", value: store.candidates.filter((c) => ACTIVE_STAGES.includes(c.stage)).length, sub: `${store.candidates.length} applicants` },
    { label: "Interviews scheduled", value: store.interviews.filter((i) => i.status === "Scheduled").length, sub: `${store.interviews.filter((i) => i.status === "Completed").length} completed` },
    { label: "Offers / hired", value: `${store.candidates.filter((c) => c.stage === "Offer").length} / ${store.candidates.filter((c) => c.stage === "Hired").length}`, sub: "This cycle" },
  ],
};
