// components/ModalSucesso.tsx
import React from "react";

interface ModalSucessoProps {
  mensagem: string;
  onClose: () => void;
}

const ModalSucesso: React.FC<ModalSucessoProps> = ({ mensagem, onClose }) => {
  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-labelledby="modalSucessoLabel"
      aria-hidden="true"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content text-center p-4">
          <h5 className="modal-title mb-3" id="modalSucessoLabel">✅ Sucesso!</h5>
          <p>{mensagem}</p>
          <button className="btn btn-success mt-3" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSucesso;
