export const generateAESKey = async (): Promise<string> => {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );

  const exportedKey = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
};

export const encryptFileAES = async (
  file: File,
  aesKey: string,
): Promise<File> => {
  const keyBuffer = Uint8Array.from(atob(aesKey), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  // 12 bytes IV for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const fileBuffer = await file.arrayBuffer();

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    fileBuffer,
  );

  // Append .enc to the file name to indicate it's encrypted
  const fileName = file.name + ".enc";
  const encryptedFile = new Blob([iv, encryptedBuffer], {
    type: file.type,
  });
  return new File([encryptedFile], fileName, {
    type: file.type,
    lastModified: Date.now(),
  });
};

export const decryptFileAES = async (
  file: File,
  aesKey: string,
): Promise<File> => {
  const keyBuffer = Uint8Array.from(atob(aesKey), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const fileBuffer = await file.arrayBuffer();
  // First 12 bytes are the IV
  const iv = new Uint8Array(fileBuffer.slice(0, 12)); 
  // The rest is the encrypted data
  const encryptedData = fileBuffer.slice(12); 

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    encryptedData,
  );

  return new File([decryptedBuffer], file.name.replace(/\.enc$/, ""), {
    type: file.type,
    lastModified: Date.now(),
  });
}