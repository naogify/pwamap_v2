const textColor = '#000000'
const textHaloColor = '#FFFFFF'

const addMarkers = (mapObject: any, geojson: any, setShop: any, setSearchParams: any) => {

  // nothing to do if shops exists.
  if (mapObject.getSource('shops')) {
    return
  }

  mapObject.addSource('shops', {
    type: 'geojson',
    data: geojson,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 25,
  })

  if (
    mapObject.getLayer('shop-points') &&
    mapObject.getLayer('shop-symbol')
  ) {
    return
  }

  mapObject.addLayer({
    id: 'shop-points',
    type: 'circle',
    source: 'shops',
    filter: ['all',
      ['==', '$type', 'Point'],
    ],
    paint: {
      'circle-radius': 13,
      'circle-color': '#FF0000',
      'circle-opacity': 0.4,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#FFFFFF',
      'circle-stroke-opacity': 1,
    },
  })

  mapObject.addLayer({
    id: 'shop-symbol',
    type: 'symbol',
    source: 'shops',
    filter: ['all',
      ['==', '$type', 'Point'],
    ],
    paint: {
      'text-color': textColor,
      'text-halo-color': textHaloColor,
      'text-halo-width': 2,
    },
    layout: {
      'text-field': "{スポット名}",
      'text-font': ['Noto Sans Regular'],
      'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
      'text-radial-offset': 0.5,
      'text-justify': 'auto',
      'text-size': 12,
      'text-anchor': 'top',
      'text-max-width': 12,
      'text-allow-overlap': false,
    },
  })

  mapObject.on('mouseenter', 'shop-points', () => {
    mapObject.getCanvas().style.cursor = 'pointer'
  })

  mapObject.on('mouseleave', 'shop-points', () => {
    mapObject.getCanvas().style.cursor = ''
  })

  mapObject.on('mouseenter', 'shop-symbol', () => {
    mapObject.getCanvas().style.cursor = 'pointer'
  })

  mapObject.on('mouseleave', 'shop-symbol', () => {
    mapObject.getCanvas().style.cursor = ''
  })

  mapObject.on('click', 'shop-points', (event: any) => {
    if (!event.features[0].properties.cluster) {

      console.log(event.features[0].properties)
      setShop(event.features[0].properties)
      setSearchParams({'id': event.features[0].properties.id})
    }
  })

  mapObject.on('click', 'shop-symbol', (event: any) => {
    if (!event.features[0].properties.cluster) {
      setShop(event.features[0].properties)
      setSearchParams({'id': event.features[0].properties.id})
    }
  })

}

export default addMarkers
