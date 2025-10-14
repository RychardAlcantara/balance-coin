
import "../../../styles/dashboard.css";
import "../../../styles/style.css";
import React, { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale/pt-BR";
import { get, getDatabase, ref } from "firebase/database";
import { getAuth } from "firebase/auth";
import { format } from "date-fns";
import { Transacao } from "@/app/classes/Transacao";
import FormularioTransacao from "./transacao/formularioTransacao";

registerLocale("pt-BR", ptBR);

interface TransacaoHistorico {
  dataModificacao: string;
  campoModificado: string;
  valorAnterior: unknown;
  valorAtualizado: unknown;
}

interface TransacaoData {
  valor: number;
  tipoTransacao: string;
  descricao?: string;
  categoria?: string;
  anexoUrl?: string | null;
  data: string;
  hora: string;
  idTransacao: string;
  historico?: TransacaoHistorico[];
  status?: string;
}

interface EditarTransacaoProps {
  onClose: () => void;
  isOpen: boolean;
}

const EditarTransacaoModal: React.FC<EditarTransacaoProps> = ({ onClose, isOpen }) => {
  const [mesSelecionado, setMesSelecionado] = useState<Date | null>(null);
  const [transacoesMensais, setTransacoesMensais] = useState<TransacaoData[]>([]);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<TransacaoData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (user) setUserId(user.uid);
  }, []);

  useEffect(() => {
    const carregarTransacoes = async () => {
      if (!userId || !mesSelecionado) return;

      const mesAno = format(mesSelecionado, "MM-yyyy");
      const db = getDatabase();
      const refTransacoes = ref(db, `transacoes/${mesAno}`);

      try {
        const snapshot = await get(refTransacoes);
        const transacoes: TransacaoData[] = [];

        if (snapshot.exists()) {
          const dados = snapshot.val();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Object.values(dados).forEach((dia: any) => {
            if (dia[userId]) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              Object.values(dia[userId]).forEach((t: any) => {
                if (t.status === "Ativa" || t.status === "Editada") {
                  transacoes.push(t);
                }
              });
            }
          });
        }

        setTransacoesMensais(transacoes);
        setTransacaoSelecionada(null);
      } catch (err) {
        console.error("Erro ao buscar transações:", err);
      }
    };

    carregarTransacoes();
  }, [userId, mesSelecionado]);

  const handleAtualizar = async (dados: {
    tipo: string;
    valor: number;
    descricao: string;
    categoria: string;
    anexoUrl: string | null;
  }) => {
    if (!userId || !transacaoSelecionada || !mesSelecionado) return;

    try {
      const transacaoAtualizada = new Transacao(
        dados.tipo,
        dados.valor,
        userId,
        0,
        0,
        dados.descricao,
        dados.categoria,
        transacaoSelecionada.idTransacao,
        dados.anexoUrl,
        "edicao",
        transacaoSelecionada.historico || []
      );

      await transacaoAtualizada.atualizarTransacao(mesSelecionado);
      alert("Suas alterações foram salvas com sucesso!");
      window.location.reload();
      onClose();
    } catch (err) {
      console.error("Erro ao atualizar transação:", err);
      alert("Ocorreu um erro ao salvar as alterações.");
    }
  };

  const legendaMesAno = mesSelecionado ? format(mesSelecionado, "MM/yyyy") : "Selecione o Mês";

  return (
    <div className={`modal-overlay ${isOpen ? "is-open" : ""}`}>
      <div className="conteudoModal">
        <h3>Editar Transação</h3>

        <div className="mb-3">
          <label>Selecionar Mês</label>
          <DatePicker
            locale="pt-BR"
            className="form-control"
            selected={mesSelecionado}
            onChange={setMesSelecionado}
            dateFormat="MM/yyyy"
            showMonthYearPicker
          />
        </div>

        <div className="mb-3">
          <label>
            Selecionar Transação - <span className="badge text-bg-primary">({legendaMesAno})</span>
          </label>
          <select
            className="form-control"
            onChange={(e) => {
              const id = e.target.value;
              const selecionada = transacoesMensais.find((t) => t.idTransacao === id) || null;
              setTransacaoSelecionada(selecionada);
            }}
            disabled={!mesSelecionado || transacoesMensais.length === 0}
            value={transacaoSelecionada?.idTransacao || ""}
          >
            <option value="">Selecione uma transação</option>
            {transacoesMensais.map((t) => (
              <option key={t.idTransacao} value={t.idTransacao}>
                R$ {t.valor.toFixed(2)} ({t.tipoTransacao} - {t.data})
              </option>
            ))}
          </select>
        </div>

        {transacaoSelecionada && (
          <>
            <FormularioTransacao
              modo="edicao"
              idUsuario={userId!}
              idTransacao={transacaoSelecionada.idTransacao}
              dataTransacao={transacaoSelecionada.data}
              valorInicial={String(transacaoSelecionada.valor)}
              tipoInicial={transacaoSelecionada.tipoTransacao}
              descricaoInicial={transacaoSelecionada.descricao || ""}
              categoriaInicial={transacaoSelecionada.categoria || ""}
              anexoUrlInicial={transacaoSelecionada.anexoUrl || null}
              onSubmit={handleAtualizar}
            />
          </>
        )}

        <div className="modal-footer">
          <button className="botaoCancelar" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarTransacaoModal;