# ADR-003: Event-Driven Architecture for AI Feature

**Date:** 2025-05-01
**Status:** Accepted
**Consulted:** Full development team, Project Manager

---

## 1. Context

The system includes an AI feature that monitors developer activity and
automatically generates reports for the Project Manager when tasks have not
been updated within a sprint or hours have not been logged. This feature cannot
rely on a direct user action, it must fire automatically based on conditions
detected in the system.

A request-driven approach would require the manager to manually
trigger the check, which eliminates the value of automation. The team needed a
mechanism that reacts to conditions as they emerge, not on demand. The
constraint is that the system runs on OCI with a Node.js backend and must
integrate with Google Gemini API for the AI processing.

---

## 2. Decision

We will implement the AI monitoring feature using an Event-Driven
Architecture style. The flow is triggered by two types of events:

1. *Scheduled event*: A scheduler runs periodically and emits a trigger when
   the inactivity check interval is reached, initiating the monitoring cycle
   automatically without user interaction.
2. *Command event*: A developer sends a Telegram command (for example /update,
   /status, etc). The bot receives it as an event and routes it to the appropriate
   service.

Event-driven flow for the AI feature (Scheduler trigger):

- Gemini Service queries Task Management Service for stale tasks
- Gemini Service sends context prompt to Google Gemini API
- Gemini API returns analysis and report content
- Gemini Service persists report to Oracle ATP Database
- Telegram Bot delivers report notification to Project Manager


---

## 3. Alternatives Considered
The alternative would have been to expose a manual endpoint that the Project manager triggers from the web portal or the Telegram interface whenever they want to check for inactive developers. 

While this is simpler to implement, this would generate more responsibility of monitoring on the manager rather than a system feature that could improve efficiency. It would also mean that inactivity could go undetected if the manager forgot to trigger the check.

---

## 4. Consequences

**Positive:**
- The scheduler and Gemini Service are decoupled.
- New event types (sprint end, milestone reached in KPIs, etc.) can be added as triggers without modifying existing components, which is of upmost importance since the project will focus on CI/CD.

- The system reacts to real conditions (task inactivity) rather than waiting for explicit user requests. So it becomes an automated feature that could improve our team's efficiency.

**Negative:**
- Automated flows are harder to trace and debug than synchronous interactions; explicit logging and monitoring are required.
- The feature depends on Google Gemini API availability, if the external service is down (or we run out of free tokens), report generation fails unless retry logic is implemented.
