"use client";
import PageSkeleton from "./pageSkeleton";
import FadeInSection from "./fadeInSection";

type SkeletonVariant =
  | "dashboard"
  | "gigs"
  | "pitches"
  | "profile"
  | "learning"
  | "generic";

interface WithPageTransitionProps {
  isReady: boolean;
  children: React.ReactNode;
  variant?: SkeletonVariant;
}

/**
 * Wraps any page content.
 * Shows a skeleton while loading, then fades in content when ready.
 *
 * Usage:
 *   <WithPageTransition isReady={isReady} variant="gigs">
 *     <YourPageContent />
 *   </WithPageTransition>
 */
const WithPageTransition: React.FC<WithPageTransitionProps> = ({
  isReady,
  children,
  variant = "generic",
}) => {
  if (!isReady) {
    return <PageSkeleton variant={variant} />;
  }

  return <FadeInSection delay={0}>{children}</FadeInSection>;
};

export default WithPageTransition;