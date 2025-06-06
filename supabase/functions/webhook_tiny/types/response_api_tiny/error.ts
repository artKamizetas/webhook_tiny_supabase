export interface RetornoErroTiny {
  status_processamento: string;
  status: string;
  codigo_erro: number;
  erros: [
    {
      erro: string;
    },
  ];
}
