# Pre-Publishing Checklist ✓

Use this checklist before publishing your first version to npm.

## 📋 Setup Checklist

### NPM Account Setup
- [ ] Created account at [npmjs.com](https://www.npmjs.com/signup)
- [ ] Verified email address
- [ ] Generated automation token (Profile → Access Tokens → Generate New Token → Automation)
- [ ] Saved token securely

### GitHub Setup
- [ ] Added `NPM_TOKEN` secret to GitHub repository
  - Go to: Settings → Secrets and variables → Actions → New repository secret
  - Name: `NPM_TOKEN`
  - Value: Your npm automation token
- [ ] Verified GitHub Actions are enabled for the repository

### Package Configuration
- [ ] Updated `package.json`:
  - [ ] Replaced `YOUR_USERNAME` with actual GitHub username in repository URLs
  - [ ] Added your name/email to `author` field
  - [ ] Verified package version (currently `1.0.0`)
- [ ] Updated `README.md`:
  - [ ] Replaced `YOUR_USERNAME` with actual GitHub username in badge URLs
  - [ ] Reviewed and updated documentation if needed

### Package Name Verification
- [ ] Checked package name availability:
  ```bash
  npm view ado-connector
  ```
  - If package doesn't exist → ✅ Good to go!
  - If package exists → ❌ Choose a different name (e.g., `@yourscope/ado-connector`)

### Build Verification
- [ ] Built package successfully:
  ```bash
  npm run build
  ```
- [ ] Verified package contents:
  ```bash
  npm pack --dry-run
  ```
- [ ] Checked that only these files are included:
  - [ ] `dist/` folder (compiled code)
  - [ ] `README.md`
  - [ ] `LICENSE`
  - [ ] `package.json`

### Testing (Optional but Recommended)
- [ ] Created a test Next.js project
- [ ] Installed the package locally:
  ```bash
  npm pack
  # In test project:
  npm install /path/to/ado-connector-1.0.0.tgz
  ```
- [ ] Verified the package works as expected

## 🚀 Ready to Publish?

Once all items above are checked, you're ready to publish!

### Publishing Steps

1. **Update version** (if needed):
   ```bash
   npm version 1.0.0  # or patch/minor/major
   ```

2. **Commit and push**:
   ```bash
   git add .
   git commit -m "chore: prepare for npm publish"
   git push && git push --tags
   ```

3. **Create GitHub Release**:
   - Go to: https://github.com/YOUR_USERNAME/ado-connector/releases/new
   - Select tag: `v1.0.0`
   - Release title: `v1.0.0 - Initial Release`
   - Description:
     ```markdown
     ## 🎉 Initial Release
     
     First stable release of ado-connector!
     
     ### Features
     - Azure DevOps connector for Next.js
     - Pipeline listing and details
     - Build artifacts retrieval
     - Full TypeScript support
     
     ### Installation
     ```bash
     npm install ado-connector
     ```
     
     See [README](https://github.com/YOUR_USERNAME/ado-connector#readme) for usage instructions.
     ```
   - Click "Publish release"

4. **Monitor the publish**:
   - Go to: Actions tab in GitHub
   - Watch "Publish to NPM" workflow
   - Wait for green checkmark ✅

5. **Verify on npm**:
   - Check: https://www.npmjs.com/package/ado-connector
   - Test install: `npm install ado-connector` in a test project

## 🎯 Post-Publishing

- [ ] Verified package appears on npmjs.com
- [ ] Tested installation in a fresh project
- [ ] Updated `CHANGELOG.md` with release notes
- [ ] Announced release (Twitter, blog, etc.) - optional

## 📝 Notes

- **Version**: Start with `1.0.0` for first stable release
- **License**: MIT (already configured)
- **Scope**: Publishing as public package
- **Provenance**: Enabled for security

## ❓ Need Help?

- See `PUBLISHING.md` for detailed instructions
- See `NPM_SETUP.md` for setup overview
- Use `/publish-npm` workflow for quick reference

---

**Last Updated**: 2025-12-02
