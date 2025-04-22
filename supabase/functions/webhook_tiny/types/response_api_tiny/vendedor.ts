export interface ResponseApiTinyPesquisaVendedores {
  retorno: {
    status_processamento: number;
    status: string;
    codigo_erro?: number;
    erros?: Array<{ erro: string }>;
    pagina?: string;
    numero_pagina?: string;
    vendedores?: Array<{ vendedor: Vendedor }>;
  };
}
export interface Vendedor {
  id: number;
  codigo: number;
  nome: string;
  tipo_pessoa: string;
  fantasia: string;
  cpf_cnpj: string;
  email: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
  situacao: string;
}
export interface VendedorSupabase {
  id: string;
  id_tiny: number;
  nome: string;
  situacao: string;
  created_at: Date;
  updated_at: Date;
  equipe: string;
}
