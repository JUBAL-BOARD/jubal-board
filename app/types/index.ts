import type { ReactNode } from "react";
import type { StaticImageData } from "next/image";
import { Network, GitMerge, BadgeCheck, ClipboardCheck, Users, Briefcase, LucideIcon } from "lucide-react";


// ─── Shared / Existing (Client) ───────────────────────────────────────────────

export interface Category {
  icon: ReactNode;
  label: string;
}

export interface Service {
  label: string;
  bg: string | StaticImageData;
}

export interface Feature {
  title: string;
  desc: string;
  icon: ReactNode;
}

export interface ContactItem {
  icon: ReactNode;
  lines: string[];
}

export interface NavItem {
  icon: ReactNode;
  label: string;
  active?: boolean;
}

export interface Creative {
  name: string;
  role: string;
  rating: number;
  avatar: string;
  portfolioImg: string;
  verified?: boolean;
  premium?: boolean;
}

export interface Project {
  title: string;
  assignee: string;
  assigneeAvatar: string;
  status: string;
  progress: number;
  thumbnail: string;
}

export interface Pitch {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  rate: string;
  completedProjects: number;
  verified?: boolean;
}

// ─── Creative Dashboard ────────────────────────────────────────────────────────

export interface CreativeUser {
  name: string;
  avatar: string;
  isOnline: boolean;
  plan: "free" | "premium";
}

export interface CreativeStats {
  activeProjects: number;
  pendingPitches: number;
  weeklyEarnings: number;
}

export type FreshGig = {
  id: string;
  title: string;
  category: string;
  budget: string;
  timeline: string;
  description: string;
  image?: string;
  isPremium?: boolean;
  deliveryDate?: string;
  skills?: string;
  referenceFile?: string;
  deliverables?: string[];
  currency?: string;
  postedBy: {
    name: string;
    avatar: string;
    verified?: boolean;
    language?: string;
    communication?: string;
  };
};

export interface TodoItem {
  id: string;
  title: string;
  progress?: number;
  type: string;
  actionLabel: string;
  isCompleted: boolean;
}

export interface OngoingGig {
  id: string;
  title: string;
  thumbnail: string;
  client: {
    name: string;
    avatar: string;
  };
  dueIn: string;
  progress: number;
  status: "In Progress" | "Completed" | "Paused";
}

export interface CreativePitch {
  id: string;
  gigTitle: string;
  category: string;
  budget: string;
  timeline: string;
  description: string;
  image: string;
  sentAt: string;
  status: "approved" | "pending" | "rejected" | "ongoing"; // add ongoing
  client: {
    id: string;
    name: string;
    avatar: string;
    verified?: boolean;
    isOnline?: boolean;
  };
}

export type CourseLesson = {
  title: string;
  duration: string;
};

export type CourseOutlineSection = {
  id: number;
  title: string;
  lessons: CourseLesson[];
};

export type Course = {
  id: string;
  title: string;
  level: string;
  format: string;
  rating: number;
  duration: string;
  price: number | string;
  description: string;
  image: string;
  progress?: number;
  videoUrl?: string;
  outline?: CourseOutlineSection[]; 
};
export interface MyGig {
  id: string;
  title: string;
  thumbnail: string;
  client: {
    name: string;
    avatar: string;
  };
  dueIn: string;
  progress: number;
  status: "All" | "In Progress" | "Completed" | "Revised" | "Collaborating" | "Partially Completed" | "Active";
  collabMates?: {
    avatars: string[];
    label: string;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
  isQuickReply?: boolean;
}

// app/types.ts
export type ConversationType = "dm" | "group";

export type Conversation = {
  id: string;
  type: ConversationType;
  name: string;           // person's name or group name
  avatar?: string;        // for DMs
  members?: { name: string; avatar: string }[];    // for group chats (multiple avatars)
  isOnline?: boolean;
  isGroup?: boolean;  
  lastMessage?: string;
  lastSender?: string;
  lastTime?: string;
  unread: number;
  messages: Message[];
};

export type Message = {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
  isQuickReply?: boolean;
  senderId?: string;
  senderName?: string;    // needed for group chats
  senderAvatar?: string;  // needed for group chats
};

export interface EarningsData {
  totalEarned: number;
  pendingEarnings: number;
  availableBalance: number;
}

export interface Transaction {
  id: string;
  details: string;
  paymentMethod: string;
  date: string;
  time: string;
  amount: string;
  status: "Debit" | "Credit" | "Reversed" | "Pending";
}

export interface ClientFamMember {
  id: string;
  name: string;
  avatar: string;
  totalProjects: number;
  language: string;
  preferredCommunication: string;
}

export interface CollabCreative {
  id: string;
  name: string;
  role: string;
  rating: number;
  avatar: string;
  portfolioImg: string;
  verified?: boolean;
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  timeAgo: string;
  comment: string;
}

export interface SocialLink {
  platform: "instagram" | "behance";
  url: string;
}

export interface CreativeProfile {
  name: string;
  avatar: string;
  isOnline: boolean;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  completedProjects: number;
  jobSuccess: number;
  bio: string;
  skills: string[];
  services: string[];
  yearsOfExperience: number;
  totalClients: number;
  portfolioImages: string[];
  socialLinks: SocialLink[];
}

export interface AppNotification {
  id: string;
  type: "project" | "message" | "review" | "system";
  title: string;
  subtitle?: string;
  avatar: string;
  name: string;
  timeAgo: string;
  stars?: number;
  isRead?: boolean;
}

export interface NotificationGroup {
  label: string;
  notifications: AppNotification[];
}