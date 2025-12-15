import PaymentSuccessContent from "@/components/modules/Payment/PaymentSuccessContent";

// Force dynamic rendering to ensure fresh data after payment
export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage() {
  return <PaymentSuccessContent />;
}
