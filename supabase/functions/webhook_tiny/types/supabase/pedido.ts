export interface ResponsePedidoSupabase extends RequestPedidoSupabase {
  id: string;
  created_at: Date;
}

export interface RequestPedidoSupabase {
  id_tiny: number;
  numero: number;
  codigo_cliente: number;
  nome_cliente: string;
  nome_fantasia: string | null;
  id_vendedor_tiny: number;
  data: Date;
  previsto: Date;
  valor: number;
  situacao: string;
  quantidade: number;
  marcadores: string[];
  observacoes: string;
  oc: string | null;
  prorrogavel: string | null;
  programado: string | null;
  trigger_movimento: string | null;
  observacoes_fabrica: string | null;
  updated_at: Date;
  id_status?: string;
  id_vendedor: string | null;
  id_cliente: string | null;
  frete_por_conta: string | null;
  forma_envio: string | null;
  forma_frete: string | null;
  valor_frete: string | null;
}
