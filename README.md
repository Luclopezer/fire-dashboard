# luclopezer.github.io

Static FIRE dashboard for GitHub Pages.

## URL GitHub Pages

This repository is intended to be published as a **GitHub Pages user site** because its repository name is `luclopezer.github.io`.

When GitHub Pages is enabled, this user site is served at the domain root:

```text
https://luclopezer.github.io/
```

If the same files are published from a normal project repository named `fire-dashboard`, GitHub Pages serves them under the project path instead:

```text
https://luclopezer.github.io/fire-dashboard/
```

## Checklist if the root URL still returns 404

1. The repository must be owned by the `luclopezer` account and named exactly `luclopezer.github.io`.
2. GitHub Pages must be enabled in **Settings → Pages**.
3. The publishing source must point to the branch/folder that contains `index.html` at the published root, usually `main` and `/ (root)`.
4. After saving the Pages settings, wait for the GitHub Pages build/deploy action to finish before testing the URL again.

The app uses relative PWA asset paths so the same files can work from either `/` or `/fire-dashboard/` depending on where GitHub Pages publishes them.

## Sécurisation

Le plan complet est dans [`docs/security-roadmap.md`](docs/security-roadmap.md).

À retenir :

1. Un repo privé réduit l'exposition du code GitHub, mais le JavaScript envoyé au navigateur reste inspectable.
2. Les données doivent être protégées côté backend, pas seulement avec un écran de login.
3. Les règles Firebase renforcées sont dans `database.rules.json`.
4. Une variante encore plus stricte, limitée à un seul UID Firebase, est disponible dans `database.rules.owner.template.json`.
5. Un script de départ Supabase est disponible dans `supabase/fire-dashboard-schema.sql`.
6. Un exemple d'API Vercel sécurisée par Firebase Admin est disponible dans `vercel/api/dashboard.js`.

## Sécuriser les données sensibles avec Firebase

La protection des données se fait côté Firebase :

1. Active **Authentication → Sign-in method → Email/Password** dans Firebase.
2. Crée ton compte utilisateur dans **Authentication → Users** et ne crée pas d'écran public d'inscription.
3. Publie les règles `database.rules.json` dans **Realtime Database → Rules**.
4. Migre ou ressaisis tes données dans l'app après connexion : elles seront enregistrées sous `fire/users/<uid>/...`.
5. Supprime les anciennes données `fire/portfolio` et `fire/history` si elles existent encore dans Realtime Database.
   
Avec ces règles, chaque utilisateur authentifié ne peut lire et écrire que son propre chemin `fire/users/<uid>`. Le site peut rester public, mais les données Firebase ne sont plus publiques.

## Si tu ne vois pas l'écran de login

Si le dashboard s'affiche directement sans login :

1. Tu es peut-être déjà connecté dans ce navigateur : clique sur **Déconnexion** pour vérifier que l'écran `FIRE privé` revient.
2. Ton navigateur peut avoir gardé l'ancienne PWA en cache : fais un rechargement forcé (`Ctrl` + `Shift` + `R`) ou supprime les données du site dans les DevTools.
3. Sur mobile, ferme l'app PWA installée puis rouvre-la, ou désinstalle/réinstalle le raccourci après le nouveau déploiement.
4. Vérifie que GitHub Pages a fini de redéployer la branche `main`.
5. Vérifie que tu as créé ton utilisateur dans **Firebase Authentication → Users** ; le code n'ouvre pas d'inscription publique.

Le service worker force maintenant une vérification de mise à jour au chargement et recharge la page quand une nouvelle version prend le contrôle, afin d'éviter de rester bloqué sur une ancienne version sans login.

