# ADR-001: Microservices and Client-Server Architecture
**Date:** 2025-05-01
**Status:** Accepted
**Consulted:** Full development team, Project Manager

---

## 1. Context
The Oracle Project Management system must support two distinct user interfaces,
a web portal and a Telegram bot, both requiring access to the same business
logic and data. The team identified that the Telegram bot and the REST API
backend have different responsibilities, and should be
able to evolve independently without affecting each other (relevant for CI/CD).
 
Current time and delivery constraints mean both components share the same
deployment unit for now, but the architectural boundaries between them are
deliberately designed to support independent deployment in the near future.
The tech stack is Node.js with an Oracle ATP database deployed on OCI.


---
## 2. Decision
We will structure the system using a Microservices Architecture combined
with a Client-Server style as our team's approach for this Oracle project:

- **Telegram Bot Service** (bot.js): An autonomous service responsible solely
  for handling Telegram communication. It receives user commands, translates
  them into HTTP requests to the backend, and returns formatted responses. It
  has no direct access to the database and no business logic (here we simply declare the commands we want the users to have when
  interacting with the bot).

- **REST API Backend Service** (server.js): The central server that exposes
  all business operations via HTTP/REST endpoints. It handles authentication,
  task management, KPI calculation, team activity tracking, and AI integration.
  It is the only service with access to the database.

- **Gemini Service** (geminiService.js): A dedicated service responsible for
  all communication with the Google Gemini API. It operates independently from
  the bot and is consumed by the backend.

The Client-Server style is applied at two levels: the Web Portal and Telegram
Bot act as clients of the REST API Backend, and the REST API Backend acts as a
client of the Google Gemini API for AI processing.
 
Lastly, taking into account that they should be loosely coupled, services communicate exclusively via HTTP/REST.

---

## 3. Alternatives Considered
The alternative would have been to build a single monolithic application where everything (Telegram bot logic, REST endpoints, AI integration, etc.) lived in one unified process. However we know that one of the primary focuses of the course and the project is to learn the importance of independent deployment, that's why we did not implement this alternative.

Also, a failure in one part of the system could bring down the entire application, and since the approach of the Oracle challenge is for team members to work on different parts of the system in parallel it would represent another downside of this alternative.

---

## 4. Consequences

**Positive:**
- The bot and backend can be deployed, scaled, and updated independently without affecting each other.
- A failure in the Telegram bot doesn't impact the REST API Backend or the web portal.
- New services can be added without modifying existing ones
- We can replace the Gemini service with a different AI by changing only the AI focused service.

**Negative:**
- Is harder to debug and trace than a singular monolithic application. 
- Communication over HTTP adds latency (however since our application is relatively small and does not have a great amount of users this latency is minimal)