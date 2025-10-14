/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth } from "firebase/auth";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const GraficoResumo = () => {
  const [filtroDias, setFiltroDias] = useState(30);

  const [fluxoLabels, setFluxoLabels] = useState<string[]>([]);
  const [entradasMensais, setEntradasMensais] = useState<number[]>([]);
  const [saidasMensais, setSaidasMensais] = useState<number[]>([]);

  const [saldoLabels, setSaldoLabels] = useState<string[]>([]);
  const [saldoValores, setSaldoValores] = useState<number[]>([]);

  const [categoriasLabels, setCategoriasLabels] = useState<string[]>([]);
  const [categoriasValores, setCategoriasValores] = useState<number[]>([]);

  const getDadosFluxoCaixa = (dados: any, uid: string) => {
    const fluxo: { [mes: string]: { entradas: number; saidas: number } } = {};

    Object.entries(dados).forEach(([mesAno, diasTransacoes]: any) => {
      for (const dia in diasTransacoes) {
        const usuarios = diasTransacoes[dia];
        if (usuarios[uid]) {
          const transacoesUsuario = usuarios[uid];

          for (const transacaoId in transacoesUsuario) {
            const transacao = transacoesUsuario[transacaoId];
            if (!fluxo[mesAno]) fluxo[mesAno] = { entradas: 0, saidas: 0 };

            if (transacao.tipoTransacao === "deposito") {
              fluxo[mesAno].entradas += transacao.valor;
            } else {
              fluxo[mesAno].saidas += transacao.valor;
            }
          }
        }
      }
    });

    const meses = Object.keys(fluxo).sort();
    setFluxoLabels(meses);
    setEntradasMensais(meses.map((m) => fluxo[m].entradas));
    setSaidasMensais(meses.map((m) => fluxo[m].saidas));
  };

  const getDadosEvolucaoSaldo = (dados: any, uid: string, diasFiltro: number) => {
    const hoje = new Date();
    const saldoTemp: { [data: string]: number } = {};

    Object.values(dados).forEach((diasTransacoes: any) => {
      Object.values(diasTransacoes).forEach((usuarios: any) => {
        if (usuarios[uid]) {
          const transacoesUsuario = usuarios[uid];
          for (const transacaoId in transacoesUsuario) {
            const transacao = transacoesUsuario[transacaoId];
            const dataParts = transacao.data.split("-");
            const dataObj = new Date(`${dataParts[2]}-${dataParts[1]}-${dataParts[0]}`);
            const diff = Math.floor((hoje.getTime() - dataObj.getTime()) / (1000 * 60 * 60 * 24));
            if (diff <= diasFiltro) {
              saldoTemp[transacao.data] = transacao.saldo;
            }
          }
        }
      });
    });

    const datas = Object.keys(saldoTemp).sort((a, b) => {
      const d1 = new Date(a.split("-").reverse().join("-")).getTime();
      const d2 = new Date(b.split("-").reverse().join("-")).getTime();
      return d1 - d2;
    });

    setSaldoLabels(datas);
    setSaldoValores(datas.map((d) => saldoTemp[d]));
  };

  const getDadosGastosPorCategoria = (dados: any, uid: string) => {
  const categoriasFixas = ["saude", "lazer", "investimento", "transporte", "outros", "pagamentos", "transferências"];
  const categoriasTemp: { [categoria: string]: number } = {
    saude: 0,
    lazer: 0,
    investimento: 0,
    transporte: 0,
    outros: 0,
    pagamentos: 0,
    transferências: 0,
  };

  Object.values(dados).forEach((diasTransacoes: any) => {
    Object.values(diasTransacoes).forEach((usuarios: any) => {
      if (usuarios[uid]) {
        const transacoesUsuario = usuarios[uid];
        for (const transacaoId in transacoesUsuario) {
          const transacao = transacoesUsuario[transacaoId];
          if (transacao.tipoTransacao !== "deposito") {
            const categoria = (transacao.categoria || "").toLowerCase();

            if (categoriasTemp.hasOwnProperty(categoria)) {
              categoriasTemp[categoria] += transacao.valor;
            } else {
              categoriasTemp["outros"] += transacao.valor;
            }
          }
        }
      }
    });
  });

  setCategoriasLabels(categoriasFixas.map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1)));
  setCategoriasValores(categoriasFixas.map((c) => categoriasTemp[c]));
};


  useEffect(() => {
    const fetchDados = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getDatabase();
      const transacoesRef = ref(db, "transacoes");
      const snapshot = await get(transacoesRef);

      if (snapshot.exists()) {
        const dados = snapshot.val();
        const uid = user.uid;

        getDadosFluxoCaixa(dados, uid);
        getDadosEvolucaoSaldo(dados, uid, filtroDias);
        getDadosGastosPorCategoria(dados, uid);
      }
    };

    fetchDados();
  }, [filtroDias]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: false },
    },
  };

  return (
    <div className="accordion" id="accordionExample">
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseOne"
            aria-expanded="true"
            aria-controls="collapseOne"
          >
            <FontAwesomeIcon icon={faChartLine} /> Gráficos de Análise Financeira
          </button>
        </h2>
        <div id="collapseOne" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
          <div className="accordion-body">
            <div className="container">
              <div className="row mb-4">
                {/* Gráfico 1: Fluxo de Caixa */}
                <div className="col-md-4">
                  <h5>Fluxo de Caixa (Mensal)</h5>
                  <Bar
                    data={{
                      labels: fluxoLabels,
                      datasets: [
                        { label: "Entradas", data: entradasMensais, backgroundColor: "#4CAF50" },
                        { label: "Saídas", data: saidasMensais, backgroundColor: "#F44336" },
                      ],
                    }}
                    options={options}
                  />
                </div>

                {/* Gráfico 2: Evolução do Saldo */}
                <div className="col-md-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Evolução do Saldo</h5>
                    <select
                      className="form-select w-auto"
                      value={filtroDias}
                      onChange={(e) => setFiltroDias(Number(e.target.value))}
                    >
                      <option value={30}>30 dias</option>
                      <option value={60}>60 dias</option>
                      <option value={90}>90 dias</option>
                    </select>
                  </div>
                  <Line
                    data={{
                      labels: saldoLabels,
                      datasets: [
                        {
                          label: "Saldo (R$)",
                          data: saldoValores,
                          borderColor: "#2196F3",
                          backgroundColor: "#2196F3",
                          fill: false,
                          tension: 0.3,
                        },
                      ],
                    }}
                    options={options}
                  />
                </div>

                {/* Gráfico 3: Gastos por Categoria */}
                <div className="col-md-4">
                  <h5>Gastos por Categoria</h5>
                  <Pie
                    data={{
                      labels: categoriasLabels,
                      datasets: [
                        {
                          label: "Valores R$",
                          data: categoriasValores,
                          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#9C27B0", "#00BCD4", "#795548"],
                          hoverOffset: 6,
                        },
                      ],
                    }}
                    options={options}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
};

export default GraficoResumo;