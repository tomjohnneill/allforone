import React , {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500, blue50, amber200, amber50} from 'material-ui/styles/colors'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Session } from 'meteor/session';
import FacebookProvider, { Comments } from 'react-facebook';
import Dialog from 'material-ui/Dialog';
import {Link, browserHistory} from 'react-router';
import {Pledges} from '/imports/api/pledges.js';
import {Interests} from '/imports/api/interests.js';
import {Contributions} from '/imports/api/contributions.js';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import IconButton from 'material-ui/IconButton';
import TrendingFlat from 'material-ui/svg-icons/action/trending-flat';
import StarRate from 'material-ui/svg-icons/toggle/star';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import Clear from 'material-ui/svg-icons/content/clear';
import CircularProgress from 'material-ui/CircularProgress';
import Chip from 'material-ui/Chip';
import PlacesAutocomplete from 'react-places-autocomplete';
import { geocodeByAddress, geocodeByPlaceId, getLatLng } from 'react-places-autocomplete';
import TextField from 'material-ui/TextField';
import Infoicon from '/imports/ui/components/infoicon.jsx'
import Snackbar from 'material-ui/Snackbar';
import Event from 'material-ui/svg-icons/action/event';
import Group from 'material-ui/svg-icons/social/group';
import Accessibility from 'material-ui/svg-icons/action/accessibility';
import AccessTime from 'material-ui/svg-icons/device/access-time';
import LocationOn from 'material-ui/svg-icons/communication/location-on';

var moment = require('moment');


const styles = {
  box: {
    backgroundColor: grey200,
    marginTop: '10px',
    marginBottom: '10px',
    padding: '10px'
  },
  iconOff: {
  filter:  'gray', WebkitFilter:  'grayscale(1)'

    , opacity:  '0.4'
},
  chip: {
        margin: 4,
      },
      optionChip: {
        margin: 8
      },
  image: {
    padding: '5px',
    borderRadius: '10px'
  },
  indiegogoImage: {
    padding: '5px',
    borderRadius: '10px',
    maxHeight: '200px',
    width: 'auto'
  },
  message: {width: 'auto', maxWidth: '80%', backgroundColor: 'white', margin: '16px', padding: '10px', borderRadius: '10px'}
}

export class Community extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
        locationOpen: false, interestsSet: false,address: '', suggestionsCalled: true
        , editInterestOpen: false, tags: [], tagText: '', snackbarOpen: false
      };
    this.onChange = (address) => this.setState({ address })
  }

  componentDidMount() {
    var objDiv = ReactDOM.findDOMNode(this.refs.box);
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  componentDidUpdate() {
    var objDiv = ReactDOM.findDOMNode(this.refs.box);
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  handleScrapeHTML = (e) => {
    e.preventDefault()
    Meteor.call('scrapeExperiment', 'climate change')
  }


  handleSnackbarClose = () => {
    this.setState({snackbarOpen: false})
  }



  handleRequestDelete(interest, e) {

    Meteor.call('removeInterest', interest)
  }

  handleSelect = (address, placeId) => {
    geocodeByAddress(address,  (err, { lat, lng }) => {
    if (err) { console.log('Oh no!', err) }
    Meteor.call('updateLocation', address, lat, lng)
  })
  }

  handleFacebookLogin = (e) => {
    e.preventDefault()
    Meteor.loginWithFacebook({requestPermissions: ['email', 'public_profile', 'user_friends']},function(error, result) {
      if (error) {
          console.log("facebook login didn't work at all")
          Bert.alert(error.reason, 'danger')
      }
    })

  }

  handleLocationEditOpen = (e) => {
    e.preventDefault()
    this.setState({locationOpen: true})
  }

  handleLocationEditClose = () => {
    this.setState({locationOpen: false})
  }

  handleAddInterest(interest, option, e) {
    e.preventDefault()
    this.setState({interestsSet: option})
    Meteor.call('addInterest', interest)
  }

  handleInterestsSet = (e) => {
    e.preventDefault();
    this.setState({interestsSet: false})
  }

  callEventbriteAPI(interests) {
    Meteor.call('callEventbriteEventSearch', interests, function(error, result) {
      if (error) {
        console.log(error)
      } else {
        console.log('this has finished executing')
        this.setState({findingMore: false})
      }
    }.bind(this))
  }


  handleMoreSuggestions = () => {
    this.setState({findingMore: true})
    this.setState({suggestionsCalled: true})
    Meteor.call('checkCurrentSuggestions', (error, result) => {
      console.log('Result is: '+result)
      if (error) {
        console.log(error)
      } else if (result == false) {
        Meteor.call('callMeetupGroupSearch', this.props.user.interests)
        var i
        for (i=0;i<this.props.user.interests.length;i++) {
          Meteor.call('scrapeExperiment', this.props.user.interests[i])
          Meteor.call('indiegogoSearch', this.props.user.interests[i])
        }
        this.callEventbriteAPI(this.props.user.interests)
      } else if (result == true) {
        Meteor.call('newTodayEventSuggestions')
        this.setState({findingMore: false})
        Meteor.call('searchEventsNoUpdate', this.props.user.interests)
      }
    })




  }



  getMeetupImageURL(html) {
    try {
      for (let item of getUrls(html)) {
        if (item.match(/\.(jpeg|jpg|gif|png)$/) != null) {
              return item
              break;
        }
        else {
          return '/images/eventdefault.jpg';
          break;
        }
    }
    }
    catch(err) {return '/images/eventdefault.jpg'}
  }

  handleEventStar(event, today, e) {
    if (event.starred) {
      Meteor.call('unStarEvent', event, today)
    } else {
      Meteor.call('starEvent', event, today)
      Meteor.call('markEventSeen', event, today)
    }
  }

  handleEventCross(event, today, e) {
    Meteor.call('crossEvent', event, today)
    console.log(event)
    console.log(today)
    console.log(e)
  }

  handleMeetupStar(event, today, e) {
    Meteor.call('starMeetup', event, today)
    Meteor.call('markMeetupSeen', event, today)
  }

  handleMeetupCross(event,today,  e) {
    Meteor.call('crossMeetup', event, today)
  }

  handleMeetupExpandChange(event, today, expanded){
    if (!expanded) {
      Meteor.call('markMeetupSeen', event, today)
    }
  };

  handleEventExpandChange(event, today, expanded){
    if (!expanded) {
      Meteor.call('markEventSeen', event, today)
    }
  };

  handleEditInterests = (e) => {
    e.preventDefault()
    this.setState({editInterestOpen: true})
  }

  handleEditInterestClose = () => {
    this.setState({editInterestOpen: false})
  }

  handleLinkEnter = (event, newValue) => {
    this.setState({domain: newValue})
  }

  scrapeDomain = () => {
    Meteor.call('scrapeOpenGraph', this.state.domain)
  }

  handleKeyPress = (e) => {
    if (e.key == 'Enter') {
      e.preventDefault()
      console.log('hello')
      Meteor.call('scrapeOpenGraph', this.state.domain, function(error, result) {
        console.log('setting state')
        console.log(result)
        this.setState({contribution: result})
        console.log(this.state)
      }.bind(this))
      this.setState({domain: ''})
    }
  }

  handleContributionCancel = (e) => {
    e.preventDefault()
    Meteor.call('removeContribution', this.state.contribution)
    this.setState({domain: '', contribution: null})
  }

  handleContributionConfirm = (e) => {
    e.preventDefault()
    //add tags to Collection
    Meteor.call('attachTags', this.state.contribution, this.state.tags)
    this.setState({snackbarOpen: true, domain: '', contribution: null})
    Meteor.call('confirmContribution', this.state.contribution, function(error, result) {
      if (error) {
        console.log(error)
      } else {
        console.log(result)
      }
    })

  }

  handleTagSubmit = (e) => {
    e.preventDefault()
    console.log(this.state.tagText)
    console.log(e.key)
    if (e.key == ',' || e.key == 'Enter') {
      this.setState({tags: this.state.tags.concat([this.state.tagText])})
    this.setState({tagText: ''})
  }
  else {
    var tagText = this.state.tagText
    console.log(this.state.tagText + tagText)
    this.setState({tagText: tagText + e.key})
  }

  }

  handleTagType = (event, newValue) => {
    this.setState({tagText: newValue})
  }

  handleRemoveTag (tag, e)  {
    console.log(tag)
    var i = this.state.tags.indexOf(tag)
    console.log(i)
    console.log(this.state.tags)
    var newArray = this.state.tags.splice(i, 1)
    var newnewArray = this.state.tags.filter(function(i) {
      	return i != tag
      })
    console.log(newArray)
    console.log(newnewArray)
    this.setState({
      tags: newnewArray
    })

  }

  handleLinkOpen(url, eventId, today,  e) {
    e.preventDefault()
    Meteor.call('registerEventClick', eventId, today)
    console.log(url)
    window.open(url)
  }

  handleIndiegogoSearch = (e) => {
    var i
    console.log('hello lets run a search of indiegogo')
    var interestLength = this.props.user.interests.length
    for (i=0;i<interestLength;i++) {
      Meteor.call('indiegogoSearch', this.props.user.interests[i])
    }

  }

  renderSuggestions(today) {
    var i = 0
    var suggestions = []

    function getGetOrdinal(n) {
        var s=["th","st","nd","rd"],
        v=n%100;
        return n+(s[(v-20)%10]||s[v]||s[0]);
     }

    for (i = 0; i < this.props.user.suggestions[today].length; i++) {
      var event = this.props.user.suggestions[today][i]
      if (event && !event.crossed) {

        if (event.type === 'event')
        {
        suggestions.push(
              <Card onExpandChange={this.handleEventExpandChange.bind(this, event, today)}
                style={{marginTop: '10px', overflowX: 'hidden',
                    borderColor: event.starred? amber500 : null
                        }}
                initiallyExpanded={false}>
                <div style={{paddingTop: '10px'}}>
                  <div style={{paddingLeft: '10px'}}>Go to an interesting event...</div>
                  <Divider style={{marginTop: '10px'}}/>
                </div>
              <CardHeader
                title={event.title}
                style={{paddingRight: '0px'}}
                avatar={<Event/>}
                titleStyle={{marginRight: '-50px'}}
                showExpandableButton={false}
                actAsExpander={true}
              />
            <CardMedia onTouchTap={this.handleLinkOpen.bind(this,event.url, event._id, today)}
              style={{display: 'flex', justifyContent: 'center'}}
           >
             <img  style={styles.image} src={event.image? event.image : event.logo? event.logo : '/images/eventdefault.jpg'} alt="" />
           </CardMedia>
           <CardText expandable={false} style={{paddingTop: '0px', paddingBottom: '0px'}}>
             <div style={{display: 'flex'}}>
               <div style={{flex: 3, paddingRight: '5px'}}>
                 <AccessTime/>
                  {moment(event.start).format("HH:mm") + ', ' + getGetOrdinal(moment(event.start).format("D")) + ' ' + moment(event.start).format("MMM")}
               </div>
               <div style={{flex: 4, paddingLeft: '5px'}}>
                 <LocationOn/>
                 {event.venue && event.venue.name ? event.venue.name : 'Not yet clear'}
               </div>
             </div>
           </CardText>
           <CardText expandable={true}>
             <div dangerouslySetInnerHTML={{ __html: event.description ? event.description.replace(/<img[^>]*>/g,"") : 'Description missing'}}/>
           </CardText>
           <CardActions showExpandableButton={true} >
             <IconButton  onTouchTap={this.handleEventStar.bind(this, event, today)}>
               {event.starred ? <StarRate color={amber500}/> : <StarBorder color={grey500}/>}
             </IconButton>
             <IconButton onTouchTap={this.handleEventCross.bind(this, event, today)}>
               <Clear color='red'/>
             </IconButton>
          </CardActions>
        </Card>
        )
      } else if (event.source === 'contribution') {
        suggestions.push(
              <Card onExpandChange={this.handleEventExpandChange.bind(this, event, today)}
                style={{marginTop: '10px', overflowX: 'hidden',
                    borderColor: event.starred? amber500 : null
                        }}
                initiallyExpanded={false}>

              <CardHeader
                title={event.title}
                avatar={<Accessibility/>}
                titleStyle={{marginRight: '-50px'}}
                actAsExpander={true}
              />
            <CardMedia onTouchTap={this.handleLinkOpen.bind(this,event.url, event._id, today)}
              style={{ display: 'flex', justifyContent: 'center'}}
           >
             <img  style={styles.image} src={event.image? event.image : '/images/eventdefault.jpg'} alt="" />
           </CardMedia>

           <CardText expandable={true}>
             <div>
               {event.description}
             </div>
           </CardText>
           <CardActions showExpandableButton={true} >
             <IconButton  onTouchTap={this.handleEventStar.bind(this, event, today)}>
               {event.starred ? <StarRate color={amber500}/> : <StarBorder color={grey500}/>}
             </IconButton>
             <IconButton onTouchTap={this.handleEventCross.bind(this, event, today)}>
               <Clear color='red'/>
             </IconButton>
          </CardActions>
        </Card>)
      }

      else if (event.type === 'science') {
        suggestions.push(
              <Card onExpandChange={this.handleEventExpandChange.bind(this, event, today)}
                style={{marginTop: '10px', overflowX: 'hidden',
                    borderColor: event.starred? amber500 : null
                        }}
                initiallyExpanded={false}>
              <div style={{paddingTop: '10px'}}>
                <div style={{paddingLeft: '10px'}}>Help fund some scientific research...</div>
                <Divider style={{marginTop: '10px'}}/>
              </div>
              <CardHeader
                title={event.title}
                avatar={<i className="fa fa-flask"></i>}
                titleStyle={{marginRight: '-50px'}}
                actAsExpander={true}
              />
            <CardMedia onTouchTap={this.handleLinkOpen.bind(this,event.url, event._id, today)}
              style={{ display: 'flex', justifyContent: 'center'}}
           >
             <img  style={styles.image} src={event.image? event.image : '/images/eventdefault.jpg'} alt="" />
           </CardMedia>

           <CardText expandable={true}>
             <div>
               {event.description}
             </div>
           </CardText>
           <CardActions showExpandableButton={true} >
             <IconButton  onTouchTap={this.handleEventStar.bind(this, event, today)}>
               {event.starred ? <StarRate color={amber500}/> : <StarBorder color={grey500}/>}
             </IconButton>
             <IconButton onTouchTap={this.handleEventCross.bind(this, event, today)}>
               <Clear color='red'/>
             </IconButton>
          </CardActions>
        </Card>)
      }

      else if (event.type === 'funding') {
        suggestions.push(
              <Card onExpandChange={this.handleEventExpandChange.bind(this, event, today)}
                style={{marginTop: '10px', overflowX: 'hidden',
                    borderColor: event.starred? amber500 : null
                        }}
                initiallyExpanded={false}>
              <div style={{paddingTop: '10px'}}>
                <div style={{paddingLeft: '10px'}}>Donate to a worthy cause or project...</div>
                <Divider style={{marginTop: '10px'}}/>
              </div>
              <CardHeader
                title={event.title}
                avatar={<i className="fa fa-flask"></i>}
                titleStyle={{marginRight: '-50px'}}
                actAsExpander={true}
              />
            <CardMedia onTouchTap={this.handleLinkOpen.bind(this,event.url, event._id, today)}
              style={{maxHeight: '200px', display: 'flex', justifyContent: 'center'}}
              mediaStyle={{maxHeight: '200px'}}
           >
             <img  style={styles.indiegogoImage} src={event.image? event.image : '/images/eventdefault.jpg'} alt="" />
           </CardMedia>
           {event.fundingProgress ?
           <CardText expandable={false}>
             <Subheader style={{paddingLeft: '0px'}}>
               Funding progress
             </Subheader>
             <div>
             <LinearProgress  mode="determinate" value={event.fundingProgress}/>
             </div>
             <div style={{textAlign: 'right', color: grey500, paddingTop:'10px'}}>
               {Math.round(event.fundingProgress)}% of ${event.goal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} raised so far
             </div>
           </CardText> : null}
           <CardText expandable={true}>
             <div>
               {event.description}
             </div>
           </CardText>
           <CardActions showExpandableButton={true} >
             <IconButton  onTouchTap={this.handleEventStar.bind(this, event, today)}>
               {event.starred ? <StarRate color={amber500}/> : <StarBorder color={grey500}/>}
             </IconButton>
             <IconButton onTouchTap={this.handleEventCross.bind(this, event, today)}>
               <Clear color='red'/>
             </IconButton>
          </CardActions>
        </Card>)
      }

      else if (event.type === 'group') {
        suggestions.push(
              <Card onExpandChange={this.handleEventExpandChange.bind(this, event, today)}
                style={{marginTop: '10px', overflowX: 'hidden',
                    borderColor: event.starred? amber500 : null
                        }}
                initiallyExpanded={false}>
                <div style={{paddingTop: '10px'}}>
                  <div style={{paddingLeft: '10px'}}>Meet some like-minded people...</div>
                  <Divider style={{marginTop: '10px'}}/>
                </div>
              <CardHeader
                title={event.title}
                avatar={<Group/>}
                titleStyle={{marginRight: '-50px'}}
                actAsExpander={true}
              />
            <CardMedia style={{ display: 'flex', justifyContent: 'center'}}
              onTouchTap={this.handleLinkOpen.bind(this,event.url, event._id, today)}

           >
             <img style={styles.image} src={event.image? event.image : '/images/eventdefault.jpg'} alt="" />
           </CardMedia>
           <CardText expandable={false} style={{paddingTop: '0px', paddingBottom: '0px'}}>
             <div style={{display: 'flex'}}>
               <div style={{flex: 3, paddingRight: '5px'}}>
                 <b>Number of members:</b> {event.members}
               </div>
             </div>
           </CardText>
           <CardText expandable={true}>
             <div>
               <div dangerouslySetInnerHTML={{ __html: event.description ? event.description.replace(/<img[^>]*>/g,"") : 'Description missing'}}/>
             </div>
           </CardText>
           <CardActions showExpandableButton={true} >
             <IconButton  onTouchTap={this.handleEventStar.bind(this, event, today)}>
               {event.starred ? <StarRate color={amber500}/> : <StarBorder color={grey500}/>}
             </IconButton>
             <IconButton onTouchTap={this.handleEventCross.bind(this, event, today)}>
               <Clear color='red'/>
             </IconButton>
          </CardActions>
        </Card>)
      }
        if (event.seen !== true) {
          break;
        }
      }
    }

/*

    for (i = 0; i < 5 ; i++) {
      var event = this.props.user.eventSuggestions[today][i]
      var meetup = this.props.user.meetupSuggestions[today][i]
      if (event && !event.seen) {
        suggestions.push(
              <Card onExpandChange={this.handleEventExpandChange.bind(this, event, today)}
                style={{margin: '16px', overflowX: 'hidden', borderRadius: '10px',
                   border: event.starred ? '2px solid' : null, borderColor: event.starred? amber500 : null
                        }}
                initiallyExpanded={false}>
              <CardHeader
                title={event.eventInfo.name.text}
                avatar={event.eventInfo.logo? event.eventInfo.logo.url : '/images/eventdefault.jpg'}
                actAsExpander={true}
              />
              <CardMedia
                expandable={true}
           >
             <img  src={event.eventInfo.logo? event.eventInfo.logo.url : '/images/eventdefault.jpg'} alt="" />
           </CardMedia>
           <CardText expandable={true}>
             <div dangerouslySetInnerHTML={{ __html: event.eventInfo.description.html ? event.eventInfo.description.html.replace(/<img[^>]*>/g,"") : 'Description missing'}}/>
           </CardText>
           <CardActions showExpandableButton={true} >
             <IconButton  onTouchTap={this.handleEventStar.bind(this, event, today)}>
               <StarRate color={amber500}/>
             </IconButton>
             <IconButton onTouchTap={this.handleEventCross.bind(this, event, today)}>
               <Clear color='red'/>
             </IconButton>
          </CardActions>
        </Card>
        )

        break;
      }
      if (event && event.seen && !event.crossed) {
        suggestions.push(
              <Card onExpandChange={this.handleEventExpandChange.bind(this, event, today)}
                style={{margin: '16px', overflowX: 'hidden', borderRadius: '10px'
                , border: event.starred ? '2px solid' : null, borderColor: event.starred? amber500 : null}}
                initiallyExpanded={false}>
              <CardHeader
                title={event.eventInfo.name.text}
                avatar={event.eventInfo.logo? event.eventInfo.logo.url : '/images/eventdefault.jpg'}
                actAsExpander={true}
              />
              <CardMedia
                expandable={true}
           >
             <img  src={event.eventInfo.logo? event.eventInfo.logo.url : '/images/eventdefault.jpg'} alt="" />
           </CardMedia>
           <CardText expandable={true}>
             <div dangerouslySetInnerHTML={{ __html: event.eventInfo.description.html ? event.eventInfo.description.html.replace(/<img[^>]*>/g,"") : 'Description missing'}}/>
           </CardText>
           <CardActions showExpandableButton={true} >
             <IconButton  onTouchTap={this.handleEventStar.bind(this, event, today)}>
               <StarRate color={amber500}/>
             </IconButton>
             <IconButton onTouchTap={this.handleEventCross.bind(this, event, today)}>
               <Clear color='red'/>
             </IconButton>
          </CardActions>
        </Card>
        )

      }
        if (meetup && !meetup.seen) {
          suggestions.push(
                <Card onExpandChange={this.handleMeetupExpandChange.bind(this, meetup, today)}
                  style={{margin: '16px', overflowX: 'hidden', borderRadius: '10px'
                  , border: event.starred ? '2px solid' : null, borderColor: event.starred? amber500 : null}}
                  initiallyExpanded={false}>
                  <CardHeader
                    title={meetup.meetupInfo.name}
                    avatar={this.getMeetupImageURL(meetup.meetupInfo.description) ? this.getMeetupImageURL(meetup.meetupInfo.description)
                              : '/images/eventdefault.jpg'}
                    actAsExpander={true}
                  />
                <CardMedia expandable={true}
             >
               <img src={this.getMeetupImageURL(meetup.meetupInfo.description) ? this.getMeetupImageURL(meetup.meetupInfo.description)
                         : '/images/eventdefault.jpg'} alt="" />
             </CardMedia>

             <CardText expandable={true}>
               <div dangerouslySetInnerHTML={{ __html: meetup.meetupInfo.description ? meetup.meetupInfo.description.replace(/<img[^>]*>/g,"") : 'Description missing'}}/>
             </CardText>
             <CardActions showExpandableButton={true}>
               <IconButton  onTouchTap={this.handleMeetupStar.bind(this, meetup, today)}>
                 <StarRate color={amber500}/>
               </IconButton>
               <IconButton onTouchTap={this.handleMeetupCross.bind(this, meetup, today)}>
                 <Clear color='red'/>
               </IconButton>
            </CardActions>
          </Card>
          )

          break;

        }
        if (meetup && meetup.seen && !meetup.crossed) {
          suggestions.push(
                <Card onExpandChange={this.handleMeetupExpandChange.bind(this, meetup, today)}
                  style={{margin: '16px', overflowX: 'hidden', borderRadius: '10px', border: event.starred ? '2px solid' : null, borderColor: event.starred? amber500 : null}}
                  initiallyExpanded={false}>
                  <CardHeader
                    title={meetup.meetupInfo.name}
                    avatar={this.getMeetupImageURL(meetup.meetupInfo.description) ? this.getMeetupImageURL(meetup.meetupInfo.description)
                              : '/images/eventdefault.jpg'}
                    actAsExpander={true}
                  />
                <CardMedia expandable={true}
             >
               <img src={this.getMeetupImageURL(meetup.meetupInfo.description) ? this.getMeetupImageURL(meetup.meetupInfo.description)
                         : '/images/eventdefault.jpg'} alt="" />
             </CardMedia>

             <CardText expandable={true}>
               <div dangerouslySetInnerHTML={{ __html: meetup.meetupInfo.description ? meetup.meetupInfo.description.replace(/<img[^>]*>/g,"") : 'Description missing'}}/>
             </CardText>
             <CardActions showExpandableButton={true} >
               <IconButton  onTouchTap={this.handleMeetupStar.bind(this, meetup, today)}>
                 <StarRate color={amber500}/>
               </IconButton>
               <IconButton onTouchTap={this.handleMeetupCross.bind(this, meetup, today)}>
                 <Clear color='red'/>
               </IconButton>
            </CardActions>
          </Card>
          )

        }

      }
      */

    return (
      <div>
        {suggestions}
      </div>
    )
  }

  getNextSuggestion(today) {
    var suggestionLength = this.props.user.suggestions[today].length

    var i
    for (i=0; i< suggestionLength; i++) {
      var event = this.props.user.suggestions[today][i]
      if (!event.seen) {
        Meteor.call('markEventSeen', event, today)
        break;
      }

    }
  }

  render() {
    console.log(this.state)

    if (this.props.user && this.props.user.justAddedPledge) {
      Meteor.call('resetJustAddedPledge')
    }

    var today = new Date()
    var yesterday = new Date(today.getTime() - (24*60*60*1000))
    today = today.toISOString().slice(0,10).replace(/-/g,"")
    yesterday = yesterday.toISOString().slice(0,10).replace(/-/g,"")

    var contributionCollection
    if (this.state.contribution ) {
      contributionCollection = Contributions.findOne({_id: this.state.contribution})
    }

    const inputProps = {
      value: this.state.address,
      onChange: this.onChange,
    }

    return (
      <div>
        {this.props.loading ? <div style={{height: '80vh', width: '100%',
                                              display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <CircularProgress/>
        </div> :
        Meteor.userId() === null ?
        <div style={{height: '80vh', margin: '10px', boxSizing: 'border-box', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexDirection: 'column', backgroundColor: grey200}}>
          <div style={{textAlign: 'center', width: '90%', backgroundColor: 'white', padding: '16px', margin: '16px', borderRadius: '5px'}}>
            Suggestions of things you can do, and communities you can join, taken from all over the internet. <br/><br/>New, every day.
          </div>
          <div style={{textAlign: 'center', width: '90%', backgroundColor: 'white', padding: '16px', margin: '16px', borderRadius: '5px'}}>
            <p>Find events to go to</p>
            <p>Campaigns to be a part of</p>
            <p>Fundraisers to contribute to</p>
            <p>Like-minded people to meet</p>
          </div>
          <div style={{margin: '16px'}}>
            <RaisedButton backgroundColor="#3b5998" labelColor='white' label='Log in with Facebook' onTouchTap={this.handleFacebookLogin}/>
          </div>

        </div> :
        <div>
          <div style={{display: 'flex'}}>
          <Subheader style={{flex: 1, display: 'inline-flex'}}>
            Suggestions
          </Subheader>
        <div style={{width: 'auto'}}>
          <div style={{display: 'inline-flex'}}>
            <Chip
              onTouchTap = {this.handleEditInterests}
              style={styles.optionCip}
            >...</Chip>
        </div>
        {this.props.user.location ?
        <div style={{display: 'inline-flex'}}>
          <Chip
            style={styles.optionChip}
            backgroundColor={amber200}
            onTouchTap={this.handleLocationEditOpen}
          >
          {this.props.user.location.address.length > 10 ? this.props.user.location.address.substring(0,10) + '...' :
          this.props.user.location.address}
        </Chip>
      </div> : null}
      </div>
      </div>
          {this.props.user.interests && this.props.user.interests.length > 0 && 1===2?
            <div>
              {this.props.user.interests.slice(0, Math.min(this.props.user.interests.length , 2)).map(
                (each) => (
                <div style={{float: 'left'}}>
                <Chip
                  onRequestDelete={this.handleRequestDelete.bind(this, each)}
                  style={styles.chip}
                >
                  {each}
                </Chip>
                </div>
              ))}
              <div style={{float: 'left'}}>
                <Chip
                  onTouchTap = {this.handleEditInterests}
                  style={styles.chip}
                >...</Chip>
            </div>
            </div> :
            <div/>
          }

          {!this.props.user.interests || this.props.user.interests.length === 0 || this.state.interestsSet ?
            <div>

              <Subheader style={{width: '100%', display: 'inline-block'}}>
                What do you want to fix?
              </Subheader>
              <div>
              {this.props.interestList.map((interest) => (
                ((this.props.user.interests && !this.props.user.interests.includes(interest.interest)) || !this.props.user.interests) ?
                <div style={{marginLeft: '5px', float: 'left'}}>
                  <Chip style={styles.chip} backgroundColor={blue50} onTouchTap={this.handleAddInterest.bind(this, interest.interest, true)}>
                    {interest.interest}
                  </Chip>
                </div> : null
              ))}
              </div>
              <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
              <IconButton onTouchTap={this.handleInterestsSet}>
                <KeyboardArrowDown/>
              </IconButton>
              </div>
            </div> : null
            }

          {this.props.user.interests && this.state.interestsSet === false &&
            this.props.user.interests.length > 0 && !this.props.user.location ?
            <div>
              <Subheader style={{display: 'inline-block'}}>
                Where do you live/spend your time?
              </Subheader>
              <div style={{paddingLeft: '16px', paddingRight: '16px'}}>
              <PlacesAutocomplete inputProps={inputProps} onSelect={this.handleSelect} />
              </div>
            </div> :
            null
          }

          <div style={{display: 'flex', justifyContent: 'center', overflowY: 'scroll', backgroundColor: grey200}}>
          <div ref='box' style={{backgroundColor: grey200
            , height: 'calc(100vh - 166px)'
            , maxWidth: '400px',width: '100%' }}>

          {this.props.user.interests && this.props.user.location ?


          <div style={{width: '100%', textAlign: 'center', marginTop: '16px', color: 'grey'}}>
            <hr style={{marginLeft: 'auto', marginRight: 'auto', width: '40%'
              , float: 'left', marginTop: '10px', marginBottom: '10px', borderTop: '1px solid grey'}}/>
            Yesterday
            <hr style={{marginLeft: 'auto', marginRight: 'auto', width: '40%'
              , float: 'right', marginTop: '10px', marginBottom: '10px', borderTop: '1px solid grey'}} />
        </div>

            : null}
          {this.props.user.suggestions && this.props.user.suggestions[yesterday] ? this.renderSuggestions(yesterday) :
          this.props.user.interests && this.props.user.location ?
          <div style={styles.message}>
            Sorry, it doesn't look like you checked in yesterday. We can sort you out today though.
          </div> : null}

          {this.props.user.interests && this.props.user.location ?
            <div>
              <div style={{width: '100%', textAlign: 'center', color: 'grey', marginTop: '16px'}}>
                  <hr style={{marginLeft: 'auto', marginRight: 'auto', width: '40%', float: 'left', marginTop: '10px', marginBottom: '10px', borderTop: '1px solid grey'}}/>
                  Today
                  <hr style={{marginLeft: 'auto', marginRight: 'auto', width: '40%', float: 'right', marginTop: '10px', marginBottom: '10px', borderTop: '1px solid grey'}} />
              </div>
          <div style={styles.message}>
            We've got some suggestions for you. <br/>Just click cross if you're not a fan. Star if you are.
          </div>
          </div>: null}
          {this.state.findingMore ?
            <Card style={{display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '16px',
                          borderRadius: '10px', padding: '16px'}}>
              <CircularProgress/>
            </Card> :
            null}
          {this.props.user.suggestions && this.props.user.suggestions[today] ? this.renderSuggestions(today) : null}
          {this.props.user.interests && this.props.user.interests.length > 0 &&
            !this.state.interestsSet && this.props.user.location && (!this.props.user.suggestions || !this.props.user.suggestions[today])
            || this.props.user._id === 'msfgNtu67nrevfX6c' || this.props.user._id === 'p6ZQiT9b7iWKcyL9D'
            ?
            <div style={{width: '100%', boxSizing: 'border-box', paddingLeft: '16px', paddingRight: '16px', marginBottom: '16px'}}>
              <RaisedButton fullWidth={true} primary={true}
                label='Update my suggestions' onTouchTap={this.handleMoreSuggestions}/>
            </div>
            : null
          }
          {this.props.user.suggestions && this.props.user.suggestions[today] && this.props.user.suggestions[today][7] && !this.props.user.suggestions[today][7].seen ?
          <div style={{display: 'flex', width: '100%', justifyContent: 'center'}}>
            <IconButton
              style={{backgroundColor: 'white', borderRadius: '40px', marginBottom: '10px', marginTop: '10px'}}
              onTouchTap={this.getNextSuggestion.bind(this, today)}>
              <KeyboardArrowDown/>
            </IconButton>
          </div> : null
          }
          {this.props.user.suggestions && this.props.user.suggestions[today] && this.props.user.suggestions[today][7] && this.props.user.suggestions[today][7].seen ?
            <div style={styles.message}>
              That's all for today, come back tomorrow for more though
            </div> : null
          }
          {this.state.contribution ?
            <div>
              <Subheader style={{backgroundColor:'white'}}>
                Suggestions you have made
              </Subheader>
              <div>
                <Card style={{margin: '16px', overflowX: 'hidden', borderRadius: '10px'}}>
                  <CardHeader
                    title={contributionCollection.title}

                  />
                  <CardMedia>
                    <img src={contributionCollection.image}/>
                  </CardMedia>
                  <CardText style={{color: grey500}}>
                    {contributionCollection.description}
                  </CardText>
                  <Divider/>
                  <Subheader>
                    Add topic/category tags
                  </Subheader>
                  <div style={{ paddingLeft: '16px', paddingRight: '16px'}}>
                  {this.state.tags ? this.state.tags.map(
                    (tag) => (
                      <div style={{float: 'left', marginBottom: '5px'}}>
                      <Chip

                        onRequestDelete={this.handleRemoveTag.bind(this, tag)}
                        >
                        {tag}
                      </Chip>
                      </div>
                    )
                  ) : null}
                  </div>
                  <div style={{width: '100%', paddingLeft: '16px', paddingRight: '16px'}}>
                  <TextField
                    hintText='Type each tag separated by a comma'
                    fullWidth={true}
                    multiLine={true}
                    onChange={this.handleTagType}
                    onKeyPress={this.handleTagSubmit}
                    value={this.state.tagText}
                  />
                </div>
                  <CardActions>
                    <FlatButton secondary={true} label='Cancel' onTouchTap={this.handleContributionCancel}/>
                    <FlatButton primary = {true} label='Confirm' onTouchTap={this.handleContributionConfirm}/>
                  </CardActions>
                </Card>
              </div>


            </div> : null}
            {this.props.user.interests && this.props.user.location ?
            <div style={{paddingLeft: '16px', boxSizing: 'border-box', backgroundColor: 'white'}}>
            <div style={{width: '100%', display: 'flex'}}>
            <Subheader style={{paddingLeft: '0px', height: '30px', width: '80%'}}>
              Or add a suggestion for other people
            </Subheader>
            <Infoicon text='If you know of an event, campaign, cause or even just an interesting article, copy it in here and we will suggest it to people'/>
            </div>

            <TextField
              multiLine={true}
              hintText='Link to campaign'
              onChange = {this.handleLinkEnter}
              value={this.state.domain}
              onKeyPress={this.handleKeyPress}
              />
          </div> :null}

          </div>
        </div>
          <Dialog
            title="Edit your interests"
              actions={[
                <FlatButton label='Confirm' onTouchTap={this.handleEditInterestClose}/>
              ]}
              modal={false}
              autoScrollBodyContent={true}
              open={this.state.editInterestOpen}
              onRequestClose={this.handleEditInterestClose}
                              contentStyle={{width: "95%", maxWidth: "none"}}
            >
            <div>
            {this.props.user.interests && this.props.user.interests.length > 0 ?
              <div>
                {this.props.user.interests.map((each) => (
                  <div style={{float: 'left'}}>
                  <Chip
                    onRequestDelete={this.handleRequestDelete.bind(this, each)}
                    style={styles.chip}
                  >
                    {each}
                  </Chip>
                  </div>
                ))}
              </div>
              : null}



                  <Subheader style={{width: '100%', display: 'inline-block'}}>
                    What do you want to fix?
                  </Subheader>
                  <div>
                  {this.props.interestList.map((interest) => (
                    (this.props.user.interests && !this.props.user.interests.includes(interest.interest)) ?
                    <div style={{marginLeft: '5px', float: 'left'}}>
                      <Chip style={styles.chip} backgroundColor={blue50} onTouchTap={this.handleAddInterest.bind(this, interest.interest, false)}>
                        {interest.interest}
                      </Chip>
                    </div> : null
                  ))}
                  </div>
                  <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                  </div>
                </div>

            </Dialog>

            <Dialog
              title="Change your location"
                actions={[
                  <FlatButton label='Confirm' onTouchTap={this.handleLocationEditClose}/>
                ]}
                modal={false}
                open={this.state.locationOpen}
                onRequestClose={this.handleLocationEditClose}

                style={{paddingTop: '0px'}}

                contentStyle={{width: "95%", maxWidth: "none"}}
              >


                <div>
                  <Subheader style={{display: 'inline-block'}}>
                    Where do you live/spend your time?
                  </Subheader>
                  <div style={{paddingLeft: '16px', paddingRight: '16px', height: '300px'}}>
                  <PlacesAutocomplete inputProps={inputProps} onSelect={this.handleSelect} />
                  </div>
                </div>

              </Dialog>

              <Snackbar
                open={this.state.snackbarOpen}
                message={'Your contribution has been duly noted'}
                autoHideDuration={3000}
                onRequestClose={this.handleSnackbarClose}
              />



        </div>


    }

    </div>
    )
  }
}

Community.propTypes = {
  loading: PropTypes.bool.isRequired,
  pledgeThreads: PropTypes.array,
  interestList: PropTypes.array,
  contributions: PropTypes.array,
}

export default createContainer(() => {
  const subscriptionHandler = Meteor.subscribe("threadList");
  const pledgeThreadHandler = Meteor.subscribe("pledgeThreadList");
  const myPledgeHandler = Meteor.subscribe("myPledges");
  const userData = Meteor.subscribe("userData");
  const interestData = Meteor.subscribe("interestList");
  const contributionData = Meteor.subscribe("myContributions");

  return {
    user: Meteor.users.findOne({_id: Meteor.userId()}),
    contributions: Contributions.find({}).fetch(),
    pledges: Pledges.find({title: {$ne: 'Untitled Pledge'}}).fetch(),
    interestList: Interests.find({}).fetch(),
    loading: !subscriptionHandler.ready() || !myPledgeHandler.ready() || !userData.ready() || !contributionData.ready(),
  };
}, Community);
