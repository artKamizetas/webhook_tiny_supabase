import {
  PedidoApiTinyObterPedidoById,
  ResponseApiTinyObterPedidoById,
} from "../types/response_api_tiny/pedido.ts";
import { ApiTinyRequest } from "./api/tiny_service_api.ts";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import { PedidoFormatter } from "../utils/formater.ts";
import { ResponsePedidoSupabase } from "../types/supabase/pedido.ts";
import { AppError } from "../utils/appError.ts"; // Ajuste o caminho conforme necessário

class PedidoService {
  private db: SupabaseServiceApi;
  private pedidoFormatter: PedidoFormatter;
  private apiTiny: ApiTinyRequest = new ApiTinyRequest();

  constructor(supabase: SupabaseClient) {
    this.db = new SupabaseServiceApi(supabase);
    this.pedidoFormatter = new PedidoFormatter(supabase);
  }

  async obterPedidoById(
    id: number,
  ): Promise<PedidoApiTinyObterPedidoById["pedido"]> {
    try {
      console.log(`🔎 Iniciando obtenção do pedido pelo ID: ${id}`);

      const response: ResponseApiTinyObterPedidoById = await this.apiTiny.APIobterPedido(id);

      if ("codigo_erro" in response.retorno) {
        const msg = `Erro da API Tiny: ${response.retorno.erros.map((e) => e.erro).join(", ")}`;
        console.error(msg);
        throw new AppError(msg, 502);
      }

      if (
        response.retorno.status === "OK" &&
        response.retorno.status_processamento === "3"
      ) {
        return response.retorno.pedido;
      } else {
        const msg = "❌ Pedido com status ou processamento inválido na API Tiny";
        console.error(msg, response.retorno);
        throw new AppError(msg, 502);
      }
    } catch (error) {
      console.error("❌ Erro ao obter pedido:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erro interno ao obter pedido", 500);
    }
  }

  async update(
    pedido_tiny: PedidoApiTinyObterPedidoById["pedido"],
  ): Promise<number | undefined> {
    try {
      const pedidoAtualizado = await this.pedidoFormatter.formatPedido(pedido_tiny);
      console.log("📦 Pedido atualizado formatado.");
      await this.db.update("pedidos", pedidoAtualizado, {
        id_tiny: pedido_tiny.id,
      });
      return pedido_tiny.numero;
    } catch (error) {
      console.error("❌ Erro ao atualizar pedido:", error);
      throw new AppError("Erro ao atualizar pedido", 500);
    }
  }

  async create(
    pedido_tiny: PedidoApiTinyObterPedidoById["pedido"],
  ): Promise<string> {
    try {
      const pedido = await this.pedidoFormatter.formatPedido(pedido_tiny);
      console.log("📥 Pedido formatado para inserção:", pedido);
      await this.db.insert("pedidos", pedido);

      const pedidoData: ResponsePedidoSupabase[] | null = await this.db.select(
        "pedidos",
        { id_tiny: pedido_tiny.id },
      );

      if (pedidoData && pedidoData.length > 0) {
        return pedidoData[0].id;
      } else {
        throw new AppError(
          `Pedido com ID ${pedido_tiny.id} não encontrado após inserção.`,
          404,
        );
      }
    } catch (error) {
      console.error("❌ Erro ao criar pedido:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Erro interno ao criar pedido", 500);
    }
  }

  async select(
    id_pedido_tiny: number,
  ): Promise<ResponsePedidoSupabase[] | null> {
    try {
      const pedido: ResponsePedidoSupabase[] | null = await this.db.select(
        "pedidos",
        { id_tiny: id_pedido_tiny },
      );
      if (!pedido || pedido.length === 0) {
        console.log(`ℹ️ Pedido com ID Tiny ${id_pedido_tiny} não encontrado.`);
        return null;
      }
      return pedido;
    } catch (error) {
      console.error("❌ Erro ao buscar pedido no banco:", error);
      throw new AppError("Erro ao buscar pedido", 500);
    }
  }
}

export { PedidoService };
