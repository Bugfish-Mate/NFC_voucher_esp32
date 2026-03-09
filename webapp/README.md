# Webapp

Diese Webapp ist das Frontend des Projekts `NFC_voucher_esp32`. Sie wurde mit React und Vite erstellt und wird nach dem Build nicht auf einem klassischen Webserver, sondern direkt auf dem ESP32 bereitgestellt.

Die Anwendung spricht ausschliesslich mit der REST-API des ESP32. Sie enthaelt aktuell die Oberflaechen fuer:
- Auslesen eines NFC-Tags
- Beschreiben eines NFC-Tags

## Rolle im Gesamtsystem

Die Webapp ist nur die Benutzeroberflaeche. Die eigentliche NFC-Kommunikation findet auf dem ESP32 statt.

Ablauf:
1. Der Browser laedt die statischen Dateien der Webapp vom ESP32.
2. Die Webapp sendet HTTP-Requests an Endpunkte wie `/api/tag/read` und `/api/tag/write`.
3. Der ESP32 kommuniziert ueber den PN532 mit dem NFC-Tag.
4. Das Ergebnis wird als JSON an die Webapp zurueckgegeben.
5. Die Webapp zeigt Status, UID und Textinhalt an.

## Projektstruktur

Wichtige Dateien:

- `src/App.jsx`
  Enthält die Hauptoberflaeche mit den Funktionen `NFC lesen` und `NFC beschreiben`.
- `src/App.css`
  Enthält das Layout und die Darstellung der Oberflaeche.
- `src/index.css`
  Enthält globale Styles.
- `src/main.jsx`
  Einstiegspunkt der React-Anwendung.
- `vite.config.js`
  Konfiguriert Vite so, dass der Build direkt nach `../data/webapp` geschrieben wird.
- `package.json`
  Enthält die NPM-Skripte fuer Entwicklung, Build und Deployment.

## Verwendete API-Endpunkte

Die Webapp nutzt aktuell diese Endpunkte des ESP32:

- `POST /api/tag/read`
  Liest ein NFC-Tag und liefert Tagtyp, UID und Text zurueck.
- `POST /api/tag/write`
  Schreibt einen Text auf ein NFC-Tag.

Die Basis-URL ist leer konfiguriert. Das bedeutet: Die Webapp spricht immer den Host an, von dem sie geladen wurde. Dadurch funktioniert sie direkt auf dem ESP32 ohne weitere Konfiguration.

## Entwicklung

Entwicklungsserver starten:

```bash
npm install
npm run dev
```

Danach ist die Webapp lokal ueber Vite erreichbar.

## Build fuer den ESP32

Die Webapp wird fuer das ESP32-Dateisystem gebaut.

```bash
npm run build:esp
```

Der Build wird in folgendes Verzeichnis geschrieben:

- `../data/webapp`

Dieses Verzeichnis wird anschliessend ueber LittleFS auf den ESP32 geladen.

## Deployment auf den ESP32

Wenn PlatformIO installiert und verfuegbar ist, kann die Webapp direkt deployt werden:

```bash
npm run deploy:esp
```

Dieses Skript fuehrt zwei Schritte aus:
1. Build der React-Webapp
2. Upload des LittleFS-Dateisystems auf den ESP32

## Hinweise

Die Webapp ist bewusst einfach gehalten. Sie bildet aktuell nur den bereits umgesetzten Funktionsumfang der ESP32-Firmware ab. Erweiterungen wie komplexe JSON-Datenstrukturen, Validierung von Gutscheinobjekten oder Verwaltungsfunktionen muessen sowohl im Frontend als auch in der Firmware ergaenzt werden.
