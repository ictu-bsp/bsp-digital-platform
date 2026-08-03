export type AdvancementApprovalStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";

export interface AdvancementRequirementProgress {
  id: string;
  name: string;
  isCompleted: boolean;
  note?: string;
  description?: string;
  notes?: string;
  uploadedFileName?: string | null;
  uploadedUrl?: string | null;
  approvalStatus?: AdvancementApprovalStatus;
}

const templates: Record<string, AdvancementRequirementProgress[]> = {
  membership: [
    {
      id: "membership-1",
      name: "Memorize the Scout Oath, Law, and Motto",
      isCompleted: false,
      note: "Awaiting evidence upload",
      approvalStatus: "NOT_SUBMITTED",
      description: "Show evidence that you understand the Scout Oath, Law, motto, and the meaning of the Scout Promise.",
    },
    {
      id: "membership-2",
      name: "Show proper Scout courtesy and flag knowledge",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload proof that you can explain the Philippine flag and demonstrate the Scout sign, salute, and courtesy.",
    },
    {
      id: "membership-3",
      name: "Attend and participate in a troop meeting",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Attach a short attendance note or unit leader confirmation that you joined a regular scout meeting.",
    },
  ],
  "kid-scout": [
    {
      id: "kid-scout-1",
      name: "Attend a unit meeting and greet the troop leaders",
      isCompleted: false,
      note: "Start with the basics",
      approvalStatus: "NOT_SUBMITTED",
      description: "Complete the initial Kid Scout readiness checklist with your unit leader.",
    },
    {
      id: "kid-scout-2",
      name: "Practice the Scout sign, salute, and flag ceremony",
      isCompleted: false,
      note: "Ready for upload",
      approvalStatus: "NOT_SUBMITTED",
      description: "Show evidence that you joined the meeting and participated in basic flag ceremony and Scout courtesy activities.",
    },
    {
      id: "kid-scout-3",
      name: "Complete a simple service or cleanliness activity",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Share a short reflection or photo showing your participation in a simple service activity.",
    },
  ],
  "young-usa": [
    {
      id: "young-usa-1",
      name: "Join a unit activity or outdoor meeting",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Attach evidence of your presence and participation in an activity organized by your unit.",
    },
    {
      id: "young-usa-2",
      name: "Demonstrate basic Scout conduct and courtesy",
      isCompleted: false,
      note: "Awaiting evidence upload",
      approvalStatus: "NOT_SUBMITTED",
      description: "Show that you followed the Scout manners, team behavior, and simple meeting routines expected of your section.",
    },
    {
      id: "young-usa-3",
      name: "Complete a short reflection on what you learned",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Submit a short reflection or note about a Scout value or activity you experienced.",
    },
  ],
  "growing-usa": [
    {
      id: "growing-usa-1",
      name: "Participate in a unit service project",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Document your active participation in a service activity for your unit or community.",
    },
    {
      id: "growing-usa-2",
      name: "Practice simple knot tying and outdoor safety",
      isCompleted: false,
      note: "Open for upload",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload proof that you practiced basic knots, safety, and outdoor readiness.",
    },
    {
      id: "growing-usa-3",
      name: "Show basic campcraft preparedness",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Attach a photo or note showing that you prepared the simple camping materials needed for your activity.",
    },
  ],
  "leaping-usa": [
    {
      id: "leaping-usa-1",
      name: "Lead a simple task during a meeting",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Show that you can take responsibility for a small task assigned by your unit leader.",
    },
    {
      id: "leaping-usa-2",
      name: "Help prepare for a flag ceremony or opening activity",
      isCompleted: false,
      note: "Awaiting evidence upload",
      approvalStatus: "NOT_SUBMITTED",
      description: "Attach a brief note or photo showing your involvement in a flag ceremony or opening activity.",
    },
    {
      id: "leaping-usa-3",
      name: "Present a short report about a Scout value",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Submit a short report or reflection about a Scout value you practiced during the month.",
    },
  ],
  tenderfoot: [
    {
      id: "tenderfoot-1",
      name: "Tie and use the square knot and two half hitches",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload a photo or document showing your knot-tying practice and the finished knots.",
    },
    {
      id: "tenderfoot-2",
      name: "Participate in a community service activity",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Show proof of a service activity you completed for your home, school, or community.",
    },
    {
      id: "tenderfoot-3",
      name: "Demonstrate basic first aid and safety awareness",
      isCompleted: false,
      note: "Open for evidence upload",
      approvalStatus: "NOT_SUBMITTED",
      description: "Attach a document, photo, or certificate that shows your health and safety preparation.",
    },
  ],
  "second-class": [
    {
      id: "second-class-1",
      name: "Show improved outdoor and camping skills",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload evidence of your outdoor skills practice, camp routine, or patrol activity.",
    },
    {
      id: "second-class-2",
      name: "Complete a service project with your patrol",
      isCompleted: false,
      note: "Open for upload",
      approvalStatus: "NOT_SUBMITTED",
      description: "Share a reflection or proof of how your patrol completed a meaningful service task.",
    },
    {
      id: "second-class-3",
      name: "Practice personal responsibility and emergency preparedness",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Attach a short log or note showing how you prepared for emergencies and followed your responsibilities.",
    },
  ],
  "first-class": [
    {
      id: "first-class-1",
      name: "Plan and lead a small patrol or unit task",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Show your planning and preparation for a unit activity, patrol task, or camp duty.",
    },
    {
      id: "first-class-2",
      name: "Show stronger campcraft and trail skills",
      isCompleted: false,
      note: "Open for upload",
      approvalStatus: "NOT_SUBMITTED",
      description: "Attach proof of a campcraft or hiking skill you practiced and improved.",
    },
    {
      id: "first-class-3",
      name: "Complete a leadership or service responsibility",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload evidence of a leadership role or service responsibility you handled for the unit.",
    },
  ],
  "scout-citizen-service": [
    {
      id: "scout-citizen-service-1",
      name: "Take part in a civic or community activity",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Document your participation in a civic event, school activity, or community project.",
    },
    {
      id: "scout-citizen-service-2",
      name: "Present a short report on citizenship and community responsibility",
      isCompleted: false,
      note: "Open for upload",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload a short report, reflection, or speech that explains your understanding of citizenship.",
    },
    {
      id: "scout-citizen-service-3",
      name: "Complete a service project with documentation",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Attach evidence of the service project, who benefited, and how you contributed.",
    },
  ],
  explorer: [
    {
      id: "explorer-1",
      name: "Practice first aid and emergency response",
      isCompleted: false,
      note: "Awaiting evidence upload",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload proof of your first-aid practice or a training session you completed.",
    },
    {
      id: "explorer-2",
      name: "Complete a personal fitness or physical challenge log",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Show a short reflection or log of your fitness routine and how you stayed ready for scouting activities.",
    },
    {
      id: "explorer-3",
      name: "Take part in a community service project",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload proof of a service activity you completed in your community or school.",
    },
  ],
  pathfinder: [
    {
      id: "pathfinder-1",
      name: "Complete a citizenship and community involvement activity",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Document a neighborhood service activity, leadership role, or civic engagement you handled.",
    },
    {
      id: "pathfinder-2",
      name: "Keep a camping or outdoor activity log",
      isCompleted: false,
      note: "Open to upload",
      approvalStatus: "NOT_SUBMITTED",
      description: "Keep a simple log of your overnight, camp, or outdoor activity and attach it here.",
    },
    {
      id: "pathfinder-3",
      name: "Discuss safety, teamwork, and survival skills",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Attach a short note or reflection showing how you practiced safety and teamwork in the field.",
    },
  ],
  outdoorsman: [
    {
      id: "outdoorsman-1",
      name: "Prepare an emergency kit or survival pack",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Capture your readiness plan or a photo of the kit you prepared.",
    },
    {
      id: "outdoorsman-2",
      name: "Demonstrate a branch-specific outdoor skill",
      isCompleted: false,
      note: "Open for upload",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload a proof sheet, photo, or note that shows the specialized skill you practiced.",
    },
    {
      id: "outdoorsman-3",
      name: "Show responsibility in planning an outdoor activity",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Attach evidence showing you helped plan, prepare, and manage an outdoor activity responsibly.",
    },
  ],
  venturer: [
    {
      id: "venturer-1",
      name: "Lead a planning session or project for your unit",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Describe how you led a project, meeting, or activity for your unit or patrol.",
    },
    {
      id: "venturer-2",
      name: "Attend and document training hours",
      isCompleted: false,
      note: "Open for upload",
      approvalStatus: "NOT_SUBMITTED",
      description: "Attach the attendance slips or certificates for your training session.",
    },
    {
      id: "venturer-3",
      name: "Mentor younger scouts or support new members",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload evidence showing how you guided or supported younger scouts in your unit.",
    },
  ],
  "yellow-quadrant": [
    {
      id: "yellow-quadrant-1",
      name: "Complete a rover orientation and discussion",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Show that you completed the rover orientation tasks for this stage and understood your role in the unit.",
    },
    {
      id: "yellow-quadrant-2",
      name: "Show participation in a unit leadership activity",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Attach a short note or photo showing your involvement in a leadership activity.",
    },
  ],
  "green-quadrant": [
    {
      id: "green-quadrant-1",
      name: "Lead a team project or service activity",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Document your leadership role in a rover activity or service initiative.",
    },
    {
      id: "green-quadrant-2",
      name: "Document your participation in unit planning",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload a short report or note showing how you helped with planning or coordination.",
    },
  ],
  "red-quadrant": [
    {
      id: "red-quadrant-1",
      name: "Complete a major service initiative",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload proof of a more advanced service project you completed for your community.",
    },
    {
      id: "red-quadrant-2",
      name: "Show evidence of community impact",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Include photos, reports, or feedback that demonstrate the impact of your contribution.",
    },
  ],
  "blue-quadrant": [
    {
      id: "blue-quadrant-1",
      name: "Coordinate a community-focused initiative",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Attach proof that you helped coordinate an initiative that benefited your community.",
    },
    {
      id: "blue-quadrant-2",
      name: "Support younger scouts or new members",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload evidence showing how you guided or supported younger scouts in your unit.",
    },
  ],
  "chief-scout-nation-builder": [
    {
      id: "chief-scout-nation-builder-1",
      name: "Lead a nation-building or civic outreach project",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload evidence of a project that helped build your nation and community.",
    },
    {
      id: "chief-scout-nation-builder-2",
      name: "Present a final review with supporting evidence",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Submit a final reflection, summary, and supporting documents for unit leader review.",
    },
  ],
  eagle: [
    {
      id: "eagle-1",
      name: "Plan and lead a service project",
      isCompleted: false,
      note: "Locked until the previous rank is complete",
      approvalStatus: "NOT_SUBMITTED",
      description: "Upload evidence of the leadership service project you completed for this milestone.",
    },
    {
      id: "eagle-2",
      name: "Prepare board-review notes and supporting documents",
      isCompleted: false,
      note: "Locked until the previous rank is complete",
      approvalStatus: "NOT_SUBMITTED",
      description: "Keep your review notes, project summary, and supporting documents ready for unit leader review.",
    },
    {
      id: "eagle-3",
      name: "Reflect on leadership growth and achievements",
      isCompleted: false,
      note: "Pending requirement",
      approvalStatus: "NOT_SUBMITTED",
      description: "Submit a short reflection on how you grew as a leader through the advancement journey.",
    },
  ],
};

function resolveTemplateKey(rankKey: string): string | undefined {
  const normalized = rankKey.toLowerCase().trim().replace(/[_\s]+/g, "-");

  if (templates[normalized]) {
    return normalized;
  }

  const aliases: Record<string, string> = {
    "tenderfoot-scout": "tenderfoot",
    "second-class-scout": "second-class",
    "first-class-scout": "first-class",
    "scout-citizen-service": "scout-citizen-service",
    "explorer-scout": "explorer",
    "pathfinder-scout": "pathfinder",
    "outdoorsman-scout": "outdoorsman",
    "venturer-scout": "venturer",
    "eagle-scout": "eagle",
    "young-usa": "young-usa",
    "growing-usa": "growing-usa",
    "leaping-usa": "leaping-usa",
    "yellow-quadrant": "yellow-quadrant",
    "green-quadrant": "green-quadrant",
    "red-quadrant": "red-quadrant",
    "blue-quadrant": "blue-quadrant",
    "chief-scout-nation-builder": "chief-scout-nation-builder",
    "kid-scout": "kid-scout",
    membership: "membership",
  };

  return aliases[normalized];
}

export function buildInitialBadgeProgress(rankKey: string): AdvancementRequirementProgress[] {
  const templateKey = resolveTemplateKey(rankKey);
  return (templateKey ? templates[templateKey] ?? [] : []).map((item) => ({ ...item }));
}

export function mergeBadgeProgressWithDefaults(
  defaults: Record<string, AdvancementRequirementProgress[]>,
  persisted: Record<string, AdvancementRequirementProgress[]>
): Record<string, AdvancementRequirementProgress[]> {
  const merged: Record<string, AdvancementRequirementProgress[]> = {};

  for (const [rankKey, items] of Object.entries(defaults)) {
    const existing = persisted[rankKey];
    if (existing?.length) {
      merged[rankKey] = existing.map((item) => ({ ...item }));
      continue;
    }

    merged[rankKey] = items.map((item) => ({ ...item }));
  }

  return merged;
}
