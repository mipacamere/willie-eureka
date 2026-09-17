# Foto delle gallerie

Metti qui le foto reali delle camere/appartamenti, **con lo stesso nome file esatto** elencato in `lib/gallery/photos.ts` (maiuscole/minuscole comprese) — è così che il sito trova ogni foto.

## Dove va ogni foto

```
mipa/MiPA1/            → foto dell'appartamento MiPA 1
mipa/MiPA2/            → foto dell'appartamento MiPA 2
mipa/MiPA3/            → foto dell'appartamento MiPA 3
mipa/MiPA4/            → foto dell'appartamento MiPA 4

via-nazionale/101/     → foto della camera 101
via-nazionale/102/     → foto della camera 102
via-nazionale/103/     → foto della camera 103
via-nazionale/104/     → foto della camera 104
via-nazionale/105/     → foto della camera 105
via-nazionale/breakfast/ → foto della sala colazione

via-nazionale-suites/201/ → foto della suite 201
via-nazionale-suites/202/ → foto della suite 202
via-nazionale-suites/203/ → foto della suite 203
```

## Come funziona

- Basta **una foto per file** (non serve una versione "miniatura" separata: il sito la ridimensiona automaticamente per la griglia).
- Se una foto elencata nei dati non è ancora presente in una cartella, quella singola foto viene saltata nella pagina — non genera errori. Puoi quindi caricare le foto un gruppo alla volta, con calma.
- Se vuoi **aggiungere o rinominare** delle foto rispetto all'elenco originale, aggiorna anche `lib/gallery/photos.ts` con i nomi esatti dei file che stai caricando.
- Formati supportati: qualunque formato immagine che il browser sa mostrare (jpg, jpeg, png, webp...).
