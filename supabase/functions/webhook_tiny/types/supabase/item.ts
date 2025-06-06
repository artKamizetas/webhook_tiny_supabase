export interface ResponseItemSupabase extends RequestItemSupabase {
  id?: string;
  created_at?: Date;
}

export interface RequestItemSupabase {
  id_pedido_tiny: number;
  quantidade: number;
  valor: number;
  layout: string | null;
  id_produto_tiny: number;
  id_pedido: string;
  updated_at: Date;
  id_produto: string | null;
  id_status?: string;
  retrabalho?: boolean;
  etapa_producao?: string;
  id_lote_suprimento?: string;
  id_lote_corte?: string;
  id_lote_estamparia?: string;
  id_lote_embalagem?: string;
  data_conclusao?: string;
}