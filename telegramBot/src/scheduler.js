import { apiClient } from './apiClient.js'

export function startOverdueNotifier(bot, ADMIN_CHAT_ID) {
    async function run() {
        try {
            const { data: issues } = await apiClient.get('/issues/overdue')

            if (!issues.length) return

            for (const issue of issues) {
                const message =
                    `⚠️ Overdue Task\n\n` +
                    `#${issue.id} - ${issue.title}\n` +
                    `Due: ${issue.dueDate || 'N/A'}\n\n` +
                    `Please update status or provide reason using /overdue ${issue.id}`

                await bot.sendMessage(ADMIN_CHAT_ID, message)
            }

            await apiClient.patch(
                '/issues/marknotified',
                issues.map((i) => i.id)
            )
        } catch (err) {
            console.error('[OVERDUE NOTIFIER ERROR]', err.message)
        }
    }

    setInterval(run, 5 * 60 * 1000)
    run()
}
