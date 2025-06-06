import { ItemWrapper } from "./item.ts";
import { RetornoErroTiny } from "./error.ts";

export interface ResponseApiTinyObterPedidoById {
  retorno: PedidoApiTinyObterPedidoById | RetornoErroTiny;
}

export interface PedidoApiTinyObterPedidoById {
  status_processamento: string;
  status: string;
  pedido: {
    id: number;
    numero: number;
    data_pedido: string;
    data_prevista: string;
    data_faturamento: string;
    cliente: Cliente;
    itens: ItemWrapper[];
    parcelas: ParcelaWrapper[];
    marcadores: MarcadorWrapper[];
    condicao_pagamento: string;
    forma_pagamento: string;
    meio_pagamento: string;
    nome_transportador: string;
    frete_por_conta: string;
    valor_frete: string;
    valor_desconto: string;
    total_produtos: string;
    total_pedido: string;
    numero_ordem_compra: string;
    deposito: string;
    forma_envio: string;
    forma_frete: string;
    situacao: string;
    obs: string;
    id_vendedor: number;
    nome_vendedor: string;
    codigo_rastreamento: string;
    url_rastreamento: string;
    id_nota_fiscal: string;
  };
}

export interface Cliente {
  codigo: string;
  nome: string;
  nome_fantasia: string;
  tipo_pessoa: string;
  cpf_cnpj: string;
  ie: string;
  rg: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
  fone: string;
}

interface ParcelaWrapper {
  parcela: Parcela;
}

interface Parcela {
  dias: string;
  data: string;
  valor: string;
  obs: string;
}

interface MarcadorWrapper {
  marcador: Marcador;
}

interface Marcador {
  id: string;
  descricao: string;
  cor: string;
}
