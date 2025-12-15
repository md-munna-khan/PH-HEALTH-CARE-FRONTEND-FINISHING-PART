import { AppointmentPieChart } from "@/components/shared/AppointmentPieChart";
import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";
import { StatsCard } from "@/components/shared/StatCard";
import { getDashboardMetaData } from "@/services/meta/dashboard.service";
import { IDoctorDashboardMeta } from "@/types/meta.interface";
import { Suspense } from "react";
async function DoctorDashboardContent() {
  const result = await getDashboardMetaData();

  const data: IDoctorDashboardMeta = result.data;
  // Safe access with fallback for revenue data
  const totalRevenue = data.totalRevenue?._sum?.amount || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Appointments"
          value={data.appointmentCount.toLocaleString()}
          iconName="CalendarDays"
          description="All time appointments"
          iconClassName="bg-blue-100"
        />
        <StatsCard
          title="Total Patients"
          value={data.patientCount.toLocaleString()}
          iconName="Users"
          description="Unique patients served"
          iconClassName="bg-green-100"
        />
        <StatsCard
          title="Total Reviews"
          value={data.reviewCount.toLocaleString()}
          iconName="Star"
          description="Patient reviews"
          iconClassName="bg-yellow-100"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          iconName="DollarSign"
          description="Total earnings"
          iconClassName="bg-emerald-100"
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

const DoctorDashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your medical practice and patient statistics
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DoctorDashboardContent />
      </Suspense>
    </div>
  );
};

export default DoctorDashboardPage;
