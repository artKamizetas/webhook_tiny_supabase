import { Pedido, ResponseApiTinyObterPedido, PedidoSupabase} from "../types/response_api_tiny/pedido.ts";
import { ApiTinyRequest } from "./api/tiny_service_api.ts";
import { PedidoController } from "../controllers/pedidoController.ts";

const api = new ApiTinyRequest();
const pedidoController = new PedidoController();

class PedidoService {
  async obterPedidoById(id: number): Promise<Pedido> {
    try {
      const response:ResponseApiTinyObterPedido = await api.APIobterPedido(id);

      if (response.retorno.status == "OK" && response.retorno.pedido) {
        return response.retorno.pedido;
      } else {
        console.log("Erro ao obter pedido:", response.retorno.erros);
        throw new Error("Erro ao obter pedido");
      }
    } catch (error) {
      console.error("Erro ao obter pedido:", error);
      throw new Error("Erro ao obter pedido");
    }
  }

  async update(pedido: Pedido) {
    await pedidoController.update(pedido);
    console.log("Pedido atualizado:", pedido.numero);
  }

  async create(pedido: Pedido) {
    await pedidoController.create(pedido);
    console.log("Novo pedido inserido:", pedido.numero);
    
  }
  async select(id_pedido_tiny: number) {
    try{
      const pedido: PedidoSupabase[]| null = await pedidoController.select(id_pedido_tiny);
      
      if(!pedido) {
        console.log("Pedido não encontrado:", id_pedido_tiny);
      }
      return pedido
    } catch (err) {
      console.error("Erro ao selecionar o pedido:", err);
      throw new Error("Erro ao selecionar o pedido");
    }
  }
}

export { PedidoService };
