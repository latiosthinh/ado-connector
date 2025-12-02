# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release
- Azure DevOps connector for Next.js
- Pipeline listing and details
- Build artifacts retrieval
- Type-safe API with full TypeScript support

## [1.0.0] - 2025-12-02

### Added
- Initial release of ado-connector
- Support for Azure DevOps pipelines API
- Support for Azure DevOps builds and artifacts API
- Next.js Route Handler integration
- TypeScript type definitions
- Comprehensive documentation

---

## How to Update This Changelog

When preparing a new release, move items from "Unreleased" to a new version section:

### Categories
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

### Example Entry
```markdown
## [1.1.0] - 2025-12-15

### Added
- New API endpoint for work items
- Support for custom ADO API endpoints

### Fixed
- Authentication token refresh issue
- Type definitions for pipeline runs
```
