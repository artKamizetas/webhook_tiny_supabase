import { Item, ItemSupabase } from "../types/response_api_tiny/item.ts";
import {
  PedidoResponseApiTiny,
  PedidoSupabase,
} from "../types/response_api_tiny/pedido.ts";
import { ProdutoService } from "../service/produto_service.ts";
import { VendedorService } from "../service/vendedor_service.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js";

async function formatItemData(
  item: Item,
  pedidoSupabase: PedidoSupabase,
  supabase: SupabaseClient,
): Promise<ItemSupabase> {
  const produtoService = new ProdutoService(supabase);

  const produtos = await produtoService.select(item.id_produto);
  if (!produtos) {
    throw new Error(
      "Produto selecionado nao foi encontrado no banco de dados",
    );
  }
  const produto = produtos[0];

  if (!produto.id) {
    throw new Error("Produto selecionado não possui ID válido");
  }
  if (!pedidoSupabase.id) {
    throw new Error("Pedido Supabase selecionado nao possui ID");
  }

  return {
    id_pedido_tiny: pedidoSupabase.id_tiny,
    quantidade: Number(item.quantidade),
    valor: Number(item.valor_unitario),
    id_produto_tiny: Number(item.id_produto),
    layout: item.info_adicional ? item.info_adicional : null,
    updated_at: new Date(),
    id_pedido: pedidoSupabase.id,
    id_produto: produto.id,
  };
}

async function formatPedidoData(
  pedido_tiny: PedidoResponseApiTiny,
  supabase: SupabaseClient,
  method?: string,
): Promise<PedidoSupabase> {
  let existFirstOrderMarcador = false;

  if (!supabase) {
    throw new Error("Supabase client não fornecido a formatPedidoData");
  }
  const strDataPedido = pedido_tiny.data_pedido;
  const strDataPrevista = pedido_tiny.data_prevista;

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

  const vendedorService = new VendedorService(supabase);
  const id_vendedor = await vendedorService.fetchVendedorPorId(
    pedido_tiny.id_vendedor,
  );

  pedido_tiny.marcadores.forEach((marcador) => {
    if (marcador.marcador.id === "205753") existFirstOrderMarcador = true; // id do marcador 1²¡²³¤€¼½¾‘’¥×¶´«öç«»¬´¶ç
  });
  if(existFirstOrderMarcador){
    //clienteService.create(pedido_tiny.cliente);
  }

  if (method === "update") {
    const pedido = {
      id_tiny: Number(pedido_tiny.id),
      numero: Number(pedido_tiny.numero),
      id_vendedor,
      id_vendedor_tiny: Number(pedido_tiny.id_vendedor),
      data: dataPedidoConvertida,
      previsto: dataPrevistaConvertida,
      valor: Number(pedido_tiny.total_pedido),
      situacao: pedido_tiny.situacao,
      quantidade: pedido_tiny.itens
        .map((item) => Number(item.item.quantidade))
        .reduce((a, b) => a + b, 0),
      marcadores: pedido_tiny.marcadores.map((marcador) =>
        marcador.marcador.descricao
      ),
      observacoes: pedido_tiny.obs,
      codigo_cliente: Number(pedido_tiny.cliente.codigo),
      nome_fantasia: pedido_tiny.cliente.nome_fantasia,
      nome_cliente: pedido_tiny.cliente.nome,
      updated_at: new Date(),
    };
    return pedido;
  }

  const pedido = {
    id_tiny: Number(pedido_tiny.id),
    numero: Number(pedido_tiny.numero),
    id_vendedor,
    id_vendedor_tiny: Number(pedido_tiny.id_vendedor),
    data: dataPedidoConvertida,
    previsto: dataPrevistaConvertida,
    valor: Number(pedido_tiny.total_pedido),
    situacao: pedido_tiny.situacao,
    quantidade: pedido_tiny.itens
      .map((item) => Number(item.item.quantidade))
      .reduce((a, b) => a + b, 0),
    marcadores: pedido_tiny.marcadores.map((marcador) =>
      marcador.marcador.descricao
    ),
    observacoes: pedido_tiny.obs,
    codigo_cliente: Number(pedido_tiny.cliente.codigo),
    nome_fantasia: pedido_tiny.cliente.nome_fantasia,
    nome_cliente: pedido_tiny.cliente.nome,
  };
  return pedido;
}
export { formatItemData, formatPedidoData };
