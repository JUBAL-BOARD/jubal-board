import type { ReactNode } from "react";

// ─── Shared / Existing (Client) ───────────────────────────────────────────────

export interface Category {
  icon: ReactNode;
  label: string;
}

export interface Service {
  label: string;
  bg: string;
}

export interface Feature {
  title: string;
  desc: string;
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

export interface FreshGig {
  id: string;
  title: string;
  category: string;
  budget: string;
  timeline: string;
  description: string;
  image: string;
  isPremium?: boolean;
  postedBy: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
}

export interface TodoItem {
  id: string;
  title: string;
  progress: number;
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
  status: "approved" | "pending" | "rejected";
  client: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
}

export interface Course {
  id: string;
  title: string;
  format: "Video" | "Quick Read" | "Audio";
  level: "Beginners" | "All Levels" | "Advanced";
  rating: number;
  price: number;
  duration: string;
  description: string;
  image: string;
}

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
  status: "In Progress" | "Completed" | "Revised" | "Collaborating" | "Partially Completed" | "Active";
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

export interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
  isQuickReply?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;       // add this
  unread: number;
  isOnline: boolean;
  isGroup?: boolean;
  messages: Message[];    // add this
}

export interface EarningsData {
  totalEarned: number;
  pendingEarnings: number;
  availableBalance: number;
}

export interface Transaction {
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