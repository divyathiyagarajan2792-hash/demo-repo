# 0 → Shipped Resume Parser

A static mock: drop a PDF resume on the page, and the browser parses it with
pdf.js and shows a score plus which skills are present and which are missing.
No backend — everything happens client-side.

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
npx serve resume-parser
# or
python -m http.server 8080 --directory resume-parser
```

A local server is recommended rather than file:// so the pdf.js CDN script
loads cleanly.

## How the scoring works

- `script.js` holds one `SKILLS` array — add or remove skills there and the
  score, "present" and "missing" sections all update from it.
- The PDF's text is extracted page by page with pdf.js, lowercased, and each
  skill is matched by plain substring inclusion.
- Score = matched skills ÷ total known skills. Purely a demo metric.

## Files

- `index.html` — hero, dropzone, score card, present/missing skill cards
- `style.css` — dark theme, dropzone states, score ring, skill chips
- `script.js` — pdf.js wiring, skill matching, score/chip rendering
