/**
 * Elenco file per camera/appartamento — nomi esatti presi da mipa.html,
 * via_nazionale_camere.html, via_nazionale_suites.html (nessun file
 * inventato). Le foto vere vanno messe in
 * public/images/gallery/{gallerySlug}/{roomId}/{filename}, con questi
 * stessi nomi esatti (maiuscole/minuscole comprese).
 *
 * Se un nome file elencato qui non esiste ancora sul disco, quella
 * singola foto viene semplicemente saltata nella griglia (non genera
 * errore) — così puoi aggiungere le foto reali una alla volta, gruppo
 * per gruppo, senza dover completare tutto in una volta.
 */

export const GALLERY_PHOTOS: Record<string, Record<string, string[]>> = {
  mipa: {
    MiPA1: [
      "20250111_142153_result.jpg", "20250111_142537_result.jpg", "20250111_142554_result.jpg",
      "20250111_142557_result.jpg", "20250111_142640_result.jpg", "20250111_142748_result.jpg",
      "20250111_142759_result.jpg", "20250111_142815_result.jpg", "20250111_142829_result.jpg",
      "20250111_142905_result.jpg", "20250111_142937_result.jpg", "20250111_143031_result.jpg",
      "20250111_143039_result.jpg", "20250111_143112_result.jpg", "20250111_143127_result.jpg",
      "20250111_143137_result.jpg", "20250111_143217_result.jpg", "20250111_143306_result.jpg",
    ],
    MiPA2: [
      "20250111_151612_result.jpg", "20250111_151622_result.jpg", "20250111_151630_result.jpg",
      "20250111_151643_result.jpg", "20250111_151659_result.jpg", "20250111_151706_result.jpg",
      "20250111_151737_result.jpg", "20250111_151803_result.jpg", "20250111_151842_result.jpg",
      "20250111_151852(0)_result.jpg", "20250111_151918_result.jpg", "20250111_151924(0)_result.jpg",
      "20250111_151928_result.jpg", "20250111_151950_result.jpg", "20250111_152007_result.jpg",
      "20250111_152020_result.jpg", "20250111_152024_result.jpg", "20250111_152043_result.jpg",
      "20250111_152106_result.jpg",
      "photo_2023-09-10_18-10-25.jpg", "photo_2023-09-10_18-15-14.jpg", "photo_2023-09-10_18-25-44.jpg",
    ],
    MiPA3: [
      "20250111_144901_result.jpg", "20250111_144916_result.jpg", "20250111_144927_result.jpg",
      "20250111_144942_result.jpg", "20250111_144948_result.jpg", "20250111_145014_result.jpg",
      "20250111_145025_result.jpg", "20250111_145032_result.jpg", "20250111_145051_result.jpg",
      "20250111_145101_result.jpg", "20250111_145115_result.jpg", "20250111_145122_result.jpg",
      "20250111_145132_result.jpg", "20250111_145203_result.jpg", "20250111_145209_result.jpg",
      "20250111_145219_result.jpg", "20250111_145226_result.jpg", "20250111_145236_result.jpg",
      "20250111_145254_result.jpg",
    ],
    MiPA4: [
      "photo_2024-07-15_07-07-12.jpg",
      "photo_2024-07-15_07-07-12 (2).jpg", "photo_2024-07-15_07-07-12 (3).jpg",
      "photo_2024-07-15_07-07-12 (4).jpg", "photo_2024-07-15_07-07-12 (5).jpg",
      "photo_2024-07-15_07-07-13.jpg",
      "photo_2024-07-15_07-07-13 (2).jpg", "photo_2024-07-15_07-07-13 (3).jpg",
      "photo_2024-07-15_07-07-13 (4).jpg", "photo_2024-07-15_07-07-13 (5).jpg",
      "photo_2024-07-15_07-07-13 (6).jpg",
      "photo_2024-07-15_07-17-22.jpg",
    ],
  },
  "via-nazionale": {
    "101": [
      "20250110_112619.jpg", "20250110_112718.jpg", "20250110_112722.jpg", "20250110_112728.jpg",
      "20250110_112756.jpg", "20250110_112833.jpg", "20250110_113757.jpg", "20250110_114038.jpg",
      "20250110_114152.jpg", "20250110_114210.jpg", "20250110_114228.jpg", "20250110_114246.jpg",
      "20250110_114302.jpg", "20250110_114315.jpg", "20250110_114352.jpg", "20250110_114410.jpg",
    ],
    "102": [
      "20250110_120926.jpg", "20250110_120959.jpg", "20250110_121055.jpg", "20250110_121101.jpg",
      "20250110_121251.jpg", "20250110_121342.jpg", "20250110_121403.jpg", "20250110_121456.jpg",
      "20250110_121536.jpg", "20250110_121610.jpg", "20250110_121616(0).jpg", "20250110_121629.jpg",
      "20250110_121812.jpg",
    ],
    "103": [
      "20250110_125254.jpg", "20250110_125331.jpg", "20250110_125353.jpg", "20250110_125500.jpg",
      "20250110_125515.jpg", "20250110_125526.jpg", "20250110_125550.jpg", "20250110_125602.jpg",
      "20250110_125616.jpg", "20250110_125633.jpg", "20250110_125730.jpg", "20250110_125753.jpg",
      "20250110_125804.jpg", "20250110_125824.jpg",
    ],
    "104": [
      "20250110_142958.jpg", "20250110_143034.jpg", "20250110_143109.jpg", "20250110_143120.jpg",
      "20250110_143132.jpg", "20250110_143143.jpg", "20250110_143202.jpg", "20250110_143216.jpg",
      "20250110_143235.jpg", "20250110_143257.jpg", "20250110_143319.jpg", "20250110_143327.jpg",
      "20250110_143333.jpg", "20250110_143348.jpg", "20250110_143434.jpg", "20250110_143523.jpg",
    ],
    "105": [
      "20250110_151206.jpg", "20250110_151231.jpg", "20250110_151256.jpg", "20250110_151309.jpg",
      "20250110_151404.jpg", "20250110_151417.jpg", "20250110_151441.jpg", "20250110_151518.jpg",
      "20250110_151655.jpg", "20250110_151725.jpg",
    ],
    breakfast: [
      "20250110_152604.jpg", "20250110_152617.jpg", "20250110_152634.jpg", "20250110_152643.jpg",
      "20250110_152658.jpg", "20250110_152711.jpg", "20250110_152731.jpg", "20250110_152805.jpg",
      "20250110_152816.jpg", "20250110_152858.jpg", "20250110_152925.jpg", "20250110_153101.jpg",
      "20250110_153111.jpg",
    ],
  },
  "via-nazionale-suites": {
    "201": [
      "_MG_0067.jpg",
      "_MG_0073.jpg", "_MG_0074.jpg", "_MG_0076.jpg", "_MG_0078.jpg",
      "_MG_0079.jpg", "_MG_0082.jpg", "_MG_0083.jpg", "_MG_0089.jpg",
      "_MG_0098.jpg", "_MG_0099.jpg", "_MG_0102.jpg", "_MG_0105.jpg",
    ],
    "202": [
      "_MG_0107.jpg",
      "_MG_0109.jpg", "_MG_0115.jpg", "_MG_0119.jpg", "_MG_0121.jpg",
      "_MG_0124.jpg", "_MG_0129.jpg", "_MG_0138.jpg", "_MG_0141.jpg", "_MG_0144.jpg",
    ],
    "203": [
      "_MG_0146.jpg",
      "_MG_0149.jpg", "_MG_0153.jpg", "_MG_0157.jpg", "_MG_0159.jpg",
      "_MG_0163.jpg", "_MG_0173.jpg", "_MG_0191.jpg", "_MG_0197.jpg", "_MG_0198.jpg",
    ],
  },
};

/** Costruisce l'URL pubblico di ogni foto di una camera/appartamento. */
export function getPhotoUrls(gallerySlug: string, roomId: string): string[] {
  const files = GALLERY_PHOTOS[gallerySlug]?.[roomId] ?? [];
  return files.map((f) => `/images/gallery/${gallerySlug}/${roomId}/${encodeURIComponent(f)}`);
}

/**
 * Tutte le foto di un intero gruppo (es. "MiPA — Appartamenti"), prese
 * dalla stessa fonte di getPhotoUrls ma tutte insieme, senza dividerle
 * per singola camera — per la galleria cumulativa di struttura.
 */
export function getGroupPhotoUrls(gallerySlug: string): string[] {
  const rooms = GALLERY_PHOTOS[gallerySlug] ?? {};
  return Object.entries(rooms).flatMap(([roomId, files]) =>
    files.map((f) => `/images/gallery/${gallerySlug}/${roomId}/${encodeURIComponent(f)}`)
  );
}
