---
description: How to publish the package to npmjs
---

# Publishing to NPM

## Quick Start (First Time Setup)

1. **Create NPM Account** at [npmjs.com](https://www.npmjs.com/signup)

2. **Generate NPM Token**:
   - Login to npmjs.com
   - Profile → Access Tokens → Generate New Token → Automation
   - Copy the token

3. **Add GitHub Secret**:
   - GitHub repo → Settings → Secrets and variables → Actions
   - New repository secret: `NPM_TOKEN` = your token

4. **Update package.json**:
   - Replace `YOUR_USERNAME` with your GitHub username
   - Add your name to `author` field

## Publishing a New Version

### Recommended: Via GitHub Release

// turbo-all

1. **Update version**:
```bash
npm version patch  # 1.0.0 → 1.0.1 (bug fixes)
npm version minor  # 1.0.0 → 1.1.0 (new features)
npm version major  # 1.0.0 → 2.0.0 (breaking changes)
```

2. **Push with tags**:
```bash
git push && git push --tags
```

3. **Create GitHub Release**:
   - Go to GitHub → Releases → Create new release
   - Select the version tag
   - Add release notes
   - Publish release
   - Package automatically publishes to npm!

### Alternative: Manual Trigger

1. Go to GitHub → Actions → "Publish to NPM"
2. Click "Run workflow"
3. Optionally specify version
4. Click "Run workflow"

### Emergency: Local Publishing

1. Login: `npm login`
2. Build: `npm run build`
3. Publish: `npm publish --access public`

## Verification

After publishing, check:
- NPM page: https://www.npmjs.com/package/ado-connector
- Test install: `npm install ado-connector` in a test project

## Version Guidelines

- **PATCH** (0.0.X): Bug fixes only
- **MINOR** (0.X.0): New features, backwards compatible
- **MAJOR** (X.0.0): Breaking changes

See [PUBLISHING.md](../PUBLISHING.md) for detailed documentation.
