import {
  PedidoApiTinyObterPedidoById,
} from "../types/response_api_tiny/pedido.ts";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import { PedidoFormatter } from "../utils/formater.ts";
import { ResponsePedidoSupabase } from "../types/supabase/pedido.ts";

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
      console.log("Deletando itens do pedido com ID Tiny:", id_tiny_pedido);
      await this.db.delete("itens", "id_pedido_tiny", id_tiny_pedido);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Erro ao deletar em itens:", error);
        throw new Error(`Erro ao deletar em itens: ${error.message}`);
      } else {
        console.error("Erro desconhecido ao deletar em itens:", error);
        throw new Error("Erro desconhecido ao deletar em itens");
      }
    }

    await this.create(pedido);
    console.log("itens atualizados:", pedido.numero);
  }

  async create(pedido_tiny: PedidoApiTinyObterPedidoById["pedido"]) {
    const pedidoSupabase: ResponsePedidoSupabase[] | null = await this.db
      .select("pedidos", { id_tiny: pedido_tiny.id });

    if (!pedidoSupabase) {
      throw new Error(`Erro ao consultar em pedidos: ${pedido_tiny.id}`);
    }

    const itemDataArray = await Promise.all(
      pedido_tiny.itens.map((item) =>
        this.pedidoFormatter.formatItem(item.item, pedidoSupabase[0])
      ),
    );
    console.log("Dados formatados para inserção em itens");
    try {
      await this.db.insert("itens", itemDataArray);
      console.log("Novo itens inseridos:", pedido_tiny.numero);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Erro ao inserir em itens:", error);
        throw new Error(`Erro ao inserir itens: ${error.message}`);
      } else {
        console.error("Erro desconhecido ao inserir em itens:", error);
        throw new Error(
          "Erro desconhecido ao inserir itens. Pedido não foi finalizado.",
        );
      }
    }
  }
}

export { ItemService };
