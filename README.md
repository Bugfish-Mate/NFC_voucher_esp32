# NFC Voucher ESP32

Dieses Projekt ist ein NFC-Programmiergeraet auf Basis eines ESP32 und eines PN532-Readers. Der ESP32 uebernimmt die Kommunikation mit NFC-Tags, stellt eine HTTP-API bereit und liefert eine React-Webapp direkt an den Browser aus. Die Webapp dient aktuell zum Lesen und Beschreiben von NFC-Tags.

Das Projekt basiert auf einer groesseren urspruenglichen Aufgabenstellung fuer ein Gutschein-System mit NFC-Tags. Der aktuelle Stand setzt bewusst nur einen Teil dieser Anforderungen um. Im Fokus stehen die technische Grundarchitektur, die NFC-Kommunikation, das Hosting der Weboberflaeche auf dem Mikrocontroller und ein klarer Programmaufbau.

## Architektur

Die Architektur besteht aus drei Schichten:

1. Hardware
- ESP32 als zentrale Recheneinheit
- PN532 als NFC-Reader ueber I2C
- WS2812-Status-LED zur Anzeige von Systemzustaenden
- NTAG215 als verwendeter NFC-Tag-Typ

2. Firmware auf dem ESP32
- Initialisiert WLAN, Dateisystem, Status-LED und NFC-Hardware
- Stellt REST-Endpunkte fuer NFC-Operationen bereit
- Liest und schreibt Nutzdaten auf dem NFC-Tag
- Liefert die gebaute React-Webapp aus dem internen Dateisystem aus

3. React-Webapp
- Laeuft im Browser
- Wird als statische Build-Dateien vom ESP32 ausgeliefert
- Nutzt ausschliesslich HTTP-Requests gegen die REST-API des ESP32
- Bietet aktuell Oberflaechen fuer `Tag lesen` und `Tag beschreiben`

### Datenfluss

Der typische Ablauf ist:

1. Der Browser ruft die Webapp vom ESP32 ab.
2. Die Webapp sendet einen Request an einen API-Endpunkt wie `/api/tag/read` oder `/api/tag/write`.
3. Die Firmware wartet auf ein NFC-Tag, kommuniziert ueber den PN532 mit dem Tag und fuehrt die gewuenschte Operation aus.
4. Das Ergebnis wird als JSON an die Webapp zurueckgegeben.
5. Die Webapp zeigt Status, UID und gelesene oder geschriebene Inhalte an.

### Hosting-Konzept

Die React-App wird lokal im Ordner `webapp` entwickelt. Beim Build werden die statischen Dateien nach `data/webapp` geschrieben. Dieses Verzeichnis wird ueber LittleFS auf den ESP32 geladen. Die Firmware stellt anschliessend diese Dateien als Webanwendung bereit.

Damit ergibt sich folgende Trennung:
- `webapp/` enthaelt den React-Quellcode
- `data/webapp/` enthaelt das gebaute Frontend fuer den ESP32
- `src/main.cpp` enthaelt Firmware, REST-API und NFC-Logik

## Programmstruktur

### 1. ESP32-Firmware

Die Firmware ist aktuell in einer zentralen Datei organisiert:

- [src/main.cpp](C:\VSCode_CPE\projects\NFC_voucher_esp32\src\main.cpp)

Wichtige Aufgabenbereiche in dieser Datei:

#### Initialisierung und Infrastruktur
- Einbinden der benoetigten Bibliotheken fuer WLAN, Webserver, JSON, LittleFS, PN532 und NeoPixel
- Definition der Pinbelegung fuer I2C, PN532 und Status-LED
- Initialisierung von `AsyncWebServer`, `Adafruit_PN532` und der Status-LED

#### Logging und Statusanzeige
- `logLine(...)` und `logRequest(...)` erzeugen serielle Debug-Ausgaben mit Zeitstempeln
- `setStatusLed(...)` steuert die WS2812-LED fuer Boot, Idle, Busy, Erfolg und Fehler

#### NFC-Hilfsfunktionen
- `readTagUid(...)` liest die UID eines Tags mit mehreren Wiederholversuchen
- `readPageWithRetry(...)` und `writePageWithRetry(...)` kapseln robuste Seitenzugriffe fuer NTAG215
- `readTagText(...)` liest den Inhalt des User-Speichers als Text
- `writeStringToTag(...)` schreibt Text in den User-Speicher
- `eraseTagUserMemory(...)` loescht den User-Speicherbereich des Tags
- `setTagPassword(...)` und `removeTagPassword(...)` setzen oder entfernen einen Passwortschutz auf Tag-Ebene

#### Netzwerk und Dateisystem
- `setupEAPWiFi()` verbindet den ESP32 mit dem konfigurierten WLAN
- `setupFileSystem()` mountet LittleFS
- `setupWebRoutes()` stellt die React-Webapp und den SPA-Fallback bereit

#### REST-API
- `setupApiRoutes()` registriert alle HTTP-Endpunkte
- Die API verarbeitet Requests, fuehrt NFC-Operationen aus und antwortet mit JSON

Aktuell relevante Endpunkte:
- `GET /api/health`
- `GET /api/tag/read`
- `POST /api/tag/read`
- `POST /api/tag/write`
- `POST /api/tag/password/set`
- `POST /api/tag/password/remove`
- `POST /api/tag/erase`

#### Einstiegspunkt
- `setup()` initialisiert Serial, LED, WLAN, LittleFS, NFC und den Webserver
- `loop()` ist minimal gehalten, da Webserver und Request-Verarbeitung ereignisorientiert sind

### 2. React-Webapp

Die Webapp liegt im Ordner:

- [webapp](C:\VSCode_CPE\projects\NFC_voucher_esp32\webapp)

Wichtige Dateien:

- [webapp/src/App.jsx](C:\VSCode_CPE\projects\NFC_voucher_esp32\webapp\src\App.jsx)
- [webapp/src/App.css](C:\VSCode_CPE\projects\NFC_voucher_esp32\webapp\src\App.css)
- [webapp/src/index.css](C:\VSCode_CPE\projects\NFC_voucher_esp32\webapp\src\index.css)
- [webapp/vite.config.js](C:\VSCode_CPE\projects\NFC_voucher_esp32\webapp\vite.config.js)
- [webapp/package.json](C:\VSCode_CPE\projects\NFC_voucher_esp32\webapp\package.json)

Aufgaben der Webapp:
- Anzeige der Benutzeroberflaeche
- Ausloesen von API-Aufrufen zum Lesen und Schreiben
- Anzeigen von Statusmeldungen und Ergebnissen

Der Build ist so konfiguriert, dass `vite build` direkt nach `../data/webapp` schreibt. Dadurch kann das Ergebnis unmittelbar per LittleFS auf den ESP32 deployt werden.

### 3. Plattform- und Build-Konfiguration

Die PlatformIO-Konfiguration liegt in:

- [platformio.ini](C:\VSCode_CPE\projects\NFC_voucher_esp32\platformio.ini)

Wichtige Punkte:
- Board-Definition fuer den ESP32
- Aktiviertes LittleFS-Dateisystem
- Bibliotheken fuer PN532, AsyncWebServer, ArduinoJson und NeoPixel

## Aktuell umgesetzter Funktionsumfang

Der aktuelle Stand fokussiert sich auf die technische Basis und nicht auf die komplette Gutscheinlogik der urspruenglichen Aufgabenstellung.

Bereits umgesetzt:
- NFC-Tag ueber PN532 lesen
- Textinhalt von NTAG215 lesen
- Text auf NTAG215 schreiben
- Tag loeschen
- Passwort auf dem Tag setzen und entfernen
- REST-API auf dem ESP32
- React-Webapp, gehostet direkt vom ESP32
- Statusanzeige ueber eine WS2812-LED
- Debug-Logging auf dem ESP32

Bewusst noch nicht vollstaendig umgesetzt:
- Vollstaendige JSON-Datenstruktur fuer Gutscheininformationen
- Validierung eines komplexen Gutscheinobjekts
- Verwaltung konsumierter Einheiten als Liste aus Datum und Menge
- Endgueltiges Sicherheitskonzept fuer den produktiven Einsatz
- Vollstaendige Oberflaeche fuer alle in der urspruenglichen Aufgabenstellung genannten Funktionen

## Projektverzeichnis

Die wichtigsten Verzeichnisse im Ueberblick:

- `src/` Firmware des ESP32
- `webapp/` React-Quellcode
- `data/webapp/` gebautes Frontend fuer LittleFS
- `.pio/` Build-Artefakte von PlatformIO
- `platformio.ini` Projekt- und Bibliothekskonfiguration

## Build und Deployment

### Firmware

Build und Flash erfolgen mit PlatformIO.

### Webapp

Die Webapp wird im Verzeichnis `webapp/` entwickelt.

Wichtige Scripts:
- `npm run build`
- `npm run build:esp`
- `npm run deploy:esp`

`npm run build:esp` erzeugt die statischen Dateien in `data/webapp`.
`npm run deploy:esp` baut die Webapp und laedt das LittleFS-Dateisystem auf den ESP32.

## Hinweise zum Projektstand

Diese Repository-Version dokumentiert einen funktionierenden technischen Prototypen. Der Schwerpunkt liegt auf der Kopplung von ESP32, NFC-Hardware, REST-API und Web-Frontend. Die urspruengliche Schulprojektidee ist weiterhin die fachliche Grundlage, der implementierte Umfang ist aber bewusst reduziert und technisch fokussiert.
