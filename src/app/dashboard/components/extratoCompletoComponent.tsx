'use client';

import { JSX, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import "../../../styles/dashboard.css";
import "../../../styles/style.css";
import { Extrato } from "@/app/classes/Extrato";
import { faPiggyBank, faMoneyBillTrendUp, faMoneyBillTransfer, faCoins, faHeartPulse, faUmbrellaBeach, faCarSide } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { visualizarAnexo } from "@/utils/visualizarAnexo";

interface TransacaoData {
  idTransacao: string;
  tipoTransacao: string;
  valor: number;
  data: string;
  hora: string;
  status: string;
  descricao?: string;
  anexoUrl?: string;
}

const ExtratoCompletoComponent = () => {
  const [transacoes, setTransacoes] = useState<{ transacao: TransacaoData; mes: string }[]>([]);
  const [extrato, setExtrato] = useState<Extrato | null>(null);

  // Filtros
  const [mesSelecionado, setMesSelecionado] = useState("");
  const [filtroValorMin, setFiltroValorMin] = useState("");
  const [filtroValorMax, setFiltroValorMax] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [buscaTexto, setBuscaTexto] = useState("");
  const [periodo, setPeriodo] = useState<[Date | null, Date | null]>([null, null]);

  const [dataInicio, dataFim] = periodo;

  //Icones Categorias Transações
  const iconesCategorias: { [key: string]: JSX.Element } = {
  deposito: <FontAwesomeIcon icon={faPiggyBank} color="#2ecc71" />,
  transferencia: <FontAwesomeIcon icon={faMoneyBillTransfer} color="#ff5031" />,
  investimento: <FontAwesomeIcon icon={faMoneyBillTrendUp} color="#2563eb" />,
  saúde: <FontAwesomeIcon icon={faHeartPulse} color="#e74c3c" />,
  lazer: <FontAwesomeIcon icon={faUmbrellaBeach} color="#f39c12" />,
  transporte: <FontAwesomeIcon icon={faCarSide} color="#3498db" />,
  outros: <FontAwesomeIcon icon={faCoins} color="#8e44ad" />,
};

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setExtrato(new Extrato(user.uid));
    }
  }, []);

  useEffect(() => {
    async function fetchTransacoes() {
      if (extrato) {
        try {
          const transacoesData = await extrato.buscarExtratoCompleto();
          setTransacoes(transacoesData);
        } catch (error) {
          console.error("Erro ao buscar transações:", error);
          setTransacoes([]);
        }
      }
    }
    fetchTransacoes();
  }, [extrato]);

  const handleMesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMesSelecionado(event.target.value);
  };

  // Aplicação dos filtros
  const transacoesFiltradas = transacoes
    .filter((t) => !mesSelecionado || t.mes === mesSelecionado)
    .filter((t) => !filtroTipo || t.transacao.tipoTransacao === filtroTipo)
    .filter((t) => !filtroStatus || t.transacao.status.toLowerCase() === filtroStatus.toLowerCase())
    .filter((t) => {
      if (!dataInicio && !dataFim) return true;
      const data = new Date(t.transacao.data.split("/").reverse().join("-"));
      return (!dataInicio || data >= dataInicio) && (!dataFim || data <= dataFim);
    })
    .filter((t) => {
      const valor = t.transacao.valor;
      const min = filtroValorMin ? parseFloat(filtroValorMin) : null;
      const max = filtroValorMax ? parseFloat(filtroValorMax) : null;
      return (!min || valor >= min) && (!max || valor <= max);
    })
    .filter((t) => {
      if (!buscaTexto) return true;
      const texto = buscaTexto.toLowerCase();
      return (
        t.transacao.tipoTransacao.toLowerCase().includes(texto) ||
        t.transacao.status.toLowerCase().includes(texto) ||
        t.transacao.data.includes(texto) ||
        t.transacao.hora.includes(texto)
      );
    });

    // Função que limpa os filtros
    const limparFiltros = () => {
    setMesSelecionado("");
    setFiltroValorMin("");
    setFiltroValorMax("");
    setFiltroTipo("");
    setFiltroStatus("");
    setBuscaTexto("");
    setPeriodo([null, null]);
  };

  return (
    <div className="container extratoCompletoContainer">
      <div className="row align-items-center mb-4">
        <div className="col-md-12 saldo-header">
          <h4>Extrato Completo</h4>
        </div>
      </div>

      {/* Filtros */}
      <div className="row mb-3 g-2">
        
        <div className="col-md-4 col-sm-12">
          <select className="form-select" value={mesSelecionado} onChange={handleMesChange}>
            <option value="">Todos os meses</option>
            {[...new Set(transacoes.map((t) => t.mes))].map((mes) => (
              <option key={mes} value={mes}>
                {extrato ? extrato.formatarMesAno(mes) : mes}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4 col-sm-12">
          <select className="form-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="deposito">Depósito</option>
            <option value="transferencia">Transferência</option>
            <option value="investimento">Investimentos</option>
            <option value="outro">Outros</option>
          </select>
        </div>
        <div className="col-md-4 col-sm-12">
          <select className="form-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="ativa">Ativo</option>
            <option value="pendente">Pendente</option>
            <option value="concluida">Concluída</option>
            <option value="excluida">Excluída</option>
          </select>
        </div>

      </div>

      <div className="row mb-3 g-2">
        <div className="col-md-6 col-sm-12">
          <input type="text" className="form-control" placeholder="Buscar..." value={buscaTexto} onChange={(e) => setBuscaTexto(e.target.value)} />
        </div>

        <div className="col-md-2 col-sm-12">
          <DatePicker
            selectsRange
            startDate={dataInicio}
            endDate={dataFim}
            onChange={(update) => setPeriodo(update)}
            isClearable
            className="form-control"
            placeholderText="Período"
            dateFormat="dd/MM/yyyy"
          />
        </div>
        <div className="col-md-2 col-sm-12">
          <input type="number" className="form-control" placeholder="Valor mínimo" value={filtroValorMin} onChange={(e) => setFiltroValorMin(e.target.value)} />
        </div>
        <div className="col-md-2 col-sm-12">
          <input type="number" className="form-control" placeholder="Valor máximo" value={filtroValorMax} onChange={(e) => setFiltroValorMax(e.target.value)} />
        </div>

        <div className="row mb-3 g-2">
        <div className="col-md-12 col-sm-12 d-flex justify-content-end">
          <button className="btn btn-outline-danger" onClick={limparFiltros}>
            Limpar Filtros
          </button>
        </div>
      </div>

      </div>

      {/* Lista de Transações */}
      <div className="row">
        <div className="col-md-12 mb-3">
          <ul className="transacoes-lista">
            {transacoesFiltradas.length === 0 ? (
              <li className="transacao-item">
                <div className="info">Nenhuma transação encontrada.</div>
              </li>
            ) : (
              transacoesFiltradas.map(({ transacao }, index) => (
                <li className="flex items-start justify-between p-4 transacao-item" key={index}>
                  {/* Lado esquerdo - Ícone e informações */}
                  <div className="flex items-start space-x-3">
                    {/* Ícone */}
                    <div className="icone-tipo">
                      {iconesCategorias[transacao.tipoTransacao.toLowerCase()] || (
                        <FontAwesomeIcon icon={faCoins} color="#7f8c8d" />
                      )}
                    </div>

                    {/* Informações da transação */}
                    <div className="flex flex-col space-y-2">
                        <div className="info">
                        <strong>
                          {transacao.tipoTransacao === "deposito"
                            ? "Depósito"
                            : transacao.tipoTransacao === "transferencia"
                            ? "Transferência"
                            : transacao.tipoTransacao === "investimento"
                            ? "Investimento"
                            : "Outro"}
                        </strong>
                        <span>{transacao.descricao?.trim() ? transacao.descricao : "Não possui descrição"}</span>
                      </div>
                    </div>
                    
                    {/* Botão embaixo do texto */}
                    {transacao.anexoUrl && (
                      <div className="anexo">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => visualizarAnexo(transacao.anexoUrl || "")}>Ver Anexo</button>
                      </div>
                    )}
                  </div>

                  {/* Lado direito - Data, hora, valor e status */}
                  <div className="flex flex-col items-end space-y-1 text-right">
                    <div className="data">
                    {transacao.data}
                    <br />
                    <small>{transacao.hora}</small>
                  </div>

                  <div className={`valor ${transacao.tipoTransacao}`}>
                    R$ {transacao.valor.toFixed(2)}
                  </div>

                  <div className={`status ${transacao.status.toLowerCase()}`}>
                    {transacao.status.toUpperCase()}
                  </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExtratoCompletoComponent;