import WebhookPayload from '../types/webhook_payload.ts';
import { proxyUrl } from '../env/index.ts';
import { AppError } from '../utils/appError.ts'; 

export async function sendWebhook(data: WebhookPayload) {
  console.log("Enviando webhook...");

  try {
    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const texto = await response.text();
      console.error("Resposta inválida do webhook:", texto);
      throw new AppError(`Erro ao enviar webhook: ${response.statusText}`, response.status);
    }

    console.log("Webhook enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar webhook:", error);
    if (error instanceof AppError) throw error;
    throw new AppError("Falha ao tentar enviar o webhook", 500);
  }
}
