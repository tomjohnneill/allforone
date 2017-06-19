import React, {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { IndexLink, Link , browserHistory} from 'react-router';
import MediaQuery from 'react-responsive'
import FontIcon from 'material-ui/FontIcon';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import IconLocationOn from 'material-ui/svg-icons/communication/location-on';

const recentsIcon = <FontIcon className="material-icons">restore</FontIcon>;
const favoritesIcon = <FontIcon className="material-icons">favorite</FontIcon>;
const nearbyIcon = <IconLocationOn />;

const styles = {
  box: {
    width: '100%'
    , backgroundColor: '#1251BA'
    , bottom: '0px'
    , color: 'white'
    , justifyContent: 'center'
    , alignItems: 'center'
    , WebkitAlignItems: 'center'
    , WebkitJustifyContent: 'center'
    , display: 'flex'
    , display: '-webkit-flex'
    , marginTop: '100px'
  },
  mobileBox: {
    width: '100%'
    , backgroundColor: '#1251BA'
    , bottom: '0px'
    , color: 'white'
    , justifyContent: 'center'
    , alignItems: 'center'
    , WebkitAlignItems: 'center'
    , WebkitJustifyContent: 'center'
    , display: 'flex'
    , display: '-webkit-flex'
    , marginTop: '100px'
    , marginBottom: '60px'
  },
  list: {
    listStyleType: 'none',
    paddingTop: '3px',
    paddingBottom: '3px',
    paddingRight: '15px',
    margin: '0px',
  }
  , link: {
    color: 'white',
    textDecoration: 'none',
  }
}

export default class BottomBar extends React.Component {
  render() {
    return(

      <div>
        <MediaQuery minDeviceWidth={700}>
          <div ref = 'BottomBar' style = {styles.box}>
        <ul style={styles.list}>
          <li><Link to="/" style={styles.link}>Home</Link></li>
          <li><Link to="/faq" style={styles.link}>FAQ</Link></li>
          <li><Link to="/blog" style={styles.link}>Blog</Link></li>
        </ul>
        <ul style={styles.list}>
          <li><Link to="/dashboard" style={styles.link}>Dashboard</Link></li>
          <li><Link to="/yourdetails" style={styles.link}>Settings</Link></li>
        </ul>
        <ul style={styles.list}>
          <li><Link to="/contact" style={styles.link}>Contact</Link></li>
          <li><Link to="/faq" style={styles.link}>Partners</Link></li>
          <li><Link to="/sites" style={styles.link}>Sites</Link></li>
        </ul>
        <ul style={styles.list}>
          <li><Link to="/terms" style={styles.link}>Terms and Conditions</Link></li>
          <li><Link to="/privacypolicy" style={styles.link}>Privacy policy</Link></li>
        </ul>

      </div>
        </MediaQuery>
        <MediaQuery maxDeviceWidth={700}>

          <div ref = 'BottomBar' style = {styles.mobileBox}>
        <ul style={styles.list}>
          <li><Link to="/" style={styles.link}>Home</Link></li>
          <li><Link to="/faq" style={styles.link}>FAQ</Link></li>
          <li><Link to="/contact" style={styles.link}>Contact</Link></li>
        </ul>
        <ul style={styles.list}>
          <li><Link to="/dashboard" style={styles.link}>Dashboard</Link></li>
          <li><Link to="/yourdetails" style={styles.link}>Settings</Link></li>
        </ul>
      </div>
      <Paper style={{zIndex:100}} >
<BottomNavigation style={{position: 'fixed', bottom: '0px', zIndex: 100}}>

  <BottomNavigationItem
    label="Your Listings"
    icon={nearbyIcon}
    onTouchTap={() => browserHistory.push('/yourdetails')}
  />
  <BottomNavigationItem
    label="Dashboard"
    icon={nearbyIcon}
    onTouchTap={() => browserHistory.push('/dashboard')}
  />
  <BottomNavigationItem
    label="Blog"
    icon={nearbyIcon}
    onTouchTap={() => browserHistory.push('/blog')}
  />
</BottomNavigation>
</Paper>
        </MediaQuery>
      </div>

    )
  }
}
