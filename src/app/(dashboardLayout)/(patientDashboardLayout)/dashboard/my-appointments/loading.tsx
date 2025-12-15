import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyAppointmentsLoading() {
  return (
    <div className="grid gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6 border-muted/30">
          <div className="flex items-start justify-between">
            <div className="flex gap-4 flex-1">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
