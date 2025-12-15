import { AppointmentPieChart } from "@/components/shared/AppointmentPieChart";
import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";
import { StatsCard } from "@/components/shared/StatCard";
import { getDashboardMetaData } from "@/services/meta/dashboard.service";
import { IPatientDashboardMeta } from "@/types/meta.interface";
import { Suspense } from "react";

// Dynamic SSR with fetch-level caching (30s in service for real-time stats)
export const dynamic = "force-dynamic";

async function PatientDashboardContent() {
  // CRITICAL: Server-side role verification before rendering
  const result = await getDashboardMetaData();

  const data: IPatientDashboardMeta = result.data;

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Appointments"
          value={data.appointmentCount.toLocaleString()}
          iconName="CalendarDays"
          description="All time appointments"
          iconClassName="bg-blue-100"
        />
        <StatsCard
          title="Total Prescriptions"
          value={data.prescriptionCount.toLocaleString()}
          iconName="FileText"
          description="Medical prescriptions"
          iconClassName="bg-purple-100"
        />
        <StatsCard
          title="Total Reviews"
          value={data.reviewCount.toLocaleString()}
          iconName="Star"
          description="Reviews given"
          iconClassName="bg-yellow-100"
        />
      </div>

      {/* Appointment Status Chart */}
      <div className="grid gap-4">
        <AppointmentPieChart
          data={data.formattedAppointmentStatusDistribution}
          title="Appointment Status Distribution"
          description="Overview of your appointment statuses"
        />
      </div>
    </div>
  );
}

const PatientDashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your health records and appointment history
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <PatientDashboardContent />
      </Suspense>
    </div>
  );
};

export default PatientDashboardPage;
