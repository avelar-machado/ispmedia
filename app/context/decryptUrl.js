// Importa a biblioteca crypto-js
import CryptoJS from 'crypto-js';

// Chave secreta para desencriptação (deve ser a mesma usada no servidor)
const secretKey = 'mySecretKey';

/**
 * Função para desencriptar a URL do vídeo.
 * @param {string} encryptedUrl - URL encriptada.
 * @returns {string} URL desencriptada.
 */
export function decryptUrl(encryptedUrl) {
  const bytes = CryptoJS.AES.decrypt(encryptedUrl, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}
