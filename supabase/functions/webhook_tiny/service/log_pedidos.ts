import {
  PedidoApiTinyObterPedidoById,
} from "../types/response_api_tiny/pedido.ts";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import { PedidoFormatter } from "../utils/formater.ts";

class LogPedidoService {
  private db: SupabaseServiceApi;
  private pedidoFormatter: PedidoFormatter;

  constructor(supabase: SupabaseClient) {
    this.db = new SupabaseServiceApi(supabase);
    this.pedidoFormatter = new PedidoFormatter(supabase);
  }

  async create(
    pedido_tiny: PedidoApiTinyObterPedidoById["pedido"],
  ) {
    const logPedido = await this.pedidoFormatter.formatLogPedido(pedido_tiny);
    console.log("LogPedido formatado para inserção");
    try {
      await this.db.insert("log_pedidos", logPedido);
    } catch (error) {
      console.error("Erro ao criar Log:", error);
      throw new Error("Erro ao inserir pedido no banco de dados");
    }

    return;
  }
}

export { LogPedidoService };
