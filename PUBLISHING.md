# Publishing to NPM

This document explains how to publish the `ado-connector` package to npmjs.

## Prerequisites

1. **NPM Account**: You need an npmjs account. Create one at [npmjs.com](https://www.npmjs.com/signup)

2. **NPM Access Token**: 
   - Log in to [npmjs.com](https://www.npmjs.com)
   - Go to your profile → Access Tokens
   - Click "Generate New Token" → "Automation"
   - Copy the token (you won't see it again!)

3. **GitHub Secret**:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

## Publishing Methods

### Method 1: Automatic Publishing via GitHub Releases (Recommended)

This is the easiest and most automated approach:

1. **Update the version** in `package.json`:
   ```bash
   npm version patch  # for bug fixes (1.0.0 → 1.0.1)
   npm version minor  # for new features (1.0.0 → 1.1.0)
   npm version major  # for breaking changes (1.0.0 → 2.0.0)
   ```

2. **Push the version tag**:
   ```bash
   git push && git push --tags
   ```

3. **Create a GitHub Release**:
   - Go to your repository on GitHub
   - Click "Releases" → "Create a new release"
   - Select the tag you just pushed (e.g., `v1.0.1`)
   - Add release notes
   - Click "Publish release"

4. **Automatic Publishing**: The GitHub Action will automatically:
   - Build the package
   - Run tests (if any)
   - Publish to npm with provenance

### Method 2: Manual Trigger via GitHub Actions

You can manually trigger the publish workflow:

1. Go to your repository on GitHub
2. Click "Actions" → "Publish to NPM"
3. Click "Run workflow"
4. Optionally specify a version (or leave empty to use package.json version)
5. Click "Run workflow"

### Method 3: Manual Publishing from Local Machine

For emergency situations or initial setup:

1. **Login to npm**:
   ```bash
   npm login
   ```

2. **Build the package**:
   ```bash
   npm run build
   ```

3. **Test the package locally** (optional but recommended):
   ```bash
   npm pack
   # This creates a .tgz file you can inspect
   ```

4. **Publish**:
   ```bash
   npm publish --access public
   ```

## Before Your First Publish

1. **Update package.json**:
   - Replace `YOUR_USERNAME` in the repository URLs with your actual GitHub username
   - Add your name/email to the `author` field
   - Verify the version number

2. **Check package name availability**:
   ```bash
   npm view ado-connector
   ```
   If the package doesn't exist, you're good to go! If it does, you'll need to choose a different name.

3. **Test the build**:
   ```bash
   npm run build
   ```
   Make sure the `dist` folder is created with all necessary files.

## Version Management

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version (X.0.0): Breaking changes
- **MINOR** version (0.X.0): New features, backwards compatible
- **PATCH** version (0.0.X): Bug fixes, backwards compatible

Use npm's built-in version commands:
```bash
npm version patch -m "Fix: description of fix"
npm version minor -m "Feat: description of feature"
npm version major -m "Breaking: description of breaking change"
```

## Troubleshooting

### "You do not have permission to publish"
- Make sure you're logged in: `npm whoami`
- Verify the package name is available or you own it
- Check that `NPM_TOKEN` secret is set correctly in GitHub

### "Package name too similar to existing packages"
- Choose a more unique name (e.g., `@yourscope/ado-connector`)

### "Build failed"
- Run `npm run build` locally to debug
- Check that all dependencies are installed

## Package Contents

The published package includes:
- `dist/` - Compiled JavaScript and TypeScript definitions
- `README.md` - Documentation
- `LICENSE` - MIT License
- `package.json` - Package metadata

Files excluded (see `.npmignore`):
- Source TypeScript files (`src/`)
- Configuration files
- Development files
- Tests

## Monitoring

After publishing:
- Check your package page: `https://www.npmjs.com/package/ado-connector`
- Verify the files included: Click "Explore" on the npm package page
- Test installation: `npm install ado-connector` in a test project

## Best Practices

1. **Always test locally** before publishing
2. **Use GitHub Releases** for automatic publishing
3. **Write clear release notes** describing changes
4. **Follow semantic versioning** strictly
5. **Keep README.md updated** with latest features
6. **Tag releases** in git for version tracking
