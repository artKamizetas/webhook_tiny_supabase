import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { sendWebhook } from "./service/send_webhook_google_sheet.ts";
import WebhookPayload from "./types/webhook_payload.ts";
import { WebhookHandler } from "./webhook-handler.ts";


serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method não permitido", { status: 405 });
  }

  try {
    const payload: WebhookPayload = await req.json();

    if (!payload || !payload.dados || !payload.dados.id) {
      return new Response(
        JSON.stringify({ error: "Invalid payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    console.log("Payload recebido:", JSON.stringify(payload, null, 2));
    const webhookHandler = new WebhookHandler();
    await webhookHandler.initialize();
    const result = await webhookHandler.execute(payload);

    await sendWebhook(payload);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Erro ao processar o webhook:", error);
    return new Response(`Erro ao processar o pedido: ${error.message}`, {
      status: 500,
    });
  }
});
