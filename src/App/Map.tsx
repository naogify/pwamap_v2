import { useState, useEffect, useRef, CSSProperties} from "react";
import Shop from './Shop'
import  addMarkers from './addMarkers'
import setCluster from './setCluster'
import hideLayers from './hideLayers'
import { parseHash, updateHash } from '../lib/hash'
import toGeoJson from './toGeoJson'
// @ts-ignore
import geojsonExtent from '@mapbox/geojson-extent'

type Props = {
  data: Pwamap.ShopData[];
};

const CSS: CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
}

const Content = (props: Props) => {
  const mapNode = useRef<HTMLDivElement>(null);
  const [mapObject, setMapObject] = useState<any>()
  const [shop, setShop] = useState<Pwamap.ShopData | undefined>(undefined)
  const [ zLatLngString, setZLatLngString ] = useState<string>('');

  useEffect(() => {
    // Only once reder the map.
    if (!mapNode.current || mapObject) {
      return
    }

    // @ts-ignore
    const { geolonia } = window;

    const map = new geolonia.Map({
      container: mapNode.current,
      style: 'geolonia/gsi',
    });

    const onMapLoad = () => {
      hideLayers(map)
      setMapObject(map)
    }

    const orienteationchangeHandler = () => {
      map.resize()
    }

    // attach
    map.on('load', onMapLoad)

    window.addEventListener('orientationchange', orienteationchangeHandler)

    return () => {
      // detach to prevent memory leak
      window.removeEventListener('orientationchange', orienteationchangeHandler)
      map.off('load', onMapLoad)
    }
  }, [mapNode, mapObject, props.data])


  // マーカーとクラスターを追加
  useEffect(() => {

    if (!mapObject || !props.data || props.data.length === 0) {
      return
    }

    const geojson = toGeoJson(props.data)

    addMarkers(mapObject, geojson, setShop)
    setCluster(mapObject)

    // もしハッシュがあれば、そこに移動する
    const hash = parseHash();
    if (hash && hash.get('map')) {

      const latLngString = hash.get('map') || '';
      const zlatlng = latLngString.split('/');

      const zoom = zlatlng[0]
      const lat = zlatlng[1]
      const lng = zlatlng[2]

      mapObject.flyTo({ center: [lng, lat], zoom, speed: 3 });

    } else {
      // ハッシュがなければ、データの範囲に移動する
      const bounds = geojsonExtent(geojson)
      mapObject.fitBounds(bounds, { padding: 50 })
    }

    // 地図の移動が終わったらハッシュを更新
    mapObject.on('moveend', () => {
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

      setZLatLngString(`${zStr}/${lat}/${lng}`);
    });

  }, [mapObject, props.data])

  // 地図が移動したらハッシュを更新
  useEffect(() => {
    const hash = parseHash();
    if (zLatLngString) {
      hash.set('map', zLatLngString);
    }
    updateHash(hash);

  }, [ zLatLngString ]);

  const closeHandler = () => {
    setShop(undefined)
  }

  return (
    <div style={CSS}>
      <div
        ref={mapNode}
        style={CSS}
        data-geolocate-control="on"
        data-marker="off"
        data-gesture-handling="off"
      ></div>
      {shop ?
        <Shop shop={shop} close={closeHandler} />
        :
        <></>
      }
    </div>
  );
};

export default Content;
