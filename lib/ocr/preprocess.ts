// Porting di preprocessImage (mipacompanion/vncompanion): converte in scala di grigi e
// applica uno stretch lineare di contrasto (min-max normalization), che migliora
// sensibilmente la lettura OCR su foto scattate con poca luce o leggermente sfocate.
// Esegue solo lato client (richiede canvas/Image del DOM).
export function preprocessImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = d[i + 1] = d[i + 2] = gray;
      }
      let min = 255,
        max = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] < min) min = d[i];
        if (d[i] > max) max = d[i];
      }
      const range = Math.max(1, max - min);
      for (let i = 0; i < d.length; i += 4) {
        const v = ((d[i] - min) * 255) / range;
        d[i] = d[i + 1] = d[i + 2] = v;
      }
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => resolve(dataUrl); // in caso di errore usa l'originale
    img.src = dataUrl;
  });
}
