# Guía para el backend (Oracle Smart)

Documento **unificado** para quien construye el **API en Spring Boot** sobre **Oracle Autonomous Database (ATP)** en **OCI**: qué debe existir en **BD**, cómo **conectar**, y qué **endpoints / JSON** necesita el **frontend** (Vite/React) para sustituir los mocks.

**Stack asumido:** Spring Boot + Oracle ATP + frontend React.

---

## Tabla de contenidos

1. [Resumen y prioridades](#1-resumen-y-prioridades)
2. [Oracle Cloud y Autonomous Database](#2-oracle-cloud-y-autonomous-database)
3. [Spring Boot → conexión a ATP](#3-spring-boot--conexión-a-atp)
4. [Usuarios y esquema](#4-usuarios-y-esquema)
5. [Modelo físico, migraciones y checklist BD](#5-modelo-físico-migraciones-y-checklist-bd)
6. [Detalles prácticos ATP](#6-detalles-prácticos-atp)
7. [Mapa BD ↔ pantallas del front](#7-mapa-bd--pantallas-del-front)
8. [Brechas de esquema vs UI actual](#8-brechas-de-esquema-vs-ui-actual)
9. [Mapeo de enums (contrato API)](#9-mapeo-de-enums-contrato-api)
10. [API REST](#10-api-rest)
11. [CORS y entorno](#11-cors-y-entorno)
12. [Checklist entrega backend](#12-checklist-entrega-backend)
13. [Qué hará el frontend después](#13-qué-hará-el-frontend-después)

---

## 1. Resumen y prioridades

- El frontend hoy asume **tareas con `sprintId`**, **usuarios con rol legible**, estados en **español** en el contrato deseado, y tipos de tarea que pueden no coincidir con el `CHECK` inicial de Oracle.
- En BD la jerarquía es **`project` → `sprint` → `feature` → `issues`**. El API puede **aplanar** (incluir `sprintId` en cada issue vía join con `feature`) para no forzar al front a conocer features en el MVP.
- **Orden sugerido de implementación:**  
  **(A)** ATP + migraciones + conexión Spring + `issues` + `sprint` + usuarios/miembros + auth mínima + endpoints lectura/escritura básicos.  
  **(B)** `timelog` + agregados de dashboard (`summary`, `compare`).  
  **(C)** `kpi_snapshot` + `issue_log` expuesto como actividad + reglas de riesgo/sobrecarga en servidor.

---

## 2. Oracle Cloud y Autonomous Database

| Ítem              | Descripción                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Servicio**      | **Autonomous Transaction Processing (ATP)** para carga OLTP del gestor de tareas.                                                                |
| **Compartment**   | Donde viva la instancia (separar `dev` / `prod` si aplica).                                                                                      |
| **Wallet**        | Descargar desde la consola de la ADB (`tnsnames.ora`, `sqlnet.ora`, `cwallet.sso` o equivalente PEM). **No** versionar el wallet en git público. |
| **Conexión**      | Anotar servicios TNS (`..._high`, `..._medium`, `..._low`). Para servidor de aplicaciones suele usarse `_medium` o `_low`.                       |
| **Usuario ADMIN** | Solo administración y DDL inicial; la aplicación en runtime debe usar **usuario de app** (ver §4).                                               |
| **Red**           | Opcional: **private endpoint** + VPN/bastión; si hay acceso público, restringir por IP.                                                          |

---

## 3. Spring Boot → conexión a ATP

### 3.1 Dependencias (Maven, ejemplo)

- `com.oracle.database.jdbc:ojdbc11` (alineado con JDK LTS).
- Opcional: `com.oracle.database.jdbc:ucp` si usan pool Oracle además de Hikari.

### 3.2 Wallet

- **Local:** carpeta fuera del repo (ej. `~/.oci/wallets/adb-demo/`).
- **OCI Compute / OKE:** wallet en **secret** o volumen con permisos restrictivos.

### 3.3 Propiedades (`application.yml` / variables de entorno)

Ejemplo ilustrativo:

```yaml
spring:
    datasource:
        url: jdbc:oracle:thin:@demo_tp?TNS_ADMIN=/ruta/absoluta/al/wallet
        username: ${ADB_APP_USER}
        password: ${ADB_APP_PASSWORD}
        driver-class-name: oracle.jdbc.OracleDriver
```

También es habitual usar `jdbc:oracle:thin:@NOMBRE_EN_TNSNAMES` y definir `TNS_ADMIN` (o `oracle.net.tns_admin`) apuntando al directorio del wallet descomprimido.

**Requisitos:**

- [ ] `TNS_ADMIN` o equivalente → directorio del wallet.
- [ ] Credenciales del **usuario de aplicación**, no `ADMIN`.
- [ ] JDK compatible con `ojdbc11` (Java 11+).

Seguir la guía oficial _Connecting to Autonomous Database_ para la variante exacta de URL según versión del driver.

---

## 4. Usuarios y esquema

| Rol                                        | Uso                                                       |
| ------------------------------------------ | --------------------------------------------------------- |
| **ADMIN** (creado con la ADB)              | Crear esquema/usuario app, grants iniciales.              |
| **Usuario de aplicación** (ej. `APP_USER`) | Propietario de tablas o usuario con grants sobre objetos. |
| **Solo lectura** (opcional)                | Reporting / snapshots.                                    |

**Recomendación MVP:** un esquema/usuario dedicado para la app, distinto de `ADMIN`, con privilegios mínimos.

---

## 5. Modelo físico, migraciones y checklist BD

### 5.1 Tablas previstas (script del proyecto)

- `role`
- `users` → **recomendado renombrar a `app_users`** (evitar palabra reservada / confusión con diccionario Oracle)
- `admin_user`
- `project`, `sprint`, `feature`, `issues`
- `timelog`, `kpi_snapshot`, `project_member`, `issue_log`

**Auxiliares:** secuencias (ej. `issue_log_seq`), triggers (`trg_issues_*`) según diseño.

### 5.2 Ajustes recomendados al modelo (v1)

| Cambio                          | Motivo                                  |
| ------------------------------- | --------------------------------------- |
| `app_users` en lugar de `users` | Claridad y menos fricción en SQL/tools. |
| `issues.assigned_to` **NULL**   | Tareas sin asignar (Task Manager).      |
| `issues.due_date` (DATE)        | Panel “En riesgo” / atrasadas.          |
| `issues.priority`               | Valores acordados con §9.               |
| Ampliar `issues.status`         | Ej. `in_review` para “revisión”.        |
| Ampliar `issues.type`           | Ej. `ISSUE` si se distingue de `TASK`.  |

### 5.3 Migraciones

- **Flyway** o **Liquibase** con scripts versionados.
- **Orden sugerido:** `role` → `app_users` → `project` → `sprint` → `feature` → `issues` → `timelog` / `kpi_snapshot` / `project_member` / `issue_log` → secuencias → triggers → datos semilla.
- Triggers que escriben en `issue_log` deben tolerar **`assigned_to` NULL** (usar `changed_by` coherente o usuario sistema).

### 5.4 Checklist “BD lista para Spring”

- [ ] Instancia **ATP** en estado **AVAILABLE**.
- [ ] **Wallet** descargado; ruta documentada para el equipo (sin commitear).
- [ ] Usuario de app + contraseña en **secret store**.
- [ ] Migraciones aplicadas en `dev`.
- [ ] Prueba con SQL Developer / `sqlplus` con el **mismo TNS** que Spring.
- [ ] Spring levanta **DataSource** y query de prueba (`SELECT 1 FROM DUAL` o similar).
- [ ] INSERT/UPDATE de prueba en `issues` valida triggers y `issue_log`.

---

## 6. Detalles prácticos ATP

- Conexión cliente–ADB con **TLS**; el wallet aporta confianza.
- Valorar **índices** según el API: `issues(feature_id)`, `issues(assigned_to)`, `sprint(project_id)`, `timelog(issue_id)`, etc.
- Backups y retención los gestiona el servicio; definir **clon** para `test` si hace falta.

---

## 7. Mapa BD ↔ pantallas del front

| Entidad Oracle                 | Uso en el front                               | Notas para el API                                    |
| ------------------------------ | --------------------------------------------- | ---------------------------------------------------- |
| `project`                      | Contexto / selector                           | `GET /projects`, `GET /projects/:id`                 |
| `sprint`                       | Dashboard, comparativo, filtros, Task Manager | Lista por `projectId`                                |
| `feature`                      | MVP puede ocultarse en UI                     | Default `featureId` por sprint o CRUD mínimo         |
| `issues`                       | Tareas, KPIs, riesgo, rendimiento             | Incluir `sprintId` resuelto en DTO                   |
| `app_users` + `project_member` | Asignación, equipo, actividad                 | Rol visible desde `role` o `role_in_project`         |
| `role`                         | Texto de rol                                  |                                                      |
| `timelog`                      | Horas auditables                              | Coexistir con `issues.actual_hours` si ambos existen |
| `issue_log`                    | Historial de actividad                        | `GET` paginado                                       |
| `kpi_snapshot`                 | Dashboard / histórico                         | Opcional si primero se calcula en queries            |
| `admin_user`                   | Panel admin                                   | Fuera del MVP del front actual                       |

---

## 8. Brechas de esquema vs UI actual

| Necesidad del front       | Si falta en SQL inicial  | Acción                                                |
| ------------------------- | ------------------------ | ----------------------------------------------------- |
| `dueDate`                 | Añadir `due_date`        | Migración                                             |
| Estado “revisión”         | Ampliar `CHECK` o mapear | Acordar en §9                                         |
| `priority`                | Columna + dominio        | Migración                                             |
| Tipo “issue” (incidencia) | Ampliar `type`           | Migración o mapeo en API                              |
| Sin asignar               | `assigned_to` NULL       | Nullable + filtro API                                 |
| IDs en JSON               | `NUMBER` en Oracle       | API devuelve string o number de forma **consistente** |

---

## 9. Mapeo de enums (contrato API)

### Estado tarea (UI deseada ↔ Oracle sugerido)

| Front (`TaskStatus`) | Oracle `issues.status`                 |
| -------------------- | -------------------------------------- |
| `pendiente`          | `open`                                 |
| `en_progreso`        | `in_progress`                          |
| `revisión`           | `in_review` _(o equivalente acordado)_ |
| `completada`         | `closed`                               |

### Tipo tarea

| Front (`TaskType`) | Oracle `issues.type`            |
| ------------------ | ------------------------------- |
| `feature`          | `TASK` o tipo dedicado          |
| `bug`              | `BUG`                           |
| `issue`            | `ISSUE` si se amplía el `CHECK` |
| `capacitación`     | `TRAINING`                      |

### Sprint

| Front       | `sprint.status` |
| ----------- | --------------- |
| `active`    | `active`        |
| `planned`   | `planned`       |
| `completed` | `completed`     |

---

## 10. API REST

Base sugerida: `https://api…/v1`. Respuestas **JSON**. Errores: `{ "code", "message", "details" }` + HTTP 4xx/5xx.

### 10.1 Autenticación

| Método | Ruta           | Descripción                                                          |
| ------ | -------------- | -------------------------------------------------------------------- |
| `POST` | `/auth/login`  | `{ "email", "password" }` → `{ "accessToken", "expiresIn", "user" }` |
| `GET`  | `/auth/me`     | Usuario actual (+ `projectId` activo si aplica)                      |
| `POST` | `/auth/logout` | Opcional                                                             |

Front: `Authorization: Bearer <token>`.

### 10.2 Proyecto y miembros

| Método | Ruta                           |
| ------ | ------------------------------ |
| `GET`  | `/projects`                    |
| `GET`  | `/projects/:projectId`         |
| `GET`  | `/projects/:projectId/members` |

### 10.3 Sprints

| Método | Ruta                                     |
| ------ | ---------------------------------------- |
| `GET`  | `/projects/:projectId/sprints`           |
| `GET`  | `/projects/:projectId/sprints/:sprintId` |

Fechas en ISO `YYYY-MM-DD` donde aplique.

### 10.4 Issues (tareas)

| Método   | Ruta                                   | Query / notas                                                                            |
| -------- | -------------------------------------- | ---------------------------------------------------------------------------------------- |
| `GET`    | `/projects/:projectId/issues`          | `sprintId`, `status[]`, `assigneeId`, `unassigned`, `type`, `search`, `page`, `pageSize` |
| `GET`    | `/projects/:projectId/issues/:issueId` |                                                                                          |
| `POST`   | `/projects/:projectId/issues`          | Body alineado al DTO de abajo                                                            |
| `PATCH`  | `/projects/:projectId/issues/:issueId` | Parcial                                                                                  |
| `DELETE` | `…/issues/:issueId`                    | Opcional                                                                                 |

**DTO recomendado (issue = tarea en UI):**

```json
{
    "id": "1",
    "projectId": "1",
    "sprintId": "1",
    "featureId": "1",
    "title": "…",
    "description": "…",
    "status": "pendiente",
    "priority": "media",
    "type": "bug",
    "assigneeId": "101",
    "dueDate": "2026-04-20",
    "createdAt": "2026-04-10T12:00:00Z",
    "updatedAt": "2026-04-10T14:00:00Z",
    "estimatedHours": 5,
    "actualHours": 6,
    "isVisible": true
}
```

### 10.5 Features (opcional MVP)

| Método | Ruta                                              |
| ------ | ------------------------------------------------- |
| `GET`  | `/projects/:projectId/sprints/:sprintId/features` |

Si no hay UI: el POST de issue puede crear/usar un feature por defecto del sprint.

### 10.6 Time logs

| Método | Ruta                                            |
| ------ | ----------------------------------------------- |
| `GET`  | `/projects/:projectId/issues/:issueId/timelogs` |
| `POST` | `/projects/:projectId/issues/:issueId/timelogs` |

Body ejemplo: `{ "hoursLogged": 2, "logDate": "2026-04-10" }`.

### 10.7 Actividad

| Método | Ruta                            |
| ------ | ------------------------------- |
| `GET`  | `/projects/:projectId/activity` |

Query: `sprintId`, `from`, `to`, `page`, `pageSize`. Origen: `issue_log` + joins a usuarios.

### 10.8 Dashboard

| Método | Ruta                                     | Descripción                                                         |
| ------ | ---------------------------------------- | ------------------------------------------------------------------- |
| `GET`  | `/projects/:projectId/dashboard/summary` | `?sprintId=` — KPIs del sprint (conteos, progreso %, riesgos, etc.) |
| `GET`  | `/projects/:projectId/dashboard/compare` | `?baselineSprintId=&compareSprintId=`                               |
| `GET`  | `/projects/:projectId/kpi-snapshots`     | Opcional: `?sprintId=&limit=`                                       |

### 10.9 Rendimiento del equipo

| Método | Ruta                                                                    |
| ------ | ----------------------------------------------------------------------- |
| `GET`  | `/projects/:projectId/team-performance?sprintId=`                       |
| `GET`  | `/projects/:projectId/users/:userId/task-status-distribution?sprintId=` |

Paginación sugerida: `{ "items": [], "total", "page", "pageSize" }`.

---

## 11. CORS y entorno

- **CORS** habilitado hacia el origen del front (ej. `http://localhost:5173` en desarrollo).
- Front usará `VITE_API_BASE_URL` apuntando a la base del API (`…/v1`).

---

## 12. Checklist entrega backend

**Base de datos y Spring**

- [ ] ATP provisionada, wallet y TNS documentados para el equipo.
- [ ] DataSource Spring verificado contra ATP.
- [ ] Flyway/Liquibase con esquema + extensiones §5.2.
- [ ] Triggers `issue_log` probados con `assigned_to` NULL.
- [ ] Índices alineados a consultas del §10.

**API y contrato**

- [ ] OpenAPI/Swagger publicado o README con ejemplos.
- [ ] Mapeo Oracle → JSON (fechas ISO-8601, nulls, IDs).
- [ ] `sprintId` en DTO de issue (join vía `feature`).
- [ ] Seeds mínimos: proyecto, 2–3 sprints, issues variados, miembros.

**Integración front**

- [ ] CORS y URL de despliegue acordadas con quien hace el front.

---

## 13. Qué hará el frontend después

- Cliente HTTP + servicios por dominio (`tasksApi`, `sprintsApi`, …).
- Sustituir `src/mock/*` por el API respetando el contrato de los §9–10.
- Estados de carga, error y vacío en Dashboard, Task Manager, Rendimiento e Historial.

---

_Documento unificado para el repo **oracle-smart** — Oracle Management Project: **Spring Boot**, **Oracle Autonomous DB (OCI)**, frontend **React/Vite**._
