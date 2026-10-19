import { Link } from 'react-router-dom';
import { useBeyondWork, type BeyondWorkItem } from '@/beyond/useBeyondWork';

function WorkEmpty() {
  return (
    <aside className="by-empty-client" aria-label="No published client work yet">
      <p className="by-muted">
        No client pieces are public yet. Read how we built Skillance above, or{' '}
        <Link to="/beyond/contact" className="by-textlink">start a project</Link>.
      </p>
    </aside>
  );
}

function WorkItem({ item }: { item: BeyondWorkItem }) {
  return (
    <article className="by-work-item">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt="" width={72} height={72} />
      ) : (
        <span className="by-work-mark" aria-hidden="true">
          {item.name.slice(0, 1)}
        </span>
      )}
      <div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        {item.tags.length > 0 ? (
          <ul className="by-tags">
            {item.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        ) : null}
        {item.linkUrl ? (
          <a href={item.linkUrl} target="_blank" rel="noopener noreferrer">
            Visit {item.name}
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function WorkCatalog({ limit }: { limit?: number }) {
  const { ready, items } = useBeyondWork();
  const shown = typeof limit === 'number' ? items.slice(0, limit) : items;

  if (!ready) {
    return (
      <div className="by-work-skeleton" role="status" aria-live="polite">
        <span className="by-work-skeleton-line" />
        <span className="by-work-skeleton-line by-work-skeleton-line-short" />
      </div>
    );
  }

  if (shown.length === 0) return <WorkEmpty />;

  return (
    <div className="by-work-list">
      {shown.map((item) => (
        <WorkItem key={item.id} item={item} />
      ))}
    </div>
  );
}
