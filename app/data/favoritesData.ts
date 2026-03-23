export interface FavoriteCreative {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  rate: string;
  completedProjects: number;
  online: boolean;
  verified: boolean;
}

export const favoriteCreatives: FavoriteCreative[] = [
  { id: 1, name: "Natasha John", role: "Graphic Designer", avatar: "https://i.pravatar.cc/150?img=47", rating: 5.0, rate: "$300", completedProjects: 12, online: true, verified: true },
  { id: 2, name: "Natasha John", role: "Graphic Designer", avatar: "https://i.pravatar.cc/150?img=45", rating: 5.0, rate: "$300", completedProjects: 12, online: true, verified: true },
  { id: 3, name: "Natasha John", role: "Graphic Designer", avatar: "https://i.pravatar.cc/150?img=44", rating: 5.0, rate: "$300", completedProjects: 12, online: true, verified: true },
  { id: 4, name: "Natasha John", role: "Graphic Designer", avatar: "https://i.pravatar.cc/150?img=43", rating: 5.0, rate: "$300", completedProjects: 12, online: false, verified: true },
  { id: 5, name: "Natasha John", role: "Graphic Designer", avatar: "https://i.pravatar.cc/150?img=41", rating: 5.0, rate: "$300", completedProjects: 12, online: true, verified: true },
  { id: 6, name: "Natasha John", role: "Graphic Designer", avatar: "https://i.pravatar.cc/150?img=40", rating: 5.0, rate: "$300", completedProjects: 12, online: false, verified: true },
];

export const budgetRanges = [
  "$50-$100", "$100-$500", "$500-$1000", "$1000-$5000", "$5000+",
];

export const timelines = [
  "Less than 24 hours", "1-3 days", "3-7 days", "1-2 weeks", "1 month+",
];

export const projectModes = ["Virtual", "Physical", "Hybrid"];