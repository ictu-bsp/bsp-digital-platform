// src/app/payments/webhook/route.ts

import { NextResponse } from "next/server";
import { verifyScoutPayment } from "@/app/actions/scouts";

export async function POST(request: Request) {
  const payload = await request.json();
  const data = payload.data;

  console.log("===Webhook triggered===");
  console.log(data);
  console.log("===webhook end===");

  if (data.attributes.type === "source.chargeable") {
    // GCash and GrabPay
    console.log("E-wallet Payment Chargeable");

    const sourceMetadata = data.attributes.data.attributes.metadata ?? {};

    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.PAYMONGO_SECRET as string
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: data.attributes.data.attributes.amount,
            source: {
              id: data.attributes.data.id,
              type: data.attributes.data.type,
            },
            description: data.attributes.data.attributes.description,
            currency: "PHP",
            statement_descriptor:
              data.attributes.data.attributes.statement_descriptor,
            // Forward the same metadata so the resulting Payment object
            // can be matched back to a registration/payment record too.
            metadata: sourceMetadata,
          },
        },
      }),
    };

    try {
      const res = await fetch("https://api.paymongo.com/v1/payments", options);
      const result = await res.json();
      console.log("Payment creation result:", result);
    } catch (err) {
      console.error("Payment creation failed:", err);
    }
  }

  if (data.attributes.type === "payment.paid") {
    console.log("Payment Paid");

    const metadata = data.attributes.data.attributes.metadata;
    const paymentRecordId = metadata?.paymentRecordId;

    if (!paymentRecordId) {
      console.error(
        "payment.paid received with no paymentRecordId in metadata — cannot match to a payment record.",
        metadata
      );
    } else {
      const result = await verifyScoutPayment(paymentRecordId, "paid");
      console.log("verifyScoutPayment result:", result);
    }
  }

  if (data.attributes.type === "payment.failed") {
    console.log("Payment Failed");

    const metadata = data.attributes.data.attributes.metadata;
    const paymentRecordId = metadata?.paymentRecordId;

    if (!paymentRecordId) {
      console.error(
        "payment.failed received with no paymentRecordId in metadata — cannot match to a payment record.",
        metadata
      );
    } else {
      const result = await verifyScoutPayment(paymentRecordId, "failed");
      console.log("verifyScoutPayment result:", result);
    }
  }

  return new NextResponse("Webhook Received", { status: 200 });
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}