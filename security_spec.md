# Security Specification: Nyaya AI - Legal Companion

## 1. Data Invariants
- A `user` profile MUST only be created/updated by the user themselves (matching `request.auth.uid`).
- A `search` or `bookmark` MUST only belong to the user who created it, and securely nested in their `users/{userId}` subcollection or cross-referenced correctly.
- Searches and bookmarks MUST have valid string text/content, and sizes MUST be constrained to prevent Denial of Wallet attacks.

## 2. The "Dirty Dozen" Payloads
1.  **Identity Spoofing**: User A tries to create a profile under User B's UID.
2.  **Cross-user Write**: User A tries to insert a bookmark into User B's subcollection.
3.  **Cross-user Read**: User A tries to read User B's search history.
4.  **Ghost Field Injection**: User A tries to inject `isAdmin: true` into their user profile.
5.  **Oversized Payload**: User A tries to upload a 2MB string as a search query.
6.  **Type Mismatch**: User A tries to send a number instead of a string for a search query.
7.  **Array Size Exhaustion**: User A tries to send an array of 500 tags for a bookmark.
8.  **Timestamp Forgery**: User A tries to set `createdAt` to a time in the past/future, avoiding server time.
9.  **Missing Required Fields**: User A tries to create a bookmark without a `sectionId`.
10. **Immutable Field Modification**: User A tries to update `createdAt` during an update.
11. **Path Variable Poisoning**: User A sends a 2000-character string as the `bookmarkId`.
12. **Unauthenticated Access**: Anonymous user tries to read public/private laws or user info.

## 3. The Test Runner
See `firestore.rules.test.ts` for implementation.
