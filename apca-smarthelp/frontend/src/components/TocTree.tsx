import type { TocNode } from '../api/client';

interface TocTreeProps {
  nodes: TocNode[];
  activeId?: string;
  onSelect: (topicId: string) => void;
}

export function TocTree({ nodes, activeId, onSelect }: TocTreeProps) {
  return (
    <ul className="toc-tree">
      {nodes.map((node) => (
        <li key={node.id} className="toc-item">
          <button
            type="button"
            className={activeId === node.id ? 'active' : undefined}
            onClick={() => onSelect(node.id)}
          >
            {node.title}
            {node.page_from != null && (
              <span className="toc-page ltr">p.{node.page_from}</span>
            )}
          </button>
          {node.children.length > 0 && (
            <TocTree nodes={node.children} activeId={activeId} onSelect={onSelect} />
          )}
        </li>
      ))}
    </ul>
  );
}
