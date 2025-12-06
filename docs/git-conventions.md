# Git Conventions

In order to facilitate contributions to the project, please make sure to follow the conventions detailed below.

For most of the conventions, enforcing happens through automations. Any change proposal can be submitted through the usual contribution process and a maintainer will review it.

## Pull Request Process

1. Ensure your code passes all CI checks
2. Update the README.md with details of changes to the interface, if applicable.
3. Your Pull Request will be reviewed by maintainers, who may request changes or provide feedback.

## Git Hooks

The project adopts conventional commit to ensure commits' messages adhere to a common standard and enable automated release notes generation.

### Pre Commit

**code lint**\
the code is linted and automatically fixed whenever possible. The lint pass is a non blocking

### Commit Message

**linting**\
the commit message is checked against the conventional commit configuration. When the check fails, it will either exit with an error code (VSCode) or open an editor in the terminal and let you edit the message

**spell check**\
a spell check is performed against the commit message to ensure the message does not contain any grammar issue. Any potential issue will be highlighted and will make the commit fail. If the issue turns out to be a false positive you can add exceptions in the `.git-dictionary.txt` file

## Commit Footers

### Feature Flag Integration

When working on features controlled by feature flags that are **not yet enabled in production**, use the `Feature-Flag:` footer in your commit message:

```
feat: add component palette UI

Feature-Flag: ADD_COMPONENTS
```

**Automated Processing:**
- A release-please plugin automatically filters commits during release processing
- The plugin reads `.env.production` to determine which flags are enabled
- Commits with `Feature-Flag:` footers for disabled flags are excluded from changelogs and version bumps
- When you enable a flag and create a new release, all previously excluded commits are automatically included

**Benefits:**
- Keep feature-flagged work out of release notes until the feature is production-ready
- Automatic changelog management when features are promoted to production
- Full compatibility with release-please's `OVERRIDE COMMIT MSG` feature

**Example with multiple footers:**
```
feat: implement drag-and-drop for components

This change adds drag-and-drop functionality to the component palette.

Feature-Flag: ADD_COMPONENTS
Refs: #123
```

The `Feature-Flag:` footer can be combined with other conventional commit footers like `Refs:`, `Closes:`, or `BREAKING CHANGE:`.

