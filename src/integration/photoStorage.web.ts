// NAVEGADOR: guarda a foto como imagem JPEG reduzida (data URL). O armazenamento do
// navegador (localStorage) tem só ~5 MB, e uma foto de câmera passa disso sozinha.
// Reduzindo para no máximo 1024 px, cada foto fica com ~100 KB.
const MAX_SIDE = 1024;
const QUALITY = 0.7;

export async function persistPhoto(uri: string | null): Promise<string | null> {
  if (!uri) return null;
  if (/^https?:/i.test(uri)) return uri; // foto da internet (dados iniciais): mantém

  return new Promise<string>((resolve, reject) => {
    const img = document.createElement('img');

    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Não foi possível preparar a foto para salvar.'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', QUALITY));
    };

    img.onerror = () => reject(new Error('Não foi possível preparar a foto para salvar.'));
    img.src = uri;
  });
}

export async function deletePhoto(_uri: string | null): Promise<void> {
  // No navegador a foto vive dentro do próprio registro; nada a apagar.
}
