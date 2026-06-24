export interface Deliverable {
  id: string;
  projectId: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  creativeNote?: string;
  reviewStatus?: string;
  collabId?: string;
  isCollabDeliverable?: boolean;
}

export interface CreativeProfile {
  creativeId?: string;
  fullName?: string;
  name?: string;
  professionalRole?: string;
  avatarUrl?: string;
  imageUrl?: string;
  overallRating?: number;
  isPremium?: boolean;
  isVerified?: boolean;
}

export interface BriefDetail {
  jobTitle?: string;
  jobDescription?: string;
  specificSkills?: string;
  timeline?: string;
  deliveryDate?: string | null;
}

export interface BriefRow {
  label: string;
  value: string;
}

export interface Milestone {
  id: string;
  title?: string;
  isCompleted?: boolean;
  completedAt?: string | null;
}