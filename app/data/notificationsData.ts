export type NotificationType = "proposal" | "message" | "review";
export type NotificationGroup = "Today" | "Yesterday" | "This Week";

export interface Notification {
  id: number;
  type: NotificationType;
  avatar: string;
  title: string;
  subtitle?: string;
  rating?: number;
  quote?: string;
  time: string;
  read: boolean;
  group: NotificationGroup;
}

export const notifications: Notification[] = [
  // Today
  { id: 1, type: "proposal", avatar: "https://i.pravatar.cc/150?img=11", title: "Dennis Mark accepted your proposal",  subtitle: "Photography- $200",          time: "2 mins ago", read: false, group: "Today" },
  { id: 2, type: "message",  avatar: "https://i.pravatar.cc/150?img=15", title: "Akin Olajide sent you a message",     subtitle: "Can we schedule a call",      time: "2 mins ago", read: false, group: "Today" },
  { id: 3, type: "review",   avatar: "https://i.pravatar.cc/150?img=33", title: "New review from Charles Eden",        rating: 4, quote: '"You do an outstanding job"', time: "2 mins ago", read: false, group: "Today" },

  // Yesterday
  { id: 4, type: "proposal", avatar: "https://i.pravatar.cc/150?img=11", title: "Dennis Mark accepted your proposal",  subtitle: "Photography- $200",          time: "2 mins ago", read: true, group: "Yesterday" },
  { id: 5, type: "message",  avatar: "https://i.pravatar.cc/150?img=15", title: "Akin Olajide sent you a message",     subtitle: "Can we schedule a call",      time: "2 mins ago", read: true, group: "Yesterday" },
  { id: 6, type: "review",   avatar: "https://i.pravatar.cc/150?img=33", title: "New review from Charles Eden",        rating: 4, quote: '"You do an outstanding job"', time: "2 mins ago", read: true, group: "Yesterday" },

  // This Week
  { id: 7, type: "proposal", avatar: "https://i.pravatar.cc/150?img=11", title: "Dennis Mark accepted your proposal",  subtitle: "Photography- $200",          time: "2 mins ago", read: true, group: "This Week" },
  { id: 8, type: "message",  avatar: "https://i.pravatar.cc/150?img=15", title: "Akin Olajide sent you a message",     subtitle: "Can we schedule a call",      time: "2 mins ago", read: true, group: "This Week" },
  { id: 9, type: "review",   avatar: "https://i.pravatar.cc/150?img=33", title: "New review from Charles Eden",        rating: 4, quote: '"You do an outstanding job"', time: "2 mins ago", read: true, group: "This Week" },
];