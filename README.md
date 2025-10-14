# Img2Img Converter

Application web développée avec React et Vite pour convertir rapidement plusieurs images vers différents formats (JPEG, PNG, WebP, GIF et SVG) directement dans le navigateur.

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

## Build de production

```bash
npm run build
npm run preview
```

## Remarques

- Les conversions sont réalisées entièrement dans le navigateur sans transfert de données vers un serveur.
- Le format SVG généré encapsule l'image rasterisée dans un conteneur SVG pour garantir une compatibilité maximale.
- La conversion vers GIF crée un GIF statique (un seul frame) optimisé pour les images importées.
