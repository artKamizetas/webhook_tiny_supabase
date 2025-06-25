import WebhookPayload from "./types/webhook_payload.ts";
import { PedidoService } from "./service/pedido_service.ts";
import { ItemService } from "./service/item_service.ts";
import { authenticateUser } from "./middleware/auth.ts";
import { LogPedidoService } from "./service/log_pedidos.ts";

export class WebhookHandler {
  private pedidoService!: PedidoService;
  private itemService!: ItemService;
  private logPedidoService!: LogPedidoService;

  async initialize() {
    const { supabase } = await authenticateUser();
    this.pedidoService = new PedidoService(supabase);
    this.itemService = new ItemService(supabase);
    this.logPedidoService = new LogPedidoService(supabase);
  }

  async execute(
    payload: WebhookPayload,
  ): Promise<{ success: boolean; message: string }> {
    console.log("=== Início do processamento do webhook ===");

    try {
      const pedidoId = payload.dados.id;
      console.log(`Buscando pedido completo na API Tiny pelo ID: ${pedidoId}`);

      const pedido = await this.pedidoService.obterPedidoById(pedidoId);

      console.log(
        `Verificando se o pedido ID ${pedido.id} já existe no banco de dados...`,
      );
      const exists = await this.pedidoService.select(pedido.id);

      if (exists) {
        console.log(`Pedido ${pedido.id} já existe. Atualizando...`);
        await this.pedidoService.update(pedido);
        await this.itemService.update(pedido);
        const action = "atualizado";
        console.log(`Pedido ${pedido.id} ${action} com sucesso.`);
        console.log(`Itens do pedido ${pedido.id} ${action} com sucesso.`);
        await this.logPedidoService.create(pedido);
        return {
          success: true,
          message: `Pedido ${pedido.numero} ${action} com sucesso`,
        };
      }

      console.log(
        `Pedido ${pedido.id} não encontrado. Inserindo novo pedido...`,
      );
      await this.pedidoService.create(pedido);
      await this.itemService.create(pedido);
      console.log(`Pedido ${pedido.id} inserido com sucesso.`);
      console.log(`Itens do pedido ${pedido.id} inserido com sucesso.`);
      await this.logPedidoService.create(pedido);
      return {
        success: true,
        message: `Pedido ${pedido.numero} inserido com sucesso`,
      };
    } catch (error) {
      const message = error instanceof Error
        ? `Erro ao processar o webhook: ${error.message}`
        : "Erro desconhecido ao processar o webhook.";

      console.error(message, error);
      return { success: false, message };
    } finally {
      console.log("=== Fim do processamento do webhook ===");
    }
  }
}
