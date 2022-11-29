export const parseHash = (url?: Location | URL) => {
  const qstr = (url || window.location).hash.substring(2);
  const q = new URLSearchParams(qstr);
  return q;
};

export const updateHash = (q: URLSearchParams) => {

  const hash = q.toString();
  if (hash) {
    window.location.hash = `#/?${q.toString().replace(/%2F/g, '/')}`;
  }
};

export const getZXYHash = () => {

  const hash = parseHash();
  if (hash && hash.get('map')) {

    const latLngString = hash.get('map') || '';
    const zlatlng = latLngString.split('/');

    const zoom = zlatlng[0]
    const lat = zlatlng[1]
    const lng = zlatlng[2]

    return {zoom, lat, lng}
  } else {
    return null
  }
}

export const getCenterZXY = (mapObject: any) => {
  // see: https://github.com/maplibre/maplibre-gl-js/blob/ba7bfbc846910c5ae848aaeebe4bde6833fc9cdc/src/ui/hash.js#L59
  const center = mapObject.getCenter(),
  rawZoom = mapObject.getZoom(),
  zoom = Math.round(rawZoom * 100) / 100,
  // derived from equation: 512px * 2^z / 360 / 10^d < 0.5px
  precision = Math.ceil((zoom * Math.LN2 + Math.log(512 / 360 / 0.5)) / Math.LN10),
  m = Math.pow(10, precision),
  lng = Math.round(center.lng * m) / m,
  lat = Math.round(center.lat * m) / m,
  zStr = Math.ceil(zoom);
  return {zStr, lat, lng}
}
