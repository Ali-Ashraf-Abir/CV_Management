"use client";

import { use } from "react";



import { RecruiterPositionDetail } from "@/components/positions/recruiter-position-detail";
import { CandidatePositionCv } from "@/components/candidate/candidate-position-cv";
import { Skeleton } from "@/components/ui/skeleton";
import { isRecruiterOrAdmin } from "@/lib/utils/isRecruiterOrAdmin";
import { useAuth } from "@/hooks/useAuth";

export default function PositionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return isRecruiterOrAdmin(user?.role) ? (
    <RecruiterPositionDetail positionId={id} />
  ) : (
    <CandidatePositionCv positionId={id} />
  );
}
