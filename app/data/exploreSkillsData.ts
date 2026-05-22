export interface SkillCategory {
  id: string;
  name: string;
  skills?: string[]; // optional now — fetched from API
  services: { id: string; name: string }[];
}
