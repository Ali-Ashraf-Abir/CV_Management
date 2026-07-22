import { PositionApplicantsPage } from "@/components/recruiterPositionPage/position-applicant-page";

export default function Page({ params }: { params: { id: string } }) {
  return <PositionApplicantsPage positionId={params.id} />;
}