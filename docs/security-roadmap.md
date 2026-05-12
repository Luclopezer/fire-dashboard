# Sécurisation du dashboard FIRE

Objectif : garder l'URL mobile `https://luclopezer.github.io/`, réduire l'exposition du code, verrouiller les données Firebase, puis préparer une migration vers un backend plus sécurisé.

## 1. Ce qu'il faut comprendre avant de sécuriser

- **Un site GitHub Pages est statique** : le navigateur reçoit toujours le HTML, le CSS et le JavaScript nécessaires à l'affichage. Même avec un repo privé, le code envoyé au navigateur reste inspectable dans DevTools.
- **On ne met jamais de secret dans `index.html`** : pas de mot de passe, pas de clé privée Firebase Admin, pas de token Supabase `service_role`, pas de clé API serveur.
- **La vraie sécurité des données est côté backend** : règles Firebase, RLS Supabase ou API Vercel qui vérifie l'utilisateur avant de lire/écrire.

## 2. Mettre le repo GitHub en privé

### À faire manuellement dans GitHub

1. Ouvre le repo `Luclopezer/luclopezer.github.io`.
2. Va dans **Settings**.
3. Descends dans **Danger Zone**.
4. Clique **Change visibility**.
5. Choisis **Make private**.
6. Confirme le nom du repo si GitHub le demande.

### Point important pour GitHub Pages

- Avec **GitHub Free**, passer un repo personnel en privé peut désactiver GitHub Pages.
- Pour garder GitHub Pages actif depuis un repo privé, il faut généralement **GitHub Pro/Team/Enterprise**.
- Si tu veux un repo privé sans payer GitHub Pro, l'option la plus propre est de déployer le site via **Vercel**, **Netlify** ou **Cloudflare Pages** depuis ton repo privé.

### Vérification après passage en privé

- Ouvre `https://luclopezer.github.io/` en navigation privée.
- Si le site ne répond plus, soit tu dois repasser le repo public, soit passer par GitHub Pro, soit migrer l'hébergement vers Vercel/Netlify/Cloudflare Pages.

## 3. Règles Firebase renforcées

Le fichier `database.rules.json` est la version à publier dans Firebase. Il fait plusieurs choses :

- refuse par défaut les lectures/écritures à la racine ;
- autorise seulement `auth.uid` à lire/écrire `fire/users/<uid>` ;
- bloque explicitement les anciens chemins publics `fire/portfolio` et `fire/history` ;
- valide la forme des données `portfolio` ;
- valide la forme des points `history` ;
- refuse les champs inattendus avec `$other`.

### À publier manuellement dans Firebase

1. Ouvre **Firebase Console**.
2. Va dans ton projet `fire-dashboard-5f696`.
3. Va dans **Realtime Database → Rules**.
4. Copie-colle le contenu de `database.rules.json`.
5. Clique **Publish**.
6. Va dans **Realtime Database → Data** et supprime les anciens chemins si présents :
   - `fire/portfolio`
   - `fire/history`

### Mode encore plus strict : seulement ton UID

Si tu veux que **même un autre compte Firebase Auth créé par erreur** ne puisse pas avoir son propre espace, utilise `database.rules.owner.template.json` :

1. Dans Firebase, va dans **Authentication → Users**.
2. Copie ton **User UID**.
3. Dans `database.rules.owner.template.json`, remplace partout `YOUR_FIREBASE_UID_HERE` par ton UID.
4. Publie cette version dans **Realtime Database → Rules**.

## 4. Backend sécurisé avec Supabase

Supabase est adapté si tu veux remplacer Firebase par une base PostgreSQL avec Row Level Security.

### Ce que j'ai ajouté côté code

- `supabase/fire-dashboard-schema.sql` : script SQL qui crée une table `fire_dashboards` avec une ligne par utilisateur.
- RLS activé et forcé.
- Policies `select`, `insert`, `update`, `delete` limitées à `auth.uid() = user_id`.
- Le rôle `anon` n'a aucun accès direct à la table.

### À faire manuellement dans Supabase

1. Crée un projet Supabase.
2. Va dans **Authentication → Providers**.
3. Active **Email**.
4. Désactive l'inscription publique si tu veux être le seul utilisateur, ou ne crée aucun lien d'inscription dans l'app.
5. Va dans **SQL Editor**.
6. Colle et exécute `supabase/fire-dashboard-schema.sql`.
7. Dans **Authentication → Users**, crée ton compte.
8. Ensuite seulement, on pourra modifier `index.html` pour utiliser Supabase au lieu de Firebase.

### À ne jamais faire

- Ne mets jamais la clé Supabase `service_role` dans le navigateur.
- La clé `anon` peut être publique uniquement si RLS est correctement activé.

## 5. Backend sécurisé avec Vercel

Vercel est adapté si tu veux garder Firebase, mais ne plus parler directement à Firebase Database depuis le navigateur.

### Ce que j'ai ajouté côté code

- `vercel/api/dashboard.js` : endpoint serveur exemple.
- Il attend un token Firebase Auth dans l'en-tête `Authorization: Bearer <idToken>`.
- Il vérifie le token avec Firebase Admin côté serveur.
- Il lit/écrit uniquement `fire/users/<uid>`.
- Il nettoie et limite les valeurs avant écriture.

### À faire manuellement dans Vercel

1. Crée un projet Vercel depuis le repo GitHub privé.
2. Ajoute les variables d'environnement dans **Project Settings → Environment Variables** :
   - `FIREBASE_DATABASE_URL` = ton URL Realtime Database ;
   - `FIREBASE_SERVICE_ACCOUNT_JSON` = JSON complet du service account Firebase Admin.
3. Dans Firebase Console, va dans **Project settings → Service accounts**.
4. Génère une nouvelle clé privée.
5. Copie le JSON dans `FIREBASE_SERVICE_ACCOUNT_JSON` côté Vercel uniquement.
6. Ne commit jamais ce JSON dans GitHub.
7. Déploie sur Vercel.

### Prochaine étape de code si tu choisis Vercel

Il faudra modifier `index.html` pour :

1. garder Firebase Auth côté navigateur ;
2. récupérer `await user.getIdToken()` ;
3. appeler `/api/dashboard` en `GET` pour charger les données ;
4. appeler `/api/dashboard` en `PUT` pour sauvegarder les données ;
5. supprimer les accès directs `getDatabase`, `ref`, `set`, `onValue` côté navigateur.

## 6. Recommandation simple

### Étape immédiate

1. Publie `database.rules.json` dans Firebase.
2. Vérifie que le login s'affiche en navigation privée.
3. Supprime les anciens chemins publics dans Firebase.
4. Mets le repo privé seulement si tu acceptes l'impact possible sur GitHub Pages.

### Étape recommandée ensuite

- Si tu veux le plus simple : reste sur Firebase Auth + Realtime Database rules renforcées.
- Si tu veux une vraie architecture backend : choisis **Vercel + Firebase Admin**.
- Si tu veux une base SQL propre et scalable : choisis **Supabase + RLS**.

Ma recommandation pour ton cas : **Vercel + Firebase Admin**, car tu gardes ton Firebase actuel mais tu retires les écritures directes depuis le navigateur.
