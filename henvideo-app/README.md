# HenVideo - Android TV App

Application de streaming vidéo style Netflix/Plex pour Android TV et Firestick.

## 📱 Installation

### Télécharger l'APK

1. Va dans l'onglet **Actions** sur GitHub
2. Clique sur le dernier workflow réussi
3. Télécharge l'artifact `henvideo-apk-*`
4. Dézippe pour obtenir `henvideo.apk`

### Installer sur l'émulateur Android TV

1. Ouvre Android Studio
2. Lance l'émulateur Android TV
3. Glisse l'APK sur la fenêtre de l'émulateur
4. L'application s'installe automatiquement

### Installer sur Firestick/Google TV réel

1. Active "Sources inconnues" dans les paramètres
2. Utilise "Downloader" ou "Send Files to TV" pour installer l'APK

## 🎮 Contrôles

| Touche | Action |
|--------|--------|
| Flèches | Navigation |
| Enter | Sélectionner |
| Esc/Back | Retour |

## 🔧 Développement

### Structure du projet

```
henvideo-app/
├── App.tsx          # Composant principal
├── app.json         # Configuration Expo
├── eas.json         # Configuration build EAS
├── package.json     # Dépendances
└── assets/          # Icônes et images
```

### Build automatique

Le build se lance automatiquement à chaque push sur `main`.

Pour déclencher manuellement:
1. Va dans **Actions**
2. Sélectionne "Build HenVideo APK"
3. Clique "Run workflow"

## 📋 Workflow de test

1. **Modification du code** → Push sur GitHub
2. **Build automatique** → 5-10 minutes (EAS Cloud)
3. **Téléchargement APK** → Artifact dans Actions
4. **Installation** → Glisser sur émulateur
5. **Test** → Vérifier sur Android TV

---

*Développé avec React Native + Expo pour Android TV*
