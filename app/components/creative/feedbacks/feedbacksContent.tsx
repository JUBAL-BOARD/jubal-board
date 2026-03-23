import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import FeedbackProfile from "./feedbackProfile";
import FeedbackStats from "./feedbackStats";
import RatingBreakdown from "./ratingBreakdown";
import ReviewsList from "./reviewsList";

const FeedbacksContent: React.FC = () => {
  return (
    <div>
      <Breadcrumb crumbs={[
        { label: "Dashboard", path: "/creative/dashboard" },
        { label: "Feedbacks" },
      ]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Feedback/Ratings</h1>

      <FeedbackProfile />
      <FeedbackStats />
      <RatingBreakdown />
      <ReviewsList />
    </div>
  );
};

export default FeedbacksContent;