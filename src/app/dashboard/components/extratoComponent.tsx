"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { auth } from "../../../lib/firebase";
import EditarTransacaoModal from "./modaleditarComponent";
import ExcluirTransacaoModal from "./modalexcluirComponent";
import { Extrato } from "@/app/classes/Extrato";
import { visualizarAnexo } from "@/utils/visualizarAnexo";

interface TransacaoData {
  idTransacao: string;
  tipoTransacao: string;
  valor: number;
  data: string;
  hora: string;
  status: string;
  anexoUrl?: string;
}

const ExtratoComponent = () => {
  const [transacoes, setTransacoes] = useState<TransacaoData[]>([]);
  const [mesVigente, setMesVigente] = useState("");
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [extrato, setExtrato] = useState<Extrato | null>(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const transacoesPorPagina = 5;

  const [ordenacao, setOrdenacao] = useState<"mais_recente" | "mais_antigo">("mais_recente");

  // Cálculo de páginas com ordenação aplicada
  const transacoesOrdenadas = [...transacoes].sort((a, b) => {
    const dataA = new Date(`${a.data.split("/").reverse().join("-")}T${a.hora}`);
    const dataB = new Date(`${b.data.split("/").reverse().join("-")}T${b.hora}`);
    return ordenacao === "mais_recente"
      ? dataB.getTime() - dataA.getTime()
      : dataA.getTime() - dataB.getTime();
  });

  // Cálculo de páginas
  const indexInicio = (paginaAtual - 1) * transacoesPorPagina;
  const indexFim = indexInicio + transacoesPorPagina;
 const transacoesPaginadas = transacoesOrdenadas.slice(indexInicio, indexFim);
  const totalPaginas = Math.ceil(transacoes.length / transacoesPorPagina);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setExtrato(new Extrato(user.uid));
    }
  }, []);

  useEffect(() => {
    async function fetchTransacoes() {
      if (extrato) {
        try {
          const transacoesData = await extrato.buscarExtrato();
          setTransacoes(transacoesData);
          setMesVigente(extrato.getMesVigente(transacoesData));
        } catch (error) {
          console.error("Erro ao buscar transações:", error);
          setTransacoes([]);
          setMesVigente("");
        }
      }
    }
    fetchTransacoes();
  }, [extrato]);

  const abrirModalEditar = () => setModalEditarAberto(true);
  const fecharModalEditar = () => setModalEditarAberto(false);

  const abrirModalExcluir = () => setModalExcluirAberto(true);
  const fecharModalExcluir = () => setModalExcluirAberto(false);

  return (
    <div className="extrato-card">
      <div className="container">
        <div className="row">
          <div className="col-md-6 col-sm-12">
            <h5>Extrato</h5>
          </div>
          <div className="col-md-6 col-sm-12 text-end">
            <ul>
              <li>
                <select className="form-select" value={ordenacao} onChange={(e) => {
                setOrdenacao(e.target.value as "mais_recente" | "mais_antigo");
                setPaginaAtual(1); // Volta para a primeira página ao mudar ordenação
              }}>
                  <option value="mais_recente">Mais recente primeiro</option>
                  <option value="mais_antigo">Mais antigo primeiro</option>
                </select>
              </li>
              <li>
                <span className="extrato-editar-icone" onClick={abrirModalEditar}>
                  <FontAwesomeIcon icon={faPenToSquare} />
                </span>
              </li>
              <li>
                <span className="extrato-excluir-icone" onClick={abrirModalExcluir}>
                  <FontAwesomeIcon icon={faTrashCan} />
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 col-sm-12">
            <div className="extrato-item">
              <div className="row">
              <div className="extrato-header">Últimas Transações</div>
              {transacoesPaginadas.length > 0 ? (
                transacoesPaginadas.map((transacao) => (
                  <div key={transacao.idTransacao} className="extrato-transacao row">
                    <div className="col-md-6 col-sm-12">
                      <div className="extrato-mes">{mesVigente}</div>
                      <div className="extrato-data">{`${transacao.data} - ${transacao.hora}`}</div>
                    </div>
                    <div className="col-md-4 col-sm-12">
                      <div
                        className={`extrato-valor ${
                          transacao.tipoTransacao === "deposito" ? "positivo" : "negativo"
                        }`}
                      >
                        R$ {transacao.valor.toFixed(2)}
                      </div>
                      <div className={`extrato-tipo-${transacao.tipoTransacao.toLowerCase()}`}>
                        {transacao.tipoTransacao}
                      </div>
                    </div>
                    <div className="col-md-2 col-sm-12">
                    {transacao.anexoUrl && (
                        <button className="btn btn-sm btn-outline-primary" onClick={() => visualizarAnexo(transacao.anexoUrl || "")}>Ver Anexo</button>
                    )}
                  </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <p>Nenhuma transação encontrada.</p>
                </div>
              )}

              {/* Controles de Paginação */}
              {totalPaginas > 1 && (
                <div className="paginacao mt-3 text-end">
                  <button className="btn btn-secondary me-2" onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))} disabled={paginaAtual === 1}>Anterior</button>
                  <span>Página {paginaAtual} de {totalPaginas}</span>
                  <button className="btn btn-secondary ms-2" onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))} disabled={paginaAtual === totalPaginas}>Próxima</button>
                </div>
              )}
              </div>
              </div>
          </div>
        </div>
        {modalEditarAberto && (<EditarTransacaoModal isOpen={modalEditarAberto} onClose={fecharModalEditar} />)}

      {modalExcluirAberto && (<ExcluirTransacaoModal isOpen={modalExcluirAberto} onClose={fecharModalExcluir} />)}
      </div>
    </div>
  );
};

export default ExtratoComponent;
