type BeyondFigureProps = {
  webpSrc?: string;
  jpgSrc?: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
};

export default function BeyondFigure({
  webpSrc,
  jpgSrc,
  alt,
  className = '',
  loading = 'lazy',
}: BeyondFigureProps) {
  const rasterSrc = jpgSrc ?? webpSrc ?? '';

  return (
    <figure className={`by-figure ${className}`.trim()}>
      <div className="by-parallax">
        <picture className="by-parallax-media">
          {webpSrc ? <source type="image/webp" srcSet={webpSrc} /> : null}
          <img src={rasterSrc} alt={alt} loading={loading} decoding="async" width={1600} height={1067} />
        </picture>
      </div>
    </figure>
  );
}
