# Comment créer le fichier .exe

## Prérequis
- Node.js installé (v18 ou plus récent)
- npm ou yarn

## Étapes

### 1. Cloner le projet depuis GitHub
```bash
git clone [URL_DE_TON_REPO]
cd [NOM_DU_PROJET]
```

### 2. Installer les dépendances du projet
```bash
npm install
```

### 3. Installer Electron et Electron Builder
```bash
npm install --save-dev electron electron-builder
```

### 4. Ajouter les scripts dans package.json
Ajoute ces lignes dans la section "scripts" de ton package.json :
```json
{
  "scripts": {
    "electron:dev": "npm run dev & electron .",
    "electron:build": "npm run build && electron-builder --win"
  }
}
```

Et ajoute aussi à la racine du package.json :
```json
{
  "main": "electron/main.js"
}
```

### 5. Build le projet React
```bash
npm run build
```

### 6. Créer l'exécutable Windows (.exe)
```bash
npx electron-builder --win
```

### 7. Trouver ton .exe
Le fichier .exe sera dans le dossier `release/` :
- `release/Code Notes Setup x.x.x.exe` (installateur)
- `release/win-unpacked/Code Notes.exe` (version portable)

## Commandes rapides (après installation des dépendances)

```bash
# Tester en mode développement
npm run dev
# puis dans un autre terminal :
npx electron .

# Créer le .exe final
npm run build && npx electron-builder --win
```

## Notes
- La première compilation peut prendre quelques minutes
- Le .exe créé fonctionnera sans Node.js installé
- Les données sont stockées en localStorage (persiste entre les sessions)
