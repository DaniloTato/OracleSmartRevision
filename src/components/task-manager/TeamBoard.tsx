import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus, Member } from '../../types'

interface TeamBoardProps {
   tasks: Task[]
   members: Member[]
   onUpdateStatus: (taskId: number, status: TaskStatus) => void
   onDeleteTask: (taskId: number) => void
   highlightedTaskId?: number
}

export function TeamBoard({
   tasks,
   members,
   onUpdateStatus,
   onDeleteTask,
   highlightedTaskId = 0,
}: TeamBoardProps) {
   return (
      <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-sidebar-bg)] overflow-hidden min-h-[320px] flex-1 min-w-0">
         <div className="p-4 border-b border-[var(--color-border)] shrink-0">
            <h2 className="text-lg font-medium text-[var(--color-text)]">
               Equipo
            </h2>
         </div>

         <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 min-h-0">
            <div className="flex gap-4 h-full min-w-max">
               {members.map((member) => {
                  return (
                     <MemberColumn
                        key={member.userId}
                        member={member}
                        userTasks={tasks.filter(
                           (t) => t.assigneeId === member.userId
                        )}
                        onUpdateStatus={onUpdateStatus}
                        onDeleteTask={onDeleteTask}
                        highlightedTaskId={highlightedTaskId}
                     />
                  )
               })}
            </div>
         </div>
      </div>
   )
}

function MemberColumn({
   member,
   userTasks,
   onUpdateStatus,
   onDeleteTask,
   highlightedTaskId,
}: {
   member: Member
   userTasks: Task[]
   onUpdateStatus: (taskId: number, status: TaskStatus) => void
   onDeleteTask: (taskId: number) => void
   highlightedTaskId: number
}) {
   const { setNodeRef, isOver } = useDroppable({
      id: member.userId, // now safe: number
   })

   const totalHours = userTasks.reduce(
      (sum, t) => sum + (t.estimatedHours ?? 0),
      0
   )

   return (
      <div
         ref={setNodeRef}
         className={`flex flex-col w-56 shrink-0 rounded-lg border border-[var(--color-border)] bg-white p-3 min-h-[200px] transition-colors ${
            isOver
               ? 'ring-2 ring-[var(--color-oracle-orange)] bg-orange-50/30'
               : ''
         }`}
      >
         <p className="font-medium text-sm text-[var(--color-text)] truncate shrink-0">
            {member.name}
         </p>

         <p className="text-xs text-[var(--color-text-muted)] mb-2 shrink-0">
            {totalHours}h estimadas · {userTasks.length} tareas
         </p>

         <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 min-h-0">
            {userTasks.map((task) => (
               <TaskCard
                  key={`${member.userId}-${task.id}`}
                  task={task}
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDeleteTask}
                  isHighlighted={task.id === highlightedTaskId}
               />
            ))}
         </div>
      </div>
   )
}
