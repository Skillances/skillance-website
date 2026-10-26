import { useCallback, useState, type CSSProperties } from 'react';

const DESKTOP_W = 1600;
const DESKTOP_H = 1000;
const MOBILE_W = 780;
const MOBILE_H = 1688;

export type BeforeAfterItem = {
  id: string;
  num: string;
  label: string;
  caption: string;
  afterAlt: string;
  beforeAlt: string;
};

type BeforeAfterCompareProps = {
  item: BeforeAfterItem;
};

function imagePaths(exampleId: string, side: 'before' | 'after') {
  const base = `/beyond/redesigns/${exampleId}-${side}`;
  return {
    desktop: `${base}-desktop.webp`,
    mobile: `${base}-mobile.webp`,
  };
}

export default function BeforeAfterCompare({ item }: BeforeAfterCompareProps) {
  const [pos, setPos] = useState(50);
  const paths = imagePaths(item.id, 'after');
  const beforePaths = imagePaths(item.id, 'before');

  const onInput = useCallback((value: number) => {
    setPos(value);
  }, []);

  const style = { '--by-ba-pos': `${pos}%` } as CSSProperties;
  const valuetext = `${pos}% before, ${100 - pos}% after`;

  return (
    <figure className="by-ba-figure">
      <div
        className="by-ba"
        style={style}
      >
        <picture className="by-ba-after">
          <source
            media="(max-width: 639px)"
            srcSet={paths.mobile}
            width={MOBILE_W}
            height={MOBILE_H}
          />
          <img
            src={paths.desktop}
            width={DESKTOP_W}
            height={DESKTOP_H}
            loading="lazy"
            decoding="async"
            alt={item.afterAlt}
            className="by-ba-img by-ba-img-after"
          />
        </picture>
        <div className="by-ba-before" aria-hidden="true">
          <picture>
            <source
              media="(max-width: 639px)"
              srcSet={beforePaths.mobile}
              width={MOBILE_W}
              height={MOBILE_H}
            />
            <img
              src={beforePaths.desktop}
              width={DESKTOP_W}
              height={DESKTOP_H}
              loading="lazy"
              decoding="async"
              alt=""
              className="by-ba-img by-ba-img-before"
            />
          </picture>
        </div>
        <span className="by-ba-badge by-ba-badge-before">Before</span>
        <span className="by-ba-badge by-ba-badge-after">After</span>
        <div className="by-ba-handle" aria-hidden="true">
          <span className="by-ba-handle-grip">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
            </svg>
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          step={1}
          className="by-ba-range"
          aria-label={`Compare before and after: ${item.label}`}
          aria-valuetext={valuetext}
          onChange={(e) => onInput(Number(e.target.value))}
        />
      </div>
      <figcaption className="by-ba-caption">
        <span className="by-ba-caption-label">{item.num} · {item.label}</span>
        <span className="by-ba-caption-text">{item.caption}</span>
      </figcaption>
      <p className="by-sr">{item.beforeAlt}</p>
    </figure>
  );
}
