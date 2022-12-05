import { useState, useEffect, useRef, CSSProperties} from "react";
import Shop from './Shop'
import  addMarkers from './addMarkers'
import setCluster from './setCluster'
import hideLayers from './hideLayers'
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

    const bounds = geojsonExtent(geojson)
    mapObject.fitBounds(bounds, { padding: 50 })

  }, [mapObject, props.data])

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
