export default interface WebhookPayload {
  dados: {
    id: number;
    numero: string;
    data: string;
    idPedidoEcommerce: string;
    codigoSituacao: string;
    descricaoSituacao: string;
    idContato: string;
    idNotaFiscal: string;
    nomeEcommerce: string;
    cliente: {
      nome: string;
      cpfCnpj: string;
    };
    formaEnvio: {
      id: string;
      descricao: string;
    };
  };
}
