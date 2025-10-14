/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, ChangeEvent, useEffect } from "react";

interface UploadAnexoProps {
  idUsuario: string;
  idTransacao: string;
  dataTransacao: string; // Format: DD-MM-YYYY
  onUploadSuccess?: (base64: string) => void;
  onRemoveSuccess: () => void;
  urlAtual: string | null;
}

const tiposPermitidos = ["image/jpeg", "image/png", "image/bmp", "application/pdf"];

const converterArquivoParaBase64 = (
  file: File,
  onProgress: (percent: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const tamanhoTotal = file.size;

    reader.onloadstart = () => onProgress(0);

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / tamanhoTotal) * 100);
        onProgress(percent);
      }
    };

    reader.onloadend = () => {
      onProgress(100);
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject("Erro ao converter o arquivo.");
      }
    };

    reader.onerror = () => reject("Erro ao ler o arquivo.");

    reader.readAsDataURL(file);
  });
};

const UploadAnexo: React.FC<UploadAnexoProps> = ({
  idUsuario,
  idTransacao,
  dataTransacao,
  onUploadSuccess,
  onRemoveSuccess,
  urlAtual,
}) => {
  const [progresso, setProgresso] = useState<number>(0);
  const [nomeArquivoOriginal, setNomeArquivoOriginal] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string>("");
  const [nomeFirebase, setNomeFirebase] = useState<string>("");

  useEffect(() => {
    if (nomeArquivoOriginal) {
      const extensao = nomeArquivoOriginal.split(".").pop();
      const nomeGerado = `anexo_${idUsuario}_${idTransacao}_${dataTransacao.replaceAll("-", "")}.${extensao}`;
      setNomeFirebase(nomeGerado);
    }
  }, [nomeArquivoOriginal, idUsuario, idTransacao, dataTransacao]);

  const handleArquivoSelecionado = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setMensagem("");

    if (file) {
      if (!tiposPermitidos.includes(file.type)) {
        setMensagem("Arquivo inválido. Permitidos: JPG, PNG, BMP e PDF.");
        return;
      }

      setNomeArquivoOriginal(file.name);
      setProgresso(0);

      try {
        const base64 = await converterArquivoParaBase64(file, setProgresso);
        setMensagem("Arquivo anexado com sucesso!");
        if (onUploadSuccess) onUploadSuccess(base64);
      } catch (error) {
        console.error(error);
        setMensagem("Falha no processo de anexo do arquivo.");
      }
    }
  };

  return (
    <div className="mt-3">
      <label className="form-label">
        Selecione um arquivo (JPG, PNG, BMP ou PDF)
      </label>
      <input
        type="file"
        className="form-control"
        accept=".jpg,.jpeg,.png,.bmp,.pdf"
        onChange={handleArquivoSelecionado}
      />

      {urlAtual && (
  <div className="mt-3">
    <p>
      <strong>Anexo atual:</strong>{" "}
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() => {
          if (urlAtual.startsWith("data:")) {
            // É base64
            const newWindow = window.open();
            if (newWindow) {
              newWindow.document.write(`<iframe src="${urlAtual}" frameborder="0" style="width:100%;height:100%"></iframe>`);
              newWindow.document.title = "Visualizar Anexo";
            }
          } else {
            // É uma URL pública
            window.open(urlAtual, "_blank");
          }
        }}
      >
        Visualizar
      </button>{" "}
      |{" "}
      <button
        type="button"
        className="btn btn-sm btn-outline-danger ms-2"
        onClick={onRemoveSuccess}
      >
        Remover
      </button>
    </p>
  </div>
)}

      {nomeArquivoOriginal && (
        <div className="mt-2">
          <p><strong>Nome original:</strong> {nomeArquivoOriginal}</p>
          <div className="progress">
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${progresso}%` }}
              aria-valuenow={progresso}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {progresso}%
            </div>
          </div>
        </div>
      )}

      {mensagem && <p className="mt-2">{mensagem}</p>}
    </div>
  );
};

export default UploadAnexo;
