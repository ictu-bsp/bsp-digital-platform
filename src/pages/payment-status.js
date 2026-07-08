// src/pages/payment-status.js
// Shown after PayMongo redirects back from GCash/GrabPay authorization.
// Reads ?status=success or ?status=failed from the URL.

import { useRouter } from "next/router";
import Link from "next/link";

export default function PaymentStatus() {
  const router = useRouter();
  const { status } = router.query;

  const isSuccess = status === "success";
  const isFailed = status === "failed";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#f4f4f5",
      padding: "24px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        padding: "40px",
        textAlign: "center"
      }}>
        {isSuccess && (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#166534", marginBottom: "8px" }}>
              Payment Successful
            </h1>
            <p style={{ color: "#52525b", marginBottom: "24px" }}>
              Your payment was authorized and completed.
            </p>
          </>
        )}

        {isFailed && (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#b91c1c", marginBottom: "8px" }}>
              Payment Failed
            </h1>
            <p style={{ color: "#52525b", marginBottom: "24px" }}>
              The payment was not completed. Please try again.
            </p>
          </>
        )}

        {!isSuccess && !isFailed && (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#3f3f46", marginBottom: "8px" }}>
              Processing...
            </h1>
            <p style={{ color: "#52525b", marginBottom: "24px" }}>
              Checking your payment status.
            </p>
          </>
        )}

        <Link href="/payments" style={{
          display: "inline-block",
          backgroundColor: "black",
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          textDecoration: "none"
        }}>
          Back to Payments
        </Link>
      </div>
    </div>
  );
}