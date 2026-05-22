import { useState, useEffect } from 'react';
import { apiRequest, ApiError } from '../api';

export interface CreativeProfileData {
  id: string;
  fullName: string;
  avatar?: string;
  dateOfBirth?: string;
  contactNumber: string;
  countryState: string;
  streetAddress: string;
  postalCode?: string;
  preferredSocialLinks: string[];
  describeYourselfInOneLine: string;
  languagePreference: string;
  preferredCommunication: string;
  professionalRole: string;
  categoriesOfInterest: string[];
  currency: string;
  rateRangeMin: number;
  rateRangeMax: number;
  rateType: string;
  portfolioImages: string[];
  yearsOfExperience: number;
  completedProjects: number;
  averageRating: number;
  totalReviews: number;
  jobSuccessRate: number;
  accountType?: string; // "PERSONAL" | "BUSINESS"
}

export const useCreativeProfile = () => {
  const [profile, setProfile] = useState<CreativeProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const tokenRes = await fetch("/api/auth/session/token", {
        credentials: "include",
      });
      const { token } = await tokenRes.json();
      if (!token) throw new Error("No authorization token found.");

      const response = await apiRequest<any>("/api/v1/creatives/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = response.data?.data || response.data;
      if (!payload) throw new Error("Empty payload from server.");

      const { name, creativeProfile, creativeBusiness, activeAccountType } = payload;

      // ✅ Pick the right profile based on accountType
      const isBusiness = activeAccountType === "BUSINESS";
      const activeProfile = isBusiness ? creativeBusiness : creativeProfile;

      const extractedName = activeProfile?.fullName || 
                            activeProfile?.businessName || 
                            name || 
                            "Creative";

      const extractedAvatar = activeProfile?.imageUrl || 
                              activeProfile?.logoUrl || 
                              null;

      const extractedCategories = (activeProfile?.categoriesOfInterest || []).map(
        (cat: any) => (typeof cat === "string" ? cat : cat.name)
      );

      const extractedPortfolio = (activeProfile?.portfolios || [])
        .map((p: any) => p.fileUrl)
        .filter(Boolean);

      const extractedSocialLinks = isBusiness
        ? [activeProfile?.companyWebsite].filter(Boolean)
        : (activeProfile?.preferredSocialLinks || []).filter(Boolean);

      setProfile({
        id: payload.user?.id || "",
        fullName: extractedName,
        avatar: extractedAvatar,
        dateOfBirth: activeProfile?.dateOfBirth || '',
        contactNumber: activeProfile?.contactNumber || '',
        countryState: activeProfile?.countryState || 
                      activeProfile?.businessLocationCity || '',
        streetAddress: activeProfile?.streetAddress || '',
        postalCode: activeProfile?.postalCode || '',
        preferredSocialLinks: extractedSocialLinks,
        describeYourselfInOneLine: activeProfile?.describeYourselfInOneLine || 
                                   activeProfile?.businessName || '',
        languagePreference: activeProfile?.languagePreference || 'en',
        preferredCommunication: activeProfile?.preferredCommunication || 'CHAT_ONLY',
        professionalRole: activeProfile?.professionalRole || 
                          activeProfile?.industrySector || 
                          'Creative Professional',
        categoriesOfInterest: extractedCategories,
        currency: activeProfile?.currency || 'USD',
        rateRangeMin: activeProfile?.rateRangeMin || 0,
        rateRangeMax: activeProfile?.rateRangeMax || 0,
        rateType: activeProfile?.rateType || 'HOURLY',
        portfolioImages: extractedPortfolio,
        yearsOfExperience: 0,
        completedProjects: activeProfile?.totalCompletedProjects || 0,
        averageRating: activeProfile?.overallRating || 0,
        totalReviews: activeProfile?.totalReviews || 0,
        jobSuccessRate: activeProfile?.jobSuccessRate || 0,
        accountType: activeAccountType || 'PERSONAL',
      });

    } catch (err) {
      console.error("Profile Fetch Error:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to sync profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
};