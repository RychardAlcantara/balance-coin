
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
import ModalSucesso from "@/components/ModalSucesso";

registerLocale("pt-BR", ptBR);

interface TransacaoData {
  idTransacao: string;
  valor: number;
  tipoTransacao: string;
  descricao?: string;
  categoria?: string;
  anexoUrl?: string | null;
  data: string;
  hora: string;
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  historico?: any[];
}

interface DiasTransacao {
  [userId: string]: {
    [transacaoId: string]: TransacaoData;
  };
}

interface ExcluirTransacaoModalProps {
  onClose: () => void;
  isOpen: boolean;
}

const ExcluirTransacaoModal: React.FC<ExcluirTransacaoModalProps> = ({ onClose, isOpen }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState<Date | null>(new Date());
  const [transacoes, setTransacoes] = useState<TransacaoData[]>([]);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<Transacao | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
    } else {
      console.error("Usuário não autenticado.");
    }
  }, []);

  useEffect(() => {
    const carregarTransacoesDoMes = async () => {
      if (!userId || !mesSelecionado) return;

      const db = getDatabase();
      const mesAno = format(mesSelecionado, "MM-yyyy");
      const refTransacoes = ref(db, `transacoes/${mesAno}`);
      const listaTransacoes: TransacaoData[] = [];

      try {
        const snapshot = await get(refTransacoes);
        if (snapshot.exists()) {
          const dados: Record<string, DiasTransacao> = snapshot.val();
          Object.values(dados).forEach((diaTransacoes) => {
            const transacoesUsuario = diaTransacoes[userId];
            if (transacoesUsuario) {
              Object.values(transacoesUsuario).forEach((t) => {
                if ((t.status === "Ativa" || t.status === "Editada") && t.idTransacao) {
                  listaTransacoes.push(t as TransacaoData);
                }
              });
            }
          });
        }
        setTransacoes(listaTransacoes);
        setTransacaoSelecionada(null);
      } catch (err) {
        console.error("Erro ao carregar transações:", err);
      }
    };

    carregarTransacoesDoMes();
  }, [userId, mesSelecionado]);

  const handleMesChange = (date: Date | null) => {
    setMesSelecionado(date);
  };

  const handleSelecionarTransacao = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idSelecionado = e.target.value;
    const t = transacoes.find((t) => t.idTransacao === idSelecionado);

    if (t) {
      const transacao = new Transacao(
        t.tipoTransacao,
        t.valor,
        userId || "",
        0,
        0,
        t.descricao || "",
        t.categoria || "",
        t.idTransacao,
        t.anexoUrl || null,
        "edicao",
        t.historico || []
      );
      setTransacaoSelecionada(transacao);
    }
  };

  const handleExcluir = async () => {
    if (!transacaoSelecionada || !mesSelecionado) {
      alert("Selecione uma transação e mês válidos.");
      return;
    }

    try {
      await transacaoSelecionada.excluirTransacao(mesSelecionado);
      setMensagemSucesso("Transação excluída com sucesso!");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Erro ao excluir transação:", err);
      alert("Erro ao excluir a transação.");
    }
  };

  const legendaMes = mesSelecionado ? format(mesSelecionado, "MM/yyyy") : "Selecione o mês";

  return (
    <>
      <div className={`modal-overlay ${isOpen ? "is-open" : ""}`}>
        <div className="conteudoModal">
          <h3>Excluir Transação</h3>

          <div className="mb-3">
            <label className="form-label">Selecione o Mês:</label>
            <div className="input-group">
              <DatePicker
                selected={mesSelecionado}
                onChange={handleMesChange}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                locale="pt-BR"
                className="form-control"
                placeholderText="Mês/Ano"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">
              Selecionar Transação -{" "}
              <span className="badge text-bg-primary">({legendaMes})</span>
            </label>
            <select
              className="form-control"
              value={transacaoSelecionada?.idTransacao || ""}
              onChange={handleSelecionarTransacao}
              disabled={!mesSelecionado || transacoes.length === 0}
            >
              <option value="" disabled>
                Selecione uma transação
              </option>
              {transacoes.map((t) => (
                <option key={t.idTransacao} value={t.idTransacao}>
                  R$ {t.valor.toFixed(2)} ({t.tipoTransacao} - {t.data})
                </option>
              ))}
            </select>
            {transacoes.length === 0 && (
              <small className="form-text text-muted">
                Nenhuma transação encontrada neste mês.
              </small>
            )}
          </div>

          <div className="modal-footer">
            <button className="botaoCancelar" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="botaoSalvar"
              onClick={handleExcluir}
              disabled={!transacaoSelecionada}
            >
              Excluir Transação
            </button>
          </div>
        </div>
      </div>
      {showSuccessModal && (
        <ModalSucesso
          mensagem={mensagemSucesso}
          onClose={() => {
            setShowSuccessModal(false);
            window.location.reload();
            onClose();
          }}
        />
      )}
    </>


  );
};

export default ExcluirTransacaoModal;