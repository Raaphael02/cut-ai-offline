CUT-AI - Offline Schnittbildgenerator
=====================================

WILLKOMMEN BEI CUT-AI

CUT-AI ist eine vollständig funktionsfähige Web-App zur Erzeugung technischer 
Schnittdarstellungen (Cross-Sections) aus Fotografien - komplett offline, 
ohne Cloud, ohne API-Keys, ohne Internet.

Alles läuft lokal auf Ihrem Gerät.


==================================================
SYSTEM-ANFORDERUNGEN
==================================================

Minimal:
• Android 7.0 oder höher (empfohlen: Android 10+)
• Chrome, Firefox, Edge oder Safari
• ~20 MB freier Speicher
• Internetverbindung nur für den ERSTEN Start (zum Laden der App)

Optimal getestet:
• Xiaomi 14T Pro (oder vergleichbare moderne Smartphones)
• Chrome unter Android
• iOS 14+


==================================================
INSTALLATION - SCHRITT FÜR SCHRITT
==================================================

1. ZIP-DATEI HERUNTERLADEN
   - Laden Sie die CUT-AI-Offline.zip herunter
   - Entpacken Sie die Datei (mit Ihrem Standard-Datei-Manager)

2. APP STARTEN (Methode A - Empfohlen für Android)
   
   a) Öffnen Sie Google Chrome
   b) Geben Sie in der Adressleiste ein:
      file:///storage/emulated/0/CUT-AI/index.html
      
      (Oder passen Sie den Pfad an, wo Sie die Dateien entpackt haben)
   
   c) Die App sollte jetzt laden
   
   d) Optional: Installieren Sie als PWA:
      - Tippen Sie auf das Menü (⋮)
      - Wählen Sie "Zum Startbildschirm hinzufügen"
      - Dadurch wird die App wie eine normale App installiert

3. APP STARTEN (Methode B - Alternative)
   
   Wenn Methode A nicht funktioniert:
   
   a) Starten Sie einen einfachen lokalen HTTP-Server
      (Sie benötigen einen PC/Mac für diesen Schritt)
   
   b) Terminal/Kommandozeile öffnen, zum CUT-AI-Ordner navigieren
   
   c) Python 3 installiert? Eingeben:
      python3 -m http.server 8000
      
   d) Dann auf Ihrem Smartphone öffnen:
      http://<PC-IP>:8000
      
      (PC-IP finden Sie mit: ipconfig /all (Windows) oder ifconfig (Mac/Linux))


==================================================
VERWENDUNG
==================================================

1. FOTO AUFNEHMEN ODER AUSWÄHLEN
   - Tippen Sie auf "📷 Kamera" für ein neues Foto
   - Oder "📁 Galerie öffnen" um ein bestehendes Foto auszuwählen
   - Vorschau wird angezeigt

2. EINSTELLUNGEN WÄHLEN
   
   Schnittart:
   • Automatisch - App wählt beste Art
   • Längsschnitt - Vertikale Querschnittslinie
   • Querschnitt - Horizontale Schnittlinie
   • Halbschnitt - Eine Hälfte weggeschnitten
   • Schichtaufbau - Mehrere Schichten übereinander
   • Cutaway - Explosionsdarstellung mit Komponenten
   
   Darstellungsstil:
   • Technische Zeichnung - Neutral und präzise
   • Lehrbuch - Für Bildungszwecke
   • Wissenschaftlich - Detailliert und informativ
   • Minimalistisch - Sehr vereinfacht
   
   Detailgrad:
   • Schnell - Schnelle Verarbeitung, weniger Details
   • Ausgewogen - Empfohlen für die meisten Fälle
   • Detailreich - Mehr Komponenten, längere Verarbeitung
   
   Schraffur (Schnittflächen-Darstellung):
   • Diagonal - Diagonale Linien
   • Kreuzschraffur - Überkreuzte Linien
   • Keine - Nur Konturen
   
   Zusätzliche Anweisungen (optional):
   • z.B. "Zeige Elektronik-Komponenten"
   • z.B. "Fokus auf Mechanik"
   • z.B. "Beschrifftungen auf Deutsch"

3. SCHNITTBILD ERZEUGEN
   - Tippen Sie auf "✨ Schnittbild erzeugen"
   - Die App zeigt den Verarbeitungsfortschritt
   - Dies kann 10-30 Sekunden dauern (abhängig von Foto und Gerät)

4. ERGEBNIS ANSCHAUEN
   - Das Schnittbild wird angezeigt
   - Darunter ist eine Liste der erkannten Komponenten
   - Jede Komponente zeigt ihre Konfidenz (Sicherheit)
   - Eine Analyse-Zusammenfassung wird angezeigt

5. ERGEBNIS SPEICHERN
   - "💾 PNG speichern" - Speichert als Bild (für Galerie, E-Mail, etc.)
   - "📄 SVG speichern" - Speichert als Vektorgrafik (skalierbar, bearbeitbar)
   - Beide Formate funktionieren offline
   - Dateien werden in Downloads gespeichert

6. NEUE ANALYSE
   - "🔄 Neue Analyse" um ein anderes Foto zu analysieren


==================================================
KONFIDENZ-WERTE VERSTEHEN
==================================================

Jede erkannte Komponente hat einen Prozentsatz:

🔵 Blau (60-100%):     Sehr wahrscheinlich korrekt
🟠 Orange (40-60%):    Wahrscheinlich, aber mit Unsicherheit
⚪ Grau (10-40%):      Sehr unsicher, könnte falsch sein

Die App zeigt immer ehrlich, wie sicher sie sich ist.
KEINE erfundenen Details als Fakten präsentiert!


==================================================
WICHTIGE INFORMATIONEN
==================================================

✓ KOMPLETT OFFLINE
  - Keine Internetverbindung nach dem ersten Start erforderlich
  - Keine Datenübertragung an Server
  - Keine Tracking, keine Telemetrie
  - Ihre Fotos bleiben auf Ihrem Gerät

✓ KEINE API-KEYS
  - Sie müssen sich nicht anmelden
  - Keine Registrierung erforderlich
  - Keine API-Keys eingeben
  - Kostenlos zu nutzen

✓ LOKALE SPEICHERUNG
  - Die letzten Analysen werden lokal gespeichert
  - Sie können frühere Ergebnisse abrufen
  - Alles bleibt auf Ihrem Gerät

⚠ GRENZEN DER TECHNOLOGIE
  - Das Programm versucht, aus EINEM Foto die innere Struktur zu erraten
  - Ein einzelnes Foto zeigt nicht die komplette Realität
  - Komponenten sind PLAUSIBLE REKONSTRUKTIONEN
  - Bei komplexen Objekten können Fehler auftreten
  - Unsicherheiten werden IMMER angezeigt


==================================================
HÄUFIG GESTELLTE FRAGEN (FAQ)
==================================================

F: Kann ich die App ohne Internet nutzen?
A: Ja! Nach dem ersten Start funktioniert alles offline.
   Die App wird im Browser-Cache gespeichert.

F: Warum brauche ich einen Browser und nicht nur eine App?
A: Das ist eine Web-App (PWA). Sie können sie wie eine normale App
   verwenden, aber Sie sparen Speicher und Updates sind automatisch.

F: Wie genau sind die Schnittbilder?
A: Die App rekonstruiert plausible innere Strukturen basierend auf
   dem Foto. Der echte Aufbau kann abweichen. Die App ist ein
   "Bildungs-Tool", kein Röntgen-Gerät!

F: Warum fehlen manche Details?
A: Von außen kann man oft nicht sehen, was innen ist.
   Die App zeigt das ehrlich an und vermarktet keine Fantasie als Fakt.

F: Kann ich die SVG-Datei bearbeiten?
A: Ja! SVG ist ein Text-Format. Sie können es in jedem SVG-Editor
   öffnen (z.B. Inkscape, online unter svg-edit.org).

F: Was passiert mit meinen Fotos?
A: Sie bleiben 100% auf Ihrem Gerät. Nichts wird hochgeladen.
   Sie können die Fotos selbst löschen.

F: Funktioniert die App auf dem iPhone/iPad?
A: Ja, sie funktioniert auf iOS 14+. Öffnen Sie die Datei in Safari.

F: Kann ich die App verändern?
A: Ja! Der Code ist offen und Sie können ihn anpassen.
   Bearbeiten Sie einfach die HTML/CSS/JavaScript-Dateien.

F: Warum ist die Verarbeitung manchmal langsam?
A: Smartphones haben weniger Rechenleistung als PCs.
   Bei älteren Geräten kann die Verarbeitung länger dauern.
   "Schnell" ist schneller als "Detailreich".


==================================================
FEHLERBEHEBUNG
==================================================

Problem: "App lädt nicht"
Lösung:
  1. Überprüfen Sie, ob alle Dateien vorhanden sind
  2. Versuchen Sie Methode B (HTTP-Server)
  3. Probieren Sie einen anderen Browser
  4. Cache löschen: Chrome → Einstellungen → Speicher → Löschen

Problem: "Kamera funktioniert nicht"
Lösung:
  1. Überprüfen Sie, ob Chrome Kamera-Berechtigung hat
  2. Android: Einstellungen → Apps → Chrome → Berechtigungen → Kamera
  3. Versuchen Sie, ein Foto aus der Galerie zu verwenden

Problem: "Verarbeitung dauert sehr lange"
Lösung:
  1. Versuchen Sie ein kleineres oder einfacheres Foto
  2. Wählen Sie Detailgrad "Schnell"
  3. Schließen Sie andere Apps
  4. Ältere Geräte sind langsamer - das ist normal

Problem: "PNG/SVG kann nicht gespeichert werden"
Lösung:
  1. Überprüfen Sie, ob Chrome Speicher-Berechtigung hat
  2. Überprüfen Sie, ob Sie noch Speicherplatz haben
  3. Versuchen Sie, eine andere App zum Download zu öffnen
  4. Chrome-Downloads: menu → Downloads

Problem: "App stürzt ab"
Lösung:
  1. Starten Sie Ihr Gerät neu
  2. Aktualisieren Sie Chrome auf die neueste Version
  3. Leeren Sie den Cache
  4. Versuchen Sie ein anderes Gerät/Gerät


==================================================
TIPPS FÜR BESTE ERGEBNISSE
==================================================

✓ Beleuchtung
  - Gut beleuchtetes Foto
  - Keine Gegenlicht- oder Blitzschatten
  - Tageslicht oder helle Lampen bevorzugt

✓ Perspektive
  - Fotografieren Sie von der Seite oder von oben
  - Zeigen Sie die interessantesten Bereiche
  - Nicht von schräg oben, sondern eher frontal

✓ Objekt-Vorbereitung
  - Entfernen Sie Schutzfolien oder Verpackung
  - Säubern Sie das Objekt
  - Stellen Sie es stabil hin

✓ Bildqualität
  - Verwenden Sie die Haupt-Kamera (nicht Zoom)
  - Fokussieren Sie auf das Objekt
  - Halten Sie die Kamera ruhig (oder verwenden Sie ein Stativ)

✓ Dateigröße
  - Fotos sollten nicht zu groß sein
  - Die App skaliert automatisch herunter
  - Optimale Größe: 2-4 MB

✓ Objekttypen mit besseren Ergebnissen
  - Elektronische Geräte (Smartphones, Kopfhörer, etc.)
  - Mechanische Werkzeuge
  - Technische Bauteile
  - Gegenstände mit erkennbarer Struktur

✓ Objekttypen mit schlechteren Ergebnissen
  - Sehr simple Objekte (nur Kunststoff-Block)
  - Stark gefärbte/gefärbte Objekte
  - Gegenstände ohne innere Struktur
  - Extreme Makro-Aufnahmen


==================================================
TECHNISCHE DETAILS
==================================================

Dateistruktur:
  CUT-AI/
  ├── index.html              (Hauptseite)
  ├── manifest.webmanifest    (PWA-Konfiguration)
  ├── sw.js                   (Service Worker)
  ├── css/
  │   └── style.css           (Styling)
  └── js/
      ├── app.js              (Hauptlogik)
      ├── ai.js               (Bild-Analyse)
      ├── image-analysis.js   (Bildverarbeitung)
      ├── renderer.js         (SVG-Generator)
      └── storage.js          (Lokale Speicherung)

Browser-Kompatibilität:
  ✓ Chrome/Chromium 80+
  ✓ Firefox 75+
  ✓ Safari 14+
  ✓ Edge 80+

Keine externen Abhängigkeiten:
  - Kein npm erforderlich
  - Kein Node.js erforderlich
  - Kein Python erforderlich
  - Reine HTML/CSS/JavaScript
  - Alle Modelle lokal


==================================================
LIZENZ & NUTZUNG
==================================================

Diese Anwendung ist frei nutzbar und modifizierbar.
Quellcode: https://github.com/Raaphael02/cut-ai-offline

Verwendungen:
  ✓ Persönlich
  ✓ Bildung
  ✓ Forschung
  ✓ Kommerzielle Nutzung (mit Quellenangabe erwünscht)

Wenn Sie die App verbessern, teilen Sie Ihre Verbesserungen gerne!


==================================================
KONTAKT & SUPPORT
==================================================

GitHub Issues: https://github.com/Raaphael02/cut-ai-offline/issues

Für Fragen, Bug-Reports oder Feature-Requests öffnen Sie ein GitHub Issue.

Wenn etwas nicht funktioniert:
  1. Überprüfen Sie diese README
  2. Lesen Sie die FAQ
  3. Probieren Sie die Fehlerbehebung
  4. Öffnen Sie ein GitHub Issue mit Details


==================================================
ROADMAP - ZUKÜNFTIGE VERBESSERUNGEN
==================================================

Geplant:
  • Integration echten lokalen Vision-Modells (TensorFlow.js)
  • Bessere Komponenten-Erkennung
  • 3D-Visualisierung
  • Multi-Sprachen-Unterstützung
  • Erweiterte Schnittarten
  • AR-Vorschau (Augmented Reality)
  • Bildbearbeitung vor Analyse
  • Mehr Stil-Optionen

Mitarbeit:
  Sie können helfen! Fork das Repo und reichen Sie Pull Requests ein.


==================================================
VIEL SPASS MIT CUT-AI!
==================================================

Diese App wurde mit dem Ziel entwickelt, technische Schnittbilder
einfach, offline und ohne Abhängigkeiten zu ermöglichen.

Wenn Sie Fragen haben oder Verbesserungsvorschläge, kontaktieren Sie uns!

Viel Erfolg beim Erkunden!

---

Version: 1.0
Letztes Update: 2026-09-08
Entwickler: Raaphael02
GitHub: https://github.com/Raaphael02/cut-ai-offline
