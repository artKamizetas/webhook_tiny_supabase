import {
  PedidoApiTinyObterPedidoById,
} from "../types/response_api_tiny/pedido.ts";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import { PedidoFormatter } from "../utils/formater.ts";
import { AppError } from "../utils/appError.ts"; 

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
    try {
      const logPedido = await this.pedidoFormatter.formatLogPedido(pedido_tiny);
      console.log("📝 LogPedido formatado para inserção");
      await this.db.insert("log_pedidos", logPedido);
    } catch (error) {
      console.error("❌ Erro ao criar LogPedido:", error);
      throw new AppError("Erro ao inserir log do pedido no banco de dados", 500);
    }
  }
}

export { LogPedidoService };
