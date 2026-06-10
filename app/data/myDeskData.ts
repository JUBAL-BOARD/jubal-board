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
  assignee: ProjectPerson;
  client: ProjectPerson;
  dueLabel: string;
  status: ProjectStatus;
  progress: number;
  isCollab?: boolean;
  collabExtra?: string;
  collabAvatar?: string;
  chatLabel: "Chat Creative" | "Chat Client";
}