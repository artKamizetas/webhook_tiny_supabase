


function isTamanho(tam: string): boolean {
  // Exemplo de tamanhos válidos. Ajuste conforme necessário.
  const tamanhosValidos = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'ÚNICO'];
  return tamanhosValidos.includes(tam.toUpperCase());
}

export interface DescricaoSeparada {
  produto: string;
  tamanho: string;
  cor: string;
}

function separarDescricao(desc: string | null): DescricaoSeparada | null {
  if (desc === null) {
    return null;
  }

  let produto = '';
  let tamanho = '';
  let cor = '';

  const index2 = desc.lastIndexOf('-');

  if (index2 !== -1) {
    const prefixo = desc.substring(0, index2).trim();
    const sufixo = desc.substring(index2 + 1).trim();
    const index1 = prefixo.lastIndexOf('-');

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
        cor = 'VER LAYOUT';
      }
    } else {
      if (sufixo.length > 3) {
        // Exemplo: "PRODUTO - COR"
        produto = prefixo;
        cor = sufixo;
        tamanho = 'ÚNICO';
      } else {
        // Exemplo: "PRODUTO - TAM"
        produto = prefixo;
        cor = 'INDEFINIDA';
        tamanho = sufixo;
      }
    }
  } else {
    // Exemplo: "PRODUTO"
    produto = desc;
    tamanho = 'ÚNICO';
    cor = 'INDEFINIDA';
  }

  return { produto, tamanho, cor };
}

export { isTamanho, separarDescricao };
