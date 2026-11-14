# ReflectAI Stage 2 overlay

This archive contains only new or changed Stage 2 files. Copy its contents into the root of the existing ReflectAI repository and allow folders/files to merge. It does not contain `.git`, `node_modules`, `.next`, fonts, environment files, or Stage 1 configuration.

## Routes
- `/` landing
- `/login`, `/register`
- `/dashboard`
- `/journals`, `/journals/new`, `/journals/[id]`
- `/calendar`, `/settings`, `/research`

Fixtures are isolated in `lib/fixtures/journals.ts`. Authentication, persistence, database access and AI calls are intentionally not implemented.
