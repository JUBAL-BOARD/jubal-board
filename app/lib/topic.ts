
export type Topic = {
  id: string;
  label: string;
  response?: string;
  subtopics?: Topic[];
};

// 👇 Creative → Client (you can expand later)
export const topics: Topic[] = [
  {
    id: "job_details",
    label: "Job Details",
    subtopics: [
      {
        id: "clarification",
        label: "Need clarification",
        response: "Can you clarify the exact deliverables for this project?",
      },
      {
        id: "scope",
        label: "Scope of work",
        response: "Does this include revisions or just one delivery?",
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    subtopics: [
      {
        id: "budget",
        label: "Discuss budget",
        response: "Is your budget flexible for higher quality work?",
      },
      {
        id: "payment",
        label: "Payment terms",
        response: "Will payment be milestone-based or upfront?",
      },
    ],
  },
  {
    id: "deadline",
    label: "Deadline",
    subtopics: [
      {
        id: "extension",
        label: "Request extension",
        response: "Would it be possible to extend the deadline?",
      },
      {
        id: "timeline",
        label: "Clarify timeline",
        response: "What’s your expected turnaround time?",
      },
    ],
  },
];

export const clientTopics: Topic[] = [
  {
    id: "project",
    label: "📋 Project Brief",
    subtopics: [
      { id: "project-start",    label: "When can you start?" },
      { id: "project-timeline", label: "What's your timeline?" },
      { id: "project-samples",  label: "Can I see samples?" },
      { id: "project-process",  label: "Walk me through your process" },
    ],
  },
  {
    id: "pricing",
    label: "💰 Pricing",
    subtopics: [
      { id: "price-quote",     label: "Request a quote" },
      { id: "price-negotiate", label: "Negotiate price" },
      { id: "price-deposit",   label: "How much is the deposit?" },
      { id: "price-payment",   label: "Payment methods" },
    ],
  },
  {
    id: "revisions",
    label: "✏️ Revisions",
    subtopics: [
      { id: "rev-how-many", label: "How many revisions?" },
      { id: "rev-request",  label: "Request a revision" },
      { id: "rev-feedback", label: "Give feedback" },
    ],
  },
  {
    id: "delivery",
    label: "📦 Delivery",
    subtopics: [
      { id: "del-formats",  label: "What file formats?" },
      { id: "del-deadline", label: "Can you meet my deadline?" },
      { id: "del-rush",     label: "Rush delivery" },
    ],
  },
  {
    id: "status",
    label: "🔄 Project Status",
    subtopics: [
      { id: "status-update",   label: "Any updates?" },
      { id: "status-progress", label: "How far along are you?" },
      { id: "status-stuck",    label: "Is anything blocking you?" },
    ],
  },
  {
    id: "contract",
    label: "📝 Contract",
    subtopics: [
      { id: "ct-nda",    label: "I need an NDA" },
      { id: "ct-terms",  label: "Review contract terms" },
      { id: "ct-rights", label: "Who owns the rights?" },
    ],
  },
];