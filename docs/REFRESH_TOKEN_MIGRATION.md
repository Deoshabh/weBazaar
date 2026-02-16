# Refresh Token Migration

## What changed

- New refresh tokens include JWT `jti` and are persisted with `tokenId` in `RefreshToken` records.
- `/auth/refresh` now rotates refresh tokens on every successful refresh:
  - issues a new refresh token,
  - stores new token hash,
  - deletes old token record.
- Password change/reset now revokes all refresh sessions for that user.

## Legacy token strategy

Some existing sessions may have refresh JWTs without `jti`.

- During refresh/logout, if `jti` is missing, backend performs a **bounded legacy lookup**:
  - searches up to 25 latest legacy records for the user,
  - verifies hash match,
  - migrates by issuing a modern `jti` token on refresh,
  - deletes matched legacy token record.

This keeps existing logged-in users working while naturally migrating active sessions.

## Operational notes

- `RefreshToken` now has indexes:
  - unique `{ userId, tokenId }`
  - TTL on `expiresAt`
- Expect old legacy records to disappear as users refresh or log out.
- No manual data migration is required for normal operation.
