import { useBeyondWork, type BeyondWorkItem } from '@/beyond/useBeyondWork';

function WorkEmpty() {
  return (
    <aside className="by-soon" aria-label="No published work">
      <p className="by-flag">Nothing published</p>
      <h2>No client work is published yet</h2>
      <p>
        Clients and portfolio pieces are added in the Skillance admin. They show up here after they are published.
        Nothing on this page is a placeholder client.
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
      <p className="by-muted" role="status">
        Loading published work.
      </p>
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
