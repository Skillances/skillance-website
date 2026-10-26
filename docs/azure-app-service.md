# Hosting on Azure App Service (South Africa North)

The site runs as one container on Azure App Service (Linux, B1) in `southafricanorth`:

- **nginx** serves the built Vite app, sets the security headers and the SPA fallback.
- **Node sidecar** (`server/sidecar.ts`, loopback only) replaces the two Vercel-only pieces:
  `POST /api/client-log` and `Accept: text/markdown` negotiation for `/` and `/beyond`.
- Config: `Dockerfile`, `nginx/`, `server/`. CSP lives in `nginx/security-headers.conf` and must
  match `vercel.json` (`tests/hosting-headers.test.ts` checks this until `vercel.json` is removed).

## Resources (resource group `rg-skillance-prod`)

| Resource | Name |
|---|---|
| App Service plan (Linux, B1) | `asp-skillance-web` |
| Web app | `app-skillance-web-53be9f` |
| Image | `skillanceacr53be9f.azurecr.io/skillance-web` |

The web app pulls from ACR with its system-assigned managed identity (`AcrPull` on the registry).
HTTPS only, TLS 1.2 minimum, FTPS disabled, HTTP/2, Always On, health check `/healthz`.

## Deploying

`.github/workflows/azure-app-service.yml` runs on every push to `main`: lint, typecheck, tests,
build and push the image to ACR, point the web app at the new image tag, wait for `/healthz`,
then ping IndexNow.

One-time setup for the workflow (the website repo needs the same OIDC login the backend repo uses):

1. Add repository secrets `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
   (same app registration as the backend, or a new one).
2. On that app registration, add a federated credential for this repo
   (`repo:Skillances/skillance-website:ref:refs/heads/main`).
3. Give it `Contributor` on the web app and `AcrPush` on the registry.
4. Optional repository variables: `VITE_API_BASE_URL`, `VITE_AUTH_REFRESH_COOKIE`,
   `VITE_PUBLIC_S3_CATEGORY_BASE`. These are compiled into the bundle at build time.

Manual deploy:

```bash
docker build --platform linux/amd64 --build-arg VITE_API_BASE_URL=https://api.skillance.co.za -t skillanceacr53be9f.azurecr.io/skillance-web:latest .
az acr login -n skillanceacr53be9f
docker push skillanceacr53be9f.azurecr.io/skillance-web:latest
az webapp restart -g rg-skillance-prod -n app-skillance-web-53be9f
```

## Domain cutover from Vercel (GoDaddy DNS)

1. Add TXT `asuid` and `asuid.www` with the app's custom domain verification ID
   (`az webapp show -g rg-skillance-prod -n app-skillance-web-53be9f --query customDomainVerificationId -o tsv`).
2. Check the site on `https://app-skillance-web-53be9f.azurewebsites.net`.
3. At a quiet hour, replace the Vercel records: `A @` to the app's inbound IP
   (`dig +short app-skillance-web-53be9f.azurewebsites.net`), and `CNAME www` to
   `app-skillance-web-53be9f.azurewebsites.net`. Leave every MX, SPF, DKIM and DMARC record alone.
4. Bind the domains and issue the free managed certificate:

```bash
az webapp config hostname add -g rg-skillance-prod --webapp-name app-skillance-web-53be9f --hostname skillance.co.za
az webapp config hostname add -g rg-skillance-prod --webapp-name app-skillance-web-53be9f --hostname www.skillance.co.za
az webapp config ssl create -g rg-skillance-prod -n app-skillance-web-53be9f --hostname skillance.co.za
az webapp config ssl create -g rg-skillance-prod -n app-skillance-web-53be9f --hostname www.skillance.co.za
# then bind each certificate:
az webapp config ssl bind -g rg-skillance-prod -n app-skillance-web-53be9f --certificate-thumbprint <thumbprint> --ssl-type SNI
```

5. Keep Vercel running until `https://skillance.co.za` works, then remove the Vercel project.

## Known limits

- Client-log rate limiting is per container instance. If you scale out, the limit is per instance.
- B1 has no deployment slots or autoscale; a deploy restarts the container (a few seconds of downtime).
  Move to P0v3 for slots and autoscale if that matters.
- `postbuild` (IndexNow ping) is skipped in the Docker build; the workflow runs it after a healthy deploy.
