import { useEffect, useState } from "react";
import { format } from "date-fns";
import UploadAnexo from "../upload/UploadAnexo";

interface FormularioProps {
  modo: "nova" | "edicao";
  idUsuario: string;
  idTransacao: string;
  dataTransacao: string;
  valorInicial?: string;
  tipoInicial?: string;
  descricaoInicial?: string;
  categoriaInicial?: string;
  anexoUrlInicial?: string | null;
  nomeArquivoOriginal?: string;
  onSubmit: (dados: {
    tipo: string;
    valor: number;
    descricao: string;
    categoria: string;
    anexoUrl: string | null;
  }) => void;
}

const FormularioTransacao = ({
  modo,
  idUsuario,
  idTransacao,
  dataTransacao,
  valorInicial = "",
  tipoInicial = "",
  descricaoInicial = "",
  categoriaInicial = "",
  anexoUrlInicial = null,
  nomeArquivoOriginal = "",
  onSubmit,
}: FormularioProps) => {
  const [tipo, setTipo] = useState(tipoInicial);
  const [valor, setValor] = useState(valorInicial);
  const [descricao, setDescricao] = useState(descricaoInicial);
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [anexoUrl, setAnexoUrl] = useState<string | null>(anexoUrlInicial);
  const [nomeFirebase, setNomeFirebase] = useState("");

  useEffect(() => {
    const nome = `anexo_${idTransacao}_${format(new Date(), "ddMMyyyy")}`;
    setNomeFirebase(nome);
  }, [idTransacao]);

  useEffect(() => {
    const texto = descricao.toLowerCase();

    if (texto === "") {
      setCategoria("");
      return;
    }

    const palavrasSaude = [
      "remedio", "remédio", "medicamento", "farmacia", "farmácia",
      "consulta", "dentista", "hospital", "exame", "plano"
    ];

    const palavrasLazer = [
      "cinema", "show", "jantar", "teatro", "bar",
      "viagem", "hotel", "festa", "parque", "passeio"
    ];

    const palavrasTransporte = [
      "uber", "gasolina", "ônibus", "metro", "passagem",
      "pedágio", "combustivel", "taxi", "corrida", "carro"
    ];

    const palavrasInvestimento = [
      "tesouro", "cdb", "ações", "cripto", "fundos",
      "poupança", "bolsa", "btc", "etf", "investimento"
    ];

    const contem = (lista: string[]) => lista.some(palavra => texto.includes(palavra));

    if (contem(palavrasSaude)) {
      setCategoria("Saude");
    } else if (contem(palavrasLazer)) {
      setCategoria("Lazer");
    } else if (contem(palavrasTransporte)) {
      setCategoria("Transporte");
    } else if (contem(palavrasInvestimento)) {
      setCategoria("Investimento");
    } else {
      setCategoria("Outros");
    }
  }, [descricao]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          tipo,
          valor: parseFloat(valor),
          descricao,
          categoria,
          anexoUrl,
        });
      }}
    >
      <div className="form-group">
        <select
          className="tipo-transacao-select"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
        >
          <option value="">Selecione o tipo de transação</option>
          <option value="deposito">Depósito</option>
          <option value="transferencia">Transferência</option>
          <option value="pagamento">Pagamento</option>
          <option value="investimento">Investimento</option>
        </select>
      </div>

      <div className="form-group">
        <input
          type="number"
          className="valor-input"
          placeholder="R$ 00.00"
          step="0.01"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <select
          className="tipo-transacao-select"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
        >
          <option value="">Selecione a categoria</option>
          <option value="Saude">Saúde</option>
          <option value="Lazer">Lazer</option>
          <option value="Investimento">Investimento</option>
          <option value="Transporte">Transporte</option>
          <option value="Outros">Outros</option>
        </select>
      </div>

      <div className="form-group">
        <textarea
          className="descricao-textarea"
          placeholder="Descrição da transação (opcional)"
          rows={3}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>

      <UploadAnexo
        idUsuario={idUsuario}
        idTransacao={idTransacao}
        dataTransacao={dataTransacao}
        onUploadSuccess={(url) => setAnexoUrl(url)}
        onRemoveSuccess={() => setAnexoUrl(null)}
        urlAtual={anexoUrl}
      />

      {/* Mostrar nomes do anexo */}
      {anexoUrl && (
        <div className="mt-2">
          <strong>Arquivo:</strong>
          <p>Nome original: {nomeArquivoOriginal || "N/A"}</p>
          <p>Nome no Firebase: {nomeFirebase}</p>
        </div>
      )}

      <button type="submit" className="btn btn-success mt-3">
        {modo === "nova" ? "Concluir Transação" : "Salvar Alterações"}
      </button>
    </form>
  );
};

export default FormularioTransacao;
