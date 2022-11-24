import './ExportGeoJson.scss'

const Content = () => {

  return (
    <div className="export-geojson">
      {`{
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "title": "シンデレラ城",
            "description": "シンデレラ城（Cinderella Castle）は、東京ディズニーランドのシンボルであるランドマーク。最高地点の高さは51メートルで、頭頂部には園内業務用無線のアンテナが設置されている。 ",
            "marker-size": "large",
            "marker-color": "#FF0000",
            "stroke": "#FFFFFF",
            "stroke-width": "2"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [
              139.8808906,
              35.63209422
            ]
          }
        }
      ]
    }`}
    </div>
  );
};

export default Content;