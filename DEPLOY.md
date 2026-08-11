# Deploying Adda

Target: `adda.builtbyswami.com`, on whichever Vercel account owns `builtbyswami.com`.

The repo is committed locally at `~/Projects/deluxe-cp` (`78b6016`). Node 26 and git are both fine. `gh` is installed but not logged in.

---

## 1. Push to GitHub

```bash
gh auth login          # or create the repo in the browser
cd ~/Projects/deluxe-cp
gh repo create adda --private --source=. --push
```

Private is the right default. You can flip it public later if you want the code itself to be part of the portfolio — for a hirer, readable source is usually a plus, but only once you've read back through it yourself.

## 2. Import on the right account

In Vercel, **switch to the account that owns builtbyswami.com** before importing. This is the step that matters — importing on the wrong account is what creates the cross-account domain verification you're trying to avoid, and moving a project between accounts afterwards is more annoying than starting again.

Add New → Project → import the repo. Framework detection will pick up Next.js; defaults are correct, nothing to change.

## 3. Environment variables

| Key | Value | Needed for |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://adda.builtbyswami.com` | OG images resolving to absolute URLs when shared |
| `UPSTASH_REDIS_REST_URL` | from Upstash | Presence counter |
| `UPSTASH_REDIS_REST_TOKEN` | from Upstash | Presence counter |

The Upstash pair is optional — without them the counter renders nothing rather than erroring. Add the Redis store from the project's Storage tab and Vercel injects both automatically.

`NEXT_PUBLIC_SITE_URL` is not optional if you care about link previews. Without it the OG image URL stays relative and most platforms won't resolve it.

## 4. Add the subdomain

Project → Settings → Domains → add `adda.builtbyswami.com`.

- **If builtbyswami.com already uses Vercel DNS:** it provisions automatically, nothing else to do.
- **If DNS is elsewhere** (Cloudflare, Namecheap, GoDaddy): add a `CNAME` record for `adda` pointing at `cname.vercel-dns.com`. Vercel shows the exact target on the domain screen — use what it shows rather than what's written here, in case it's changed.

Certificates issue within a few minutes. If it sits on "Invalid Configuration" for more than ten, the CNAME hasn't propagated yet — that's normal, not a mistake.

## 5. Check before you share it

- Open `https://adda.builtbyswami.com` on your actual phone. This is the only real mobile test.
- Paste the link into a Slack or WhatsApp message to yourself and confirm the OG card renders.
- Play three or four tracks through, watching for any that skip instantly — that's a label disabling embedding, and you'd want to swap the video rather than leave a dead entry.
- Confirm the clock reads Delhi time, not yours.

---

## Later: the /labs index

Once there's a second app, add `builtbyswami.com/labs` to the roundup project — a page listing each app with a screenshot, a line of description, and a link. That's the URL that goes on a CV, not the individual apps.

Not worth building with one entry in it. An index page listing a single item looks thinner than no index page at all.
