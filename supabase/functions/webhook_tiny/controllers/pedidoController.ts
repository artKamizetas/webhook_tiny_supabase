import { Pedido, PedidoSupabase } from "../types/response_api_tiny/pedido.ts";
//import { ItensController } from "./itensController.ts";
import { SupabaseServiceApi } from "../service/api/supabase_service_api.ts";
import { VendedorService } from "../service/vendedor_service.ts";

const supabase = new SupabaseServiceApi();
//const itensController = new ItensController();
const vendedorService = new VendedorService();

class PedidoController {

  async create(pedido_tiny: Pedido) {
   
    const id_vendedor = await vendedorService.fetchVendedorPorId(pedido_tiny.id_vendedor);
    
    const pedido ={
      id_tiny: pedido_tiny.id,
      numero: pedido_tiny.numero,
      id_vendedor,
      id_vendedor_tiny: pedido_tiny.id_vendedor,
      data: pedido_tiny.data_pedido,
      previsto: pedido_tiny.data_prevista,
      valor: Number(pedido_tiny.total_pedido),
      situacao: pedido_tiny.situacao,
      quantidade: pedido_tiny.itens.map((item) =>
        Number(item.item.quantidade)
      ).reduce((a, b) => a + b, 0),
      marcadores: pedido_tiny.marcadores.map((marcador) =>
        marcador.marcador.descricao
      ),
      observacoes: pedido_tiny.obs,
      codigo_cliente: pedido_tiny.cliente.codigo,
      nome_fantasia: pedido_tiny.cliente.nome_fantasia,
      nome_cliente: pedido_tiny.cliente.nome
    }

    await supabase.insert("pedidos", pedido);

    const pedidoData: PedidoSupabase[]| null = await supabase.select("pedidos", "id_tiny", pedido_tiny.id);
   
    let id_pedido;
    
    if(pedidoData) {
      id_pedido = pedidoData[0].id;
    }
    
    return id_pedido;
  }
  async update(pedido_tiny: Pedido): Promise<number | {}> {
    try {
      const id_vendedor = await vendedorService.fetchVendedorPorId(pedido_tiny.id_vendedor);
      
      const pedidoAtualizado = {
        id_tiny: pedido_tiny.id,
        numero: pedido_tiny.numero,
        id_vendedor,
        id_vendedor_tiny: pedido_tiny.id_vendedor,
        data: pedido_tiny.data_pedido,
        previsto: pedido_tiny.data_prevista,
        valor: Number(pedido_tiny.total_pedido),
        situacao: pedido_tiny.situacao,
        quantidade: pedido_tiny.itens.map((item) =>
          Number(item.item.quantidade)
        ).reduce((a, b) => a + b, 0),
        marcadores: pedido_tiny.marcadores.map((marcador) =>
          marcador.marcador.descricao
        ),
        observacoes: pedido_tiny.obs,
        codigo_cliente: pedido_tiny.cliente.codigo,
        nome_fantasia: pedido_tiny.cliente.nome_fantasia,
        nome_cliente: pedido_tiny.cliente.nome,
        updated_at: new Date().toISOString(),
      };
      await supabase.update('pedidos', pedidoAtualizado, { id_tiny: pedido_tiny.id });
      return pedido_tiny.numero;
    } catch (error) {
      console.error(error.message);
      return { success: false, message: error.message };
    }
  }
  async select(id_pedido_tiny: number): Promise<PedidoSupabase[]| null> {
    try {
      const pedido: PedidoSupabase[]| null = await supabase.select('pedidos', 'id_tiny', id_pedido_tiny);
      console.log("pedido selecionado:", pedido)
     return pedido
    } catch (err) {
      console.error("Erro inesperado:", err);
      throw new Error(`Erro select PedidoController: ${err.message}`);
    }
  }
}

export { PedidoController };
