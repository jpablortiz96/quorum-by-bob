# Galaxium Travels — Context for the Quorum Council

This document is loaded by Council agents when debating decisions about the Galaxium Travels demo repository. It captures non-obvious architectural patterns discovered during `/init` — information that is not obvious from a surface read of the codebase and that directly affects the quality of council arguments.

## Repository Location

```
demo-repo/galaxium-travels/   (subdirectory of this workspace)
Branch: bob-learning-path-branch
Source: https://github.com/IBM/galaxium-travels
```

Stack: **Python 3 / FastAPI** (backend) + **React / TypeScript / Vite** (frontend)

---

## Repository Structure

```
galaxium-travels/
├── booking_system_backend/     Python/FastAPI backend
│   ├── server.py               Dual REST+MCP entry point
│   ├── services/               Protocol-agnostic business logic
│   │   └── booking.py          Core booking validation
│   ├── db.py                   Database session management
│   ├── models.py               SQLAlchemy models (no migrations)
│   └── tests/
│       └── conftest.py         Test infrastructure (critical setup)
├── booking_system_frontend/    React/TypeScript frontend
│   ├── src/
│   │   ├── api.ts              API client + isErrorResponse() helper
│   │   └── types/index.ts      Snake_case types matching backend
│   └── vite.config.ts
└── start.sh                    Unix-only full-stack launcher
```

---

## Critical Architecture Patterns

### 1. Dual Protocol Server (Most Non-Obvious)

`booking_system_backend/server.py` exposes **both REST and MCP from a single FastAPI server**. This is the defining architectural decision of the entire backend.

- REST endpoints: `/api/*`
- MCP endpoint: `/mcp`
- **The MCP server MUST be instantiated before the FastAPI app** (`server.py:16`) to correctly combine lifespans. Reversing this order silently breaks MCP.
- Both protocols call the **same service functions** — the service layer is protocol-agnostic.

**Council implication:** Any refactor of the service layer touches BOTH REST and MCP consumers simultaneously. The blast radius is always at least 2x what it appears.

### 2. Service Layer Error Returns (Not Exceptions)

Services return `Union[SuccessType, ErrorResponse]` — they do **not** raise exceptions on business errors.

- Callers must do `isinstance(result, ErrorResponse)` before using the result
- MCP tools convert `ErrorResponse` to raised exceptions (`server.py:38-40`) because MCP requires exceptions
- REST endpoints return JSON error responses directly

**Council implication:** The Conservative should note this as a deliberate pattern. The Reformer must show actual instances where callers forgot the isinstance check, not just speculate.

### 3. Database Session Management — Two Patterns

There are **two different session patterns** in the same codebase:

| Context | Pattern | Location |
|---------|---------|---------|
| REST endpoints | Dependency injection via `get_db()` | Standard FastAPI pattern |
| MCP tools | Manual `SessionLocal()` + `finally: session.close()` | `server.py:23-27` |

These patterns exist intentionally due to MCP's different lifecycle from HTTP requests. They are not inconsistency — they are a consequence of the dual-protocol architecture.

### 4. Booking Validation — Double Identity Check

`book_flight()` validates **both** `user_id` AND `name` match (`booking.py:27`). A user_id match alone is insufficient.

- Name mismatch returns error code `"NAME_MISMATCH"`
- The frontend relies on this specific string for error display
- This is not documented in comments — only discoverable by reading the service

**Council implication:** Any change to the booking validation contract requires synchronized frontend + backend changes. Risk Officer must flag this as a coupled interface.

---

## Hidden Dependencies

### Frontend-Backend Type Coupling

- Frontend types in `types/index.ts` use **snake_case** (`flight_id`, `user_id`, `seats_available`) to match backend field names exactly
- There is **no camelCase conversion layer**
- Renaming any backend field name requires a simultaneous frontend type update
- The `isErrorResponse()` helper at `api.ts:109` is the single point of error detection — it checks the `{success: false}` structure, not HTTP status codes

### Test Infrastructure Double-Patch

Tests must patch **both** `db_module.SessionLocal` AND `server.SessionLocal` (`conftest.py:49-50`). Patching only one causes tests to silently hit the production database.

```python
# conftest.py:49-50 — both patches required
with patch('db_module.SessionLocal', return_value=session):
    with patch('server.SessionLocal', return_value=session):
```

In-memory SQLite for tests requires `StaticPool` for thread safety (`conftest.py:21`). Using the default pool causes intermittent test failures.

### API URL Configuration

Frontend uses `import.meta.env.VITE_API_URL` (Vite-specific), **not** `process.env.VITE_API_URL`. This is a common mistake when adding new API calls.

---

## Bug-Prone Areas (from rules-code)

| Area | Risk | Evidence |
|------|------|---------|
| Service layer callers | Forgetting `isinstance(result, ErrorResponse)` check | Pattern required at every call site |
| MCP tool session management | Missing `finally: session.close()` | Manual pattern, not enforced |
| Test setup | Patching only one `SessionLocal` | Two import paths, both must be patched |
| Frontend env vars | Using `process.env` instead of `import.meta.env` | Vite-specific, silent failure |
| Booking validation | Assuming user_id alone is sufficient | Name must also match |

---

## Performance and Scalability Constraints

- **SQLite file-based** (`booking.db`) — not suitable for high concurrency, no connection pooling
- Seat decrement happens in same transaction as booking creation (`booking.py:44`) — atomic but single-writer
- **No code splitting** in Vite config — all components load upfront
- Starfield animation runs continuously in the frontend — potential performance drag
- No caching layer — each request creates a new database session
- No server-side sessions — auth state lives in `localStorage` via `useUser` hook (React Context, no Redux/Zustand)
- Deploying requires coordinating two separate builds (frontend + backend)

---

## Testing Reality

| Scope | State |
|-------|-------|
| Backend (pytest) | Configured, uses in-memory SQLite + StaticPool |
| Frontend | **No test suite** — only build and lint available |

Commands:
```bash
# Backend
cd booking_system_backend && pytest
pytest tests/test_services.py -v

# Frontend — no test runner
cd booking_system_frontend && npm run lint && npm run build
```

---

## How Council Agents Should Use This Document

**🛡️ The Conservative** — When defending the current architecture, cite the dual-protocol design (`server.py:16`) as a proven, working pattern. Cite test coverage via `conftest.py` and the clean service layer separation.

**🔥 The Reformer** — When arguing for change, cite the two-pattern database session management as inconsistency, the lack of frontend tests, the SQLite scalability ceiling, and any unchecked `isinstance` call sites.

**📜 The Historian** — Search `demo-repo/galaxium-travels` git history. Use `git_archaeology` tool with `repo_path` parameter pointing to `demo-repo/galaxium-travels`. Look for commits touching `booking.py` and `server.py`.

**💰 The Economist** — Use `module_economics` with `repo_path: demo-repo/galaxium-travels` and `directory_path` of the target module (e.g., `booking_system_backend/services`).

**⚠️ The Risk Officer** — Use `dependency_blast_radius` with `repo_path: demo-repo/galaxium-travels`. Pay special attention to consumers of `booking.py` — both REST and MCP paths consume it.

**🔧 The Engineer** — Stack is FastAPI (Python) + React/Vite (TypeScript). No shared types between frontend and backend. Any interface change requires coordinated updates to `types/index.ts` and backend services.

**⚖️ The Judge** — The dual-protocol architecture means blast radius estimates are always conservative. Weight The Risk Officer's analysis heavily when the affected module is in `services/`.
