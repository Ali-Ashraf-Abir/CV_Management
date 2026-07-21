"use client";



import { RecruiterPositionsPage } from "@/components/positions/recruiter-positions-page";
import { CandidatePositionsPage } from "@/components/candidate/candidate-positions-page";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { isRecruiterOrAdmin } from "@/lib/utils/isRecruiterOrAdmin";

export default function AllPositionsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return isRecruiterOrAdmin(user?.role)? <RecruiterPositionsPage type="all"/> : <CandidatePositionsPage />;
}
