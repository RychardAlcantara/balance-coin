"use client";

import "@fortawesome/fontawesome-svg-core/styles.css";
import "../../styles/dashboard.css";
import { useEffect, useState } from "react";
import SaldoComponent from "./components/saldoComponent";
import DashboardNavbar from "./components/dashboardnavbar";
import ExtratoComponent from "./components/extratoComponent";
import NovaTransacaoComponent from "./components/novatransacaoComponent";
import Servicos from "./components/servicosComponent";
import MeusCartoes from "./components/meuscartoesComponent";
import { auth, database } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import ExtratoCompletoComponent from "./components/extratoCompletoComponent";
import GraficoResumo from "./components/graficosComponent";
import { useAppDispatch, useAppSelector } from "../hook";
import { login, logout } from "../../features/user/userSlice";
import type { Usuario } from "../../types/Usuario";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formatarDataCompleta = () => {
  const agora = new Date();
  const diasDaSemana = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  const diaSemana = diasDaSemana[agora.getDay()];
  const dia = String(agora.getDate()).padStart(2, "0");
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const ano = agora.getFullYear();

  return `${diaSemana}, ${dia}/${mes}/${ano}`;
};

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const usuario = useAppSelector((state) => state.user.usuario);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dataCompleta, setDataCompleta] = useState("");
  const [primeiroNome, setPrimeiroNome] = useState("");
  const [componenteAtivo, setComponenteAtivo] = useState<string>("");

  useEffect(() => {
    // Importa dinamicamente o arquivo JS do Bootstrap apenas no ambiente do navegador
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('bootstrap/dist/js/bootstrap.bundle.min.js');
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Buscar nome do usuário no Realtime Database
        const nomeUsuarioRef = ref(database, `contas/${user.uid}/nomeUsuario`);
        let nomeUsuario = "";
        try {
          const snapshot = await get(nomeUsuarioRef);
          if (snapshot.exists()) {
            nomeUsuario = snapshot.val();
          }
        } catch {
          // Fallback para displayName, se disponível
          nomeUsuario = user.displayName || "";
        }

        const nome = nomeUsuario || user.displayName || "";
        dispatch(
          login({
            id: user.uid,
            nome,
            email: user.email || ""
          } as Usuario)
        );
        setPrimeiroNome(nome.split(" ")[0]);
      } else {
        dispatch(logout());
        setPrimeiroNome("");
      }
      setLoading(false);
    });

    setDataCompleta(formatarDataCompleta());

    return () => unsubscribeAuth();
  }, [dispatch]);

  // Atualizar primeiro nome caso usuário seja carregado posteriormente via Redux
  useEffect(() => {
    if (usuario && usuario.nome) {
      setPrimeiroNome(usuario.nome.split(" ")[0]);
    }
  }, [usuario]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !usuario)) {
      router.push("/");
    }
  }, [isAuthenticated, usuario, loading, router]);

  const renderComponente = () => {
    switch (componenteAtivo) {
      case "outros-servicos":
        return <Servicos onServicoSelecionado={setComponenteAtivo} />;
      case "cartoes-credito":
        return <MeusCartoes />;
      case "extrato-completo":
        return <ExtratoCompletoComponent />;
      case "home":
        return <div>&nbsp;</div>;
      default:
        return <div>&nbsp;</div>;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Carregando informações do usuário...</p>
      </div>
    );
  }

  if (!isAuthenticated || !usuario) {
    return (
      <div className="auth-redirect-container">
        <div className="auth-spinner"></div>
        <p className="auth-text">Você não está autenticado. Redirecionando para a página de login...</p>
      </div>
    );
  }

  return (
    <main>
      <DashboardNavbar setComponenteAtivo={setComponenteAtivo} />
      <div className="container">
        <div className="row">
          <div className="dadosAcesso col-md-12">
            <h5 className="nomeUsuario">Bem vindo, {primeiroNome || "Usuário"}</h5>
            <p className="diaSemana">{dataCompleta}</p>
          </div>
          {/* Aqui temos o componente de Saldo. Ele possui: Saldo, Entradas, Saidas e Investimentos */}
          <div className="row">
            <div className="col-md-12 col-sm-12">
              <SaldoComponent userId={usuario.id} />
            </div>
          </div>

          {/* Aqui temos o componente de Gráficos. Ele possui: Fluxo de Caixa, Evolução do Saldo e Gastos por Categoria */}
          <div className="row">
            <div className="col-md-12 col-sm-12 mb-3">
              <GraficoResumo />
            </div>
          </div>

          {/* Aqui temos o componente de Nova Transação e Extrato */}
          <div className="row">
            <div className="col-md-4 col-sm-12">
              <NovaTransacaoComponent />
            </div>
            <div className="col-md-8 col-sm-12">
              <ExtratoComponent />
              <Link href="/transacoes" className="extrato-link float-right">
                Ver Extrato Completo
              </Link>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="outrosServicos">{renderComponente()}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;