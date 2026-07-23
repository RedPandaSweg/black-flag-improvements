# Changelog

## 1.4.7

- Item Piles bleibt eine optionale Empfehlung; die Integration registriert sich nur, wenn dessen API verfügbar ist.
- Die Systemintegration registriert sich frühestmöglich während `init` oder zuverlässig während `setup`.
- Der Cost-Transformer ordnet `system.price.denomination` der von Item Piles übergebenen Währung zu und multipliziert den Wert mit deren `exchangeRate`.
- Verwendet die registrierten Black-Flag-Konversionswerte direkt als Item-Piles-`exchangeRate` (`SP: 0,1`, `CP: 0,01`), statt sie fälschlich zu invertieren.
- Liest die Modulversion erst während der Registrierung aus, damit ein noch nicht initialisiertes `game.modules` die Integration nicht bereits beim Laden beendet.
- Registriert die Systemschnittstelle weiterhin früh, schreibt Item-Piles-World-Settings jedoch erst nach Foundrys `ready`-Hook.
- Wartet vor der endgültigen Systemregistrierung auf Black Flags Currency-Items, damit Item Piles niemals ein Profil mit leerer Währungsliste als World-Vorgabe übernimmt.

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert. Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## [1.4.1] - 2026-07-22

### Hinzugefügt

- Makro-Activities mit verlinkten Foundry-Makros oder Inline-JavaScript.
- Eigene Weapon Properties und Weapon Options mit optionalen Mechaniken und Chatkarten-Makros.
- Waffenverzauberungen mit Ability-, Schadens-, Magical- und Bonus-Konfiguration.
- Item-Piles-Integration mit denominationsabhängiger Preisumrechnung.
- Automatisierter GitHub-Release-Workflow für Foundry VTT.
