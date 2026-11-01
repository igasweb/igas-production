# Client CMS deployment

The client service is [igas-client-cms on Render](https://dashboard.render.com/web/srv-dbhe4tec6qcc73f65c5g). Its administrator URL is https://igas-client-cms.onrender.com/admin and its health endpoint is `/_health` (expected HTTP 204). The client website is https://igas-production-nu.vercel.app.

## Build and deploy

- Repository: `igasweb/igas-production`, branch `main`.
- Render root directory: `cms`.
- Node.js: 22; build: `npm ci --include=dev && npm run build`; start: `npm run start`.
- Region: Oregon (US West), as observed in the service settings during migration.
- Database: client Neon project `IGAS-CMS`; uploads: client Cloudinary cloud `mnwliy2r`.
- The live service showed Auto-Deploy set to `On Commit`. Verify a push by checking that Render and Vercel both deploy the exact new commit SHA. Root-only changes may not trigger the CMS because its root directory is `cms`.

## Git integration and automatic deployment

The service was originally created from a public repository URL. This allowed manual builds but did not provide a working push trigger, despite Auto-Deploy showing `On Commit`. On 1 November, pushing handover commit `e90b19c` triggered Vercel but no Render deployment.

With the user's explicit approval, the Render GitHub app was installed with access limited to `igasweb/igas-production`. Render listed that authorized repository, which was selected in Update Source. A Deploy action was submitted; no new deployment was visible immediately afterward. The Git-provider connection is configured, but automatic deployment remains unverified until a subsequent push produces a Render deployment at the exact new SHA.

Use a meaningful change under `cms/` to exercise the root-directory trigger. Confirm the repository, `main` branch, `On Commit` setting and exact deployed SHA in the live service. Do not expand the GitHub installation to unrelated repositories when troubleshooting. A Vercel build alone does not prove the CMS has updated.

The repository's `render.yaml` describes the client configuration. The existing live service was created separately and is not managed by an attached Blueprint. Do not apply the file expecting to update that service: creating a Blueprint can create additional resources. Check the Render service and resource bindings before any Blueprint rollout.

## Environment and credentials

Set `CORS_ORIGINS` and `NEXT_APP_URL` to the client website origin. In Vercel, set the server-only `STRAPI_URL` to the client CMS origin. Store credentials in the hosting environment settings; never commit environment files or copy secrets into this document.

`STRAPI_SUBMISSIONS_SECRET` must match between Render and Vercel for enquiries, applications and newsletter signups. `REVALIDATION_SECRET` must also match: CMS startup recreates the website cache webhook from `NEXT_APP_URL` and this secret, so changing only the webhook header is not durable. Coordinate credential updates, restart/redeploy the CMS and redeploy the website, then test the webhook and the three submission types.

Preserve the current database, Cloudinary binding and Strapi application secrets when redeploying. In particular, do not regenerate `ENCRYPTION_KEY` or `API_TOKEN_SALT` against the existing database as a routine deployment step; stored token encryption and authentication depend on them. The generated-secret entries in `render.yaml` are for provisioning, not instructions to replace existing production credentials.

## Recovery and verification

If automatic deployment does not run, open this exact Render service, use Manual Deploy for the intended `main` commit, and inspect the build/start logs. Confirm the deployed SHA and `/_health` before checking the website. Use the hosting provider's rollback controls for a failed code deployment; a code rollback does not restore overwritten environment values or database content.

After deployment, verify CMS-backed content and the client administrator login. Submit clearly labelled test enquiries and applications with a PDF, confirm they appear in their separate CMS inboxes, and verify a newsletter signup is pending. Trigger the enabled cache-revalidation webhook and expect success. Newsletter storage does not send email; delivery is not connected.

Keep the original services and restricted database backup available until the old URL cutover and final access cleanup are verified. Before retiring the original CMS, compare incoming submissions so no post-copy records are lost. See [the account migration handover](../docs/ACCOUNT-MIGRATION.md) for current verification results and remaining work.
