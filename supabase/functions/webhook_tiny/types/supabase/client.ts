export interface ResponseClientSupabase extends RequestClientSupabase {
  id: string;
  created_at: Date;
}

export interface RequestClientSupabase {
  id_tiny: number | null;
  codigo: number | null;
  nome: string | null;
  nome_fantasia: string | null;
  tipo: string | null;
  cpf_cnpj: number | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: number | null;
  cidade: string | null;
  uf: string | null;
  email: string | null;
  fone: number | null;
  id_vendedor_bling: number | null;
  situacao: string | null;
}