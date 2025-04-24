import WebhookPayload from '../types/webhook_payload.ts'
import { proxyUrl } from '../env/index.ts';

export async function sendWebhook(data: WebhookPayload) {
  console.log("Enviando webhook...");
  try {
    await fetch(proxyUrl, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json", 
      },
      body: JSON.stringify(data), 
    });

    console.log("Webhook enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar webhook:", error);
  }
}
