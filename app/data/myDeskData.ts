export type ProjectStatus = "In Progress" | "Completed" | "Revision" | "On Collabs";

export interface DeskProject {
  id: number;
  title: string;
  thumbnail: string;
  assignee: string;
  assigneeAvatar: string;
  assigneeOnline: boolean;
  dueLabel: string;
  status: ProjectStatus;
  progress: number;
  isCollab?: boolean;
  collabExtra?: string;
  collabAvatar?: string;
  chatLabel: "Chat Creative" | "Chat Client";
}

export const deskProjects: DeskProject[] = [
  {
    id: 1,
    title: "Logo Design for Luxury Boutique",
    thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&q=80",
    assignee: "Natasha Eden",
    assigneeAvatar: "https://i.pravatar.cc/150?img=47",
    assigneeOnline: true,
    dueLabel: "Due in 2 days 23hrs 30mins",
    status: "In Progress",
    progress: 60,
    chatLabel: "Chat Creative",
  },
  {
    id: 2,
    title: "Logo Design for Luxury Boutique",
    thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&q=80",
    assignee: "Kingsley Joe",
    assigneeAvatar: "https://i.pravatar.cc/150?img=11",
    assigneeOnline: false,
    dueLabel: "Due in 0 days 00hrs 00mins",
    status: "Completed",
    progress: 60,
    chatLabel: "Chat Creative",
  },
  {
    id: 3,
    title: "Logo Design for Luxury Boutique",
    thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&q=80",
    assignee: "Natasha Eden",
    assigneeAvatar: "https://i.pravatar.cc/150?img=47",
    assigneeOnline: true,
    dueLabel: "Due in 2 days 23hrs 30mins",
    status: "Revision",
    progress: 60,
    chatLabel: "Chat Creative",
  },
  {
    id: 4,
    title: "Business Card Design",
    thumbnail: "https://images.unsplash.com/photo-1572502742148-07fb14f29e0a?w=200&q=80",
    assignee: "Akin Ola",
    assigneeAvatar: "https://i.pravatar.cc/150?img=15",
    assigneeOnline: true,
    dueLabel: "Due in 0 days 00hrs 00mins",
    status: "On Collabs",
    progress: 100,
    isCollab: true,
    collabExtra: "Natasha John + 3 others",
    collabAvatar: "https://i.pravatar.cc/150?img=32",
    chatLabel: "Chat Client",
  },
];