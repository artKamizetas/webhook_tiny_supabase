export interface ResponseVendedorSupabase  extends RequestVendedorSupabase {
  id: string;
  created_at: Date;
}

export interface RequestVendedorSupabase {
  id_tiny: number;
  nome: string;
  situacao: string;
  updated_at: Date;
  equipe: string;
  senioridade_id:string
}
