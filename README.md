# Algecos Prods — Bibliothèque Audio

> Division de **ANTIKOMM** 🎹 Site : https://antikommai-lab.github.io/Algecos-Prods/

## Menu hamburger (☰)
1. **Consulter la liste** — retour à la bibliothèque.
2. **S'identifier GitHub** — colle un Personal Access Token (github.com/settings/tokens, scope **repo**). Stocké uniquement dans ton navigateur (localStorage).
   Une fois connecté :
   - ➕ **Ajouter** : upload du fichier audio + formulaire (titre, tags, description, créateur paroles, créateur son, date, note 1-5).
   - ✏️ **Éditer** les data d'un morceau.
   - 🗑 **Supprimer** un morceau de tracks.json.
   - ⭐ **Noter 1-5 étoiles** directement sur chaque carte.

## Champs par morceau (tracks.json)
```json
{
  "title": "Nom",
  "file": "audio/nom.mp3",
  "tags": ["hiphop"],
  "desc": "Description",
  "lyricsCreator": "id paroles",
  "soundCreator": "id son",
  "recordDate": "2026-10-02",
  "rating": 4
}
```

## Activer GitHub Pages (une seule fois)
Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.

## Notes
- Les uploads audio passent par l'API GitHub (limite fichier ~100 Mo via API, mp3 recommandé).
- La recherche croise titre + mots-clés + description + créateurs.
