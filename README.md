<<<<<<< codex/fix-routing-for-fire-dashboard-lg8ept
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

## Sécuriser les données sensibles

Le code HTML/CSS/JavaScript d'un site GitHub Pages reste public par nature. Il ne faut donc jamais y mettre un secret privé, un mot de passe en dur ou une clé API serveur.

La protection des données se fait côté Firebase :

1. Active **Authentication → Sign-in method → Email/Password** dans Firebase.
2. Crée ton compte utilisateur dans **Authentication → Users** et ne crée pas d'écran public d'inscription.
3. Publie les règles `database.rules.json` dans **Realtime Database → Rules**.
4. Migre ou ressaisis tes données dans l'app après connexion : elles seront enregistrées sous `fire/users/<uid>/...`.
5. Supprime les anciennes données `fire/portfolio` et `fire/history` si elles existent encore dans Realtime Database.

Avec ces règles, chaque utilisateur authentifié ne peut lire et écrire que son propre chemin `fire/users/<uid>`. Le site peut rester public, mais les données Firebase ne sont plus publiques.
=======
# fire-dashboard

Static FIRE dashboard configured to be served from the domain root (`/`).

Deploy the contents of this repository at the web root (for example a GitHub Pages user/organization site, Firebase Hosting public root, Netlify/Vercel root, or a custom domain pointing directly to this static site) so the app is available without the `/fire-dashboard` path.
>>>>>>> main
