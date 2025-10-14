export function visualizarAnexo(url: string): void {
  const novaJanela = window.open("", "_blank");

  if (!novaJanela) {
    alert("Popup bloqueado. Permita pop-ups para visualizar o anexo.");
    return;
  }

  const isImage = url.startsWith("data:image/");
  const isPDF = url.startsWith("data:application/pdf");

  let conteudoHTML = "";

  if (isImage) {
    conteudoHTML = `<html><body style="margin:0"><img src="${url}" style="max-width:100%;height:auto;" /></body></html>`;
  } else if (isPDF) {
    conteudoHTML = `<html><body style="margin:0"><embed src="${url}" type="application/pdf" width="100%" height="100%"/></body></html>`;
  } else {
    conteudoHTML = `<html><body><p>Formato de anexo não suportado.</p></body></html>`;
  }

  novaJanela.document.write(conteudoHTML);
  novaJanela.document.close();
}