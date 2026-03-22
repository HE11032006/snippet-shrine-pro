# HE - The Ultimate Developer's Second Brain 🧠💻

**HE** (anciennement Memory Notes) est une application de prise de notes et de gestion de snippets de code, pensée de A à Z par et pour les développeurs. Elle associe la puissance d'un éditeur professionnel à la simplicité d'un outil de productivité structuré.

![HE Interface Preview](https://via.placeholder.com/800x450/0d0d0f/00f2ff?text=HE+Interface+-+Obsidian+Dark)

## ✨ Fonctionnalités Principales (Version 1.0)

- ⌨️ **Éditeur Pro (Mode NeoVim)** : Éditeur de code intégré basé sur `CodeMirror 6` avec auto-complétion, coloration syntaxique dynamique pour +30 langages, et un véritable **Mode NeoVim** activable dans l'interface pour une productivité maximale.
- 🔄 **Synchronisation Git Native** : Vos données vous appartiennent. Liez l'application à un dépôt local, exportez automatiquement vos snippets en `.md` et faites vos `Push`/`Pull` vers GitHub/GitLab directement depuis les paramètres.
- 📄 **Export Multi-Format Haute Fidélité** : Exportez chaque note au format **PDF** isolé (grâce au moteur Electron), **HTML** autonome, **Markdown** brut, ou capturez une **Image (PNG)** de votre snippet magnifiquement formaté.
- 📓 **Journal de Bord (Daily Log)** : Fonctionnalité "1-clic" pour générer un template structuré de votre journée de développement (Objectifs, Bugs rencontrés, Notes).
- 🎨 **Design "Obsidian Dark"** : Une interface sombre (glassmorphism), mature et épurée, inspirée de Notion et Obsidian. Finitions soignées avec icônes dynamiques par langage.
- 🗂️ **Organisation Puissante** : Catégories étendues, sous-catégories liées, dossiers intelligents (Récents, Favoris), système de tags et recherche globale multi-critères.

## 🛠️ Stack Technique

- **Frontend** : React 18, TypeScript, Vite
- **Desktop Engine** : Electron (Support complet natif, exports PDF)
- **Styling** : Tailwind CSS, Radix UI (shadcn/ui), Lucide Icons
- **Éditeur de code** : CodeMirror 6, @replit/codemirror-vim
- **Utilitaires** : React Router, html-to-image, React Markdown

## 🚀 Installation & Lancement

Prérequis : Node.js (v18+) et npm.

```bash
# 1. Cloner le dépôt
git clone https://github.com/HE11032006/snippet-shrine-pro.git
cd snippet-shrine-pro

# 2. Installer les dépendances
npm install

# 3. Lancer l'application en mode Web (Développement)
npm run dev

# 4. Lancer l'application en mode Bureau (Electron)
npm start
```

## 📦 Build / Distribution

Pour compiler l'application de bureau pour votre plateforme (Windows, macOS, Linux) :

```bash
npm run dist
```
L'exécutable généré se trouvera dans le dossier `dist_electron/`.

## 🤝 Contribuer & Roadmap V2

Ce projet est la fondation solide d'un véritable outil de Knowledge Management pour dev. La **V2** est en phase de conception avec potentiellement :
- Backend Cloud / Supabase pour le temps réel
- Système de plugins
- Auto-tagging par IA

Les contributions, issues et PRs sont les bienvenues !
