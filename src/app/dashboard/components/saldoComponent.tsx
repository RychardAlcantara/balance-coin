import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { getDatabase, ref, get } from 'firebase/database';

interface SaldoProps {
  userId: string;
}

const SaldoComponent: React.FC<SaldoProps> = ({ userId }) => {
  const [saldo, setSaldo] = useState<number | null>(null);
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [entradas, setEntradas] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [investimentos, setInvestimentos] = useState(0);

  useEffect(() => {
    const fetchSaldo = async () => {
      const db = getDatabase();
      const saldoRef = ref(db, `contas/${userId}/saldo/saldo`);
      const snapshot = await get(saldoRef);
      

      if (snapshot.exists()) {
        setSaldo(snapshot.val());
      } else {
        setSaldo(0);
      }
    };

    const calcularTotaisDoMesVigente = async () => {
      const db = getDatabase();
      const hoje = new Date();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ano = hoje.getFullYear();
      const mesAno = `${mes}-${ano}`;
      const transacoesRef = ref(db, `transacoes/${mesAno}`);

      try {
        const snapshot = await get(transacoesRef);
        let totalEntradas = 0;
        let totalSaidas = 0;
        let totalInvestimentos = 0;

        if (snapshot.exists()) {
          const dados = snapshot.val();

          for (const dia in dados) {
            const usuarios = dados[dia];

            if (usuarios[userId]) {
              const transacoesUsuario = usuarios[userId];

              for (const transacaoId in transacoesUsuario) {
              const transacao = transacoesUsuario[transacaoId];
              
              // Ignorar transações excluídas
              if (transacao.status === "Excluída") continue;

              const tipo = transacao.tipoTransacao;
              const valor = parseFloat(transacao.valor) || 0;

              if (tipo === 'deposito') {
                totalEntradas += valor;
              } else if (tipo === 'investimento') {
                totalInvestimentos += valor;
              } else {
                totalSaidas += valor;
              }
            }
            }
          }
        }

        setEntradas(totalEntradas);
        setSaidas(totalSaidas);
        setInvestimentos(totalInvestimentos);
      } catch (error) {
        console.error("Erro ao calcular totais:", error);
      }
    };

    fetchSaldo();
    calcularTotaisDoMesVigente();
  }, [userId]);

  const toggleMostrarSaldo = () => {
    setMostrarSaldo(!mostrarSaldo);
  };

 const formatarValor = (valor: number) =>
  mostrarSaldo
    ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '*****';

  return (
  <div className="row">
      <div className="col-md-3 col-sm-6 mb-3">
        <div className="saldo-card">
          <div className="saldo-header d-flex justify-content-between align-items-center">
            <h4>Saldo</h4>
            <span className="saldo-icone" onClick={toggleMostrarSaldo} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon={mostrarSaldo ? faEye : faEyeSlash} />
            </span>
          </div>
          <div className="saldo-conteudo">
            <h2>{formatarValor(saldo || 0)}</h2>
            <p>Conta Corrente</p>
          </div>
        </div>
      </div>

      <div className="col-md-3 col-sm-6 mb-3">
        <div className="entradas-card">
          <div className="entradas-header d-flex justify-content-between align-items-center">
            <h4>Entradas</h4>
          </div>
          <div className="entradas-conteudo">
            <h2>{formatarValor(entradas)}</h2>
          </div>
        </div>
      </div>

      <div className="col-md-3 col-sm-6 mb-3">
        <div className="saidas-card">
          <div className="saidas-header">
            <h4>Saídas</h4>
          </div>
          <div className="saidas-conteudo">
            <h2>{formatarValor(saidas)}</h2>
          </div>
        </div>
      </div>

      <div className="col-md-3 col-sm-6 mb-3">
        <div className="investimentos-card">
          <div className="investimentos-header">
            <h4>Investimentos</h4>
          </div>
          <div className="investimentos-conteudo">
            <h2>{formatarValor(investimentos)}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaldoComponent;