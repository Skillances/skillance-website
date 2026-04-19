import React, { useState, useMemo, useEffect } from 'react';
import {
  ComposableMap,
  createCoordinates,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from '@vnedyalk0v/react19-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface CountryData {
  countryCode: string;
  count: number;
  lat?: number;
  lon?: number;
}

/** When set, map pans/zooms to this point and draws a highlighted marker. */
export type SecurityMapIpFocus = {
  ip: string;
  lat: number;
  lon: number;
  label: string;
};

interface SecurityWorldMapProps {
  data: CountryData[];
  ipFocus?: SecurityMapIpFocus | null;
}

function getCountryName(code: string): string {
  if (code === 'XX') return 'Unknown';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

function interpolateColor(t: number): string {
  const r = Math.round(245 * t + 251 * (1 - t));
  const g = Math.round(58 * t + 191 * (1 - t));
  const b = Math.round(50 * t + 71 * (1 - t));
  return `rgb(${r}, ${g}, ${b})`;
}

const DEFAULT_CENTER = createCoordinates(10, 20);

const SecurityWorldMap: React.FC<SecurityWorldMapProps> = ({ data, ipFocus = null }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; count: number } | null>(null);
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch(GEO_URL)
      .then((res) => res.json())
      .then((json) => setGeoData(json))
      .catch((err) => console.error('Failed to load map data:', err));
  }, []);

  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  const markers = useMemo(
    () => data.filter((d) => d.lat != null && d.lon != null && d.countryCode !== 'XX'),
    [data],
  );

  if (!geoData) return null;

  const mapLayers = (
    <>
      <Geographies geography={geoData}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="var(--map-land, #e5e5e5)"
              stroke="var(--map-border, #d4d4d4)"
              strokeWidth={0.4}
              style={{
                default: { outline: 'none' },
                hover: { outline: 'none', fill: 'var(--map-land-hover, #d4d4d4)' },
                pressed: { outline: 'none' },
              }}
            />
          ))
        }
      </Geographies>

      {markers.map((d) => {
        const intensity = Math.min(1, d.count / maxCount);
        const radius = 4 + Math.sqrt(intensity) * 20;
        const color = interpolateColor(intensity);

        return (
          <Marker
            key={d.countryCode}
            coordinates={createCoordinates(d.lon!, d.lat!)}
            onMouseEnter={(e: React.MouseEvent) => {
              const rect = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
              if (rect) {
                setTooltip({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top - 12,
                  name: getCountryName(d.countryCode),
                  count: d.count,
                });
              }
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            <circle
              r={radius}
              fill={color}
              fillOpacity={0.55}
              stroke={color}
              strokeWidth={1.5}
              strokeOpacity={0.8}
            />
            {radius > 10 && (
              <text
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontSize: Math.max(8, radius * 0.55),
                  fontWeight: 600,
                  fill: '#fff',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {d.count >= 1000 ? `${(d.count / 1000).toFixed(1)}k` : d.count}
              </text>
            )}
          </Marker>
        );
      })}

      {ipFocus && (
        <Marker coordinates={createCoordinates(ipFocus.lon, ipFocus.lat)}>
          <circle r={28} fill="none" stroke="#ef4444" strokeWidth={2} opacity={0.45} className="animate-pulse" />
          <circle r={10} fill="#ef4444" stroke="#fff" strokeWidth={2} opacity={0.95} />
          <text
            textAnchor="middle"
            y={-18}
            style={{
              fontSize: 11,
              fontWeight: 600,
              fill: 'var(--map-ip-label, #171717)',
              paintOrder: 'stroke',
              stroke: 'var(--map-ip-label-stroke, #fff)',
              strokeWidth: 3,
              strokeLinejoin: 'round',
            }}
          >
            {ipFocus.ip}
          </text>
        </Marker>
      )}
    </>
  );

  return (
    <div className="relative w-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: DEFAULT_CENTER }}
        width={800}
        height={420}
        style={{ width: '100%', height: 'auto' }}
      >
        {ipFocus ? (
          <ZoomableGroup
            key={`focus-${ipFocus.ip}`}
            center={createCoordinates(ipFocus.lon, ipFocus.lat)}
            zoom={4.25}
            enableZoom
            enablePan
            minZoom={0.6}
            maxZoom={12}
          >
            {mapLayers}
          </ZoomableGroup>
        ) : (
          <ZoomableGroup>{mapLayers}</ZoomableGroup>
        )}
      </ComposableMap>

      {ipFocus && (
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex justify-center">
          <div className="pointer-events-auto max-w-[min(100%,520px)] rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white/95 dark:bg-neutral-900/95 px-3 py-2 shadow-md text-center">
            <p className="text-xs font-mono text-neutral-800 dark:text-neutral-100">{ipFocus.ip}</p>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-0.5 leading-snug">{ipFocus.label}</p>
          </div>
        </div>
      )}

      {tooltip && (
        <div
          className="absolute pointer-events-none z-50 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-lg whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          {tooltip.name} &middot; {tooltip.count.toLocaleString()} events
        </div>
      )}

      <style>{`
        :root {
          --map-land: #e5e5e5;
          --map-border: #d4d4d4;
          --map-land-hover: #d4d4d4;
          --map-ip-label: #171717;
          --map-ip-label-stroke: #fff;
        }
        .dark {
          --map-land: #333;
          --map-border: #444;
          --map-land-hover: #444;
          --map-ip-label: #fafafa;
          --map-ip-label-stroke: #171717;
        }
      `}</style>
    </div>
  );
};

export default SecurityWorldMap;
