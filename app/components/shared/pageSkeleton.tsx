"use client";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type SkeletonVariant =
  | "dashboard"
  | "gigs"
  | "pitches"
  | "profile"
  | "learning"
  | "generic";

interface PageSkeletonProps {
  variant?: SkeletonVariant;
}

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton height={48} borderRadius={10} />
    <div className="flex items-center gap-3">
      <Skeleton circle width={44} height={44} />
      <div className="flex-1">
        <Skeleton width="40%" height={20} />
        <Skeleton width="25%" height={14} className="mt-1" />
      </div>
    </div>
    <Skeleton height={44} borderRadius={8} />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} height={80} borderRadius={10} />
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} height={140} borderRadius={10} />
      ))}
    </div>
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} height={40} borderRadius={8} />
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} height={120} borderRadius={10} />
      ))}
    </div>
  </div>
);

const GigsSkeleton = () => (
  <div className="space-y-5">
    <Skeleton height={44} borderRadius={8} />
    <div className="flex gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} width={80} height={32} borderRadius={20} />
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height={180} borderRadius={10} />
          <Skeleton width="70%" height={18} />
          <Skeleton width="45%" height={14} />
          <div className="flex justify-between">
            <Skeleton width={60} height={14} />
            <Skeleton width={60} height={14} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PitchesSkeleton = () => (
  <div className="space-y-5">
    <div className="flex justify-between items-center">
      <Skeleton width={140} height={28} />
      <Skeleton width={120} height={40} borderRadius={8} />
    </div>
    <div className="flex gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} width={90} height={32} borderRadius={20} />
      ))}
    </div>
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-start">
          <Skeleton circle width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton width="55%" height={18} />
            <Skeleton width="35%" height={14} />
            <Skeleton width="80%" height={14} />
          </div>
          <Skeleton width={70} height={28} borderRadius={6} />
        </div>
      ))}
    </div>
  </div>
);

const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-col items-center gap-3 py-6">
      <Skeleton circle width={96} height={96} />
      <Skeleton width={160} height={24} />
      <Skeleton width={120} height={16} />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <Skeleton width="30%" height={12} />
          <Skeleton height={40} borderRadius={8} />
        </div>
      ))}
    </div>
    <Skeleton height={120} borderRadius={10} />
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} height={80} borderRadius={10} />
      ))}
    </div>
  </div>
);

const LearningSkeleton = () => (
  <div className="space-y-5">
    <Skeleton width={180} height={28} />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height={160} borderRadius={10} />
          <Skeleton width="75%" height={18} />
          <Skeleton width="50%" height={14} />
          <Skeleton height={6} borderRadius={4} />
        </div>
      ))}
    </div>
  </div>
);

const GenericSkeleton = () => (
  <div className="space-y-5">
    <Skeleton width="40%" height={28} />
    <Skeleton height={44} borderRadius={8} />
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height={60} borderRadius={8} />
      ))}
    </div>
  </div>
);

const variantMap: Record<SkeletonVariant, React.FC> = {
  dashboard: DashboardSkeleton,
  gigs: GigsSkeleton,
  pitches: PitchesSkeleton,
  profile: ProfileSkeleton,
  learning: LearningSkeleton,
  generic: GenericSkeleton,
};

const PageSkeleton: React.FC<PageSkeletonProps> = ({ variant = "generic" }) => {
  const SkeletonContent = variantMap[variant];
  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className="w-full px-4 lg:px-7 py-6">
        <SkeletonContent />
      </div>
    </SkeletonTheme>
  );
};

export default PageSkeleton;