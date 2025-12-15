import DoctorCardSkeleton from "./DoctorCardSkeleton";

interface DoctorGridSkeletonProps {
  count?: number;
}

export default function DoctorGridSkeleton({
  count = 6,
}: DoctorGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <DoctorCardSkeleton key={index} />
      ))}
    </div>
  );
}
