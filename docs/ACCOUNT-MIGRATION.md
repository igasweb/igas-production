# Client account migration

Status as of 1 November 2026. Client account: `IGASweb@gcassociates.in`.

The website, CMS, database, media provider and source repository are running under the client's accounts. Data preservation, client administrator access and the replacement website API token are verified. Final handover remains incomplete: the legacy website redirect is prepared but not deployed, automatic Git deployments still need verification, and original collaborator access still requires removal.

## Client resources

| Component | Client resource | Verified state |
| --- | --- | --- |
| Source code | https://github.com/igasweb/igas-production | Ownership transferred; local Git remote points to the client repository. |
| Website | https://igas-production-nu.vercel.app | Vercel team `igas2`, project `igas-production`. Last verified deployment `HPsuywcFXb6T95w2XJX3WfYpxRYs` reached Ready in 49 seconds, before the latest local handover changes. |
| CMS | https://igas-client-cms.onrender.com/admin | Render service `srv-dbhe4tec6qcc73f65c5g`; health endpoint returned 204 on 1 November. |
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
- The original administrator in the client CMS is disabled and all 13 of its admin sessions were invalidated on 1 November. The client Super Administrator remains active. Account/content associations were preserved; reactivation would require a new login. Original source-service access and repository collaborator access still require review. Review the remaining shared application credentials as part of final handover; preserve encryption and token-salt dependencies when planning any rotation.

## Data verification

Full-row MD5 checksums on 1 November confirm that every original enquiry, job application and newsletter subscriber is present unchanged in the client database, including attachment data.

| Collection | Original database | Client database | Comparison |
| --- | ---: | ---: | --- |
| Enquiries | 2 | 3 | All original rows match; one additional verification record. |
| Job applications | 4 | 5 | All original rows match; one additional verification record. |
| Newsletter subscribers | 1 | 2 | All original rows match; one additional verification record. |

The three additional records use marker `migration-verification-1793290783729`. They remain in the client CMS for review. Earlier migration fixtures were removed; no real submissions were deleted or changed during verification. These checks describe the recorded point in time; recheck for incoming submissions immediately before cutting over the original service.

## Live verification

The last full end-to-end verification ran on 29 October:

- Enquiry and job application submissions returned 200 and appeared in their separate client CMS inboxes with consent and PDF attachments. The downloaded application PDF exactly matched the submitted bytes.
- A newsletter signup returned 200 and was stored as pending with consent version `newsletter-v1`.
- The enabled CMS cache-revalidation webhook targeted the client website and its authenticated Trigger test succeeded.
- Public reads of private enquiries, applications, subscribers and newsletter drafts returned 404. Unauthenticated cache revalidation returned 401.
- Empty enquiries and newsletter signup without consent returned 400.
- Website, careers page and sitemap returned 200; CMS health returned 204. Cloudinary upload and synthetic-media cleanup passed.

On 1 November, after the superseded tokens were expired, the client website and careers page returned 200 and CMS health returned 204. The newer Vercel Secret-storage changes and local redirect changes require another deployment and verification; the older end-to-end results do not prove that those pending deployments have completed.

## Deployments and legacy URL cutover

Vercel Git settings show the connected repository `igasweb/igas-production`. Render shows the client email as Git credential owner and Auto-Deploy set to `On Commit`, with root directory `cms`. Actual push-triggered deployment behavior still needs verification against the exact new commit SHA in both hosting dashboards.

The local Next.js configuration now includes a temporary, host-only redirect from `igas-production.vercel.app` to `igas-production-nu.vercel.app`. Next's redirect testing helper verified root, nested path, query-string and API-path behavior, and that the client host does not redirect or loop. The change has not yet been deployed. It must reach the original Vercel project as well as the client project before the legacy URL stops serving its original application.

Until the cutover is deployed and verified, original-site submissions still reach the original CMS/database. Keep the original CMS and database available while checking incoming records and verifying the redirect. The original services have not been deleted or suspended.

The repository's `render.yaml` now describes the client service and origins. The existing live service is separately created, not attached to this Blueprint. Applying a Blueprint may provision additional resources; do not assume it updates the current service. See [CMS deployment instructions](../cms/DEPLOYMENT.md).

## Remaining handover work

1. Commit and deploy the prepared handover changes. Verify both automatic Git deployments at the exact intended SHA and confirm the production website and CMS remain healthy.
2. Deploy the host-only redirect to the original Vercel project. Recheck post-copy submissions before cutover, then verify legacy root, nested paths, query strings and submission routes, plus absence of a redirect loop on the client host.
3. Re-run authenticated cache revalidation and controlled submission checks after the latest settings are deployed.
4. Remove remaining original collaborator access after verifying the client's retained access and recovery arrangements. The original administrator in the client CMS is already disabled with its sessions revoked. Complete any remaining application-secret rotation through a coordinated rollout.
5. Decide when to retire the original CMS and hosting fallback after cutover is verified. Keep private backups protected and confirm the client has an appropriate recovery process.

Custom domain migration remains postponed. Newsletter email delivery is not connected: subscriptions and drafts can be managed in the CMS, but saving or publishing a newsletter does not send email. Indexing was not enabled by this migration.
