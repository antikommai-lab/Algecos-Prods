# Algecos Prods — Bibliothèque Audio

Site : https://antikommai-lab.github.io/Algecos-Prods/

## Ajouter un morceau
1. Dépose le fichier audio dans le dossier `audio/` (mp3 conseillé, < 100 Mo).
2. Ajoute une entrée dans `tracks.json` :
   ```json
   { "title": "Nom du morceau", "file": "audio/nom.mp3", "tags": ["hiphop", "2026"], "desc": "Description courte" }
   ```
3. Commit → le site se met à jour automatiquement (GitHub Pages).

## Activer GitHub Pages (une seule fois)
Repo → **Settings → Pages** → Source : `Deploy from a branch` → branche `main`, dossier `/ (root)` → Save.

## Recherche
- Champ texte : filtre par **titre, mots-clés ou description** (combinaison libre).
- Tags cliquables : filtre par mot-clé exact.
- Les deux se combinent (ex. texte + tag).
- Lecture en chaîne automatique des résultats filtrés.
