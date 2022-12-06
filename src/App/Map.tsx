import { useState, useEffect, useRef, CSSProperties} from "react";
import Shop from './Shop'
import  addMarkers from './addMarkers'
import setCluster from './setCluster'
import hideLayers from './hideLayers'
import toGeoJson from './toGeoJson'
// @ts-ignore
import geojsonExtent from '@mapbox/geojson-extent'
import { useSearchParams, useNavigate } from "react-router-dom";
import Loading from './Loading'

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
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const navigate = useNavigate();

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

    if (queryId) {
      const shop = props.data.find((shop) => {
        return shop['id'] === queryId
      })
      if (shop) {
        setShop(shop)
      }
    }

    const geojson = toGeoJson(props.data)

    addMarkers(mapObject, geojson, setShop, setSearchParams)
    setCluster(mapObject)

    const bounds = geojsonExtent(geojson)
    mapObject.fitBounds(bounds, { padding: 50 })

  }, [mapObject, props.data, queryId, setSearchParams])

  const closeHandler = () => {
    setShop(undefined)
    navigate("/");
  }

  return (
    <div style={CSS}>
      {queryId && <Loading/>}
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
