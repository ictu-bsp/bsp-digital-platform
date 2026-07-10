// src/app/payments/webhook/route.ts
// This file's exact name (route.ts) + its folder (webhook) is what
// turns this into the URL: /payments/webhook
//
// NOTE: DB writing is intentionally left as a TODO for now.
// When ready, this is where verifyScoutPayment() from
// src/app/actions/scouts.ts would get called on "payment.paid".

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();
  const data = payload.data;

  console.log("===Webhook triggered===");
  console.log(data);
  console.log("===webhook end===");

  if (data.attributes.type === "source.chargeable") {
    // GCash and GrabPay
    console.log("E-wallet Payment Chargeable");

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
    // All payment types (Card, QR Ph, and the GCash/GrabPay payment created above)
    console.log("Payment Paid");
    // TODO: call verifyScoutPayment(scoutId, data.attributes.data.id) here
    // once this webhook is wired to the database.
  }

  if (data.attributes.type === "payment.failed") {
    // Card / PayMaya failures
    console.log("Payment Failed");
  }

  return new NextResponse("Webhook Received", { status: 200 });
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
