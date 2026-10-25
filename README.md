# Connected Minds Admin Console

A small internal tool for editing the content on the Connected Minds,
Stronger Minds website (Reading List, Research Team, Get Involved,
Location, FAQ, Internship & Collaboration) without touching code.

This app is hosted — anyone on the team can open its URL from any browser
and log in with the shared password. It doesn't read or write local files;
instead it talks to the public site's GitHub repo directly through
GitHub's API. There's no sibling folder, no local git, and nothing to run
on your own computer.

## How it fits together

- `lab-website-next` is the public site — a static export, deployed on
  Vercel from its own GitHub repo.
- `admin-console` (this app) is a second, separate Vercel project, deployed
  from its own GitHub repo. It's a normal Next.js app (not a static
  export) — its pages are editor forms, and its API routes read and write
  files in the **site's** GitHub repo using a GitHub access token.
- Saving a field on any editor page commits straight to a branch called
  `cms-draft` in the site's repo (configurable — see below). This is a
  real git branch, so several people can be editing different pages at
  once without clobbering each other, and nothing goes live yet.
- The **Publish** page shows which files have changed since the last
  publish, and a **Publish changes** button that merges `cms-draft` into
  the live branch (`main`). That merge is a normal push to `main`, which
  is exactly what makes Vercel rebuild and redeploy the public site — the
  same thing that would happen if you pushed from a terminal.

## One-time setup

You need two things: a GitHub access token the admin console can use to
read and write the site's repo, and the admin console deployed as its own
Vercel project.

### 1. Create a GitHub token

The admin console needs permission to read and write files, branches, and
commits in the `lab-website-next` repo (but nothing else).

The simplest option is a **classic personal access token**:

1. GitHub → Settings → Developer settings → Personal access tokens →
   Tokens (classic) → Generate new token.
2. Give it a name like "Connected Minds admin console", an expiration you're
   comfortable with (or no expiration, if you don't mind rotating it
   manually later), and check the **repo** scope.
3. Generate it and copy the token — GitHub only shows it once.

(A fine-grained token scoped to just this one repo, with **Contents**
and **Metadata** set to Read & write, works too and is more locked-down —
use that instead if your org prefers it.)

### 2. Deploy the admin console to Vercel

1. Push this `admin-console` folder to its own new GitHub repo (separate
   from `lab-website-next`):
   ```bash
   cd admin-console
   git remote add origin <your-admin-console-repo-url>
   git push -u origin master
   ```
2. In the [Vercel dashboard](https://vercel.com/new), import that repo as
   a **new, separate** project (don't attach it to the `lab-website-next`
   project — they're independent).
3. Before the first deploy, add these environment variables in the
   project's Settings → Environment Variables:

   | Variable | Value |
   | --- | --- |
   | `ADMIN_PASSWORD` | The shared password your team logs in with. Wrap it in quotes in any `.env` file you copy it from, but Vercel's dashboard fields don't need quoting — paste the password as-is. |
   | `SESSION_SECRET` | Any long random string, e.g. the output of `openssl rand -hex 32`. Signs login sessions; doesn't need to be memorable. |
   | `GITHUB_TOKEN` | The token from step 1. |
   | `GITHUB_OWNER` | The GitHub username or org that owns the **site** repo, e.g. `your-github-username`. |
   | `GITHUB_REPO` | The **site** repo's name, e.g. `lab-website-next`. |
   | `GITHUB_MAIN_BRANCH` | Optional, defaults to `main`. Set this if the site repo's live branch is named something else (e.g. `master`). |
   | `GITHUB_DRAFT_BRANCH` | Optional, defaults to `cms-draft`. The admin console creates this branch itself the first time it's needed. |
   | `GITHUB_SITE_ROOT` | Optional, defaults to unset (meaning `content/` and `public/` sit at the repo's root). Set this if they're inside a subfolder instead — e.g. `GITHUB_SITE_ROOT=lab-website-next` if the repo has `lab-website-next/content/...`. This happens if the whole project folder was dragged into GitHub's web upload UI instead of just its contents. |

4. Deploy. Once it's built, open the project's URL — that's the admin
   console everyone uses from now on.

Changing any of these later (e.g. rotating the GitHub token) just means
updating the Environment Variables in Vercel and redeploying — no code
change needed.

## Using it day to day

Open the admin console's URL, log in with the shared password, and edit
away. Each page has its own **Save changes** button — saving commits that
page's content straight to the `cms-draft` branch, so it's safe from the
moment you click it (nothing is lost if you close the tab), but it isn't
live on the public site yet.

Photos uploaded from the Research Team and Location editors work the same
way — they're committed to `cms-draft` under
`public/images/<team|location>/` and previewed in the editor straight from
that branch.

When you're ready for your changes to go live, open the **Publish** page.
It lists every file that's changed since the last publish; click
**Publish changes** to merge them into the live branch. Vercel picks up
that push automatically and rebuilds the public site — changes are
usually live within a minute or two. The Publish page also shows a short
history of recent publishes with links to each commit on GitHub.

## Content files

| Page in admin console | File it edits (in the site repo) |
| --- | --- |
| Reading List | `content/reading-list.json` |
| Research Team | `content/team.json` |
| Get Involved | `content/get-involved.json` |
| Location | `content/location.json` |
| FAQ | `content/faq.json` |
| Internship & Collaboration | `content/internship-collaboration.json` |

These are plain JSON files in the site repo and can also be hand-edited
there directly (on the `cms-draft` branch, so the admin console's Publish
button still applies them) as long as the shape stays the same — the
public site reads them at build time.

## Security notes

- There's a single shared password for the whole team — anyone with it
  can edit all content and publish it live. Treat it like a shared door
  key: change it (in Vercel's Environment Variables) if someone who
  shouldn't have it gets it.
- The `GITHUB_TOKEN` is powerful — it can write to the site's repo. It's
  stored only as a Vercel environment variable (never in code, never in
  git) and is only usable by this app's server-side API routes, never
  sent to the browser.
- The login session is stored in an HTTP-only cookie signed with
  `SESSION_SECRET` and lasts 7 days.
- This app is meant to be used by your own team. If you ever want to
  restrict who can even reach the login page (not just who knows the
  password), put it behind Vercel's own access controls or an SSO layer
  in front of it.

## Running it locally (for development only)

You generally shouldn't need this day-to-day — the whole point of this
setup is that nobody needs to run anything locally. But if you're making
code changes to the admin console itself:

```bash
npm install
cp .env.example .env.local
# fill in ADMIN_PASSWORD, SESSION_SECRET, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO
npm run dev
```

It'll talk to the real GitHub repo named in `GITHUB_OWNER`/`GITHUB_REPO`
exactly like the deployed version does — there's no separate "local mode"
or mock data, so be mindful that saves while developing still commit real
changes to `cms-draft`.
