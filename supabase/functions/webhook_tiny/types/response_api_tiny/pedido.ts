import { Item } from "./item.ts";

export interface ResponseApiTinyObterPedido {
  retorno: {
    status_processamento: string;
    status: string;
    codigo_erro?: number;
    erros?: Array<{ erro: string }>;
    pedido?: Pedido;
  };
}
export interface Pedido {
  id: number;
  numero: number;
  data_pedido: Date;
  data_prevista: Date;
  cliente: {
    nome: string;
    codigo: number;
    nome_fantasia: string | null;
    cpf_cnpj: number;
  };
  itens: Array<{ item: Item }>;
  marcadores: Array<{ marcador: Marcadores }>;
  total_pedido: number;
  situacao: string;
  obs: string;
  id_vendedor: number;
}
export interface PedidoSupabase {
  id:string;
  id_tiny: number;
  numero:number;
  codigo_cliente: number;
  nome_cliente: string;
  nome_fantasia: string;
  id_vendedor_tiny: number;
  data: Date;
  previsto: Date;
  valor: string;
  situacao: string;
  quantidade: number;
  marcadores: string;
  observacoes: string;
  oc: string;
  prorrogavel: string;
  prorgramado: string;
  trigger_movimento: string;
  observacoes_fabrica: string;
  created_at: Date;
  updated_at: Date;
  id_status: string;
  id_vendedor: string;
}

interface Marcadores {
  id: number;
  descricao: string;
  cor: string;
}