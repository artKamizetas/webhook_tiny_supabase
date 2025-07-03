import { Item } from "../types/response_api_tiny/item.ts";

export interface DescricaoSeparada {
  produto: string;
  tamanho: string;
  cor: string;
}

function separarDescricao(desc: string | null): DescricaoSeparada | null {
  if (desc === null) {
    return null;
  }

  let produto = "";
  let tamanho = "";
  let cor = "";

  const index2 = desc.lastIndexOf("-");

  if (index2 !== -1) {
    const prefixo = desc.substring(0, index2).trim();
    const sufixo = desc.substring(index2 + 1).trim();
    const index1 = prefixo.lastIndexOf("-");

    if (index1 !== -1) {
      const prefixoTamanho = prefixo.substring(index1 + 1).trim();

      if (isTamanho(prefixoTamanho)) {
        // Exemplo: "PRODUTO - TAM - COR"
        produto = desc.substring(0, index1).trim();
        tamanho = prefixoTamanho;
        cor = sufixo;
      } else {
        // Exemplo: "PRODUTO AKU - TAM"
        produto = prefixo;
        tamanho = sufixo;
        cor = "VER LAYOUT";
      }
    } else {
      if (sufixo.length > 3) {
        // Exemplo: "PRODUTO - COR"
        produto = prefixo;
        cor = sufixo;
        tamanho = "ÚNICO";
      } else {
        // Exemplo: "PRODUTO - TAM"
        produto = prefixo;
        cor = "INDEFINIDA";
        tamanho = sufixo;
      }
    }
  } else {
    // Exemplo: "PRODUTO"
    produto = desc;
    tamanho = "ÚNICO";
    cor = "INDEFINIDA";
  }

  return { produto, tamanho, cor };
}
function isTamanho(tam:string) {
  let tamanho = ['BL P', 'BL M', 'BL G', 'BL GG', 'BL ESP',
    'PPP', 'PP', 'P', 'M', 'G', 'GG', 'XGG', 'XXGG', 'XXXGG', 'ESP',
    'TAMANHO ÚNICO',
    '28', '30', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '58',
    '2', '4', '6', '8', '10', '12', '14', '16']

  return tamanho.includes(tam);
}
function separarCodigo(
  cod: string,
): { codigo: string; variacao: string } | string {
  if (!cod) return cod;

  const indexVar = cod.lastIndexOf("-");

  const codigo = indexVar !== -1
    ? cod.substring(0, indexVar).trim()
    : cod.trim();
  const variacao = indexVar !== -1 ? cod.substring(indexVar + 1).trim() : "";

  return { codigo, variacao };
}
function extrairOC(texto: string): string | null {
  const match = texto.match(/OC:([0-9]+)/);
  return match ? match[1] : null;
} 
function separarRepetidosUnicos<T>(array: T[], getId: (item: T) => number) {
  const counts = new Map<number, number>();

  for (const item of array) {
    const id = getId(item);
    counts.set(id, (counts.get(id) || 0) + 1);
  }

  const repetidos = array.filter(item => counts.get(getId(item))! > 1);
  const unicos = array.filter(item => counts.get(getId(item))! === 1);

  return { repetidos, unicos };
}


export { isTamanho, separarCodigo, separarDescricao,extrairOC,separarRepetidosUnicos };
