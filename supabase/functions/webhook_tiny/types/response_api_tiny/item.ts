export interface ItemWrapper {
  item: Item;
}

export interface Item {
  id_produto: number;	
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valor_unitario: number;
  info_adicional: string;
}