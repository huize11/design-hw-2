# Design Feedback

Design feedback that lives on the design. Managers pin comments on a Figma file or screenshot, attach links and moodboards, and the app turns vague notes into clear requests, prioritized tasks and progress updates, so the conversation stays in one place instead of scattering across Slack and email.

This is an MVP: a static React app that runs entirely in the browser and deploys free to GitHub Pages.

## What works

Built from the Lava HW 2 Figma file: the style guide (Figtree headings, Inter body, the red and amber priority palette, warm #F5F2EC background) and the hi-fi screens.

- **Home.** Drop screens anywhere on the page, or paste a Figma link and press Attach. Either one creates a project and opens it.
- **Projects.** Cards with a preview, priority tag, last update and comment count. Filter by All, Pending or Resolved. Click a card or "View feedback" to open the canvas.
- **Canvas and updates overlay.** Every part of the project (Sign in flow, Home Page, Email Templates…) is a card. Hover a card and the matching screen on the canvas lights up with a red outline and corner handles. Cards lift and lean on hover, show a grip, and can be dragged to rearrange by priority (Alt + arrow keys work too). The order is saved, with Undo.
- **Feedback overlay.** One click on a card or a screen opens it: AI overview of requested changes, the manager's comments, a moodboard that expands full screen, link previews, and a reply bar that sends on Enter. Click the priority tag to change it.
- **Tasks overlay.** Tasks grouped by High, Medium and Low priority. Checking a task asks you to confirm with "Mark as resolved", with Undo. Type a task like `tighten footer by Fri !high` to add one.
- **Post progress update.** Drafts a summary from the resolved tasks, posts it to the team inside the app, and can also copy it for Slack, open an email or download it. Type in "Ask AI to edit" to reshape the draft ("shorter", "friendlier", "tag Manager").
- **Minimize.** The updates overlay and the feedback/tasks overlay each have their own minimized bar, and reopening returns you to where you left off.
- **Share and Add new.** Share Project popup with invite, access levels and copy link. Add new creates a project from a name, screens or a Figma link.
- **Feedback on every action.** A toast confirms each change, with Undo where it matters.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints. The app starts with two demo projects; reset them anytime from the avatar menu.

## Deploy to GitHub Pages

1. Create a repository on GitHub and push this folder to its `main` branch.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`. Your site appears at `https://<user>.github.io/<repo>/` after the first run finishes (see the **Actions** tab).

No configuration is needed. The build uses relative paths and hash routing, so it works under any repository name.

## Use Claude for the AI features (optional)

The app works offline out of the box using built-in rules for summaries, interpretations and drafts. To use Claude instead, run the small proxy in `/proxy`, which keeps your API key off the browser:

```bash
ANTHROPIC_API_KEY=sk-ant-... node proxy/server.mjs
# in another terminal
VITE_AI_ENDPOINT=http://localhost:8787/ai npm run dev
```

To use it on your deployed site, host `proxy/server.mjs` on any Node 18+ service (Render, Railway, Fly.io), set `ALLOW_ORIGIN` to your Pages URL, then add a repository variable named `VITE_AI_ENDPOINT` (**Settings → Secrets and variables → Actions → Variables**) pointing at it. The default model is set by `AI_MODEL` in the proxy; see the [Claude API docs](https://docs.claude.com/en/api/overview) for current model names. If the proxy is unreachable, the app falls back to the built-in rules.

## Good to know

- **Data stays in each browser.** Everything is saved to IndexedDB on the device that created it. A shared link opens the app for others but not your projects, and clearing site data erases them. Real multi-user sharing needs a backend (see below).
- **Figma embeds** need the file shared as “Anyone with the link can view”. Pins sit over the embed's frame, so they don't follow Figma's own zoom and pan; use them on a stable view, or upload a screenshot when exact placement matters.
- **Slack and email** don't send on their own: Slack copies a ready-to-paste message and email opens a prefilled draft. Posting in the app is the primary path.

## Project structure

```
src/
  lib/          types, store (IndexedDB), AI rules + Claude hookup, exporters, seed data
  components/   Canvas (pins), FeedbackPanel, Thread, TasksTab, Composer, ShareModal, Rail
  pages/        Home, Projects (+ Latest), ProjectView
  styles.css    the Quiet design system: tokens, 4pt spacing, Inter
proxy/          optional Node proxy for Claude
```

## Next steps

- A backend (Supabase or Firebase) for accounts, real invites, shared projects and notifications
- Slack app and email delivery instead of copy and mailto
- The Figma REST API for frame-accurate pins and version history
- Design system change requests: browse tokens, propose a change, preview its impact
