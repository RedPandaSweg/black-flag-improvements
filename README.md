# Black Flag Improvements

Foundry-VTT-Modul für das Black-Flag-System. Es ergänzt die Activity-Auswahl um den Typ **Makro**.

Eine Makro-Activity kann entweder ein vorhandenes Welt- oder Kompendiums-Makro per UUID ausführen oder JavaScript direkt in der Activity speichern. Beim Aktivieren werden zuerst die normalen Black-Flag-Abläufe (Dialog, Verbrauch und Chatkarte) abgeschlossen und danach das Makro ausgeführt.

Im Makro stehen zusätzlich zu Foundrys üblichen Variablen folgende Werte bereit: `actor`, `token`, `item`, `activity`, `event`, `message` und `results`.

Zusätzlich enthält das Modul eine vollständige Item-Piles-Integration für Black Flag: Währungen, Händlerpreise, Container, Item-Filter, Stapelregeln und Vault-Farben. Anders als der bisherige Adapter berücksichtigt diese Integration `system.price.denomination` korrekt. Black Flags Konversionswerte (Einheiten pro GP) werden für Item Piles in GP-Wert pro Einheit umgerechnet.

Das separate Modul `item-piles-black-flag` muss deaktiviert werden, da beide Module sonst dieselbe Systemintegration registrieren.

Unter **Spieleinstellungen → Moduleinstellungen → Black Flag Improvements** können eigene Weapon Properties und Weapon Options angelegt werden. Neben reinen Anzeigeeinträgen stehen Vorlagen für Versatile, Finesse, Light, Thrown, Two-Handed, Reach sowie frei eingebbare Angriffs- und Schadensboni zur Verfügung. Versatile-Würfelstufen und Reichweitenbonus sind anpassbar. Die Mechanik kann sowohl an einer eigenen Property als auch an einer eigenen Weapon Option hängen.

Der Activity-Typ **Waffenverzauberung** bildet Zauber wie Shillelagh oder Magic Weapon ab. Beim Aktivieren wird eine Waffe des Akteurs gewählt. Die Verzauberung kann die verwendete Ability ersetzen, einen Mindest- oder Ersatz-Schadenswürfel setzen, die Waffe magisch machen und zusätzliche Angriffs- oder Schadensformeln hinzufügen. Der erzeugte Effekt besitzt eine konfigurierbare Dauer und kann über die Chatkarte oder direkt auf der Waffe entfernt werden.

## Installation

### Über Foundry VTT

Auf der GitHub-Seite unter **Releases** die Manifest-URL des neuesten Releases kopieren und in Foundry unter **Add-on Modules → Install Module → Manifest URL** einfügen.

### Manuell

Die Datei `black-flag-improvements.zip` des neuesten GitHub-Releases herunterladen und nach `Data/modules/black-flag-improvements` entpacken. Anschließend Foundry neu starten und das Modul in der Welt aktivieren.

## Kompatibilität

Entwickelt für Foundry VTT 13 und Black Flag 2.0.074. Item Piles 3.2.7 oder neuer ist optional; wenn es aktiv ist, werden Integration und Währungen automatisch eingerichtet.

## Entwicklung und Releases

Ein Release wird durch einen Git-Tag im Format `vX.Y.Z` erzeugt. Die Tag-Version muss mit `version` in `module.json` übereinstimmen. GitHub Actions prüft JSON- und JavaScript-Syntax, erzeugt das installierbare ZIP und veröffentlicht ZIP sowie Release-Manifest am GitHub-Release.

Änderungen werden in [CHANGELOG.md](CHANGELOG.md) dokumentiert.
