# 🔄 CAISH - GitHub Sync Commands Cheat Sheet

## Current Git Status
- **Repository**: `https://github.com/BenHaws/CaiSH.git`
- **Latest Commit**: `c26f04e292806667e2342161909e509e418e4246`

---

## 📋 Standard Git Workflow

### 1. Check Current Status
```bash
git status
```

### 2. Stage All Changes
```bash
git add .
```

### 3. Commit Changes
```bash
git commit -m "Your descriptive commit message here"
```

**Pro Tip**: Use conventional commits for cleaner history:
```bash
git commit -m "feat: added new treasury calculation feature"
# or
git commit -m "fix: resolved SQLite connection timeout issue"
# or
git commit -m "docs: updated README with setup instructions"
```

### 4. Push to GitHub (main branch)
```bash
git push origin main
```

**For other branches**:
```bash
git push origin <branch-name>
```

---

## 🔍 Detailed Git Commands Reference

### Checking Repository State

| Command | Description |
|---------|-------------|
| `git status` | Show modified/untracked files |
| `git diff` | Show changed files (not staged) |
| `git diff --staged` | Show staged changes |
| `git log` | View commit history |
| `git log --oneline` | Compact commit view |

### Interactive Staging (`git add -p`)
```bash
git add -p          # Stage changes interactively
git add src/file.ts # Stage specific file
git add server/     # Stage entire directory
```

---

## 🛠️ Common Scenarios

### Revert a Commit (if you made a mistake)
```bash
# View recent commits to find the one to revert
git log --oneline -10

# Undo the most recent commit (keeps changes unstaged)
git reset --soft HEAD~1

# Discard all local changes and reset to last commit
git reset --hard HEAD
```

### View Changes Before Last Commit
```bash
git show HEAD
# or for specific file
git show HEAD:src/App.tsx
```

---

## 📦 Deployment Considerations

### Files That Should NOT Be Pushed (Already in .gitignore)
- `node_modules/` - NPM dependencies
- `dist/` - Vite build output
- `dist-server/` - Server build
- `.env*` - Environment variables

### Files That ARE Tracked and Will Be Synced
- All source code in `src/`, `server/`, `lib/`
- Configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`)
- Database schema files (if tracked)

---

## 🚀 Full Sync Workflow (Copy & Paste Sequence)

```bash
# Step 1: Check what changed
git status

# Step 2: Review changes before committing
git diff

# Step 3: Stage all changes
git add .

# Step 4: Commit with message
git commit -m "describe your changes here"

# Step 5: Push to GitHub
git push origin main
```

### Quick Re-push (Overwrite remote if needed)
```bash
git push -f origin main
```
⚠️ **Warning**: `-f` force pushes! Only use if you're sure no one else is working on this branch.

---

## 🌐 Pull from GitHub (if syncing back from remote)

```bash
# Fetch latest changes without pulling
git fetch origin

# Merge latest main branch into current branch
git pull origin main

# Or rebase instead of merge
git pull --rebase origin main
```

---

## 📝 Branch Management

### Create and Switch to New Branch
```bash
git checkout -b feature-name
# or in newer Git:
git switch -c feature-name
```

### Delete a Local Branch (after merging)
```bash
git branch -d feature-name
```

---

## 🎯 Pre-Push Checklist

- [ ] Run `npm run lint` to check TypeScript errors
- [ ] Test locally: `npm run dev`
- [ ] Ensure `.env` files are NOT committed (use `.env.example`)
- [ ] Large files not accidentally committed (>100KB)
- [ ] Documentation updated if features changed

---

## 🐛 Troubleshooting

### "Your local changes to the working tree are dirty"
```bash
git stash              # Temporarily save uncommitted changes
# or
git add .              # Stage them instead of stashing
```

### "Already up to date" when pushing
```bash
git push -f origin main  # Force push if you want to overwrite
```

### Need to rebase before pushing
```bash
git fetch origin
git rebase origin/main
git push origin main --force-with-lease
```

---

## 📧 Create Pull Request (via GitHub UI)

After running `git push`, go to:
```
https://github.com/BenHaws/CaiSH/compare
```

Click **New comparison** to create a PR.

---

## 🔐 Remote Repository URL

```bash
# View configured remotes
git remote -v

# Change remote if needed
git remote set-url origin https://github.com/BenHaws/CaiSH.git

# Add new remote (if forking)
git remote add upstream https://github.com/original-owner/CaiSH.git
```

---

## ✅ Final Verification Command

```bash
git status && echo "✓ Repository is ready for push"
```

---

*Generated automatically - Last updated: $(date +%Y-%m-%d)*