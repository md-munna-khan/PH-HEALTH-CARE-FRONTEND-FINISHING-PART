import DoctorGridSkeleton from "@/components/modules/Consultation/DoctorGridSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConsultationLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 bg-slate-300/70" />
          <Skeleton className="h-5 w-96 bg-slate-300/60" />
        </div>

        {/* AI Doctor Suggestion Skeleton */}
        <Card className="border-primary/30 bg-linear-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-lg bg-primary/30" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-48 bg-slate-300/70" />
                <Skeleton className="h-4 w-64 bg-slate-300/60" />
              </div>
            </div>
            <Skeleton className="h-24 w-full bg-slate-300/60" />
            <Skeleton className="h-10 w-full bg-primary/30" />
          </CardContent>
        </Card>

        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1 bg-slate-300/70" />
          <Skeleton className="h-10 w-full sm:w-48 bg-slate-300/70" />
          <Skeleton className="h-10 w-full sm:w-32 bg-slate-300/70" />
        </div>

        {/* Doctor Grid Skeleton */}
        <DoctorGridSkeleton count={6} />

        {/* Pagination Skeleton */}
        <div className="flex justify-center gap-2">
          <Skeleton className="h-10 w-24 bg-slate-300/70" />
          <Skeleton className="h-10 w-10 bg-slate-300/70" />
          <Skeleton className="h-10 w-10 bg-slate-300/70" />
          <Skeleton className="h-10 w-10 bg-slate-300/70" />
          <Skeleton className="h-10 w-24 bg-slate-300/70" />
        </div>
      </div>
    </div>
  );
}
