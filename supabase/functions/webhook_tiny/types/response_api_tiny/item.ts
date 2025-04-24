export interface Item {
  id_produto: string;
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: string;
  valor_unitario: string;
}

export interface ItemSupabase {
  id?: string;
  id_pedido_tiny: number;
  quantidade: number;
  valor: number;
  layout?: string;
  created_at?: Date;
  id_produto_tiny: number;
  id_pedido: string;
  updated_at: Date;
  id_produto: string;
  id_status?: string;
  retrabalho?: boolean;
  etapa_producao?: string;
  id_lote_suprimento?: string;
  id_lote_corte?: string;
  id_lote_estamparia?: string;
  id_lote_embalagem?: string;
  data_conclusao?: string;
}



