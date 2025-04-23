import WebhookPayload from "./types/webhook_payload.ts";
import { PedidoService } from "./service/pedido_service.ts";
import { ItemService } from "./service/item_service.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js";
import { authenticateUser } from "./middleware/auth.ts";

export class WebhookHandler {
  private pedidoService: PedidoService;
  private itemService: ItemService;
  private supabase: SupabaseClient;

  // O construtor não é mais assíncrono
  constructor() {
    this.supabase = null as unknown as SupabaseClient; // Inicializa a variável supabase como "não inicializada"
    this.pedidoService = {} as PedidoService;
    this.itemService = {} as ItemService;
  }

  // Método assíncrono para inicializar a classe
  async initialize() {
    const { supabase } = await authenticateUser();
    console.log("Supabase autenticado:", supabase);

    // Agora que o supabase foi autenticado, podemos inicializar os serviços
    this.supabase = supabase;
    console.log("SupabaseClient recebido no WebhookHandler:", supabase);
    this.pedidoService = new PedidoService(supabase);
    this.itemService = new ItemService(supabase);
  }

  async execute(
    payload: WebhookPayload,
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log("=== Início do processamento do webhook ===");
      console.log("Payload recebido:", JSON.stringify(payload, null, 2));

      const pedidoId = payload.dados.id;
      console.log(`Buscando pedido completo na API Tiny pelo ID: ${pedidoId}`);

      const pedido = await this.pedidoService.obterPedidoById(pedidoId);
      console.log(
        "Pedido obtido da API Tiny:",
        JSON.stringify(pedido, null, 2),
      );

      console.log(
        `Verificando se o pedido ID ${pedido.id} já existe no banco de dados...`,
      );
      const existingPedido = await this.pedidoService.select(pedido.id);

      if (existingPedido) {
        console.log(`Pedido ${pedido.id} já existe. Atualizando...`);
        await this.pedidoService.update(pedido);
        console.log(
          `Pedido ${pedido.id} atualizado com sucesso na tabela pedidos.`,
        );

        await this.itemService.update(pedido);
        console.log(`Itens do pedido ${pedido.id} atualizados com sucesso.`);

        return {
          success: true,
          message: `Pedido ${pedido.numero} atualizado com sucesso`,
        };
      } else {
        console.log(
          `Pedido ${pedido.id} não encontrado. Inserindo novo pedido...`,
        );
        await this.pedidoService.create(pedido);
        console.log(
          `Pedido ${pedido.id} inserido com sucesso na tabela pedidos.`,
        );

        await this.itemService.create(pedido);
        console.log(`Itens do pedido ${pedido.id} inseridos com sucesso.`);

        return {
          success: true,
          message: `Pedido ${pedido.id} inserido com sucesso`,
        };
      }
    } catch (error) {
      console.error("Erro ao processar o webhook:", error);
      return {
        success: false,
        message: `Error processing webhook: ${error.message}`,
      };
    } finally {
      console.log("=== Fim do processamento do webhook ===");
    }
  }
}
