import FadeInSection from "@/app/components/shared/fadeInSection";
import ProjectHeaderCard from "./projectHeaderCard";
import ClientCard from "./clientCard";
import CollapsibleSection from "./collapsibleSection";
import BriefSummaryTable from "./briefSummaryTable";
import MilestonesList from "./milestonesList";
import DeliverablesList from "./deliverablesList";
import type { CreativeProfile, BriefRow, Deliverable } from "./types";
import type { Milestone } from "./types";

interface ReviewDeliverablesTabProps {
  title?: string;
  status?: string;
  progressPercentage?: number;
  dueDate?: string | null;
  clientProfile: CreativeProfile | null;
  clientName: string;
  clientAvatar: string;
  clientRole: string;
  briefRows: BriefRow[];
  milestones?: Milestone[];
  deliverables: Deliverable[];
  deliverablesLoading: boolean;
  onDownload: (fileUrl: string) => void;
  onReview: (collabId: string, deliverableId: string, status: "APPROVED" | "REVISION_REQUESTED") => void;
}

export default function ReviewDeliverablesTab({
  title,
  status,
  progressPercentage,
  dueDate,
  clientProfile,
  clientName,
  clientAvatar,
  clientRole,
  briefRows,
  milestones,
  deliverables,
  deliverablesLoading,
  onDownload,
  onReview,
}: ReviewDeliverablesTabProps) {
  return (
    <>
      <FadeInSection delay={0}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ProjectHeaderCard
            title={title}
            status={status}
            progressPercentage={progressPercentage}
            dueDate={dueDate}
            compact
          />
          <ClientCard
            clientProfile={clientProfile}
            loading={false}
            clientName={clientName}
            clientAvatar={clientAvatar}
            clientRole={clientRole}
            variant="compact"
          />
        </div>
      </FadeInSection>

      <FadeInSection delay={0}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <CollapsibleSection title="Brief Summary">
            <BriefSummaryTable rows={briefRows} compact />
          </CollapsibleSection>

          <CollapsibleSection title={`Uploaded Files (${deliverables.length})`}>
            <DeliverablesList
              deliverables={deliverables}
              loading={deliverablesLoading}
              onDownload={onDownload}
              onReview={onReview}
            />
          </CollapsibleSection>
        </div>
      </FadeInSection>

      <FadeInSection delay={0}>
        <CollapsibleSection title="Milestones">
          <MilestonesList milestones={milestones} />
        </CollapsibleSection>
      </FadeInSection>

      <FadeInSection delay={0}>
        <CollapsibleSection title="Message">
          <div className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-sm text-black min-h-[80px]">
            {deliverables[0] ? `Delivery type: ${deliverables[0].type}` : "No message from creative yet."}
          </div>
        </CollapsibleSection>
      </FadeInSection>
    </>
  );
}