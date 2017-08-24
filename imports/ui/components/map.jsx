import React from 'react';
import scriptLoader from 'react-async-script-loader';
import FlatButton from 'material-ui/FlatButton';
import {Details} from '/imports/api/pledges.js';

@scriptLoader(['https://maps.googleapis.com/maps/api/js?key=AIzaSyBTpDOE9g3QUek4pJ2lWkXhRJuAtFMEx5o&libraries=drawing,geometry'])
export default class Map extends React.Component {
  constructor(props){
    super(props);
    this.map = null;
  }

  componentWillReceiveProps ({ isScriptLoaded, isScriptLoadSucceed }) {

    if (isScriptLoaded && !this.props.isScriptLoaded) { // load finished
      if (isScriptLoadSucceed) {
        this.map = new google.maps.Map(this.refs.map, {
          center: {lat: 10.794234, lng: 106.706541},
          zoom: 7
        });

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            this.map.setCenter(pos);
            this.map.data.setControls(['Polygon']);
            this.map.data.setDrawingMode('Polygon');
            this.map.data.setStyle({
              editable: true,
              draggable: true
            });

            const marker = new google.maps.Marker({
              position: pos,
              map: this.map,
              title: 'Hello World!'
            });
          }, () => {
            console.log('navigator disabled');
          });

          function fetchPolygon() {
            // This appears to be the most reliable way of
            // fetching the polygon object from the map object :-/
            this.map.data.forEach(function(feature) {polygon = feature.getGeometry(); console.log(polygon)})
            }

        } else {
          // Browser doesn't support Geolocation
          console.log('navigator disabled');
        }
      }
      else this.props.onError()
    }
  }

  handleClearMap = (e) => {
    e.preventDefault()
    var map = this.map
    map.data.forEach(function (feature) {
      map.data.remove(feature);
    });
    map.data.setControls(['Polygon']);
    map.data.setDrawingMode('Polygon');
    map.data.setStyle({
      editable: true,
      draggable: true
    });
  }

  handleFindPolygons = (e) => {
    e.preventDefault()
    var polygon, bounds
    var map = this.map
    var findGeoMatching = this.props.findGeoMatching

     function fetchPolygon  ()  {
        // This appears to be the most reliable way of
        // fetching the polygon object from the map object :-/
        map.data.forEach(function(feature) {polygon = feature.getGeometry()})
        map.data.toGeoJson(function (json) {
          console.log(JSON.stringify(json));


          console.log(json)

          findGeoMatching(json)
        })


      }

    function fetchLatLngBoundsOfPolygon() {
        bounds=new google.maps.LatLngBounds();
        polygon.forEachLatLng(function(ll) {bounds.extend(ll)});
      }

    function hasPolygon() {
      return typeof polygon !== 'undefined';
    }


    function fetchLatLngBoundsOfPolygon() {
      bounds=new google.maps.LatLngBounds();
      polygon.forEachLatLng(function(ll) {bounds.extend(ll)});
    }


    fetchPolygon();
       if(hasPolygon()) {
         fetchLatLngBoundsOfPolygon();
       }
  }

  render(){
    return (
    <div>
      <div ref="map" style={{height: '300px', width: '100%'}}></div>
      { !this.map && <div className="center-md">Loading...</div> }
      <FlatButton label='Clear Map' onTouchTap={this.handleClearMap}/>
      <FlatButton label='Find Polygons' onTouchTap={this.handleFindPolygons}/>
    </div>
    )
  }
}
