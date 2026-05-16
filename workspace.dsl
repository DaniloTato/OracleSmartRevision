workspace "Oracle Project Management" "Architecture model for the Oracle Project Management system, supporting developers and managers through a web portal and Telegram bot." {
    !docs doc/arch
    !adrs doc/arch
    
    model {

        !impliedRelationships false
        # ── Actors ──────────────────────────────────────────────────────────
        developer = person "Developer" "Team member who checks assigned tasks, updates task status, and interacts with the system via web portal or Telegram bot."
        manager   = person "Project Manager" "Supervises team tasks, reviews KPI metrics, monitors team activity, and receives AI-generated reports."

        # ── External Systems ─────────────────────────────────────────────────
        telegramApi = softwareSystem "Telegram API" "External messaging platform. Delivers messages between users and the bot using the token issued by BotFather." "External System"
        geminiApi   = softwareSystem "Google Gemini API" "External AI service used to detect inactive developers, understand blockers, and generate automated reports for the project manager." "External System"

        # ── Main System ──────────────────────────────────────────────────────
        oraclePMS = softwareSystem "Oracle Project Management System" "Centralised system that allows developers and managers to manage tasks, track KPIs, monitor team activity, and automate follow-up via AI." {

            # ── Presentation Layer ───────────────────────────────────────────
            webPortal = container "Web Portal" "Browser-based interface for developers and managers to manage tasks, view KPIs, and monitor team activity." "React / HTML" "Web Browser"

            telegramBot = container "Telegram Bot (bot.js)" "Conversational interface on Telegram. Receives commands, forwards requests to the backend, and returns formatted responses to the user." "Node.js" "Telegram Client" {
                botAdapter = component "Bot Integration Adapter" "Receives Telegram updates, parses commands, translates them into REST calls to the backend API, and formats responses back to Telegram." "Node.js"
            }

            # ── Integration Layer ────────────────────────────────────────────
            apiBackend = container "REST API Backend (Server.js)" "Central entry point for all business operations. Exposes REST endpoints consumed by the web portal and the Telegram bot." "Node.js / Express" {

                authService     = component "Auth & Access Service" "Validates user identity, manages permissions, and ensures secure access to all system functions." "Node.js"
                taskService     = component "Task Management Service" "Handles task retrieval, status updates, assignment queries, and project data consultation." "Node.js"
                activityService = component "Team Activity Service" "Tracks and exposes recent team actions, task changes, and collaboration activity." "Node.js"
                kpiService      = component "KPI & Reporting Service" "Calculates and exposes productivity indicators, sprint progress metrics, and team-level KPI dashboards." "Node.js"
                geminiService   = component "Gemini Service (GeminiService.js)" "Detects developers with inactive tasks, sends contextual prompts to Google Gemini API, parses the AI response, and triggers automated report generation for the project manager." "Node.js"
            }

            # ── Data Layer ───────────────────────────────────────────────────
            database = container "Oracle ATP Database" "Persistent storage for tasks, users, KPI records, activity logs, and AI-generated reports." "Oracle Autonomous Transaction Processing" "Database"
        }

        # ── Relationships: Actors → System ───────────────────────────────────
        developer -> oraclePMS   "Checks tasks, updates status, consults project data" "HTTPS"
        manager   -> oraclePMS   "Reviews KPIs, monitors activity, receives AI reports" "HTTPS"
        developer -> webPortal   "Uses to manage tasks and view project data" "HTTPS"
        developer -> telegramBot "Sends commands to check and update tasks" "Telegram"
        manager   -> webPortal   "Uses to review KPIs and monitor team" "HTTPS"
        manager   -> telegramBot "Receives AI-generated reports and alerts" "Telegram"

        # ── Relationships: System → External ─────────────────────────────────
        telegramBot   -> telegramApi "Sends and receives messages" "HTTPS / Telegram Bot API"
        geminiService -> geminiApi   "Sends prompt with task context, receives AI analysis" "HTTPS / REST"

        # ── Relationships: Containers ─────────────────────────────────────────
        webPortal   -> apiBackend "Makes API calls" "HTTPS / REST"
        telegramBot -> apiBackend "Forwards parsed commands" "HTTPS / REST"
        apiBackend  -> database   "Reads and writes data" "SQL"

        # ── Relationships: Components ─────────────────────────────────────────
        botAdapter      -> authService     "Authenticates incoming requests" "HTTPS / REST"
        botAdapter      -> taskService     "Requests task data and status updates" "HTTPS / REST"

        authService     -> database        "Validates credentials and permissions" "SQL"
        taskService     -> database        "Persists and retrieves task records" "SQL"
        taskService     -> activityService "Notifies of task changes" "Internal call"
        taskService     -> kpiService      "Provides task data for KPI calculation" "Internal call"
        activityService -> database        "Stores activity logs" "SQL"
        activityService -> kpiService      "Feeds activity data into productivity metrics" "Internal call"
        kpiService      -> database        "Reads KPI records and writes computed metrics" "SQL"
        geminiService   -> geminiApi       "Sends contextual prompts and receives analysis" "HTTPS / REST"
        geminiService   -> database        "Saves generated reports" "SQL"
        geminiService   -> taskService     "Queries tasks with no recent updates" "Internal call"

        # ── Deployment ────────────────────────────────────────────────────────
        deploymentEnvironment "Oracle Cloud Infrastructure (OCI)" {

            deploymentNode "OCI Compute Instance" "Virtual machine running the Node.js backend and bot." "Oracle Cloud VM" {

                deploymentNode "Node.js Runtime" "Runs the backend API and Telegram bot process." "Node.js 18+" {
                    apiInstance = containerInstance apiBackend
                    botInstance = containerInstance telegramBot
                }
            }

            deploymentNode "OCI Networking" "Handles inbound HTTPS traffic." "OCI Load Balancer" {
                webPortalInstance = containerInstance webPortal
            }

            deploymentNode "Oracle ATP" "Managed Oracle database service." "Oracle Autonomous Transaction Processing" {
                dbInstance = containerInstance database
            }
        }
    }

    views {

        # 1. System Landscape
        systemLandscape "SystemLandscape" "Overview of all systems and actors." {
            include *
            autoLayout lr
        }

        # 2. System Context
        systemContext oraclePMS "SystemContext" "How actors and external systems interact with Oracle Project Management." {
            include *
            autoLayout lr
        }

        # 3. Containers
        container oraclePMS "Containers" "Internal containers of the Oracle Project Management system." {
            include *
            autoLayout tb
        }

        # 4. Components — REST API Backend
        component apiBackend "Components_API" "Components inside the REST API Backend." {
            include *
            autoLayout tb
        }

        # 5. Components — Telegram Bot
        component telegramBot "Components_Bot" "Components inside the Telegram Bot container." {
            include *
            autoLayout tb
        }

        # 6. Deployment
        deployment oraclePMS "Oracle Cloud Infrastructure (OCI)" "Deployment" "How the system is deployed on OCI." {
            include *
            autoLayout tb
        }

        # 7. Dynamic — Developer updates a task via Telegram
        dynamic oraclePMS "DynamicTaskUpdate" "Developer updates a task status through the Telegram bot." {
            developer   -> telegramBot "Sends /update command via Telegram"
            telegramBot -> apiBackend  "Forwards parsed update request" "HTTPS / REST"
            apiBackend  -> database    "Validates user and persists new task status" "SQL"
            apiBackend  -> telegramBot "Returns confirmation response" "HTTPS / REST"
            telegramBot -> developer   "Delivers confirmation message via Telegram"
            autoLayout lr
        }

        # 8. Dynamic — AI report flow at system level
        dynamic oraclePMS "DynamicAIReport" "AI feature detects an inactive developer and generates a report for the manager." {
            apiBackend  -> database    "Queries and saves AI-generated report" "SQL"
            apiBackend  -> telegramBot "Sends report notification to manager" "HTTPS / REST"
            telegramBot -> manager     "Delivers AI report via Telegram"
            autoLayout lr
        }

        # 9. Dynamic — AI internals at component level
        dynamic apiBackend "DynamicAIReportDetail" "Internal component flow for the AI report feature." {
            geminiService -> taskService "Queries tasks with no recent updates" "Internal call"
            geminiService -> geminiApi   "Sends prompt with inactivity context" "HTTPS / REST"
            geminiService -> database    "Saves generated report" "SQL"
            autoLayout lr
        }

        styles {
            element "Person" {
                shape Person
                background #7B6FAA
                color #ffffff
            }
            element "External System" {
                background #999999
                color #ffffff
            }
            element "Database" {
                shape Cylinder
                background #f5a623
                color #ffffff
            }
            element "Web Browser" {
                shape WebBrowser
            }
            element "Telegram Client" {
                shape MobileDeviceLandscape
            }
            element "Software System" {
                background #4a6fa5
                color #ffffff
            }
            element "Container" {
                background #6b8cba
                color #ffffff
            }
            element "Component" {
                background #9aafc9
                color #ffffff
            }
        }
    }
}
