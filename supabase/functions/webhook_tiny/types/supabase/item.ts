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
}