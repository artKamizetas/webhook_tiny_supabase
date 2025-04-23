import {
  Pedido,
  PedidoSupabase,
  ResponseApiTinyObterPedido,
} from "../types/response_api_tiny/pedido.ts";
import { ApiTinyRequest } from "./api/tiny_service_api.ts";
import { SupabaseServiceApi } from "./api/supabase_service_api.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js";
import { formatPedidoData } from "../utils/index .ts";

const apiTiny = new ApiTinyRequest();

class PedidoService {
  private db: SupabaseServiceApi
  private supabase : SupabaseClient
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.db = new SupabaseServiceApi(supabase);
  }

  async obterPedidoById(id: number): Promise<Pedido> {
    try {
      console.log(`Iniciando obtenção do pedido pelo ID: ${id}`);

      const response: ResponseApiTinyObterPedido = await apiTiny.APIobterPedido(id);
      console.log(
        "Resposta recebida da API Tiny:",
        JSON.stringify(response, null, 2),
      );

      if (response.retorno.status === "OK" && response.retorno.pedido) {
        const strDataPedido = response.retorno.pedido.data_pedido;
        const strDataPrevista = response.retorno.pedido.data_prevista;

        console.log(`Convertendo data do pedido: ${strDataPedido}`);
        const [diaPedido, mesPedido, anoPedido] = strDataPedido.split("/");
        const dataPedidoConvertida = new Date(
          Number(anoPedido),
          Number(mesPedido) - 1,
          Number(diaPedido),
        );

        console.log(`Convertendo data prevista de entrega: ${strDataPrevista}`);
        const [diaPrevista, mesPrevista, anoPrevista] = strDataPrevista.split(
          "/",
        );
        const dataPrevistaConvertida = new Date(
          Number(anoPrevista),
          Number(mesPrevista) - 1,
          Number(diaPrevista),
        );

        const pedido: Pedido = {
          ...response.retorno.pedido,
          data_pedido: dataPedidoConvertida,
          data_prevista: dataPrevistaConvertida,
        };

        console.log(
          "Pedido formatado com sucesso:",
          JSON.stringify(pedido, null, 2),
        );
        return pedido;
      } else {
        console.error(
          "Erro ao obter pedido - resposta inválida:",
          response.retorno.erros,
        );
        throw new Error("Erro ao obter pedido: resposta inválida da API Tiny");
      }
    } catch (error) {
      console.error("Erro ao obter pedido:", error);
      throw new Error("Erro ao obter pedido");
    }
  }

  async update(pedido_tiny: Pedido) {
    try {
      const pedidoAtualizado = await formatPedidoData(pedido_tiny,this.supabase,"update"); 

      await this.db.update('pedidos', pedidoAtualizado, { id_tiny: pedido_tiny.id });

      console.log("Pedido atualizado:", pedidoAtualizado.numero);
      return pedido_tiny.numero;
    } catch (error) {
      console.error(error.message);
      return { success: false, message: error.message };
    }
    
  }

  async create(pedido_tiny: Pedido): Promise<string> {
    try {
      
      const pedido = await formatPedidoData(pedido_tiny,this.supabase);
  
      await this.db.insert("pedidos", pedido);
  
      const pedidoData: PedidoSupabase[] | null = await this.db.select("pedidos", "id_tiny", pedido_tiny.id);
  
      if (pedidoData && pedidoData.length > 0) {
        const id_pedido = pedidoData[0].id!;
        return id_pedido;
      } else {
        throw new Error(`Pedido com ID ${pedido_tiny.id} não encontrado após inserção.`);
      }
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      throw new Error(`Erro ao criar pedido: ${error.message}`);
    }
  }
  
  async select(id_pedido_tiny: number) {
    try {
      const pedido: PedidoSupabase[] | null = await this.db.select(
        "pedidos",
        "id_tiny",
        id_pedido_tiny,
      );
      console.log("pedido selecionado:", pedido);
      return pedido;
    } catch (err) {
      console.error("Erro inesperado:", err);
      throw new Error(`Erro select pedidoService: ${err.message}`);
    }
  }
}

export { PedidoService };
