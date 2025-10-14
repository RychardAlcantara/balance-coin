import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../../../styles/dashboard.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

export default function MeusCartoes() {
  const [cartaoVirtual, setCartaoVirtual] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const db = getDatabase();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = ref(db, `contas/${user.uid}/nomeUsuario`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            setNomeUsuario(snapshot.val());
          } else {
            console.warn("Nome do usuário não encontrado no banco de dados.");
          }
        } catch (error) {
          console.error("Erro ao buscar o nome do usuário:", error);
        }
      } else {
        console.warn("Nenhum usuário autenticado.");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const criarCartaoVirtual = () => {
    setCartaoVirtual(true);
  };

  return (
    <div className="container sessaoCartoes py-4">
      <div className="saldo-header mb-4"><h4>Meus cartões</h4></div>

      <div className="row align-items-center mb-4">
        <div className="col-md-6">
          <h5 className="text-muted">Cartão físico</h5>
          <div className="cartaoFisico p-4">
            <div className="nomeBancoCartao">Byte</div>
            <div className="tipoCartao">Platinum</div>
            <div className="nomeCartao mt-3">{nomeUsuario || "Carregando..."}</div>
            <div>••••••••••••••</div>
          </div>
        </div>
        <div className="col-md-6 text-center">
          <div className="row">
            <div className="col-6">
              <p className="text-muted">Função: Débito</p>
            </div>
            <div className="col-6">
              <p>Status do Cartão: Ativo</p>
            </div>
          </div>
          <button className="btn btnConfigurarCartao mb-2">Configurar</button>
          <button className="btn btn-outline-danger btnBloquearCartao">Bloquear</button>
        </div>
      </div>

      {cartaoVirtual ? (
        <div className="row align-items-center mb-4">
          <div className="col-md-6">
            <h5 className="text-muted">Cartão digital</h5>
            <div className="cartaoVirtual p-4">
              <div className="nomeBancoCartao">Byte</div>
              <div className="tipoCartao">Platinum</div>
              <div className="nomeCartao mt-3">{nomeUsuario || "Carregando..."}</div>
              <div>••••••••••••••</div>
            </div>
          </div>
          <div className="col-md-6 text-center">
            <div className="row">
              <div className="col-6">
                <p className="text-muted">Função: Débito</p>
              </div>
              <div className="col-6">
                <p>Status do Cartão: Ativo</p>
              </div>
            </div>
            <button className="btn btnConfigurarCartao mb-2">Configurar</button>
            <button className="btn btn-outline-danger btnBloquearCartao">Bloquear</button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            className="btn btn-primary"
            style={{ backgroundColor: "#FF5722", border: "none" }}
            onClick={criarCartaoVirtual}
          >
            Criar cartão virtual
          </button>
        </div>
      )}
    </div>
  );
}
