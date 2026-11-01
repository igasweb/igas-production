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

With the user's explicit approval, the Render GitHub app was installed with access limited to `igasweb/igas-production`. Render listed that authorized repository, which was selected in Update Source. The subsequent push of `8cf4ec7` automatically triggered Render deployment `dep-dbjepcp5efls73du9ld0`, which reached Live in 4 minutes 1 second. The same commit has a successful Vercel deployment status targeting `DhxSGWbCJdt4ZRKFEW6WqGtkkh2J`. This verifies automatic deployment through the repaired Git-provider connection.

For future trigger checks, use a meaningful change under `cms/` to exercise the root-directory trigger. Confirm the repository, `main` branch, `On Commit` setting and exact deployed SHA in the live service. Do not expand the GitHub installation to unrelated repositories when troubleshooting. A Vercel build alone does not prove the CMS has updated.

The repository's `render.yaml` describes the client configuration. The existing live service was created separately and is not managed by an attached Blueprint. Do not apply the file expecting to update that service: creating a Blueprint can create additional resources. Check the Render service and resource bindings before any Blueprint rollout.

## Environment and credentials

Set `CORS_ORIGINS` and `NEXT_APP_URL` to the client website origin. In Vercel, set the server-only `STRAPI_URL` to the client CMS origin. Store credentials in the hosting environment settings; never commit environment files or copy secrets into this document.

`STRAPI_SUBMISSIONS_SECRET` must match between Render and Vercel for enquiries, applications and newsletter signups. `REVALIDATION_SECRET` must also match: CMS startup recreates the website cache webhook from `NEXT_APP_URL` and this secret, so changing only the webhook header is not durable. Coordinate credential updates, restart/redeploy the CMS and redeploy the website, then test the webhook and the three submission types.

Preserve the current database, Cloudinary binding and Strapi application secrets when redeploying. In particular, do not regenerate `ENCRYPTION_KEY` or `API_TOKEN_SALT` against the existing database as a routine deployment step; stored token encryption and authentication depend on them. The generated-secret entries in `render.yaml` are for provisioning, not instructions to replace existing production credentials.

The migration retained the internal CMS values `APP_KEYS`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT` and `ENCRYPTION_KEY`; their rotation is not yet verified. A coordinated rekey is still needed for complete independence from previously known application secrets. Rotating session/JWT signing secrets may require new logins. Rotating `API_TOKEN_SALT` invalidates existing token hashes, and changing `ENCRYPTION_KEY` affects encrypted token values. Prepare replacement tokens and migrate or recreate dependent encrypted values, update the website credential, and verify access before retiring the old material. Do not overwrite these values independently in a routine redeployment.

## Recovery and verification

If automatic deployment does not run, open this exact Render service, use Manual Deploy for the intended `main` commit, and inspect the build/start logs. Confirm the deployed SHA and `/_health` before checking the website. Use the hosting provider's rollback controls for a failed code deployment; a code rollback does not restore overwritten environment values or database content.

After the verified `8cf4ec7` Render restart, enquiry and application PDF-byte checks, pending newsletter consent (`newsletter-v1`) and the bootstrap-regenerated cache webhook (HTTP 200, `ok: true`) all passed; run-specific test records were removed. For future deployments, verify CMS-backed content and the client administrator login. Submit clearly labelled test enquiries and applications with a PDF, confirm they appear in their separate CMS inboxes, and verify a newsletter signup is pending. Trigger the enabled cache-revalidation webhook and expect success. Newsletter storage does not send email; delivery is not connected.

The legacy website redirect is now deployed and verified for root, nested paths/query strings and the contact API. Keep the original CMS and restricted database backup as fallback until final access cleanup and recovery arrangements are complete. Before retiring the original CMS, compare retained submissions so no post-copy records are lost. See [the account migration handover](../docs/ACCOUNT-MIGRATION.md) for current verification results and remaining work.
