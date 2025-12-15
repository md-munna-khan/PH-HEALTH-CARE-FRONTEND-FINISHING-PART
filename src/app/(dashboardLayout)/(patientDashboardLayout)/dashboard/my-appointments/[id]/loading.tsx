import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppointmentDetailLoading() {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-muted/30">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-muted/20"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-48" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
