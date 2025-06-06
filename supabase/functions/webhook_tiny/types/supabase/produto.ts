export interface ResponseProdutoSupabase extends RequestProdutoSupabase {
  id: string;
}


export interface RequestProdutoSupabase {
  id_tiny: number;
  nome?:string | null;
  codigo?:string | null;
  sku?:string | null;	
  tamanho?:string | null; 
  cor?:string | null;
  preco?:number | null;
  preco_custo?:number | null;
  unidade?:string | null;
  situacao?:string | null;
  data_criacao?:Date | null;
  tipo_variacao?:string | null;
  tempo_base_producao?:number | null;
  updated_at: Date;
}
