import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
//import { sendWebhook } from "./sendWebhookSheet.ts";
import WebhookPayload from "./types/webhook_payload.ts";
import { PedidoService } from "./service/pedido_service.ts";
import { ItemService } from "./service/item_service.ts";

const pedidoService = new PedidoService();
const itemService = new ItemService();

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method não permitido", { status: 405 });
  }

  try {
    const payload: WebhookPayload = await req.json();
    const idPedidoTiny = payload.dados.id;

    const pedido = await pedidoService.obterPedidoById(idPedidoTiny);
  
    console.log("idpedido =", idPedidoTiny);
    const pedidoExists = await pedidoService.select(idPedidoTiny);
    console.log("pedidoExists:", pedidoExists);

    //await sendWebhook(payload);
    
    if (pedidoExists) {
      await pedidoService.update(pedido);
      await itemService.update(pedido);
      return new Response(`Pedido atualizado com sucesso ${pedido.numero}`, {status: 200});
    } else {
      await pedidoService.create(pedido);
      return new Response("Novo pedido inserido com sucesso", {status: 201});

    }
  } catch (error) {
    console.error("Erro ao processar o webhook:", error);
    return new Response(`Erro ao processar o pedido: ${error.message}`, {
      status: 500,
    });
  }
});
