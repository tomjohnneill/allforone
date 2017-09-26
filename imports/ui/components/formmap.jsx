import React from 'react';
import scriptLoader from 'react-async-script-loader';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {Details} from '/imports/api/pledges.js';

@scriptLoader(['https://maps.googleapis.com/maps/api/js?key=AIzaSyBTpDOE9g3QUek4pJ2lWkXhRJuAtFMEx5o&libraries=drawing,geometry'])
export default class FomrMap extends React.Component {
  constructor(props){
    super(props);
    this.map = null;
  }

  componentWillReceiveProps ({ isScriptLoaded, isScriptLoadSucceed }) {

    if (isScriptLoaded && !this.props.isScriptLoaded) { // load finished
      if (isScriptLoadSucceed) {
        this.map = new google.maps.Map(this.refs.map, {
          center: {lat: this.props.lat, lng: this.props.lng},
          zoom: 12
        });

        const pos = {
          lat: this.props.lat,
          lng: this.props.lng
        }

        const marker = new google.maps.Marker({
          position: pos,
          map: this.map,
          title: this.props.place
        });

      }
      else this.props.onError()
    }
  }


  render(){
    return (
    <div>
      <div ref="map" style={{height: '200px', width: '100%'}}></div>
      { !this.map && <div className="center-md">Loading...</div> }
    </div>
    )
  }
}
