type BeyondFigureProps = {
  webpSrc: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
};

export default function BeyondFigure({
  webpSrc,
  alt,
  className = '',
  loading = 'lazy',
}: BeyondFigureProps) {
  return (
    <figure className={`by-figure ${className}`.trim()}>
      <div className="by-parallax">
        <picture className="by-parallax-media">
          <source type="image/webp" srcSet={webpSrc} />
          <img src={webpSrc} alt={alt} loading={loading} decoding="async" width={1600} height={1067} />
        </picture>
      </div>
    </figure>
  );
}
