// src/app/payments/create-intent/route.ts
// This file's exact name (route.ts) + its folder (create-intent) is what
// turns this into the URL: /payments/create-intent

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const optionsIntent = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(
        process.env.PAYMONGO_SECRET as string
      ).toString("base64")}`,
    },
    body: JSON.stringify(body),
  };

  const response = await fetch(
    "https://api.paymongo.com/v1/payment_intents",
    optionsIntent
  );
  const data = await response.json(); 

  if (data.errors) {
    console.log(JSON.stringify(data.errors));
    return NextResponse.json({ errors: data.errors }, { status: 400 });
  }

  return NextResponse.json({ body: data });
}
