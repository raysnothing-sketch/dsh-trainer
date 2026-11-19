# DSH-Trainer

Application autonome de préparation à la **Deutsche Sprachprüfung für den Hochschulzugang (DSH)**. Aucune dépendance envers le portfolio : dépôt, identité visuelle, contenu, typographies, configuration et déploiement lui sont propres.

## Contenu
- **20 simulations** de *Leseverstehen + wissenschaftssprachliche Strukturen* (30 P + 15 P chacune), avec texte ligne par ligne, corrigé, graphiques et entraînement de structures.
- **Hörverstehen** : audio via synthèse vocale du navigateur, 8 questions, transcription après correction.
- **Sprechen** : 3 tâches, minuteurs, reconnaissance vocale avec repli texte.
- **Schreiben** : 2 tâches, aide au plan, compteur de mots.
- **Lernen** : 5 domaines, 15 leçons et 25 conseils d'examen.

Interface localisée DE / EN / FR ; contenu pédagogique en allemand.

## Développement
```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

## Déploiement
Le dépôt est connecté à un **Cloudflare Worker** via `.github/workflows/cloudflare-deploy.yml` (OpenNext). Chaque push sur `main` construit et déploie :

**https://dsh-trainer.raysnothing.workers.dev**

Secrets GitHub requis : `CLOUDFLARE_API_TOKEN` (Workers Scripts: Edit) et `CLOUDFLARE_ACCOUNT_ID`.

Le feedback IA est optionnel : sans `DSH_AI_API_KEY`, les endpoints `/api/dsh/evaluate` et `/api/dsh/module-evaluate` répondent `501` et l'évaluation locale prend le relais.
