/** Configuration du trainer : une seule URL publique. */
export const env = {
  siteUrl: () =>
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://dsh-trainer.raysnothing.workers.dev",
};
