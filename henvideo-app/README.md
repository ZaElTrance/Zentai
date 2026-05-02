# 🎬 HenVideo - Android TV / Firestick App

Application Netflix-style pour Android TV et Amazon Firestick.

---

## 🚀 MÉTHODE RAPIDE - TEST DANS LE NAVIGATEUR

### Étape 1 : Démarrer en mode web
```bash
cd /home/z/HenVideo
npm run web
```

### Étape 2 : Ouvrir dans le navigateur
L'application s'ouvre automatiquement sur `http://localhost:8081`

### ⚠️ Note importante
Le test navigateur est **partiel** (~40% précis) :
- ✅ Interface utilisateur
- ✅ Navigation
- ❌ WebView (ouvre iframe au lieu du vrai player)
- ❌ Navigation D-pad (pas de télécommande)

---

## 📱 MÉTHODE COMPLÈTE - TEST SUR ÉMULATEUR

### Prérequis
- Android Studio installé
- 8 GB RAM minimum

### Étape 1 : Installer Android Studio
1. Télécharger : https://developer.android.com/studio
2. Installer et ouvrir

### Étape 2 : Créer un émulateur Android TV
1. Ouvrir Android Studio
2. Cliquer "More Actions" → "Virtual Device Manager"
3. "Create Device"
4. Choisir catégorie "TV"
5. Sélectionner "Android TV (1080p)"
6. Télécharger une image système (Android 13+)
7. Cliquer "Finish"

### Étape 3 : Construire l'APK
```bash
cd /home/z/HenVideo

# Option A : Via Expo (recommandé)
npx eas-cli build --platform android --profile preview --local

# Option B : Via npx expo prebuild (avancé)
npx expo prebuild
cd android
./gradlew assembleDebug
```

### Étape 4 : Installer sur l'émulateur
- Glisser-déposer l'APK dans l'émulateur
- Ou utiliser ADB : `adb install henvideo.apk`

---

## 📦 BUILD APK VIA GITHUB ACTIONS (GRATUIT)

### Étape 1 : Créer un compte Expo (gratuit)
1. Aller sur https://expo.dev
2. Créer un compte gratuit

### Étape 2 : Créer un token d'accès
1. Aller sur https://expo.dev/settings/access-tokens
2. Créer un nouveau token
3. Copier le token

### Étape 3 : Configurer GitHub
1. Créer un repo GitHub pour HenVideo
2. Aller dans Settings → Secrets → Actions
3. Ajouter `EXPO_TOKEN` avec votre token

### Étape 4 : Pousser le code
```bash
cd /home/z/HenVideo
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USER/HenVideo.git
git push -u origin main
```

### Étape 5 : Télécharger l'APK
1. Aller sur GitHub Actions
2. Le build se lance automatiquement
3. Une fois terminé, télécharger l'artifact `henvideo-apk`

---

## 🎮 UTILISATION DE L'APPLICATION

### Navigation
| Action | Télécommande | Clavier |
|--------|--------------|---------|
| Naviguer | D-pad (↑↓←→) | Flèches |
| Sélectionner | OK / Center | Enter |
| Retour | Back | Escape |
| Jouer/Pause | Play/Pause | Espace |

### Fonctionnalités
- ✅ Catalogue de vidéos
- ✅ Filtrage par tags
- ✅ WebView intégré pour Hanime.tv
- ✅ Interface Netflix-style

---

## 🔧 DÉVELOPPEMENT

### Structure du projet
```
HenVideo/
├── App.tsx              # Application principale
├── app.json             # Configuration Expo
├── eas.json             # Configuration build
├── package.json         # Dépendances
└── assets/              # Icônes et images
```

### Commandes utiles
```bash
# Démarrer en mode développement
npm start

# Mode web
npm run web

# Mode Android
npm run android

# Construire APK
npx eas-cli build --platform android --profile preview
```

---

## ⚠️ LIMITATIONS CONNUES

### Navigateur Web
- WebView utilise un iframe au lieu du player natif
- Pas de navigation D-pad
- DRM non testable

### Émulateur Android TV
- Pas de DRM Widevine (certains vidéos peuvent échouer)
- Performances différentes d'un vrai appareil

### Firestick Réel
- **MEILLEUR TEST** - 100% précis
- Nécessite d'activer le mode développeur

---

## 📋 TESTS À EFFECTUER

Après installation, vérifiez :

- [ ] L'application s'ouvre
- [ ] L'interface s'affiche correctement
- [ ] Les tags fonctionnent
- [ ] La sélection de vidéo fonctionne
- [ ] Le player WebView charge
- [ ] La connexion Hanime.tv fonctionne
- [ ] La lecture vidéo fonctionne
- [ ] Le bouton retour fonctionne

---

## 🔗 LIENS UTILES

- **Android Studio** : https://developer.android.com/studio
- **Expo** : https://expo.dev
- **Documentation Expo** : https://docs.expo.dev
- **React Native WebView** : https://github.com/react-native-webview/react-native-webview

---

*Créé avec ❤️ pour Android TV et Firestick*
