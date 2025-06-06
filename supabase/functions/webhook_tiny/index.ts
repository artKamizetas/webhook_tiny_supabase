import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { sendWebhook } from "./service/send_webhook_google_sheet.ts";
import WebhookPayload from "./types/webhook_payload.ts";
import { WebhookHandler } from "./webhook-handler.ts";

serve(async (req: Request): Promise<Response> => {
  const jsonHeader = { "Content-Type": "application/json" };

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers: jsonHeader },
    );
  }

  try {
    // Lê corpo cru para tratar requisições vazias (ex: verificação do Tiny)
    const rawBody = await req.text();

    if (!rawBody) {
      console.warn("⚠️ Requisição POST sem body — possível verificação do Tiny");
      return new Response(
        JSON.stringify({ message: "Ping recebido sem body" }),
        { status: 200, headers: jsonHeader },
      );
    }

    const payload: WebhookPayload = JSON.parse(rawBody);

    if (!payload?.dados?.id) {
      return new Response(
        JSON.stringify({ error: "Payload inválido: 'dados.id' ausente" }),
        { status: 400, headers: jsonHeader },
      );
    }

    console.log("📦 Payload recebido do pedido Tiny:", payload.dados.id);

    const handler = new WebhookHandler();
    await handler.initialize();

    const result = await handler.execute(payload);
    await sendWebhook(payload); // Executa envio ao Google Sheet

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: jsonHeader },
    );

  } catch (error) {
    console.error("❌ Erro ao processar o webhook:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      { status: 500, headers: jsonHeader },
    );
  }
});
