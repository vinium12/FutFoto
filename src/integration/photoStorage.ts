import * as FileSystem from 'expo-file-system/legacy';

// CELULAR: a foto é copiada para uma pasta fixa do app e no banco .json fica só o
// CAMINHO dela. Antes a foto era guardada inteira em base64 dentro do JSON/AsyncStorage,
// o que estoura o limite de armazenamento depois de poucas fotos.
function getPhotosDir(): string | null {
  return FileSystem.documentDirectory ? `${FileSystem.documentDirectory}fotos/` : null;
}

export async function persistPhoto(uri: string | null): Promise<string | null> {
  if (!uri) return null;

  const dir = getPhotosDir();
  if (!dir) return uri;
  if (/^https?:/i.test(uri)) return uri; // foto da internet (dados iniciais): mantém
  if (uri.startsWith(dir)) return uri; // já está salva na pasta do app

  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Foto em base64 (registros antigos): grava como arquivo .jpg
  if (uri.startsWith('data:')) {
    const dest = `${dir}${id}.jpg`;
    await FileSystem.writeAsStringAsync(dest, uri.split(',')[1] ?? '', {
      encoding: FileSystem.EncodingType.Base64,
    });
    return dest;
  }

  // Foto da câmera/galeria (fica numa pasta temporária): copia pra pasta do app
  const ext = uri.split('?')[0].match(/\.(jpe?g|png|webp|heic)$/i)?.[1]?.toLowerCase() ?? 'jpg';
  const dest = `${dir}${id}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export async function deletePhoto(uri: string | null): Promise<void> {
  const dir = getPhotosDir();
  if (uri && dir && uri.startsWith(dir)) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}
