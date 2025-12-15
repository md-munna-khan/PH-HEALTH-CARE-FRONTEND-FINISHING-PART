import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DoctorCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-linear-to-br from-slate-50 to-slate-100/50 border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {/* Avatar Skeleton */}
          <Skeleton className="h-16 w-16 rounded-full bg-slate-300/70" />

          <div className="flex-1 space-y-2">
            {/* Name Skeleton */}
            <Skeleton className="h-5 w-3/4 bg-slate-300/70" />
            {/* Designation Skeleton */}
            <Skeleton className="h-4 w-1/2 bg-slate-300/60" />
            {/* Rating Skeleton */}
            <Skeleton className="h-4 w-16 mt-2 bg-amber-300/50" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3 min-h-60 flex flex-col">
        {/* Experience and Fee */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-4 w-full bg-slate-300/70" />
          <Skeleton className="h-4 w-full bg-green-300/50" />
        </div>

        {/* Specialties */}
        <div className="min-h-14 space-y-2">
          <Skeleton className="h-3 w-20 bg-slate-300/60" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-6 w-24 rounded-full bg-primary/20" />
            <Skeleton className="h-6 w-20 rounded-full bg-primary/20" />
            <Skeleton className="h-6 w-28 rounded-full bg-primary/20" />
          </div>
        </div>

        {/* Location */}
        <Skeleton className="h-4 w-full bg-slate-300/70" />

        {/* Qualification */}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24 bg-slate-300/60" />
          <Skeleton className="h-4 w-full bg-slate-300/70" />
          <Skeleton className="h-4 w-3/4 bg-slate-300/70" />
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-slate-200 flex gap-2">
        <Skeleton className="h-10 flex-1 bg-slate-300/70" />
        <Skeleton className="h-10 flex-1 bg-primary/30" />
      </CardFooter>
    </Card>
  );
}
