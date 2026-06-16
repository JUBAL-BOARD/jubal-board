"use client";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import FeedbackProfile from "./feedbackProfile";
import FeedbackStats from "./feedbackStats";
import RatingBreakdown from "./ratingBreakdown";
import ReviewsList from "./reviewsList";
import { useFeedback } from "@/app/lib/hooks/useFeedbacks";

const FeedbacksContent: React.FC = () => {
  const feedback = useFeedback();

  return (
    <div>
      <Breadcrumb
        crumbs={[
          { label: "Dashboard", path: "/creative/dashboard" },
          { label: "Feedbacks" },
        ]}
      />
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">
        Feedback/Ratings
      </h1>

      {feedback.error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          Could not load reviews: {feedback.error}
        </div>
      )}

      <FeedbackProfile />
      <FeedbackStats
        averageRating={feedback.averageRating}
        totalReviews={feedback.totalReviews}
        positivePercent={feedback.positivePercent}
        loading={feedback.loading}
      />
      <RatingBreakdown
        averageRating={feedback.averageRating}
        totalReviews={feedback.totalReviews}
        distribution={feedback.distribution}
        loading={feedback.loading}
      />
      <ReviewsList
        reviews={feedback.reviews}
        loading={feedback.loading}
      />
    </div>
  );
};

export default FeedbacksContent;