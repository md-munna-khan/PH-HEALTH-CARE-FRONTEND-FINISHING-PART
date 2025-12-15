import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const DoctorDetailsLoading = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Doctor Profile Card Skeleton */}
      <Card className="bg-linear-to-br from-slate-50 to-slate-100/50 border-slate-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Skeleton */}
            <Skeleton className="h-32 w-32 rounded-full mx-auto md:mx-0 bg-slate-300/70" />

            {/* Doctor Info Skeleton */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64 bg-slate-300/70" />
                <Skeleton className="h-5 w-48 bg-slate-300/60" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-24 bg-amber-300/50" />
                  <Skeleton className="h-5 w-32 bg-slate-300/60" />
                </div>
              </div>

              {/* Specialties Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-slate-300/60" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-28 rounded-full bg-primary/20" />
                  <Skeleton className="h-6 w-24 rounded-full bg-primary/20" />
                  <Skeleton className="h-6 w-32 rounded-full bg-primary/20" />
                </div>
              </div>
            </div>

            {/* Action Button Skeleton */}
            <div className="flex flex-col gap-3 min-w-48">
              <Skeleton className="h-10 w-full bg-primary/30" />
              <Skeleton className="h-16 w-full bg-slate-300/60" />
            </div>
          </div>
        </CardHeader>

        <Separator className="bg-slate-200" />

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Info Cards Skeleton */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 p-3 rounded-lg bg-slate-100/80">
                <Skeleton className="h-4 w-24 bg-slate-300/60" />
                <Skeleton className="h-5 w-full bg-slate-300/70" />
              </div>
            ))}
          </div>

          <Separator className="my-6 bg-slate-200" />

          {/* About Section Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32 bg-slate-300/70" />
            <Skeleton className="h-4 w-full bg-slate-300/60" />
            <Skeleton className="h-4 w-full bg-slate-300/60" />
            <Skeleton className="h-4 w-3/4 bg-slate-300/60" />
          </div>

          <Separator className="my-6 bg-slate-200" />

          {/* Education & Experience Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded-lg bg-slate-100/80">
              <Skeleton className="h-6 w-32 bg-slate-300/70" />
              <Skeleton className="h-4 w-full bg-slate-300/60" />
              <Skeleton className="h-4 w-5/6 bg-slate-300/60" />
            </div>
            <div className="space-y-3 p-4 rounded-lg bg-slate-100/80">
              <Skeleton className="h-6 w-32 bg-slate-300/70" />
              <Skeleton className="h-4 w-full bg-slate-300/60" />
              <Skeleton className="h-4 w-5/6 bg-slate-300/60" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section Skeleton */}
      <Card className="bg-linear-to-br from-slate-50 to-slate-100/50 border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48 bg-slate-300/70" />
            <Skeleton className="h-10 w-32 bg-primary/30" />
          </div>
        </CardHeader>

        <Separator className="bg-slate-200" />

        <CardContent className="pt-6 space-y-4">
          {/* Review Items Skeleton */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="space-y-3 pb-4 border-b last:border-0 border-slate-200"
            >
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full bg-slate-300/70" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32 bg-slate-300/70" />
                    <Skeleton className="h-4 w-24 bg-amber-300/50" />
                  </div>
                  <Skeleton className="h-4 w-20 bg-slate-300/60" />
                  <Skeleton className="h-4 w-full bg-slate-300/60" />
                  <Skeleton className="h-4 w-5/6 bg-slate-300/60" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDetailsLoading;
