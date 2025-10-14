import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Usuario } from "@/app/classes/Usuario";
import { useRouter } from "next/navigation";

export default function ModalLogin() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const router = useRouter();

  const toggleModal = () => {
    setShowModal(!showModal);
    setErroLogin("");
    setEmail("");
    setSenha("");
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErroLogin("");

    const usuario = new Usuario("", email, senha);

    try {
      const user = await usuario.login();
      console.log("Usuário logado:", user);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setErroLogin(error.message);
      }
    }
  };

  return (
    <>
      <button className="btn btn-modalLoginUsuario" onClick={toggleModal}>Já tenho conta</button>

      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-labelledby="abrirContaModalLabel" aria-hidden="true" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="abrirContaModalLabel">Entre na sua conta</h5>
                <button type="button" className="btn-close" onClick={toggleModal} aria-label="Close"></button>
              </div>
              <div className="modal-body mx-auto">
                <Image src="/images/ilustra_Cadastro.png" alt="Logo Balance Coin" width={355} height={262} priority className="mb-3 img-fluid" />
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">E-mail</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Digite seu e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="senha" className="form-label">Senha</label>
                    <input
                      type="password"
                      className="form-control"
                      id="senha"
                      placeholder="Digite sua senha"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <Link href="/recuperar-senha" className="esqueciminhasenha">Esqueci minha senha</Link>
                  </div>
                  {erroLogin && (
                    <div className="alert alert-danger" role="alert">
                      {erroLogin}
                    </div>
                  )}
                  <button type="submit" className="btn btn-acessar">Acessar</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
