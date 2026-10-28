# Deployment Guide

To publish a new version of **`@adrelle/design-system`**, simply bump the version and push the git tag. GitHub Actions will handle the build and npm publishing automatically.

---

### Step 1: Bump Version

Run one of the following to update `package.json` and create a git commit with a version tag:

```bash
# Bug fixes / small tweaks (e.g., 2.0.0 -> 2.0.1)
npm version patch

# New components / features (e.g., 2.0.0 -> 2.1.0)
npm version minor

# Breaking changes (e.g., 2.0.0 -> 3.0.0)
npm version major
```

---

### Step 2: Push Commit & Tags

Push the commit and tag to GitHub to trigger the release workflow:

```bash
git push origin main --tags
```

---

### That's it! 🚀

The [GitHub Action workflow](.github/workflows/publish.yml) will automatically:
1. Detect the pushed `v*.*.*` tag
2. Install dependencies and build the package
3. Publish to npmjs (`npm publish --access public`)

#### Verify Release (Optional)
```bash
npm view @adrelle/design-system version
```
