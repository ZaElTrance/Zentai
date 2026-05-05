# Voici avec quoi commencer demain

**Date :** 5 mai 2026
**Projet :** Application Android TV pour hanime.tv — de HenVideo (WebView) vers CloudStream (natif)
**Google TV IP :** `192.168.18.7:5555`
**ADB Path :** `C:\Users\Julia\platform-tools\adb.exe`
**GitHub :** `ZaElTrance/Zentai` (repo principal, PAT actif)

---

## 1. CONTEXTE GENERAL

L'objectif est d'avoir une application fonctionnelle sur Google TV pour naviguer et regarder du contenu sur hanime.tv avec :

- **Navigation D-pad fonctionnelle** (haut/bas/gauche/droite au téléviseur)
- **Lecteur vidéo fiable** (pas de buffering, pas de crash)
- **Expérience Android TV native** (focus indicators, leanback UI)

### Pourquoi on a abandonné HenVideo (WebView)

HenVideo était une app React Native (Expo) qui enveloppait hanime.tv dans un WebView. Deux problèmes critiques insolubles :

1. **D-pad ne scroll pas** — Le système de focus natif d'Android TV consomme tous les événements D-pad AVANT qu'ils n'atteignent le JavaScript du WebView. Testé avec TVEventHandler, des injectés JS, des focus hacks — RIEN ne fonctionne. C'est une limitation fondamentale d'Android WebView sur TV.

2. **Pas d'indicateur de focus** — Impossible d'afficher quel élément est sélectionné car le WebView ne reçoit jamais les événements de focus D-pad.

### Pourquoi CloudStream est la bonne solution

- **Application native Kotlin** optimisée Android TV (9 561 étoiles GitHub)
- **Navigation D-pad native** — pas de WebView, pas de hack
- **ExoPlayer (Media3)** — lecteur vidéo natif Android, largement supérieur à hls.js dans un WebView
- **Architecture de plugins** — on ajoute simplement un plugin `.cs3` pour hanime.tv
- **Interface leanback** — conçue pour la télécommande

---

## 2. ETAT D'AVANCEMENT ACTUEL

### Ce qui EST fait ✅

| Élément | Statut | Détails |
|---------|--------|---------|
| Diagnostic D-pad | ✅ Complété | v3-diagnostic a prouvé que les événements n'atteignent jamais le WebView JS |
| API hanime.tv validée | ✅ Complété | Search (POST search.htv-services.com), Video (GET hanime.tv/api/v8/video?id=slug), m3u8 URLs — tout fonctionne |
| CloudStream installé sur TV | ✅ Complété | v4.7.0 (67.2 MB), package `com.lagradost.cloudstream3` |
| Hanime.cs3 sur la TV | ✅ Complété | Fichier 22KB poussé à `/sdcard/Download/Hanime.cs3` |
| Dépôt CloudStream créé | ✅ Complété | Branche `gh-pages` dans `ZaElTrance/Zentai` avec `repo.json` + `plugins.json` |
| URLs publiques fonctionnelles | ✅ Vérifié | Toute la chaîne HTTP 200 : repo.json → plugins.json → Hanime.cs3 |
| Repo Zentai rendu public | ✅ Temporaire | Nécessaire pour que raw.githubusercontent.com fonctionne sans auth |

### Ce qui N'EST PAS encore fait ❌

| Élément | Statut | Bloquant ? |
|---------|--------|------------|
| Plugin Hanime installé dans CloudStream | ❌ | **OUI — c'est LE prochain step** |
| Test de navigation D-pad dans CloudStream | ❌ | Dépend du plugin installé |
| Test de lecture vidéo hanime.tv via CloudStream | ❌ | Dépend du plugin installé |
| Repo Zentai remis en privé | ❌ | À faire APRÈS installation du plugin |

---

## 3. JOURNAL DES ESSAIS ET ERREURS

### Phase 1 : HenVideo (WebView) — TENTATIVES ÉCHOUÉES

#### Essai 1 : JavaScript injecté pour le focus
- **Approche** : Injecter du JS dans le WebView pour capturer les keydown events et scroller
- **Résultat** : AUCUN événement keydown n'atteint le WebView JS
- **Cause** : Android TV intercepte les D-pad events au niveau natif

#### Essai 2 : Expo TVEventHandler
- **Approche** : Utiliser `react-native-tvos-environment` TVEventHandler pour capturer les événements natifs
- **Résultat** : CRASH de l'app au lancement
- **Cause** : Incompatibilité de version avec Expo SDK 52

#### Essai 3 : v3-diagnostic (APK de diagnostic)
- **Approche** : Build APK avec logging exhaustif de tous les événements
- **Résultat** : Confirme que ZERO événement D-pad n'atteint le WebView
- **Conclusion** : C'est impossible dans un WebView — il faut une app native

#### Essai 4 : Correctif anti-adblock
- **Approche** : Injecter du CSS/JS pour cacher les popups anti-adblock
- **Résultat** : Partiellement fonctionnel mais le problème D-pad reste

### Phase 2 : Recherche d'alternatives — VALIDÉE

| Alternative | Type | D-pad natif | Lecteur | Stars | Verdict |
|-------------|------|-------------|---------|-------|---------|
| **CloudStream** | Kotlin natif | ✅ | ExoPlayer | 9 561 | **CHOISI** |
| Aniyomi | Fork Tachiyomi | ✅ | MPV | 4 200 | Bon mais moins maintenu pour TV |
| Animiru | Fork Aniyomi | ✅ | MPV | 1 200 | Trop petit |

### Phase 3 : Installation CloudStream — TENTATIVES ÉCHOUÉES

#### Essai 1 : Repo punpunsx (officiel)
- **URL essayée** : `https://raw.githubusercontent.com/punpunsx/cloudstream-18plus-Extensions/builds/repo.json`
- **Résultat** : "Aucune extension disponible"
- **Cause** : Le `plugins.json` référencé par punpunsx pointe vers `Rowdy-Avocado` (dépôt supprimé) → 0 plugins listés

#### Essai 2 : Repo personnalisé sur paste.rs
- **Approche** : Créer un repo.json custom, l'héberger sur paste.rs
- **URL essayée** : `https://paste.rs/l5rnu`
- **Résultat** : "Répertoire invalide"
- **Cause** : paste.rs ne sert pas le bon Content-Type JSON, ou CloudStream valide strictement le format d'URL

#### Essai 3 : ADB intent avec file:// URI
- **Commande** : `am start -a android.intent.action.VIEW -d "file:///sdcard/Download/Hanime.cs3" -t application/octet-stream`
- **Résultat** : "Unable to resolve Intent"
- **Cause** : CloudStream n'enregistre pas d'intent filter pour les fichiers locaux .cs3

#### Essai 4 : ADB intent avec https:// URL brute
- **Commande** : `am start -a android.intent.action.VIEW -d "https://raw.githubusercontent.com/punpunsx/cloudstream-18plus-Extensions/builds/Hanime.cs3"`
- **Résultat** : "Unable to resolve Intent"
- **Cause** : Aucune app sur la TV ne gère l'intent pour télécharger un .cs3 directement

#### Essai 5 : Build du plugin depuis le source
- **Approche** : Cloner le repo CloudStream-3XXX, ajouter Hanime.kt, builder avec Gradle
- **Résultat** : Gradle hang silencieusement, jamais de complétion
- **Cause** : Problème de compatibilité Java/Gradle, environnement serveur pas configuré pour build Android

### Phase 4 : Création du dépôt CloudStream fonctionnel — RÉUSSITE ✅

#### Approche qui a marché
1. **Création des fichiers JSON** au format exact que CloudStream attend :
   - `repo.json` avec `manifestVersion: 1` et `pluginLists` pointant vers `plugins.json`
   - `plugins.json` (ARRAY, pas objet !) avec les champs obligatoires : `url`, `status`, `version`, `apiVersion`, `name`, `internalName`, `authors`, `repositoryUrl`

2. **Hébergement via GitHub Git Data API** :
   - Le PAT ne permet PAS d'écrire via l'API Contents (`403`)
   - Mais il PERMET d'utiliser l'API Git Data (blobs, trees, commits, refs) sur le repo `ZaElTrance/Zentai`
   - Création d'une branche `gh-pages` orpheline avec les deux fichiers

3. **Rendu du repo public** (temporairement) :
   - Les URLs `raw.githubusercontent.com` nécessitent un repo public pour fonctionner sans auth
   - Le repo Zentai est actuellement PUBLIC — à remettre en privé après installation

4. **Vérification complète** :
   - `repo.json` → HTTP 200 ✅
   - `plugins.json` → HTTP 200 ✅
   - `Hanime.cs3` (punpunsx) → HTTP 200, 22 000 bytes ✅

---

## 4. URLS ET COMMANDES IMPORTANTES

### Dépôt CloudStream (nos fichiers)

```
repo.json:  https://raw.githubusercontent.com/ZaElTrance/Zentai/gh-pages/repo.json
plugins.json: https://raw.githubusercontent.com/ZaElTrance/Zentai/gh-pages/plugins.json
```

### Fichier Hanime.cs3 (hébergé par punpunsx)

```
https://raw.githubusercontent.com/punpunsx/cloudstream-18plus-Extensions/builds/Hanime.cs3
```

### Contenu de nos fichiers

**repo.json :**
```json
{
  "name": "Hanime Plugin Repo",
  "description": "CloudStream repository for Hanime plugin",
  "manifestVersion": 1,
  "pluginLists": [
    "https://raw.githubusercontent.com/ZaElTrance/Zentai/gh-pages/plugins.json"
  ]
}
```

**plugins.json :**
```json
[
  {
    "url": "https://raw.githubusercontent.com/punpunsx/cloudstream-18plus-Extensions/builds/Hanime.cs3",
    "status": 1,
    "version": 5,
    "apiVersion": 1,
    "name": "Hanime",
    "internalName": "HanimeProvider",
    "authors": ["Jacekun"],
    "repositoryUrl": "https://github.com/punpunsx/cloudstream-18plus-Extensions",
    "tvTypes": ["NSFW"],
    "language": "en"
  }
]
```

### Plugin Hanime.cs3 — Détails techniques

- **Auteur** : Jacekun
- **Version** : 5
- **Classe principale** : `com.jacekun.HanimePlugin`
- **Source** : `punpunsx/cloudstream-18plus-Extensions`
- **Contenu** : classes.dex (52KB) + manifest.json
- **API hanime.tv utilisée par le plugin** :
  - Search : `POST https://search.htv-services.com/` (JSON body avec `search_text`, `tags`, etc.)
  - Video : `GET https://hanime.tv/api/v8/video?id={slug}` → parse `videos_manifest.servers[0].streams[].url` (m3u8)
  - Homepage : Parse `window.__NUXT__` du HTML
  - Type : `TvType.NSFW`

---

## 5. PROCHAINES ÉTAPES (ORDRE EXACT)

### Étape 1 — Ajouter le repo dans CloudStream

**Option A — Via ADB intent (recommandé, essaye en premier) :**
```powershell
C:\Users\Julia\platform-tools\adb.exe -s 192.168.18.7:5555 shell am start -a android.intent.action.VIEW -d "cloudstreamrepo://raw.githubusercontent.com/ZaElTrance/Zentai/gh-pages/repo.json"
```
CloudStream devrait s'ouvrir et afficher une popup pour ajouter le repo "Hanime Plugin Repo". **Accepte la popup.**

**Option B — Via l'interface CloudStream (si ADB intent ne marche pas) :**
1. Ouvrir CloudStream sur la TV
2. Aller dans **Paramètres → Extensions → Ajouter un dépôt**
3. Coller l'URL : `https://raw.githubusercontent.com/ZaElTrance/Zentai/gh-pages/repo.json`
4. Tu devrais voir "Hanime Plugin Repo" → cliquer dessus
5. Installer le plugin **Hanime**

**Option C — Via ADB avec scheme alternatif (si Option A échoue) :**
```powershell
C:\Users\Julia\platform-tools\adb.exe -s 192.168.18.7:5555 shell am start -a android.intent.action.VIEW -d "cloudstreamapp://raw.githubusercontent.com/ZaElTrance/Zentai/gh-pages/repo.json"
```

### Étape 2 — Tester le plugin Hanime dans CloudStream

1. Une fois le plugin installé, retourner à l'écran d'accueil CloudStream
2. Chercher "Hanime" dans la barre de recherche
3. Vérifier que les résultats s'affichent
4. Cliquer sur une vidéo et vérifier que la lecture ExoPlayer fonctionne
5. **Tester le D-pad** : haut/bas pour scroller, gauche/droite pour naviguer, OK pour sélectionner

### Étape 3 — Remettre le repo Zentai en privé

```powershell
$headers = @{ Authorization = "token [VOTRE_PAT_GITHUB]" }; Invoke-RestMethod -Uri "https://api.github.com/repos/ZaElTrance/Zentai" -Method Patch -Headers $headers -ContentType "application/json" -Body '{"private":true}'
```

**ATTENTION** : Une fois le repo remis en privé, le plugin ne pourra plus se mettre à jour automatiquement via notre repo.json. Ce n'est pas un problème car le plugin est déjà installé localement sur la TV.

### Étape 4 — Nettoyage (optionnel)

- Supprimer le fichier `/sdcard/Download/Hanime.cs3` de la TV (plus nécessaire une fois le plugin installé via CloudStream) :
  ```powershell
  C:\Users\Julia\platform-tools\adb.exe -s 192.168.18.7:5555 shell rm /sdcard/Download/Hanime.cs3
  ```
- Désinstaller HenVideo (l'ancienne app WebView) :
  ```powershell
  C:\Users\Julia\platform-tools\adb.exe -s 192.168.18.7:5555 shell pm uninstall com.zaeltrance.henvideo
  ```

---

## 6. SI LE PLUGIN HANIME NE FONCTIONNE PAS

Si le plugin Hanime s'installe mais ne charge pas de vidéos, les causes possibles sont :

### 6A — Le plugin est trop ancien (API changée)
- Le Hanime.cs3 v5 date de 2023-2024, l'API hanime.tv a pu changer
- **Solution** : Vérifier l'API manuellement :
  ```powershell
  # Test search
  curl -X POST "https://search.htv-services.com/" -H "Content-Type: application/json" -d '{"search_text":"","tags":[],"tags_mode":"AND","brands":[],"blacklist":[],"order_by":"created_at_unix","ordering":"desc","page":0}'
  
  # Test video
  curl "https://hanime.tv/api/v8/video?id=test-video-slug"
  ```
  Si les endpoints répondent encore en JSON avec les m3u8 URLs, le plugin devrait fonctionner.

### 6B — Version CloudStream incompatible
- Le Hanime.cs3 a été compilé pour CloudStream v3/v4. Notre APK est v4.7.0
- **Solution** : Essayer une version plus récente de CloudStream ou un plugin mis à jour

### 6C — Problème réseau (DNS/région)
- hanime.tv peut être bloqué par le DNS du routeur
- **Solution** : Configurer DNS personnalisé (8.8.8.8, 1.1.1.1) sur la Google TV :
  - Paramètres → Réseau → Wi-Fi → DNS → 8.8.8.8

### 6D — Dernier recours : Build un plugin custom
Si rien ne marche, on peut build notre propre plugin CloudStream en Kotlin. Le code source de Jacekun est disponible :
- Repository : `punpunsx/cloudstream-18plus-Extensions`
- Fichier : `Hanime/src/main/kotlin/com/jacekun/HanimePlugin.kt`
- Il faudrait : Android Studio + Kotlin + Gradle, build un nouveau .cs3

---

## 7. INFORMATIONS TECHNIQUES DE REFERENCE

### API hanime.tv (validée et fonctionnelle)

| Endpoint | Méthode | URL | Corps/Réponse |
|----------|---------|-----|---------------|
| Recherche | POST | `https://search.htv-services.com/` | `{"search_text":"...", "tags":[], "page":0}` → liste de vidéos |
| Vidéo | GET | `https://hanime.tv/api/v8/video?id={slug}` | JSON avec `videos_manifest.servers[0].streams[].url` (m3u8) |
| Homepage | GET | `https://hanime.tv/` | HTML avec `window.__NUXT__` contenant les données |

### Format CloudStream repo.json (spécification officielle)

```json
{
  "name": "string (requis)",
  "manifestVersion": 1,
  "pluginLists": ["url_vers_plugins_json (requis)"],
  "description": "string (optionnel)",
  "iconUrl": "url (optionnel)"
}
```

### Format CloudStream plugins.json (ARRAY, pas objet !)

```json
[
  {
    "url": "url_vers_cs3 (requis, non vide)",
    "status": 1,
    "version": 5,
    "apiVersion": 1,
    "name": "Nom Affiché (requis)",
    "internalName": "InternalName (requis, unique)",
    "authors": ["Auteur"],
    "repositoryUrl": "url_repo (requis pour auto-download)",
    "tvTypes": ["NSFW"],
    "language": "en"
  }
]
```

### Valeurs tvTypes valides

`Movie`, `AnimeMovie`, `TvSeries`, `Cartoon`, `Anime`, `OVA`, `Torrent`, `Documentary`, `AsianDrama`, `Live`, `NSFW`, `Others`, `Music`, `AudioBook`, `CustomMedia`, `Audio`, `Podcast`

### PAT GitHub

- **Token** : `[VOTRE_PAT_GITHUB]`
- **User** : `ZaElTrance`
- **Expire** : 31 juillet 2026
- **Permissions** : Contents (write) sur repo `ZaElTrance/Zentai` uniquement, Git Data API
- **Limitation** : NE PEUT PAS écrire via l'API Contents sur d'autres repos, NE PEUT PAS créer de Gists

### Dépôts CloudStream connus et fonctionnels

| Repo | URL |
|------|-----|
| Extensions officielles | `https://raw.githubusercontent.com/recloudstream/extensions/master/repo.json` |
| Test Plugins | `https://raw.githubusercontent.com/recloudstream/TestPlugins/builds/repo.json` |
| Phisher98 | `https://raw.githubusercontent.com/phisher98/cloudstream-extensions-phisher/refs/heads/builds/repo.json` |
| **Notre repo Hanime** | `https://raw.githubusercontent.com/ZaElTrance/Zentai/gh-pages/repo.json` |

---

## 8. FICHIERS DU PROJET SUR GITHUB

### Repo `ZaElTrance/Zentai`

**Branche `main` :** Code source HenVideo (abandonné mais conservé)
```
henvideo-app/
  App.tsx, App.js
  androidtv-plugin.js
  webview-debug-plugin.js
  src/components/
  src/services/
  src/styles.ts, theme.ts, types/
  assets/
  scripts/
  package.json, tsconfig.json, eas.json, app.json
```

**Branche `gh-pages` :** Fichiers CloudStream repo (actifs)
```
repo.json      (198 bytes)
plugins.json   (321 bytes)
```

### Fichiers locaux sur la Google TV

| Fichier | Path | Taille | Notes |
|---------|------|--------|-------|
| CloudStream APK | installé via pm | 67.2 MB | v4.7.0, package com.lagradost.cloudstream3 |
| HenVideo APK | installé via pm | ~56 MB | v3-diagnostic, package com.zaeltrance.henvideo |
| Hanime.cs3 | `/sdcard/Download/Hanime.cs3` | 22 KB | Poussé via ADB, inutile si install via repo marche |

---

## 9. RESUME EXECUTIF

**Où on est :** CloudStream est installé sur la TV. Le dépôt de plugin est créé et hébergé sur GitHub. Tout est vérifié et fonctionnel côté serveur. Il manque juste l'étape finale : ajouter le repo dans l'interface CloudStream pour installer le plugin Hanime.

**Quoi faire demain matin :**
1. Lancer la commande ADB `cloudstreamrepo://` (Option A, Étape 1)
2. Ou ajouter le repo manuellement dans CloudStream (Option B)
3. Installer le plugin Hanime
4. Tester la navigation D-pad et la lecture vidéo
5. Remettre le repo Zentai en privé

**Si ça marche :** Projet terminé ! CloudStream + Hanime plugin = app native Android TV avec D-pad et ExoPlayer.

**Si ça ne marche pas :** Voir section 6 (diagnostics), ou envisager de build un plugin custom en Kotlin.
