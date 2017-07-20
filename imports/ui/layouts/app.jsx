import React from 'react';
import Navigation from '../components/navigation.jsx';
import BottomBar from '../components/bottombar.jsx';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MediaQuery from 'react-responsive';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors'

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#006699',
    primary2Color:  '#CCCCCC',
    accent1Color: ' #996699',
  },
  appBar: {
    height: 50,
  },
});

export const App = ( { children } ) => (
  <MuiThemeProvider muiTheme={muiTheme}>
  <div>
  <MediaQuery minDeviceWidth={700}>

  <div style={{backgroundColor: grey100,display: 'flex', flexDirection: 'column',display: '-webkit-flex',
    WebkitFlexDirection: 'column'
    , alignItems: 'center'}}>
  <div style={{ maxWidth: '600px', width: '100%' , backgroundColor: 'white'
    , marginTop: '24px', marginBottom: '24px', minHeight: '90vh'}} >
    <Navigation />
    { children }

  </div>
  </div>
  </MediaQuery>
  <MediaQuery maxDeviceWidth={700}>
    <div >
      <Navigation />
      { children }

    </div>
  </MediaQuery>
  </div>
  </MuiThemeProvider>
)
