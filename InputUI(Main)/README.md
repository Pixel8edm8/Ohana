# Ohana Family Input UI

A frontend-only React + TypeScript starter for adding people to an Ohana family tree and connecting their relationships.

## Run it in VS Code

1. Install Node.js (LTS) if it is not already installed.
2. Open this folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Included

- Add people with names, preferred names, pronouns, birth dates, living status, passing dates, and notes.
- Connect a new person to existing members as a parent, child, sibling, partner, grandparent, cousin, aunt/uncle, niece/nephew, guardian, ward/dependent, or another relationship.
- Choose relationship context: biological, adoptive, step, foster, legal guardian, chosen family, in-law, or other.
- Reciprocal relationship links are generated automatically. For example, if a new person is added as someone's sibling, the existing person's record also shows them as a sibling.
- Search/filter the member directory and remove entries.
- Data persists in this browser's localStorage.

## Important prototype note

This is not connected to a database or authentication yet. Browser storage is local to the current browser profile and device. It is useful for prototyping only; do not enter sensitive personal details. A production version should use a secure backend, user authentication, database permissions, and a clear family-tree sharing model.
