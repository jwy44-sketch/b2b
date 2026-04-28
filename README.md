# CON 3990V Scenario Room

Static study site for a CON 3990V-style scenario testing room built from the uploaded course materials in [`con3990v_absorbed`](/C:/Users/Johnathan%20Youngblood/OneDrive/Documents/Playground/con3990v_absorbed).

## What it does

- Presents one four-choice question at a time
- Rotates through all 20 topic buckets in a fixed rolling sequence
- Scores answers by bucket
- Gives immediate feedback in this format:
  - why the correct answer is correct
  - why the other answers are wrong
  - fast separation
  - specific FAR concept being tested
- Prefers RFO-first terminology where the uploaded materials signal a shift from legacy wording

## Files

- [index.html](/C:/Users/Johnathan%20Youngblood/OneDrive/Documents/Playground/index.html): static app shell
- [styles.css](/C:/Users/Johnathan%20Youngblood/OneDrive/Documents/Playground/styles.css): visual styling
- [src/app.js](/C:/Users/Johnathan%20Youngblood/OneDrive/Documents/Playground/src/app.js): browser wiring
- [src/engine.js](/C:/Users/Johnathan%20Youngblood/OneDrive/Documents/Playground/src/engine.js): question rotation, scoring, and feedback logic
- [src/question-bank.js](/C:/Users/Johnathan%20Youngblood/OneDrive/Documents/Playground/src/question-bank.js): generated question bank
- [scripts/build-question-bank.mjs](/C:/Users/Johnathan%20Youngblood/OneDrive/Documents/Playground/scripts/build-question-bank.mjs): parser/generator for the scenario bank plus supplemental gap questions
- [con3990v_absorbed/ABSORPTION_NOTES.md](/C:/Users/Johnathan%20Youngblood/OneDrive/Documents/Playground/con3990v_absorbed/ABSORPTION_NOTES.md): compact source map and study logic notes

## Regenerating the bank

```powershell
& 'C:\Users\Johnathan Youngblood\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\scripts\build-question-bank.mjs'
```

## Running locally

Serve the folder with any simple static server. Example:

```powershell
@'
import http.server
import socketserver

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving on http://localhost:{PORT}")
    httpd.serve_forever()
'@ | & 'C:\Users\Johnathan Youngblood\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -
```

Then open `http://localhost:8000`.

## Notes

- Threshold questions are intentionally kept concept-first unless the uploaded materials support a stable value.
- The site currently uses a generated source bank plus a small authored supplement for gap coverage in buckets like threshold traps, RFO shifts, and termination notices.
