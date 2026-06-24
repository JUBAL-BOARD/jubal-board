import FadeInSection from "@/app/components/shared/fadeInSection";
import ProjectHeaderCard from "./projectHeaderCard";
import ClientCard from "./clientCard";
import CollapsibleSection from "./collapsibleSection";
import BriefSummaryTable from "./briefSummaryTable";
import MilestonesList from "./milestonesList";
import type { CreativeProfile, BriefRow } from "./types";
import type { Milestone } from "./types";

interface ViewProjectTabProps {
  title?: string;
  status?: string;
  progressPercentage?: number;
  dueDate?: string | null;
  clientProfile: CreativeProfile | null;
  clientProfileLoading: boolean;
  clientName: string;
  clientAvatar: string;
  clientRole: string;
  briefRows: BriefRow[];
  milestones?: Milestone[];
}

export default function ViewProjectTab({
  title,
  status,
  progressPercentage,
  dueDate,
  clientProfile,
  clientProfileLoading,
  clientName,
  clientAvatar,
  clientRole,
  briefRows,
  milestones,
}: ViewProjectTabProps) {
  return (
    <>
      <FadeInSection delay={0}>
        <div className="mb-4">
          <ProjectHeaderCard
            title={title}
            status={status}
            progressPercentage={progressPercentage}
            dueDate={dueDate}
          />
        </div>
      </FadeInSection>

      <FadeInSection delay={0}>
        <ClientCard
          clientProfile={clientProfile}
          loading={clientProfileLoading}
          clientName={clientName}
          clientAvatar={clientAvatar}
          clientRole={clientRole}
          variant="full"
        />
      </FadeInSection>

      <FadeInSection delay={0}>
        <CollapsibleSection title="Brief Summary">
          <BriefSummaryTable rows={briefRows} />
        </CollapsibleSection>
      </FadeInSection>

      <FadeInSection delay={0}>
        <CollapsibleSection title="Milestones">
          <MilestonesList milestones={milestones} />
        </CollapsibleSection>
      </FadeInSection>
    </>
  );
}