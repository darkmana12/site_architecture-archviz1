# Stéphane AUER — Harmonie3D

Site vitrine d'architecture & photoréalisme. Déployable sur Cloudflare Pages.

## Structure du projet

```
StephaneAuer_Archi_site/
│
├── index.html          ← Page d'accueil (contenu principal)
├── portfolio.html      ← Page portfolio (à personnaliser)
├── services.html       ← Page services (à personnaliser)
├── contact.html        ← Page contact (à personnaliser)
│
├── css/
│   └── styles.css      ← Styles globaux
│
├── js/
│   └── main.js         ← Scripts (loader, curseur, animations)
│
├── assets/             ← Références / exemples (GITIGNORÉ)
│   ├── harmonie3d-optionD.html
│   └── harmonie3d-optionF-premium.html
│
├── .gitignore
└── README.md
```

## Fichiers du site vs références

- **Fichiers à modifier** : `index.html`, `portfolio.html`, `services.html`, `contact.html`, `css/styles.css`, `js/main.js` — ce sont les fichiers poussés sur Git et déployés en ligne.
- **Dossier `assets/`** : contient des maquettes et exemples de référence. Non versionné, non déployé. À ne pas utiliser pour la structure du site en ligne.

## Workflow

1. Modifier les fichiers à la racine (`index.html`, `portfolio.html`, etc.)
2. `git add` + `git commit` + `git push`
3. Cloudflare Pages déploie automatiquement après le push

## Déploiement Cloudflare Pages

1. Connecter le repo GitHub à Cloudflare Pages
2. Build settings : **Pas de build** (site statique)
3. Répertoire de sortie : `/` (racine du repo)
