import { Pedido, PedidoSupabase } from "../types/response_api_tiny/pedido.ts";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js";
import { formatItemData } from "../utils/index .ts";

class ItemService {
  private db: SupabaseServiceApi;
  private supabase: SupabaseClient;
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.db = new SupabaseServiceApi(supabase);
  }

  async update(pedido: Pedido) {
    try {
      const id_tiny_pedido = pedido.id;
      await this.db.delete("itens", "id_pedido_tiny", id_tiny_pedido);
    } catch (error) {
      console.error("Erro ao deletar em itens:", error);
      throw new Error(`Erro ao deletar em itens: ${error.message}`);
    }
    await this.create(pedido);

    console.log("itens atualizados:", pedido.numero);
  }

  async create(pedido_tiny: Pedido) {
    const pedidoSupabase: PedidoSupabase[] | null = await this.db.select(
      "pedidos",
      "id_tiny",
      pedido_tiny.id,
    );

    if (!pedidoSupabase) {
      throw new Error(`Erro ao consultar em pedidos: ${pedido_tiny.id}`);
    }
    const itemDataArray = await Promise.all(
      pedido_tiny.itens.map((item) =>
        formatItemData(item.item, pedidoSupabase[0], this.supabase)
      ),
    );
    try {
      await this.db.insert("itens", itemDataArray);
      console.log("Novo pedido inserido:", pedido_tiny.numero);
    } catch (error) {
      console.error("Erro ao inserir em itens:", error);
      throw new Error("Erro ao inserir itens. Pedido não foi finalizado.");
    }
  }
}

export { ItemService };
