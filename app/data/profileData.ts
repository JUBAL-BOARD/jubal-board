export interface UserProfile {
  fullName: string;
  displayName: string;
  email: string;
  contactNumber: string;
  location: string;
  avatar: string;
  country: string;
  city: string;
  state: string;
  streetAddress: string;
  postalCode: string;
}

export const userProfile: UserProfile = {
  fullName: "Charles Eden",
  displayName: "Denver",
  email: "charleseden@jubalboard.com",
  contactNumber: "+1 (234)567-8910",
  location: "Colorado, US",
  avatar: "https://i.pravatar.cc/150?img=33",
  country: "United States",
  city: "Denver",
  state: "Colorado",
  streetAddress: "1234 Starlight Blvd, Apt 56B",
  postalCode: "80026",
};