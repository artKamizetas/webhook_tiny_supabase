export interface ResponseAPIObterProdutoById {
  retorno: {
    status_processamento: number;
    status: string;
    codigo_erro?: number;
    erros?: Array<{ erro: string }>;
    pagina?: string;
    numero_pagina?: string;
    produto: ProdutoApiObterProdutoById;
  };
}
export interface ProdutoApiObterProdutoById {
  id: number;
  codigo: string;
  nome: string;
  unidade: string;
  preco: number;
  preco_promocional: number;
  ncm: string;
  origem: string;
  gtin: string;
  gtin_embalagem: string;
  localizacao: string;
  peso_liquido: number;
  peso_bruto: number;
  estoque_minimo: number;
  estoque_maximo: number;
  id_fornecedor: number;
  codigo_fornecedor: string;
  codigo_pelo_fornecedor: string;
  unidade_por_caixa: string;
  preco_custo: number;
  preco_custo_medio: number;
  situacao: string;
  tipo: string;
  classe_ipi: string;
  valor_ipi_fixo: string;
  cod_lista_servicos: string;
  descricao_complementar: string;
  obs: string;
  garantia: string;
  cest: string;
  tipoVariacao: string;
  variacoes: Array<{ variacao: Variacao }>;
  idProdutoPai: string;
  sob_encomenda: string;
  marca: string;
  tipoEmbalagem: string;
  alturaEmbalagem: string;
  comprimentoEmbalagem: string;
  larguraEmbalagem: string;
  diametroEmbalagem: string;
  categoria: string;
  anexos: Array<{ anexo: string }>;
  imagens_externas: Array<{ imagem_externa: ImagemExterna }>;
  classe_produto: string;
  dataCriacao: string;
}

export interface Variacao {
  id: string;
  codigo: string;
  preco: string;
  grade: {
    Tamanho: string;
    Cor: string;
  };
}

export interface ImagemExterna {
  url: string;
}


