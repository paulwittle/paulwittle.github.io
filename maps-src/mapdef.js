import './site.css';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import OSM from 'ol/source/OSM.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import TileLayer from 'ol/layer/Tile.js';
import Geolocation from 'ol/Geolocation.js';
import View from 'ol/View.js';
import Point from 'ol/geom/Point.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import LineString from 'ol/geom/LineString.js';

const view = new View({
    center: [-275816.0, 6549995.2],
    zoom: 15,
});

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

const geolocation = new Geolocation({
    // enableHighAccuracy must be set to true to have the heading value.
    trackingOptions: {
        enableHighAccuracy: true,
    },
    projection: view.getProjection(),
});

function el(id) {
    return document.getElementById(id);
}

el('track').addEventListener('change', function () {
    geolocation.setTracking(this.checked);
});

// update the HTML page when the position changes.
geolocation.on('change', function () {
    el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
    el('altitude').innerText = geolocation.getAltitude() + ' [m]';
    el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
    el('heading').innerText = geolocation.getHeading() + ' [rad]';
    el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
});

// handle geolocation error.
geolocation.on('error', function (error) {
    const info = document.getElementById('info');
    info.innerHTML = error.message;
    info.style.display = '';
});

const accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

const positionFeature = new Feature();
positionFeature.setStyle(
    new Style({
        image: new CircleStyle({
            radius: 6,
            fill: new Fill({
                color: '#3399CC',
            }),
            stroke: new Stroke({
                color: '#fff',
                width: 2,
            }),
        }),
    }),
);

geolocation.on('change:position', function () {
    const coordinates = geolocation.getPosition();
    positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
});

const locationSource = new VectorSource({
    features: [accuracyFeature, positionFeature],
})

const locationLayer = new VectorLayer({
    source: locationSource
});

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM(),
        }),
        vectorLayer,
        locationLayer
    ],
    view: view,
});