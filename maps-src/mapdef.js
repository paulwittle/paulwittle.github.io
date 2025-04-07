import './site.css';
import Map from 'ol/Map.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import OSM from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';

const styles = {
    'LineString': new Style({
        stroke: new Stroke({
            color: 'green',
            width: 1,
        }),
    }),
    'MultiLineString': new Style({
        stroke: new Stroke({
            color: 'green',
            width: 1,
        }),
    })
}

const styleFunction = function (feature) {
    return styles[feature.getGeometry().getType()];
};

const fetchJSON = function(url) {
    return fetch(url)
        .then(function (response) {
            return response.json();
        });
}

const geojsonObject = fetchJSON('./Easter_trail.geojson');

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
        zoom: 18,
    }),
});