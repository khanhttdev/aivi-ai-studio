# Contributing to AIVI AI Studio

Thank you for contributing! Please follow these guidelines to ensure code quality and consistency.

## Pull Request Checklist

Before submitting a PR, please ensure:

1.  **Tests Pass:** Run `npm test` and ensure all tests pass.
2.  **Linting:** Run `npm run lint` and resolving any errors.
3.  **Type Check:** Run `npx tsc --noEmit` and ensure no TypeScript errors.

## API Documentation Maintenance

When adding or modifying API endpoints:

1.  **Rate Limits:** If the endpoint has rate limiting, you MUST update `docs/API_RATE_LIMITS.md`.
    - Add the new endpoint to the Rate Limits table.
    - Specify the Method, Limit, and Window.
2.  **Validation:** Ensure Zod schemas are defined in `src/lib/validations/schemas.ts`.
3.  **Tests:** Add unit tests for the new route in `src/app/api/[route]/route.test.ts`.

## Code Style

- Use `camelCase` for variables and functions.
- Use `PascalCase` for React components.
- Avoid `any` types. Use explicit interfaces/types.
