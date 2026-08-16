import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '../ui/empty';
import { cn } from '../../lib/utils';

/**
 * EmptyState — one shape for every empty well on /app. No icon prop, no
 * size ladder, no decorative glyph chip.
 *
 * @param {object} props
 * @param {React.ReactNode} props.title            Sentence case: "No trades yet".
 * @param {React.ReactNode} [props.description]
 * @param {React.ReactNode} [props.action]         Usually <Button size="sm" variant="outline">.
 * @param {boolean} [props.announce=false]         role="status" — only when it appears as the result of a user action.
 * @param {string} [props.className]               Density lever (e.g. "py-6" inside a table cell).
 */
export function EmptyState({ title, description, action, announce = false, className }) {
  return (
    <Empty role={announce ? 'status' : undefined} className={cn('py-10', className)}>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        {description != null && (
          <EmptyDescription className="text-xs">{description}</EmptyDescription>
        )}
      </EmptyHeader>
      {action != null && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
