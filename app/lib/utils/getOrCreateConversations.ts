import { Conversation } from "@/app/types";

export const makeDMConversation = (user: {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
}): Conversation => ({
  id: `dm_${user.id}`,
  type: "dm",
  name: user.name,
  avatar: user.avatar,
  isOnline: user.isOnline ?? false,
  messages: [],
  lastMessage: "",
  lastTime: "",
  unread: 0,
});

export const makeGroupConversation = (project: {
  id: string;
  title: string;
  members: { name: string; avatar: string }[];
}): Conversation => ({
  id: `group_${project.id}`,
  type: "group",
  name: project.title,
  members: project.members,
  messages: [],
  lastMessage: "",
  lastTime: "",
  unread: 0,
});