import React from 'react';
import ActionHome from 'material-ui/svg-icons/action/home';
import ActionFlightTakeoff from 'material-ui/svg-icons/action/flight-takeoff';
import FileCloudDownload from 'material-ui/svg-icons/file/cloud-download';
import HardwareVideogameAsset from 'material-ui/svg-icons/hardware/videogame-asset';
import InfoOutline from 'material-ui/svg-icons/action/info';
import {grey100, yellow500, grey500} from 'material-ui/styles/colors';
import Popover from 'material-ui/Popover';
import IconButton from 'material-ui/IconButton';

const iconStyles = {
  marginRight: 24,
};

export default class InfoIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false}
  }

  mouseLeave(e) {

    this.setState({open: false})
    console.log('Mouse out info')
  }

  mouseOver(e) {
    e.preventDefault()
    this.setState({open: true, anchorEl: e.currentTarget})
    console.log('Mouse over info')
  }

  render () {
    return (
      <div style={{height: '48px', width: '48px'}}>
        <div style={{height: '48px', width: '48px'}} >
          <IconButton onTouchTap={this.mouseOver.bind(this)}>
            <InfoOutline color={grey500} hoverColor={'black'}  />
          </IconButton>

        </div>
          <Popover
            open={this.state.open}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
            onRequestClose={this.mouseLeave.bind(this)}
          >
            <div style={{backgroundColor: grey100, padding: '20px'}}>
              {this.props.text}
            </div>
          </Popover>
      </div>
    )
  }
  }
