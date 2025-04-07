import './site.css';
import Map from 'ol/Map.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import OSM from 'ol/source/OSM.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import Point from 'ol/geom/Point.js';
import Icon from 'ol/style/Icon.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';


const styleFunction = function (feature) {
    const geometry = feature.getGeometry();
    const styles = [
        // linestring
        new Style({
            stroke: new Stroke({
                color: '#a40d05',
                width: 2,
            }),
        }),
    ];

    geometry.forEachSegment(function (start, end) {
        var dx = end[0] - start[0];
        var dy = end[1] - start[1];
        var rotation = Math.atan2(dy, dx);

        var lineStr1 = new LineString([end, [end[0] - 200000, end[1] + 200000]]);
        lineStr1.rotate(rotation, end);
        var lineStr2 = new LineString([end, [end[0] - 200000, end[1] - 200000]]);
        lineStr2.rotate(rotation, end);

        var stroke = new Stroke({
            color: '#a40d05',
            width: 1,
        })

        // arrows
        styles.push(new Style({
            geometry: lineStr1,
            stroke: stroke
        }));
        styles.push(new Style({
            geometry: lineStr2,
            stroke: stroke
        }));
    });

    return styles;
};

const fetchJSON = function(url) {
     return fetch(url)
        .then(function (response) {
            return response.json();
        });
}

const geojsonObject = await fetchJSON('./Easter_trail.geojson');

const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(geojsonObject),
});

const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: styleFunction,
});

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM(),
        }),
        vectorLayer,
    ],
    view: new View({
        center: [-275816.0, 6549995.2],
        zoom: 15,
    }),
});