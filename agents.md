# General Rules

- MUST: Follow strict TDD for all code changes
- MUST: For new user-facing features, use ATDD
- MUST: Stop for human review after writing or changing tests before implementing behavior.
- MUST: Document significant architectural decisions with an ADR.
- MUST: Use feature flags to hide user facing functionalities and enable trunk based development
- MUST: Follow linting and style rules
- MUST: Preserve unidirectional data flow (parent owns state, children receive data and callbacks).
- MUST: Follow Conventional Commits.
- MUST: Maintain documentation and skills updated

# Skills

You can find relevant skills in the `./skills` directory

## Testing

Run checks before committing

- `npm test` - Unit tests in watch mode (use during TDD)
- `npm run lint:fix` - Auto-fix linting issues
