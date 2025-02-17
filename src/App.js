import React from 'react';
import {
  SimpleHeader, 
  MapWidget,
  MapOverviewWidget,
  BorderLayout,
  LayerTree,
  WfsFeatureGrid,
  CoordinateControl,
  ZoomControl,
  MeasureControl,
  FeatureInfoControl,
  AboutControl
} from './main.js';
import {createDefaultOverviewMap} from './util/map';
import {createDefaultMap} from './util/map';
import OlSourceVector from 'ol/source/Vector';
import OlLayerVector from 'ol/layer/Vector';
import ImageLayer from 'ol/layer/Image';
import ImageWMSSource from 'ol/source/ImageWMS';
import LayerGroup from 'ol/layer/Group';
import {get as getProjection} from 'ol/proj';
import 'ol/ol.css';
import './assets/css/react-olext-ol.css';
import './App.css';



//Init Vector Layer to render wfs queries
const createWfsLayer = (map) => {
  const layer = new OlLayerVector({
    name: 'WFS Flemish Addresses',
    source: new OlSourceVector()
  });
  map.addLayer(layer);
  return layer;
};

//wfs options to be used by WFS GetFeature query
const getWfsOptions = () => {
  const wfsOptions = {
      srsName: 'EPSG:31370',
      featureNS: 'informatievlaanderen.be/Adressen',
      featurePrefix: 'Adressen',
      featureTypes: ['Adrespos'],
      geometryName: 'adrespositie',
      outputFormat: 'application/json',
       maxFeatures: 200
  };
  return wfsOptions;
};

//create wms layers
const createWmsLayers = (map) => {
  //create parcel wms layer
  const wmsParcelLayer = new ImageLayer({
    name: 'GRB Parcels',
    visible: false,
    source: new ImageWMSSource({
      url: 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/Adpf/wms',
      params: {
        STYLES: '',
        LAYERS: 'Adpf',
        INFO_FORMAT: 'application/vnd.esri.wms_featureinfo_xml'
      }
    })
  });
  //create building wms layer
  const wmsbuildingLayer = new ImageLayer({
    name: 'GRB Realized Buildings',
    source: new ImageWMSSource({
      url: 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/Gebouwenregister/wms',
      params: {
        STYLES: '',
        LAYERS: 'G_GEREALISEERD',
        INFO_FORMAT: 'application/vnd.esri.wms_featureinfo_xml'
      }
    })
  });
  //create address wms layer
  const wmsaddressLayer = new ImageLayer({
    name: 'GRB Addresses',
    visible: false,
    source: new ImageWMSSource({
      url: 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/Adressen/wms',
      params: {
        STYLES: '',
        LAYERS: 'Adrespos',
        INFO_FORMAT: 'application/vnd.esri.wms_featureinfo_xml'
      }
    })
  });
  //create group layers
  const wmsGroupLayer = new LayerGroup({
    name: 'WMS Flemish Layers',
    layers: [wmsParcelLayer, wmsbuildingLayer, wmsaddressLayer],
  });
  //add layers to map
  map.addLayer(wmsGroupLayer);
  
  return wmsGroupLayer;

};

//handler to resize the overview map if the border is resized
const dragHandler = () => {
  map.updateSize();
  overviewMap.updateSize();
  overviewMap.getView().setCenter(map.getView().getCenter());
  overviewMap.getView().set('resolution', magnification * map.getView().getResolution());
};


//initialize map
const url = 'https://geoservices.informatievlaanderen.be/overdrachtdiensten/Adressen/wfs';
const viewOpts= {
  projection: 'EPSG:31370',
  center: [157257, 172012],
  zoom: 18
};
const map = createDefaultMap(viewOpts);
createWmsLayers(map);
const wfsLayer = createWfsLayer(map);
const wfsOptions = getWfsOptions();

//create overview map
const overviewMap = createDefaultOverviewMap(map);
//projections to be used in the application
//const projs= [getProjection('Belgian Lambert 72'), getProjection('WGS84')]; //adding alias
const projs= [getProjection('Belgian Lambert 72'), getProjection('WGS84'), getProjection('EPSG:4326')]; //adding alias
//const projs = [getProjection('EPSG:31370'), getProjection('WGS84')]
const magnification = 5;

const App = () => {
  return (
    <BorderLayout split="horizontal" minSize={64} maxSize={64} defaultSize={64} onDragFinished={dragHandler} >
      <div style={{width:"100%", display:'flex', flexDirection:'column'}}>
        <SimpleHeader map={map} style={{height:'64px'}}/> 
      </div>
      <BorderLayout split="horizontal" defaultSize={250} primary="second" onDragFinished={dragHandler}>
        <BorderLayout split="vertical" defaultSize={250} onDragFinished={dragHandler}>
            <div style={{width:"100%"}}>
              <LayerTree map={map}/>
            </div>
          <BorderLayout split="vertical" primary="second" defaultSize={350} maxSize={400} minSize={0} onDragFinished={dragHandler}>
              <MapWidget map={map}>
                <MapWidget.Controls>
                  <AboutControl map={map} content={<div>Hello My App</div>}/>
                  <CoordinateControl map={map} projs={projs} defaultProjCode="Belgian Lambert 72"/>
                  <ZoomControl map={map} projs={projs} defaultProjCode="Belgian Lambert 72"/>
                  <FeatureInfoControl map={map}/>
                  <MeasureControl map={map}/>
                </MapWidget.Controls>
              </MapWidget>
              <MapOverviewWidget parentMap={map} map={overviewMap} magnification={magnification}/>
          </BorderLayout>
        </BorderLayout>
        <div style={{height:'100%', width:'100%'}}>
          <WfsFeatureGrid url={url} wfsOptions={wfsOptions} map={map} vectorLayer={wfsLayer}/>
        </div>
      </BorderLayout>
    </BorderLayout>
  );
};

export default App;





