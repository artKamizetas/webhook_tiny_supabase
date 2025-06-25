import {
  PedidoApiTinyObterPedidoById,
} from "../types/response_api_tiny/pedido.ts";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import { PedidoFormatter } from "../utils/formater.ts";
import { ResponsePedidoSupabase } from "../types/supabase/pedido.ts";
import { AppError } from "../utils/appError.ts"; 

class ItemService {
  private db: SupabaseServiceApi;
  private pedidoFormatter: PedidoFormatter;

  constructor(supabase: SupabaseClient) {
    this.db = new SupabaseServiceApi(supabase);
    this.pedidoFormatter = new PedidoFormatter(supabase);
  }

  async update(pedido: PedidoApiTinyObterPedidoById["pedido"]) {
    try {
      const id_tiny_pedido = pedido.id;
      console.log("🗑️ Deletando itens do pedido com ID Tiny:", id_tiny_pedido);
      await this.db.delete("itens", "id_pedido_tiny", id_tiny_pedido);
    } catch (error) {
      console.error("❌ Erro ao deletar em itens:", error);
      if (error instanceof Error) {
        throw new AppError(`Erro ao deletar em itens: ${error.message}`, 500);
      }
      throw new AppError("Erro desconhecido ao deletar em itens", 500);
    }

    await this.create(pedido);
    console.log("✅ Itens atualizados para pedido número:", pedido.numero);
  }

  async create(pedido_tiny: PedidoApiTinyObterPedidoById["pedido"]) {
    const pedidoSupabase: ResponsePedidoSupabase[] | null = await this.db
      .select("pedidos", { id_tiny: pedido_tiny.id });

    if (!pedidoSupabase) {
      throw new AppError(`Erro ao consultar pedido com ID Tiny: ${pedido_tiny.id}`, 500);
    }

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const itemDataArray = [];

    for (const item of pedido_tiny.itens) {
      const data = await this.pedidoFormatter.formatItem(
        item.item,
        pedidoSupabase[0],
      );
      itemDataArray.push(data);
      await sleep(1000); // Espera 1 segundo entre cada requisição
    }

    console.log("📝 Dados formatados para inserção em itens");
    try {
      await this.db.insert("itens", itemDataArray);
      console.log("🆕 Novos itens inseridos para pedido número:", pedido_tiny.numero);
    } catch (error) {
      console.error("❌ Erro ao inserir em itens:", error);
      if (error instanceof Error) {
        throw new AppError(`Erro ao inserir itens: ${error.message}`, 500);
      }
      throw new AppError("Erro desconhecido ao inserir itens. Pedido não foi finalizado.", 500);
    }
  }
}

export { ItemService };
