# ADR-002: Use a Centralized REST API Backend for the web page and Telegram Chatbot

**Date:** 2025-05-01
**Status:** Accepted
**Consulted:** Full development team, Project Manager

---

## 1. Context
The system must provide a project management platform that improves productivity visibility for the
development team by at least 20%. The solution must support two UI, a web portal and a Telegram chatbot.
Both interfaces should access the same project data such as tasks, KPIs that measure the productivity of the
team and the team activity.

The system will be hosted in Oracle Cloud Infrastructure (OCI), enabling developers and managers to access
project and task information from different locations and devices

---

## 2. Decision

The system will have a centralized backend service exposing RESTful APIs that will handle task management,
KPI calculations, and data storage operations. Both the web page and the chatbot will communicate with
this backend through the APIs

---

## 3. Alternatives Considered
The other alternative could be having direct database access through the web portal and chatbot, but this
could result in an increase in security risk.

---

## 4. Consequences

**Positive:**
- Simplifies the debugging since everyone in the team has basic knowledge working with HTTP
methods such as GET, POST, etc.
- Provides clear error handling via HTTP status codes, which allows the developer team to know
exactly when a hypothetical failure occurs.
- Improves system reliability.

**Negative:**
- Adding HTTP headers adds a small overhead which causes a synchronous delay, while it’s negligible
for the size of the team it’s still a minor trade off in performance to ensure reliability and
maintainability.