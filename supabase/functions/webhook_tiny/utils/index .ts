import { Item, ItemSupabase } from "../types/response_api_tiny/item.ts";
import { Pedido, PedidoSupabase } from "../types/response_api_tiny/pedido.ts";
import { ProdutoService } from "../service/produto_service.ts";
import { VendedorService } from "../service/vendedor_service.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js";
import { PedidoService } from "../service/pedido_service.ts";

async function formatItemData(
  item: Item,
  pedido: Pedido,
  supabase: SupabaseClient,
): Promise<ItemSupabase> {
  
  const produtoService = new ProdutoService();
  const pedidoService = new PedidoService(supabase);
  const pedidosSupabase = await pedidoService.select(pedido.id);
  const produtos = await produtoService.select(item.id_produto);

  if (!pedidosSupabase || !produtos) {
    throw new Error(
      `Erro ao selecionar o pedido: ${pedido.numero} na função formatItemData`,
    );
  }
  const pedidoSupabase = pedidosSupabase[0];
  const produto = produtos[0];

  if (!produto.id) {
    throw new Error("Produto selecionado não possui ID válido");
  }
  if(!pedidoSupabase.id) {
    throw new Error("Pedido Supabase selecionado nao possui ID");
  }

  return {
    id_pedido_tiny: pedido.id,
    quantidade: item.quantidade,
    valor: item.valor_unitario,
    id_produto_tiny: item.id_produto,
    updated_at: new Date(),
    id_pedido: pedidoSupabase.id,
    id_produto: produto.id,
  };
}

async function formatPedidoData(
  pedido_tiny: Pedido,
  supabase: SupabaseClient,
  method?: string,
): Promise<PedidoSupabase> {

  if (!supabase) throw new Error("Supabase client não fornecido a formatPedidoData");

  const vendedorService = new VendedorService(supabase);
  const id_vendedor = await vendedorService.fetchVendedorPorId(
    pedido_tiny.id_vendedor,
  );
  if (method === "update") {
    const pedido = {
      id_tiny: pedido_tiny.id,
      numero: pedido_tiny.numero,
      id_vendedor,
      id_vendedor_tiny: pedido_tiny.id_vendedor,
      data: pedido_tiny.data_pedido,
      previsto: pedido_tiny.data_prevista,
      valor: Number(pedido_tiny.total_pedido),
      situacao: pedido_tiny.situacao,
      quantidade: pedido_tiny.itens.map((item) => Number(item.item.quantidade))
        .reduce((a, b) => a + b, 0),
      marcadores: pedido_tiny.marcadores.map((marcador) =>
        marcador.marcador.descricao
      ),
      observacoes: pedido_tiny.obs,
      codigo_cliente: pedido_tiny.cliente.codigo,
      nome_fantasia: pedido_tiny.cliente.nome_fantasia,
      nome_cliente: pedido_tiny.cliente.nome,
      updated_at: new Date(),
    };
    return pedido;
  }

  const pedido = {
    id_tiny: pedido_tiny.id,
    numero: pedido_tiny.numero,
    id_vendedor,
    id_vendedor_tiny: pedido_tiny.id_vendedor,
    data: pedido_tiny.data_pedido,
    previsto: pedido_tiny.data_prevista,
    valor: Number(pedido_tiny.total_pedido),
    situacao: pedido_tiny.situacao,
    quantidade: pedido_tiny.itens
      .map((item) => Number(item.item.quantidade))
      .reduce((a, b) => a + b, 0),
    marcadores: pedido_tiny.marcadores.map((marcador) =>
      marcador.marcador.descricao
    ),
    observacoes: pedido_tiny.obs,
    codigo_cliente: pedido_tiny.cliente.codigo,
    nome_fantasia: pedido_tiny.cliente.nome_fantasia,
    nome_cliente: pedido_tiny.cliente.nome,
  };
  return pedido;
}
export { formatItemData, formatPedidoData };
