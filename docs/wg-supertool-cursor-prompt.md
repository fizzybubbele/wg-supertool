# WG-SuperTool – Feature-Specs

> Stub – Details können später ergänzt werden.

## 1. Finanzen & Einkäufe

- Gemeinsame Ausgaben tracken
- Kassenzettel per Foto scannen (Vision-LLM via Edge Function)
- Einkaufsliste (offline-first)

**TODO:** Ausgaben-Modell, Split-Logik, Kassenzettel-Flow

## 2. Putzplan

- Rotierender Putzplan für WG-Mitglieder
- Erinnerungen / Zuweisungen

**TODO:** Rotations-Algorithmus, Aufgaben-Katalog

## 3. Organisation & Kommunikation

- Haushalts-Kalender
- Mitteilungen / Abstimmungen

**TODO:** Event-Modell, Notification-Strategie

## 4. Vorrat

- Vorratshaltung tracken
- Mindestbestand / Einkaufsvorschläge

**TODO:** Artikel-Modell, Barcode-Scan optional

## Multi-Tenancy

Alle Tabellen haben `household_id`. Zugriff nur über RLS-Policies für Haushaltsmitglieder.
