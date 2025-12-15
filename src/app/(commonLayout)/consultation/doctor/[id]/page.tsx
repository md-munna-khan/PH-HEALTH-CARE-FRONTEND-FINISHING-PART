import DoctorProfileContent from "@/components/modules/DoctorDetails/DoctorProfileContent";
import DoctorReviews from "@/components/modules/DoctorDetails/DoctorReviews";
import { getDoctorById } from "@/services/admin/doctorManagement";

export const revalidate = 600;

const DoctorDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const result = await getDoctorById(id);
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <DoctorProfileContent doctor={result.data} />
      <DoctorReviews doctorId={id} />
    </div>
  );
};

export default DoctorDetailPage;
