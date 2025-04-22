import { Item, ItemSupabase } from "../types/response_api_tiny/item.ts";
import { Pedido } from "../types/response_api_tiny/pedido.ts";
import { PedidoService } from "../service/pedido_service.ts";
import { ProdutoService } from "../service/produto_service.ts";
import { ProdutoSupabase } from "../types/response_api_tiny/produto.ts";

const pedidoService = new PedidoService();
const produtoService = new ProdutoService();

async function formatItemData(
  item: Item,
  pedido: Pedido,
): Promise<ItemSupabase> {
  
  const pedidosSupabase = await pedidoService.select(pedido.id);
  const produtos = await produtoService.select(item.id_produto);

  if (!pedidosSupabase || !produtos) {
    throw new Error(
      `Erro ao selecionar o pedido: ${pedido.numero} na função formatItemData`,
    );
  }
  const pedidoSupabase = pedidosSupabase[0]
  const produto = produtos[0]

  if (!produto.id) {
    throw new Error("Produto selecionado não possui ID válido");
  }


  return {
    id_pedido_tiny: pedido.id,
    quantidade: item.quantidade,
    valor: item.valor_unitario,
    id_produto_tiny: item.id_produto,
    updated_at: new Date().toISOString(),
    id_pedido: pedidoSupabase.id,
    id_produto: produto.id,
  };
}

export { formatItemData };
