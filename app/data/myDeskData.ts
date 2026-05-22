export type ProjectStatus = "In Progress" | "Completed" | "Revision" | "On Collabs";

export interface ProjectPerson {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

export interface DeskProject {
  id: number;
  title: string;
  thumbnail: string;
  assignee: ProjectPerson;   // 👈 creative
  client: ProjectPerson;     // 👈 client
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
    assignee: {
      id: "dm_natasha_eden_001",
      name: "Natasha Eden",
      avatar: "https://i.pravatar.cc/150?img=47",
      isOnline: true,
    },
    client: {
      id: "dm_charles_eden_001",
      name: "Charles Eden",
      avatar: "https://i.pravatar.cc/150?img=11",
      isOnline: true,
    },
    dueLabel: "Due in 2 days 23hrs 30mins",
    status: "In Progress",
    progress: 60,
    chatLabel: "Chat Creative",
  },
  {
    id: 2,
    title: "Logo Design for Luxury Boutique",
    thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&q=80",
    assignee: {
      id: "dm_kingsley_joe_002",
      name: "Kingsley Joe",
      avatar: "https://i.pravatar.cc/150?img=11",
      isOnline: false,
    },
    client: {
      id: "dm_charles_eden_001",
      name: "Charles Eden",
      avatar: "https://i.pravatar.cc/150?img=12",
      isOnline: false,
    },
    dueLabel: "Due in 0 days 00hrs 00mins",
    status: "Completed",
    progress: 100,
    chatLabel: "Chat Creative",
  },
  {
    id: 3,
    title: "Logo Design for Luxury Boutique",
    thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&q=80",
    assignee: {
      id: "dm_natasha_eden_001",
      name: "Natasha Eden",
      avatar: "https://i.pravatar.cc/150?img=47",
      isOnline: true,
    },
    client: {
      id: "dm_roy_john_003",
      name: "Roy John",
      avatar: "https://i.pravatar.cc/150?img=15",
      isOnline: false,
    },
    dueLabel: "Due in 2 days 23hrs 30mins",
    status: "Revision",
    progress: 60,
    chatLabel: "Chat Creative",
  },
  {
    id: 4,
    title: "Business Card Design",
    thumbnail: "https://images.unsplash.com/photo-1572502742148-07fb14f29e0a?w=200&q=80",
    assignee: {
      id: "dm_akin_ola_004",
      name: "Akin Ola",
      avatar: "https://i.pravatar.cc/150?img=15",
      isOnline: true,
    },
    client: {
      id: "dm_david_mark_004",
      name: "David Mark",
      avatar: "https://i.pravatar.cc/150?img=32",
      isOnline: true,
    },
    dueLabel: "Due in 0 days 00hrs 00mins",
    status: "On Collabs",
    progress: 100,
    isCollab: true,
    collabExtra: "Natasha John + 3 others",
    collabAvatar: "https://i.pravatar.cc/150?img=32",
    chatLabel: "Chat Client",
  },
];