import { SupabaseServiceApi } from "../service/api/supabase_service_api.ts";
import { ItemSupabase } from "../types/response_api_tiny/item.ts";
import { Pedido, PedidoSupabase } from "../types/response_api_tiny/pedido.ts";
import { formatItemData } from "../utils/index .ts";

const supabase = new SupabaseServiceApi();

class ItemController {
  async create(pedido_tiny: Pedido) {
    
    const pedidoData: PedidoSupabase[] | null = await supabase.select(
      'pedidos',
      "id_tiny",
      pedido_tiny.id,
    );

    if (!pedidoData) {
      throw new Error(`Erro ao consultar em pedidos: ${pedido_tiny.id}`);
    }
    
    const itemDataArray = pedido_tiny.itens.map(item => formatItemData(item.item, pedido_tiny));

    try{
      await supabase.insert('itens', itemDataArray);
    } catch (error) {
      console.error("Erro ao inserir em itens:", error);
    }
  }

  async delete(id_pedido_tiny: number) {
    try {
      await supabase.delete('itens', "id_pedido_tiny", id_pedido_tiny);
    } catch (error) {
      console.error("Erro ao deletar em itens:", error);
      throw new Error(`Erro ao deletar em itens: ${error.message}`);
    }
  }
  async select(id_pedido_tiny: number) {
    try {
      const itens: ItemSupabase[] | null = await supabase.select(
        'itens',
        "id_pedido_tiny",
        id_pedido_tiny,
      );

      return itens;
    } catch (err) {
      console.error("Erro ao consultar em itens:", err);
      throw new Error(`Erro ao consultar em itens: ${err.message}`);
    }
  }
}

export { ItemController };
