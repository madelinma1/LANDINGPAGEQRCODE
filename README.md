# Visible — Diagnóstico Marco PEAK

Landing page interactiva del protocolo de diagnóstico **Visible** (los 3 Overs + el Marco PEAK para VP Readiness), publicada con GitHub Pages y accesible por código QR.

## 🔗 Sitio en vivo

**https://madelinma1.github.io/LANDINGPAGEQRCODE/**

## 📱 Código QR

![Código QR del diagnóstico](qr-code.png)

- `qr-code.png` / `qr-code.svg` — imágenes del QR listas para descargar o imprimir.
- `qr.html` — página imprimible que muestra el QR junto al enlace: `https://madelinma1.github.io/LANDINGPAGEQRCODE/qr.html`

El QR apunta al sitio en vivo. Si cambia el nombre del repositorio o el usuario, regenera el QR (ver más abajo).

## 🚀 Activar GitHub Pages (una sola vez)

1. En GitHub, ve a **Settings → Pages**.
2. En **Source**, elige **Deploy from a branch**.
3. Selecciona la rama por defecto (`main`) y la carpeta **`/ (root)`**, luego **Save**.
4. Espera 1–2 minutos: el sitio queda disponible en la URL de arriba.

No hay paso de compilación: el sitio es un único `index.html` (React vía CDN) que GitHub Pages sirve tal cual.

## 📁 Archivos

| Archivo | Descripción |
| --- | --- |
| `index.html` | La app del diagnóstico (página principal) |
| `qr.html` | Página imprimible con el código QR |
| `qr-code.svg` / `qr-code.png` | Imágenes del código QR |
| `.nojekyll` | Evita el procesamiento Jekyll de GitHub Pages |

## 🔄 Regenerar el código QR

Requiere Python con [`segno`](https://pypi.org/project/segno/):

```bash
pip install segno
python3 -c "import segno; q=segno.make('https://madelinma1.github.io/LANDINGPAGEQRCODE/', error='h'); q.save('qr-code.svg', scale=10, border=4); q.save('qr-code.png', scale=12, border=4)"
```

---
*Visible · Marco PEAK · © Madelin Santana 2026*
