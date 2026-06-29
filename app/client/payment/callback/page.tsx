import { Suspense } from "react";
import PaymentCallbackPage from "@/app/components/client/payment/paymentCallback";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PaymentCallbackPage />
    </Suspense>
  );
}