import { RetornoErroTiny } from "./error.ts";

export interface ResponseApiTinyObterContato {
  retorno: ContatoByIdTiny | RetornoErroTiny;
}
export interface ContatoByIdTiny {
  status_processamento: string;
  status: string;
  contato: {
    id: string;
    codigo: string;
    nome: string;
    fantasia: string;
    tipo_pessoa: string;
    cpf_cnpj: string;
    ie: string;
    rg: string;
    im: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    cidade: string;
    uf: string;
    pais: string;
    endereco_cobranca: string;
    numero_cobranca: string;
    complemento_cobranca: string;
    bairro_cobranca: string;
    cep_cobranca: string;
    cidade_cobranca: string;
    uf_cobranca: string;
    contatos: string;
    fone: string;
    fax: string;
    celular: string;
    email: string;
    email_nfe: string;
    site: string;
    crt: string;
    estadoCivil: string;
    profissao: string;
    sexo: string;
    data_nascimento: string;
    naturalidade: string;
    nome_pai: string;
    cpf_pai: string;
    nome_mae: string;
    cpf_mae: string;
    limite_credito: number;
    situacao: string;
    obs: string;
    data_atualizacao: string;
    tipos_contato: [
      {
        tipo: string;
      },
      {
        tipo: string;
      },
    ];
  };
}

export interface ResponseApiTinyPesquisaContato {
  retorno: {
    status_processamento: number;
    status: string;
    pagina: number;
    codigo_erro?: number;
    erros?: {
      erro: string;
    }[];
    numero_paginas: number;
    contatos: ContatoApiTinyPesquisa[];
  };
}

export interface ContatoApiTinyPesquisa {
  contato: {
    id?: number;
    codigo?: string;
    nome?: string;
    fantasia?: string;
    tipo_pessoa?: string;
    cpf_cnpj?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cep?: string;
    cidade?: string;
    uf?: string;
    email?: string;
    fone?: string;
    id_lista_preco?: number;
    id_vendedor?: number;
    nome_vendedor?: string;
    situacao?: string;
    data_criacao?: string; // Ex: "04/06/2025 12:34:56"
  };
}
