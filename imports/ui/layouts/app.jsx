import React from 'react';
import Navigation from '../components/navigation.jsx';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MediaQuery from 'react-responsive';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors'

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#FF9800',
    primary2Color:  '#FF9800',
    accent1Color: '#0068B2',
  },
  appBar: {
    height: 50,
  },
  datePicker: {
    headerColor: '#0068B2',
  },
  timePicker: {
    headerColor: '#0068B2',
  },
  fontFamily: 'Raleway, Roboto'
});

export const App = ( { children } ) => (
  <MuiThemeProvider muiTheme={muiTheme}>
  <div>
  <MediaQuery minDeviceWidth={700}>

  <div style={{display: 'flex', flexDirection: 'column',display: '-webkit-flex',
    WebkitFlexDirection: 'column'
    , alignItems: 'center'}}>
  <div style={{ width: '100%' , backgroundColor: 'white',
     marginBottom: '24px', minHeight: '90vh'}} >
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
