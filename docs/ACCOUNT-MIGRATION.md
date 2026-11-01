# Client account migration

Status as of 1 November 2026. Client account: `IGASweb@gcassociates.in`.

The website, CMS, database, media provider and source repository are running under the client's accounts. Data preservation, client administrator access and the replacement website API token are verified. The legacy website now redirects to the client site, and automatic deployments have been verified on both Vercel and Render. Post-restart end-to-end checks pass. Final handover still requires the remaining repository collaborator removal and review of inherited internal CMS secrets.

## Client resources

| Component | Client resource | Verified state |
| --- | --- | --- |
| Source code | https://github.com/igasweb/igas-production | Ownership transferred; local Git remote points to the client repository. |
| Website | https://igas-production-nu.vercel.app | Vercel team `igas2`, project `igas-production`. Commit `8cf4ec7` has a successful public GitHub deployment status targeting `DhxSGWbCJdt4ZRKFEW6WqGtkkh2J`. |
| CMS | https://igas-client-cms.onrender.com/admin | Render service `srv-dbhe4tec6qcc73f65c5g`. Automatic deployment `dep-dbjepcp5efls73du9ld0` for `8cf4ec7` is Live (4 minutes 1 second), verified in the dashboard. |
| Database | Neon project `IGAS-CMS` | Initial copy of all 105 tables and 1,855 rows matched the source by per-table checksums immediately after restoration. Both databases are currently reachable. |
| Media uploads | Cloudinary cloud `mnwliy2r` | Synthetic upload and removal passed on 29 October. |

The original database was not modified by the copy. A restricted backup is stored in the Git-ignored `.migration-backups/` directory. Private migration environment files are also Git-ignored; never commit or share them.

The source CMS had no Media Library records, so no existing CMS uploads needed copying. Existing website photographs remain external URLs. Future CMS uploads use the client's Cloudinary account.

## Credentials and client access

- The client Super Administrator account is active. Password configuration and invitation consumption were verified without reading the password or its hash. Client sign-in, separate enquiry and application inbox access, and newsletter management access were verified in Brave.
- Replacement token ID 4, `IGAS client website - rotated 2026-10-29`, is Read-only with Unlimited duration. Strapi records successful use. Vercel stores `STRAPI_API_TOKEN` as a Production-only Secret.
- Superseded client tokens IDs 1 (`Read Only`), 2 (`Full Access`) and 3 (`IGAS website published content`) were reversibly expired on 1 November. Token 4 remains active. Previous expiry metadata is in the private backup folder. Tokens in the original CMS were not modified.
- `REVALIDATION_SECRET` and `STRAPI_SUBMISSIONS_SECRET` are now Production-only Secrets in Vercel. Their existing working values were retained with the user's specific approval. This storage change does not constitute another credential rotation. The corresponding values must remain synchronized with Render.
- `STRAPI_URL` is Production-only Config and points to the client CMS.
- The original administrator in the client CMS is disabled and all 13 of its admin sessions were invalidated on 1 November. The client Super Administrator remains active. Account/content associations were preserved; reactivation would require a new login. The original GitHub collaborator `atulvjd` is still present; removal is prepared for the final step after the documentation push. Original source-service access remains with the retained fallback services.

The internal CMS values `APP_KEYS`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT` and `ENCRYPTION_KEY` were inherited during the database migration; no completed rotation of these values has been demonstrated. Client-owned hosting and revoked old admin sessions do not by themselves eliminate knowledge of copied secrets. Plan a coordinated rekey before claiming complete credential independence. `API_TOKEN_SALT` and `ENCRYPTION_KEY` are tied to stored tokens and encrypted values; preserve or migrate those dependencies and update the website token before switching. See [CMS credential guidance](../cms/DEPLOYMENT.md#environment-and-credentials).

## Data verification

Full-row MD5 checksums on 1 November confirm that every original enquiry, job application and newsletter subscriber is present unchanged in the client database, including attachment data.

| Collection | Original database | Client database | Comparison |
| --- | ---: | ---: | --- |
| Enquiries | 2 | 3 | All original rows match; one additional verification record. |
| Job applications | 4 | 5 | All original rows match; one additional verification record. |
| Newsletter subscribers | 1 | 2 | All original rows match; one additional verification record. |

The three additional records use marker `migration-verification-1793290783729`. They remain in the client CMS for review. Earlier migration fixtures were removed; no real submissions were deleted or changed during verification. These checks describe the recorded point in time. The legacy public hostname now redirects to the client site; retain the original database as fallback and recheck it before eventual deletion.

## Live verification

Full end-to-end verification was repeated on 1 November after the credential and access cleanup:

- Enquiry and job application submissions returned 200 and appeared in their separate client CMS inboxes with consent and PDF attachments. Downloaded enquiry and application PDFs exactly matched the submitted bytes.
- A newsletter signup returned 200 and was stored as pending with consent version `newsletter-v1`. The three fresh run-specific fixtures were removed after verification; the older labelled review records remain.
- The enabled CMS cache-revalidation webhook targeted the client website and its authenticated Trigger test succeeded.
- Public reads of private enquiries, applications, subscribers and newsletter drafts returned 404. Unauthenticated cache revalidation returned 401.
- Empty enquiries and newsletter signup without consent returned 400.
- Website, careers page and sitemap returned 200; CMS health returned 204. Cloudinary upload and synthetic-media cleanup passed.

On 1 November, after the superseded tokens were expired, the client website and careers page returned 200 and CMS health returned 204. The full submission checks above passed before the Git-triggered Render restart, and only their run-specific fixtures were removed. The post-restart end-to-end run also passed: enquiry and application PDF bytes matched exactly, the newsletter signup was pending with `newsletter-v1` consent, and the bootstrap-regenerated CMS webhook authenticated successfully (HTTP 200, `ok: true`). Only the current-run synthetic records were removed after those checks.

## Deployments and legacy URL cutover

Vercel Git settings show the connected repository `igasweb/igas-production`. Commit `8cf4ec7` has a successful Vercel deployment status on GitHub targeting `DhxSGWbCJdt4ZRKFEW6WqGtkkh2J`.

Render was initially created from a public repository URL, which did not produce push deployments despite `On Commit` being selected. With the user's explicit approval, the Render GitHub integration was installed for only `igasweb/igas-production`, and that authorized repository was selected in Update Source. The subsequent push of `8cf4ec7` automatically produced deployment `dep-dbjepcp5efls73du9ld0`, confirmed Live in 4 minutes 1 second. Both hosting providers now have a verified push-deployment result at this commit.

The temporary host-only redirect from `igas-production.vercel.app` to `igas-production-nu.vercel.app` is deployed on the original Vercel project. Legacy deployment `CK1eTqB94VbbCuj8JD3Mz7qNMpuG` uses `e90b19c` and reached Ready in 17 seconds. Real HTTP checks confirmed:

- Legacy root GET returns 307 to the client root.
- A nested legacy path and query string return 307 with both preserved.
- Legacy `POST /api/contact` returns 307 to the client submission route, preserving the method.
- Client root returns 200, with no redirect loop.

The original CMS and database remain available as fallback; the public legacy hostname now routes visitors and new requests to the client website. No original hosting service has been deleted or suspended. This completed redirect removes the previous dependency on deploying the original public hostname cutover.

The repository's `render.yaml` now describes the client service and origins. The existing live service is separately created, not attached to this Blueprint. Applying a Blueprint may provision additional resources; do not assume it updates the current service. See [CMS deployment instructions](../cms/DEPLOYMENT.md).

## Remaining handover work

1. Commit and push the final documentation, then verify the resulting production deployments. Post-Render-restart end-to-end verification is complete and passed.
2. Remove the original GitHub collaborator `atulvjd` after that final push and verify the client owner retains access. The original administrator in the client CMS is already disabled with its sessions revoked.
3. Plan and complete coordinated rotation of the inherited internal CMS secrets listed above, including dependent token rekeying. Do not claim that existing copied secrets were rotated merely because their storage or account ownership changed.
4. Decide when to retire the original CMS and hosting fallback. Keep private backups protected, compare any retained-source records before deletion, and confirm the client has an appropriate recovery process.

Custom domain migration remains postponed. Newsletter email delivery is not connected: subscriptions and drafts can be managed in the CMS, but saving or publishing a newsletter does not send email. Indexing was not enabled by this migration.
