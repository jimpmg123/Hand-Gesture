import type { WorkflowItem } from '../types'

type WorkflowListProps = {
  items: WorkflowItem[]
  compact?: boolean
}

export function WorkflowList({ items, compact = false }: WorkflowListProps) {
  return (
    <div className={`workflow-list ${compact ? 'compact' : ''}`.trim()}>
      {items.map((item) => (
        <div key={item.title} className="workflow-item">
          <strong>{item.title}</strong>
          <p>{item.detail}</p>
        </div>
      ))}
    </div>
  )
}
