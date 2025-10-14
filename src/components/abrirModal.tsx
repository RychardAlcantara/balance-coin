import { useState } from "react";
import Image from "next/image";
import { Usuario } from "@/app/classes/Usuario";

export default function AbrirContaModal() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    termos: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleModal = () => setShowModal(!showModal);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome) newErrors.nome = "O campo Nome é obrigatório.";
    if (!formData.email) newErrors.email = "O campo E-mail é obrigatório.";
    if (!formData.senha) newErrors.senha = "O campo Senha é obrigatório.";
    if (!formData.termos)
      newErrors.termos = "É necessário aceitar os termos para continuar.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { nome, email, senha } = formData;
    const novoUsuario = new Usuario(nome, email, senha);

    try {
      await novoUsuario.cadastrar();
      toggleModal();
    } catch (error: unknown) {
  if (error instanceof Error) {
    window.alert(error.message);
  } else {
    window.alert("Ocorreu um erro desconhecido.");
  }
}

  };

  return (
    <>
      <button className="btn btn-modalAbrirConta" onClick={toggleModal}>
        Abrir minha Conta
      </button>

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          aria-labelledby="abrirContaModalLabel"
          aria-hidden="true"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="abrirContaModalLabel">
                  Crie sua conta
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={toggleModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body mx-auto">
                <Image src="/images/abriConta.png" alt="Logo Balance Coin" width={355} height={262} priority className="mb-3 img-fluid"/>
                <p>Preencha os campos abaixo para criar sua conta corrente!</p>
                <form>
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label">
                      Nome
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.nome ? "is-invalid" : ""}`}
                      id="nome"
                      placeholder="Digite seu nome completo"
                      value={formData.nome}
                      onChange={handleInputChange}
                    />
                    {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      E-mail
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      id="email"
                      placeholder="Digite seu e-mail"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="senha" className="form-label">
                      Senha
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.senha ? "is-invalid" : ""}`}
                      id="senha"
                      placeholder="Digite sua senha"
                      value={formData.senha}
                      onChange={handleInputChange}
                    />
                    {errors.senha && <div className="invalid-feedback">{errors.senha}</div>}
                  </div>
                  <div className="mb-3">
                    <input
                      type="checkbox"
                      className={`form-check-input ${errors.termos ? "is-invalid" : ""}`}
                      id="termos"
                      checked={formData.termos}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label termostext" htmlFor="termos">
                      Li e estou ciente quanto às condições de tratamento dos meus dados
                      <br />
                      conforme descrito na Política de Privacidade do banco.
                    </label>
                    {errors.termos && <div className="invalid-feedback d-block">{errors.termos}</div>}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btnCriarConta" onClick={handleSubmit}>
                  Criar Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
