# AGENTS

This file describes guidelines for Codex agents and contributors working on this
Angular project.

## Setup
1. Install Node.js (>=20) and the Angular CLI (>=16).
2. Run `npm install` to install dependencies.
3. Start the development server with `ng serve`.

## Backend information
The backend service for this application is maintained in a separate repository:
<https://github.com/luyenhaidangit/flex-microservice>.

Clone that repository to inspect API endpoints or run the backend locally:
```bash
git clone https://github.com/luyenhaidangit/flex-microservice
```
Follow its README for build and run instructions. The frontend expects the
backend URL via the `apiBaseUrl` value in `src/environments/environment.ts`.
Update this value to match your backend instance.
