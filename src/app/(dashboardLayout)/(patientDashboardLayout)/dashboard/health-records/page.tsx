import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, Heart, TrendingUp } from "lucide-react";

// Dynamic SSR - authenticated page
export const dynamic = "force-dynamic";

export default function HealthRecordsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Health Records</h1>
        <p className="text-muted-foreground">
          View and manage your medical history and health data
        </p>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">
                Health Records Feature Coming Soon
              </h3>
              <p className="text-muted-foreground">
                We&apos;re working on bringing you comprehensive health record
                management. Stay tuned for updates!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Medical Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Store and access all your lab reports, imaging results, and
              medical documents in one place.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your blood pressure, heart rate, temperature, and other
              vital signs over time.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Health Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Visualize your health data with charts and graphs to monitor your
              progress and trends.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
