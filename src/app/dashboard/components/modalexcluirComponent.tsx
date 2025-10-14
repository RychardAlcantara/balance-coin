import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale/pt-BR";
import { get, getDatabase, ref } from "firebase/database";
import { getAuth } from "firebase/auth";
import { format } from "date-fns";
import "../../../styles/dashboard.css";
import "../../../styles/style.css";
import { Transacao } from "@/app/classes/Transacao";

registerLocale("pt-BR", ptBR);

interface TransacaoData {
  idTransacao: string;
  valor?: number;
  tipoTransacao?: string;
  data: string;
  hora: string;
  status: string;
}

interface ExcluirTransacaoModalProps {
  onClose: () => void;
}

const ExcluirTransacaoModal: React.FC<ExcluirTransacaoModalProps> = ({
  onClose,
}) => {
  const [userIdAtual, setUserIdAtual] = useState<string | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(new Date());
  const [transacoes, setTransacoes] = useState<TransacaoData[]>([]);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<Transacao | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState<Date | null>(new Date());

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserIdAtual(user.uid);
    } else {
      console.error("Usuário não autenticado.");
    }
  }, []);

  useEffect(() => {
    const carregarTransacoes = async () => {
      if (!userIdAtual || !mesSelecionado) return;

      const db = getDatabase();
      const mesAnoFormatado = format(mesSelecionado, "MM-yyyy");
      const transacoesRef = ref(db, `transacoes/${mesAnoFormatado}`);
      const transacoesDoMes: TransacaoData[] = [];

      try {
        const snapshot = await get(transacoesRef);
        if (snapshot.exists()) {
          const data = snapshot.val();

          Object.entries(data).forEach(([_, diasTransacao]) => {
            if ((diasTransacao as Record<string, any>)[userIdAtual]) {
              const transacoesUsuario = (diasTransacao as Record<string, any>)[userIdAtual];
              Object.values(transacoesUsuario).forEach((transacao: any) => {
                // Filtrar apenas transações com status "Ativa" ou "Editada"
                if (transacao.status === "Ativa" || transacao.status === "Editada") {
                  transacoesDoMes.push(transacao as TransacaoData);
                }
              });
            }
          });
          setTransacoes(transacoesDoMes);
        } else {
          setTransacoes([]);
        }
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      }
    };

    carregarTransacoes();
  }, [userIdAtual, mesSelecionado]);

  const handleMesChange = (date: Date | null) => {
    setMesSelecionado(date);
    setDataSelecionada(date);
    setTransacaoSelecionada(null);
  };

  const handleTransactionSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    const transacaoData = transacoes.find((t) => t.idTransacao === selectedId);
    if (transacaoData && transacaoData.tipoTransacao && transacaoData.valor !== undefined) {
      const transacao = new Transacao(
        transacaoData.tipoTransacao,
        transacaoData.valor,
        userIdAtual || "",
        0, // saldoAnterior não disponível diretamente
        0, // saldo será atualizado no backend
        transacaoData.idTransacao
      );
      setTransacaoSelecionada(transacao);
    } else {
      setTransacaoSelecionada(null);
    }
  };

  const handleExcluirTransacao = async () => {
    if (!transacaoSelecionada || !mesSelecionado) {
      console.error("Transação ou mês não selecionados.");
      return;
    }

    try {
      await transacaoSelecionada.excluirTransacao(mesSelecionado);
      console.log("Transação excluída com sucesso!");
      alert("Transação excluída com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      alert("Erro ao excluir a transação. Tente novamente.");
    }
  };

  const legendaMesAno = mesSelecionado ? format(mesSelecionado, "MM/yyyy") : "Selecione o Mês";

  return (
    <div className="modal-overlay">
      <div className="conteudoModal">
        <h3>Excluir Transação</h3>
        <div className="mb-3">
          <label className="form-label">Selecione o Mês:</label>
          <div className="input-group">
            <DatePicker
              selected={dataSelecionada}
              onChange={handleMesChange}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              locale="pt-BR"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Selecionar Transação -{" "}
            <span className="badge text-bg-primary">({legendaMesAno})</span>
          </label>
          <select
            className="form-control"
            value={transacaoSelecionada?.idTransacao || ""}
            onChange={handleTransactionSelect}
            disabled={!mesSelecionado || transacoes.length === 0}
          >
            <option value="" disabled>
              Selecione uma transação
            </option>
            {transacoes.map((transacao) => (
              <option key={transacao.idTransacao} value={transacao.idTransacao}>
                R$ {transacao.valor?.toFixed(2)} ({transacao.tipoTransacao} - {transacao.data})
              </option>
            ))}
          </select>
          {transacoes.length === 0 && mesSelecionado && (
            <small className="form-text text-muted">
              Nenhuma transação encontrada para este mês.
            </small>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="botaoCancelar">
            Cancelar
          </button>
          <button
            className="botaoSalvar"
            onClick={handleExcluirTransacao}
            disabled={!transacaoSelecionada}
          >
            Excluir Transação
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcluirTransacaoModal;