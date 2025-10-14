import React from "react";
import Image from "next/image";

interface ServicosProps {
  onServicoSelecionado: (key: string) => void;
}

const Servicos: React.FC<ServicosProps> = ({ onServicoSelecionado }) => {
  const servicos = [
    { nome: "Empréstimo", imagem: "/images/emprestimo.png" },
    { nome: "Meus cartões", imagem: "/images/cartoes.png", key: "cartoes-credito" },
    { nome: "Pix", imagem: "/images/pix.png" },
    { nome: "Seguros", imagem: "/images/seguros.png" },
    { nome: "Doações", imagem: "/images/doacoes.png" },
    { nome: "Crédito celular", imagem: "/images/celular.png" },
  ];

  return (
    <div className="container my-4">
      <div className="mb-3 saldo-header">
        <h4>Outros Serviços</h4>
      </div>
      <div className="row g-3">
        {servicos.map((servico, index) => (
          <div
            key={index}
            className="col-6 col-md-4 col-lg-2"
            onClick={() => onServicoSelecionado(servico.key || servico.nome.toLowerCase().replace(" ", "-"))} // Passa a key ou um nome formatado
          >
            <div className="card text-center border-success">
              <div className="card-body">
                <Image src={servico.imagem} alt={servico.nome} width={50} height={50} className="mb-2" />
                <h6 className="mt-2">{servico.nome}</h6>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Servicos;