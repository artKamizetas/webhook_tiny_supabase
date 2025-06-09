import {
  PedidoApiTinyObterPedidoById,
  ResponseApiTinyObterPedidoById,
} from "../types/response_api_tiny/pedido.ts";
import { ApiTinyRequest } from "./api/tiny_service_api.ts";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.42.3?deno-compat";
import { PedidoFormatter } from "../utils/formater.ts";
import { ResponsePedidoSupabase } from "../types/supabase/pedido.ts";

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
      console.log(`Iniciando obtenção do pedido pelo ID: ${id}`);

      const response: ResponseApiTinyObterPedidoById = await this.apiTiny
        .APIobterPedido(id);

      console.log("Resposta recebida da API Tiny:");

      // Type guard para verificar se é um erro
      if ("codigo_erro" in response.retorno) {
        console.error("Erro ao obter pedido:", response.retorno.erros);
        throw new Error(
          `Erro da API Tiny: ${
            response.retorno.erros.map((e) => e.erro).join(", ")
          }`,
        );
      }

      // Verifica se o status e status_processamento indicam sucesso
      if (
        response.retorno.status === "OK" &&
        response.retorno.status_processamento === "3"
      ) {
        const pedido = response.retorno.pedido;
        return pedido;
      } else {
        console.error(
          "Erro ao obter pedido - status inválido:",
          response.retorno,
        );
        throw new Error(
          "Erro ao obter pedido: status ou processamento inválido",
        );
      }
    } catch (error) {
      console.error("Erro ao obter pedido:", error);
      throw new Error("Erro ao obter pedido");
    }
  }

  async update(
    pedido_tiny: PedidoApiTinyObterPedidoById["pedido"],
  ): Promise<number | undefined> {
    const pedidoAtualizado = await this.pedidoFormatter.formatPedido(
      pedido_tiny,
    );
    console.log("Pedido atualizado formatado.");
    await this.db.update("pedidos", pedidoAtualizado, {
      id_tiny: pedido_tiny.id,
    });

    return pedido_tiny.numero;
  }

  async create(
    pedido_tiny: PedidoApiTinyObterPedidoById["pedido"],
  ) {
    const pedido = await this.pedidoFormatter.formatPedido(pedido_tiny);
    console.log("Pedido formatado para inserção:", pedido);
    await this.db.insert("pedidos", pedido);

    const pedidoData: ResponsePedidoSupabase[] | null = await this.db.select(
      "pedidos",
      { id_tiny: pedido_tiny.id },
    );

    if (pedidoData && pedidoData.length > 0) {
      const id_pedido = pedidoData[0].id!;
      return id_pedido;
    } else {
      throw new Error(
        `Pedido com ID ${pedido_tiny.id} não encontrado após inserção.`,
      );
    }
  }

  async select(
    id_pedido_tiny: number,
  ): Promise<ResponsePedidoSupabase[] | null> {
    const pedido: ResponsePedidoSupabase[] | null = await this.db.select(
      "pedidos",
      { id_tiny: id_pedido_tiny },
    );
    if (!pedido || pedido.length === 0) {
      console.log(`Pedido com ID Tiny ${id_pedido_tiny} não encontrado.`);
      return null;
    }
    return pedido;
  }
}

export { PedidoService };
