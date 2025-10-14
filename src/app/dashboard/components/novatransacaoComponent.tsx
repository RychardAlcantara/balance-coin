import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { database } from "../../../lib/firebase";
import { ref, get } from "firebase/database";
import { Transacao } from "@/app/classes/Transacao";
import FormularioTransacao from "./transacao/formularioTransacao";
import { format } from "date-fns";

const NovaTransacaoComponent = () => {
  const [idconta, setIdConta] = useState<string | null>(null);
  const [saldoAtual, setSaldoAtual] = useState<number>(0);
  const [idTransacao, setIdTransacao] = useState<string>("");
  const [dataTransacao, setDataTransacao] = useState<string>("");

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setIdConta(user.uid);
      obterSaldo(user.uid);
      const newIdTransacao = String(Date.now());
      setIdTransacao(newIdTransacao);
      setDataTransacao(format(new Date(), "dd-MM-yyyy"));
    } else {
      alert("Usuário não está logado.");
    }
  }, []);

  const obterSaldo = async (idconta: string) => {
    const contaRef = ref(database, `contas/${idconta}/saldo`);
    try {
      const snapshot = await get(contaRef);
      let saldoAtual = 0;
      if (snapshot.exists() && snapshot.val() !== null) {
        const saldoData = snapshot.val();
        if (typeof saldoData.saldo === "number") {
          saldoAtual = saldoData.saldo;
        } else if (typeof saldoData.saldo === "string") {
          const parsed = parseFloat(saldoData.saldo);
          saldoAtual = isNaN(parsed) ? 0 : parsed;
        }
      }
      setSaldoAtual(saldoAtual);
    } catch (error) {
      console.error("Erro ao obter saldo:", error);
      alert("Erro ao carregar o saldo. Tente novamente.");
    }
  };

  return (
    <div className="nova-transacao-card">
      <h1 className="nova-transacao-titulo">Nova Transação</h1>
      {idconta && idTransacao && dataTransacao ? (
        <FormularioTransacao
          modo="nova"
          idUsuario={idconta}
          idTransacao={idTransacao}
          dataTransacao={dataTransacao}
          onSubmit={async ({ tipo, valor, descricao, categoria, anexoUrl }) => {
            if (!idconta) {
              alert("Erro ao identificar a conta do usuário.");
              return;
            }

            const valorNumerico = parseFloat(String(valor));

            let novoSaldo: number;
            if (tipo === "deposito") {
              novoSaldo = saldoAtual + valorNumerico;
            } else {
              novoSaldo = saldoAtual - valorNumerico;
            }

            const transacao = new Transacao(
              tipo,
              valorNumerico,
              idconta,
              saldoAtual,
              novoSaldo,
              descricao, 
              categoria,
              idTransacao,
              anexoUrl,
              "nova"
            );

            try {
              await transacao.registrar();
              alert("Transação salva com sucesso!");
              window.location.reload();
              setIdTransacao(String(Date.now()));
              setDataTransacao(format(new Date(), "dd-MM-yyyy"));
              obterSaldo(idconta);
              
            } catch (error) {
              const msg = error instanceof Error ? error.message : String(error);
              alert(`Erro ao salvar transação: ${msg}`);
            }
          }}
        />
      ) : (
        <div>Carregando dados do usuário e transação...</div>
      )}
    </div>
  );
};

export default NovaTransacaoComponent;