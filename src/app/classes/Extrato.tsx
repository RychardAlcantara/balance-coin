import { getDatabase, ref, get } from "firebase/database";

interface TransacaoData {
  idTransacao: string;
  tipoTransacao: string;
  valor: number;
  data: string;
  hora: string;
  status: string;
  saldoAnterior?: number;
  saldo?: number;
}

export class Extrato {
  private userId: string;
  private db = getDatabase();
  private mesesPorExtenso = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  constructor(userId: string) {
    this.userId = userId;
  }

  async buscarExtrato(mesAno?: string): Promise<TransacaoData[]> {
    const transacoesRef = ref(this.db, mesAno ? `transacoes/${mesAno}` : `transacoes`);
    const snapshot = await get(transacoesRef);
    const transacoes: TransacaoData[] = [];

    if (snapshot.exists()) {
      snapshot.forEach((mesSnapshot) => {
        const dias = mesSnapshot.val();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.values(dias).forEach((usuarios: any) => {
          if (usuarios[this.userId]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Object.values(usuarios[this.userId]).forEach((transacao: any) => {
              if (transacao.status === "Ativa" || transacao.status === "Editada") {
                transacoes.push({
                  ...transacao,
                  tipoTransacao: transacao.tipoTransacao,
                  data: transacao.data.replace(/-/g, "/"),
                });
              }
            });
          }
        });
      });
    }

    return transacoes;
  }

  async buscarExtratoCompleto(): Promise<{ transacao: TransacaoData; mes: string }[]> {
    const transacoesRef = ref(this.db, `transacoes`);
    const snapshot = await get(transacoesRef);
    const transacoes: { transacao: TransacaoData; mes: string }[] = [];

    if (snapshot.exists()) {
      snapshot.forEach((mesSnapshot) => {
        const mes = mesSnapshot.key;
        const dias = mesSnapshot.val();
        Object.keys(dias).forEach((dia) => {
          const transacoesDia = dias[dia][this.userId];
          if (transacoesDia) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Object.values(transacoesDia).forEach((transacao: any) => {
              if (transacao.status === "Ativa" || transacao.status === "Editada" || transacao.status === "Excluída") {
                transacoes.push({
                  transacao: {
                    ...transacao,
                    tipoTransacao: transacao.tipoTransacao,
                    data: transacao.data.replace(/-/g, "/"),
                  },
                  mes,
                });
              }
            });
          }
        });
      });
    }

    return transacoes;
  }

  calcularEntradaseSaidas(transacoes: TransacaoData[]): { entradas: number; saidas: number } {
    const hoje = new Date();
    const trintaDiasAtras = new Date(hoje);
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    let entradas = 0;
    let saidas = 0;

    transacoes.forEach((transacao) => {
      const [dia, mes, ano] = transacao.data.split("/");
      const dataTransacao = new Date(
        parseInt(ano, 10),
        parseInt(mes, 10) - 1,
        parseInt(dia, 10)
      );

      if (dataTransacao >= trintaDiasAtras && dataTransacao <= hoje) {
        if (transacao.tipoTransacao === "deposito") {
          entradas += transacao.valor ?? 0;
        } else if (transacao.tipoTransacao === "transferencia") {
          saidas += transacao.valor ?? 0;
        }
      }
    });

    return { entradas, saidas };
  }

  formatarMesAno(mesAno: string): string {
    if (!mesAno || !mesAno.includes("-")) return "Mês/Ano inválido";
    const [mes, ano] = mesAno.split("-");
    const numeroMes = parseInt(mes, 10);
    return numeroMes > 0 && numeroMes <= 12
      ? `${this.mesesPorExtenso[numeroMes - 1]}/${ano}`
      : "Mês/Ano inválido";
  }

  getMesVigente(transacoes: TransacaoData[]): string {
    if (transacoes.length === 0) return "";
    const primeiraTransacao = transacoes[0];
    if (!primeiraTransacao.data) return "";
    const [, mes] = primeiraTransacao.data.split("/");
    const numeroMes = parseInt(mes, 10);
    return numeroMes > 0 && numeroMes <= 12 ? this.mesesPorExtenso[numeroMes - 1] : "";
  }
}