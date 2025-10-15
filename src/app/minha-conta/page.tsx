"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import DashboardNavbar from "../dashboard/components/dashboardnavbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, database } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { Usuario } from "@/app/classes/Usuario";
import "@/styles/minhaconta.css";
import Link from "next/link";
import ModalSucesso from "@/components/ModalSucesso";

export default function MinhaConta() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [userData, setUserData] = useState<{
    nome: string;
    email: string;
    senha: string;
  }>({
    nome: "",
    email: "",
    senha: "",
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // NOVO useEffect para carregar o Bootstrap JS no cliente
  useEffect(() => {
    // Importa dinamicamente o arquivo JS do Bootstrap apenas no ambiente do navegador
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('bootstrap/dist/js/bootstrap.bundle.min.js');
    }
  }, []);

  useEffect(() => {
    const deslogar = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(database, `contas/${user.uid}`);
        onValue(
          userRef,
          (snapshot) => {
            const data = snapshot.val();
            if (data) {
              setUserData({
                nome: data.nomeUsuario || "",
                email: data.emailUsuario || user.email || "",
                senha: "",
              });
            }
            setLoading(false);
          },
          (error) => {
            console.error("Erro ao carregar dados:", error);
            setLoading(false);
            window.alert("Erro ao carregar dados do usuário.");
          }
        );
      } else {
        setLoading(false);
        router.push("/");
      }
    });

    return () => deslogar();
  }, [router]);

  const alterarTexto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") return;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      router.push("/");
      return;
    }

    if (userData.senha && userData.senha.length < 6) {
      window.alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      const usuario = new Usuario(userData.nome, userData.email, userData.senha || "");
      await usuario.atualizarUsuario(auth.currentUser.uid, userData.nome, userData.email, userData.senha);
      setMensagemSucesso("Sucesso! Dados do usuário atualizados.");
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : "Erro ao atualizar dados.");
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

  return (
    <>
      <div className="row">
        <DashboardNavbar />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-md-6 col-sm-12">
            <Image src="/images/minha_conta.png" alt="Conta" width={450} height={450} className="img-fluid" />
          </div>
          <div className="col-md-6 col-sm-12 minhaconta">
            <h4>Minha conta</h4>
            <form onSubmit={enviarFormulario}>
              <div className="mb-3">
                <label htmlFor="nome" className="form-label">Nome</label>
                <input type="text" className="form-control" id="nome" name="nome" value={userData.nome} onChange={alterarTexto} />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" name="email" value={userData.email} readOnly />
              </div>
              <div className="mb-3">
                <label htmlFor="senha" className="form-label">Senha</label>
                <input type="password" className="form-control" id="senha" name="senha" value={userData.senha} onChange={alterarTexto} placeholder="Deixe em branco para manter a senha atual" />
              </div>
              <div className="d-flex gap-3">
                <button type="submit" className="btn btn-success ">Salvar alterações</button>
                <Link href="/dashboard" className="btn btn-outline-primary">
                  ← Voltar ao Dashboard
                </Link>
              </div>

            </form>
          </div>
        </div>
      </div>
      {showSuccessModal && (
        <ModalSucesso
          mensagem={mensagemSucesso}
          onClose={() => {
            setShowSuccessModal(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}