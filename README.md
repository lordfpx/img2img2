# Img2Img Converter

Application web développée avec React et Vite pour convertir rapidement plusieurs images vers différents formats (JPEG, PNG, WebP, GIF et SVG) directement dans le navigateur. Ce projet fournit un service web minimaliste et efficace, conçu pour fonctionner entièrement côté client.

## Fonctionnalités

- Import de un ou plusieurs fichiers (drag & drop ou sélection classique)
- Conversion côté client avec ajustement du niveau de compression selon le format cible
- Aperçu avant/après interactif avec un slider pour comparer les rendus
- Statistiques de gain de poids globales et par image
- Téléchargement de chaque version convertie
- Interface moderne et responsive réalisée avec Tailwind CSS

## Démarrage

```bash
cd webapp
npm install
npm run dev
```

L'application est disponible sur [http://localhost:5173](http://localhost:5173).

> ℹ️ **Astuce** : dans certains environnements restreints (par exemple cette sandbox), `npm install` peut échouer avec une erreur `403 Forbidden` lors de l'accès au registre npm. Dans ce cas, réessayez depuis un poste disposant d'un accès internet ou configurez un registre privé/miroir autorisé.

## Synchroniser avec la branche `main`

Si vous devez récupérer les dernières modifications depuis `main` et qu'aucun remote n'est configuré, ajoutez d'abord l'URL du dépôt GitHub :

```bash
git remote add origin <URL_DU_DEPOT>
git fetch origin
git pull origin main
```

Sans cette configuration préalable, la commande `git pull origin main` renverra l'erreur :

```
fatal: 'origin' does not appear to be a git repository
fatal: Could not read from remote repository.
```

Vérifiez ensuite l'absence de conflits puis poussez vos changements si nécessaire.

## Build de production

```bash
npm run build
npm run preview
```

## Déploiement sur GitHub Pages

Deux options sont proposées :

1. **Pipeline GitHub Actions** (recommandé)
   - Activez GitHub Pages dans les paramètres du dépôt (onglet *Pages*) et choisissez la source « GitHub Actions ».
   - Commitez le workflow fourni dans `.github/workflows/deploy.yml`. À chaque `push` sur `main`, le site sera construit et publié automatiquement.
2. **Publication manuelle depuis votre poste**
   - Assurez-vous d'avoir les droits d'écriture sur la branche `gh-pages`.
   - Exécutez :

```bash
npm run deploy
```

Le script construit l'application avec la configuration adaptée à GitHub Pages puis pousse le contenu du dossier `dist` sur la branche `gh-pages`.

## Bonnes pratiques

- Optimisez les images avant de les importer pour améliorer la qualité du rendu final.
- Prévoyez un fallback pour les navigateurs qui ne supportent pas WebP.
- Activez un suivi analytique pour comprendre quels formats sont les plus utilisés.

## Remarques

- Les conversions sont réalisées entièrement dans le navigateur sans transfert de données vers un serveur.
- Le format SVG généré encapsule l'image rasterisée dans un conteneur SVG pour garantir une compatibilité maximale.
- La conversion vers GIF crée un GIF statique (un seul frame) optimisé pour les images importées.

## Licence

MIT
