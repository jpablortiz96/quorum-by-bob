# Blast Radius Assessment: Two-Service vs. One-Service Architecture

## Risks Eliminated by Consolidation

1. **Cross-service communication failures eliminated** - `dependency_blast_radius("server.py")` shows criticality 99/100 (minimal blast radius). No Java service means no network calls, serialization errors, or timeout cascades between services.

2. **Deployment coordination complexity removed** - Single Python service eliminates version mismatch risks between Java inventory service and Python booking service that previously required synchronized deployments.

3. **Dual-stack maintenance burden eliminated** - No Java runtime dependencies, Spring Boot configs, or JVM tuning. Operational surface area reduced to Python-only stack.

## Risks Introduced by Consolidation

1. **Increased single-service blast radius** - `dependency_blast_radius("services/booking.py")` shows 10 consumers with criticality 58/100. All booking logic now concentrated in one service; any booking.py bug affects entire application.

2. **Python performance bottleneck** - Inventory hold logic now runs in Python's GIL-constrained runtime instead of Java's multi-threaded JVM, potentially impacting high-concurrency booking scenarios.