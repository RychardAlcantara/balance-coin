import { database } from "../../lib/firebase";
import { ref, set, update, get } from "firebase/database";
import { format } from "date-fns";

export class Transacao {
  tipo: string;
  valor: number;
  idconta: string;
  saldoAnterior: number;
  saldo: number;
  data: string;
  hora: string;
  status: string;
  descricao: string;
  categoria: string;
  idTransacao?: string;
  anexoUrl?: string | null; // Added anexoUrl property
  historico?: Array<{
    dataModificacao: string;
    campoModificado: string;
    valorAnterior: unknown;
    valorAtualizado: unknown;
  }>;

  constructor(
    tipo: string,
    valor: number,
    idconta: string,
    saldoAnterior: number,
    saldo: number,
    descricao: string,
    categoria: string,
    idTransacao?: string,
    anexoUrl?: string | null,
    modo: "nova" | "edicao" = "nova",
    historico?: Array<{
      dataModificacao: string;
      campoModificado: string;
      valorAnterior: unknown;
      valorAtualizado: unknown;
    }>
  ) {
    this.tipo = tipo;
    this.valor = valor;
    this.idconta = idconta;
    this.saldoAnterior = saldoAnterior;
    this.saldo = saldo;
    this.idTransacao = idTransacao;
    this.anexoUrl = anexoUrl;
    this.historico = historico;
    this.descricao = descricao;
    this.categoria = categoria;

    const dataAtual = new Date();
    this.data = `${String(dataAtual.getDate()).padStart(2, "0")}-${String(
      dataAtual.getMonth() + 1
    ).padStart(2, "0")}-${dataAtual.getFullYear()}`;
    this.hora = `${String(dataAtual.getHours()).padStart(2, "0")}:${String(
      dataAtual.getMinutes()
    ).padStart(2, "0")}:${String(dataAtual.getSeconds()).padStart(2, "0")}`;
    this.status = modo === "edicao" ? "Editada" : "Ativa";
  }

  async registrar(): Promise<void> {
    const dataAtual = new Date();
    const mesVigente = `${String(dataAtual.getMonth() + 1).padStart(2, "0")}-${dataAtual.getFullYear()}`;
    const idTransacaoToUse = this.idTransacao || `${dataAtual.getTime()}`;
    const transacoesRef = ref(database, `transacoes/${mesVigente}/${this.data}/${this.idconta}/${idTransacaoToUse}`);

    try {
      await set(transacoesRef, {
        idTransacao: idTransacaoToUse,
        tipoTransacao: this.tipo,
        valor: this.valor,
        saldoAnterior: this.saldoAnterior,
        saldo: this.saldo,
        data: this.data,
        hora: this.hora,
        status: this.status,
        descricao: this.descricao,
        categoria: this.categoria,
        anexoUrl: this.anexoUrl || null,
      });

      const contaRef = ref(database, `contas/${this.idconta}/saldo`);
      await update(contaRef, { saldo: this.saldo });

      console.log("Transação registrada com sucesso.");
    } catch (error) {
      console.error("Erro ao registrar transação:", error);
      throw new Error("Erro ao registrar a transação. Tente novamente.");
    }
  }

  async atualizarTransacao(mesSelecionado: Date): Promise<void> {
    if (!this.idconta || !mesSelecionado || !this.idTransacao) {
      console.error("Dados incompletos para atualizar transação.", {
        idconta: this.idconta,
        mesSelecionado,
        idTransacao: this.idTransacao,
      });
      throw new Error("Dados incompletos para atualizar transação.");
    }

    const mesAno = format(mesSelecionado, "MM-yyyy");
    const transacaoRef = ref(
      database,
      `transacoes/${mesAno}/${this.data}/${this.idconta}/${this.idTransacao}`
    );
    const saldoRef = ref(database, `contas/${this.idconta}/saldo`);

    try {
      const snapshot = await get(transacaoRef);
      const saldoSnapshot = await get(saldoRef);

      if (snapshot.exists() && saldoSnapshot.exists()) {
        const dadosAnteriores = snapshot.val();
        let saldoAtual = parseFloat(saldoSnapshot.val().saldo) || 0;

        const valorAnterior = parseFloat(dadosAnteriores.valor) || 0;
        const novoValor = parseFloat(this.valor.toString()) || 0;

        // Validações
        if (isNaN(saldoAtual) || isNaN(valorAnterior) || isNaN(novoValor)) {
          console.error("Valores inválidos detectados:", {
            saldoAtual,
            valorAnterior,
            novoValor,
          });
          throw new Error("Valores inválidos para atualização.");
        }

        console.log("Estado inicial:", {
          saldoAtual,
          valorAnterior,
          tipoAnterior: dadosAnteriores.tipoTransacao,
          novoValor,
          novoTipo: this.tipo,
        });

        // Removendo o impacto da transação anterior
        if (dadosAnteriores.tipoTransacao === "deposito") {
          saldoAtual -= valorAnterior;
        } else if (dadosAnteriores.tipoTransacao === "transferencia") {
          saldoAtual += valorAnterior;
        }

        console.log("Após remover impacto anterior:", { saldoAtual });

        // Aplicando o impacto da transação atualizada
        if (this.tipo === "deposito") {
          saldoAtual += novoValor;
        } else if (this.tipo === "transferencia") {
          saldoAtual -= novoValor;
        }

        console.log("Após aplicar novo impacto:", { saldoAtual });

        // Atualizando o histórico
        const novoHistorico = [
          ...(dadosAnteriores.historico || []),
          {
            dataModificacao: format(new Date(), "dd-MM-yyyy HH:mm:ss"),
            campoModificado: "valor",
            valorAnterior,
            valorAtualizado: novoValor,
          },
          {
            dataModificacao: format(new Date(), "dd-MM-yyyy HH:mm:ss"),
            campoModificado: "tipoTransacao",
            tipoTransacaoAnterior: dadosAnteriores.tipoTransacao,
            tipoTransacaoAtualizado: this.tipo,
          },
        ];

        // Atualizando no banco
        await update(transacaoRef, {
          idTransacao: this.idTransacao,
          tipoTransacao: this.tipo,
          valor: this.valor,
          saldoAnterior: this.saldoAnterior,
          saldo: saldoAtual,
          data: this.data,
          hora: this.hora,
          status: "Ativa",
          historico: novoHistorico,
          descricao: this.descricao,
          categoria: this.categoria,
          anexoUrl: this.anexoUrl || null,
        });

        await update(saldoRef, { saldo: saldoAtual });

        console.log("Transação e saldo atualizados com sucesso!", {
          saldoFinal: saldoAtual,
        });
      } else {
        console.error(
          "Transação ou saldo não encontrados no caminho especificado.",
          transacaoRef.toString(),
          saldoRef.toString()
        );
        throw new Error("Transação ou saldo não encontrados.");
      }
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      throw new Error("Erro ao atualizar a transação.");
    }
  }

  async excluirTransacao(mesSelecionado: Date): Promise<void> {
    if (!this.idconta || !this.idTransacao || !mesSelecionado) {
      console.error("Dados incompletos para excluir transação.", {
        idconta: this.idconta,
        idTransacao: this.idTransacao,
        mesSelecionado,
      });
      throw new Error("Dados incompletos para excluir transação.");
    }

    const mesAnoFormatado = format(mesSelecionado, "MM-yyyy");
    const transacaoRef = ref(
      database,
      `transacoes/${mesAnoFormatado}/${this.data}/${this.idconta}/${this.idTransacao}`
    );
    const saldoRef = ref(database, `contas/${this.idconta}/saldo`);

    try {
      // Alterar o status da transação para "Excluída"
      console.log("Atualizando status para 'Excluída':", transacaoRef.toString());
      await update(transacaoRef, { status: "Excluída" });
      console.log("Status atualizado com sucesso.");

      // Recalcular saldo
      const snapshot = await get(saldoRef);
      let saldoAtual = snapshot.exists() ? parseFloat(snapshot.val().saldo) : 0;

      if (isNaN(saldoAtual)) {
        console.error("Saldo atual inválido:", saldoAtual);
        saldoAtual = 0;
      }

      let valorTransacao = this.valor || 0;
      if (isNaN(valorTransacao)) {
        console.error("Valor da transação inválido:", valorTransacao);
        valorTransacao = 0;
      }

      // Ajuste do saldo com base no tipo de transação
      if (this.tipo === "deposito") {
        saldoAtual -= valorTransacao;
      } else if (this.tipo === "transferencia") {
        saldoAtual += valorTransacao;
      }

      // Atualizar saldo no banco de dados
      await update(saldoRef, { saldo: saldoAtual });
      console.log("Saldo atualizado:", saldoAtual);

    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      throw new Error("Erro ao excluir a transação.");
    }
  }
}