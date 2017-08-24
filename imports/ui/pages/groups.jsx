import React , {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Pledges, Details} from '/imports/api/pledges.js';
import {Reviews} from '/imports/api/reviews.js';
import {List, ListItem} from 'material-ui/List';
import ReactStars from 'react-stars';
import TextField from 'material-ui/TextField';
import {grey200, grey500, grey100, amber500, blue200} from 'material-ui/styles/colors';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import Subheader from 'material-ui/Subheader';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import {Link, browserHistory} from 'react-router';
import IconButton from 'material-ui/IconButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Map from '/imports/ui/components/map.jsx'

const styles = {
  box: {
    backgroundColor: grey200,
    padding: '10px'
  },
  header: {
    backgroundColor: 'white',
    fontSize: '20pt',
    fontWeight: 'bold',
    padding: '10px',
  },
  cardTitle: {
    display: 'flex',
    marginTop: '10px'
  },
  bigTitle: {
    width: '50%',
    fontStyle: 'italic',
    color: grey500
  },
  currentCommitments: {
    textAlign: 'center',

  },
  targetCommitments: {
    textAlign: 'center'
  },
  smallIcon: {
     width: 24,
     height: 24,
     color: 'white',
   },
   small: {
     width: 36,
     height: 36,
     padding: '4px 4px 4px 20px'
   },
     toggle: {
    marginBottom: 16,
  },

}

const position = [51.505, -0.09];



export class Groups extends React.Component{
  constructor(props) {
    super(props);
    console.log(this.props)
    this.state = {markers: [[51.5055, -0.091], [51.5015, -0.089], [51.5015, -0.087]]
      , filters: [], details: {}, locationChoice: ''}
  }


  componentWillReceiveProps(nextProps) {
    var userResponses = {}
    if (!nextProps.loading) {
      var details = nextProps.details
      console.log(details)
      for (var i in details) {
        userResponses[details[i].question] = {}
        for (var j in details[i].members) {
          var response
          if (typeof details[i].members[j].response === 'object' && details[i].members[j].response !== null) {
            response = details[i].members[j].response.place
          } else {
            response = details[i].members[j].response
          }
          userResponses[details[i].question][details[i].members[j].userId] = response
        }
      }
    }
    console.log(userResponses)
    this.setState({data: userResponses})

  }

  handleBackClick = (e) => {
    e.preventDefault()
    browserHistory.push('/pages/pledges/' + this.props.params.pledge +'/' + this.props.params._id)
  }

  handleChange  (question, event, key, value)  {
    var currentState = this.state.details[question] ? this.state.details[question] : {}
    var currentDetails = this.state.details
    currentState.equal = value
    currentDetails[question] = currentState
    this.setState({[question]: currentState})
    if (!this.state.filters.includes(question)) {
      this.setState({filters: this.state.filters.concat([question])});
    }
  }


  handleChoice  (question, event, key, value)  {
    var currentState = this.state.details[question] ? this.state.details[question] : {}
    var currentDetails = this.state.details
    currentState.choice = value
    currentDetails[question] = currentState
    this.setState({details: currentDetails})
    if (!this.state.filters.includes(question)) {
      this.setState({filters: this.state.filters.concat([question])});
    }

  }

  handleLocationChange = (event, key, value) => {
    this.setState({locationChoice: value})
  }

  handleFindGeoMatching = (json) => {
    this.setState({json: json})
    var users = []
    console.log(json.features)
    var overallUsers
    if (json.features.length > 0 && this.state.filters.length) {
      console.log('first option')
      Meteor.call('findMatching', json, this.state.locationChoice, this.props.params._id, (err, result) => {
        if (err) {
          console.log(err.reason)
        } else {
          for (var i in result) {
            users.push(result[i].userId)
          }
          this.setState({geographyUsers: users})
          Meteor.call('findRelevantUsers', this.state.filters, this.state.details, (err, response) => {
            if (err) {
              console.log(err.reason)
            } else {
              this.setState({detailUsers: response})
              overallUsers = users.filter(function(n) {
                return response.indexOf(n) !== -1;
              });
              this.setState({overallUsers: overallUsers})
            }
          })
        }
      })
    } else if (this.state.filters.length) {
      console.log('second option')
      Meteor.call('findRelevantUsers', this.state.filters, this.state.details, (err, response) => {
        if (err) {
          console.log(err.reason)
        } else {
          this.setState({detailUsers: response})
          if (users) {
            overallUsers = users.filter(function(n) {
              return response.indexOf(n) !== -1;
            });
          } else {
            overallUsers = response
          }
          this.setState({overallUsers: response})
        }
      })
    } else {
      console.log('third option')
      Meteor.call('findMatching', json, this.state.locationChoice, this.props.params._id, (err, result) => {
        if (err) {
          console.log(err.reason)
        } else {
          for (var i in result) {
            users.push(result[i].userId)
          }
          console.log(users)
          this.setState({geographyUsers: users, overallUsers: users})
        }
      })
    }

    console.log(this.state)

    console.log(overallUsers)
  }

  handleFindRelevantDetails = () => {
    Meteor.call('findRelevantUsers', this.state.data)
  }

  handleMapClick = (e) => {
    var current = this.state.markers
    current.push([e.latlng.lat,e.latlng.lng])
    this.setState({markers: current})
    console.log(this.state)

  }

  runThroughFilters = () => {
    for (var i in this.state.filters) {

    }
  }

  executeFilter = () => {
    var geoUsers
    Meteor.call('findRelevantUsers', this.state.filters, this.state.details, (err, result) => {
      if (err) {
        console.log(err.reason)
      } else {
        console.log('Relevant users from details:')
        this.setState({detailUsers: result})
        geoUsers = result
        console.log(result)
      }
    })
    console.log(geoUsers)
    return (geoUsers)
  }

  handleMakeGroup = (e) => {
    e.preventDefault()
    Meteor.call('saveGroupCriteria', this.state.details, this.state.locationChoice
    , this.state.json, this.state.filters, this.props.params._id)
    console.log('ues roles package to assign users from state to certain role group')
    Meteor.call('addUsersToPledgeGroup', this.state.overallUsers, this.state.groupName, this.props.params._id)
    Meteor.call('addNameToPledgeRoles' , this.state.groupName, this.props.params._id)
  }

  handleChangeGroupName = (e, newValue) => {
    this.setState({groupName: newValue})
  }


  render () {


    return (
      <div>
        <span onTouchTap={this.handleBackClick}>
        <div style={{display: 'flex' ,backgroundColor: grey500, color: 'white'}}>
                  <IconButton
            iconStyle={styles.smallIcon}
            style={styles.small}
          >
            <ArrowBack />
          </IconButton>

        <div style={{width: '100%', paddingLeft: '16px', backgroundColor: grey500, color: 'white', alignItems: 'center', display: 'flex'}}>

          BACK TO PLEDGE
        </div>
        </div>
      </span>
        <Subheader style={{backgroundColor: 'white'}}>
          Create a User Group
        </Subheader>
        <div>
        {this.props.loading ? null :

        <div style={styles.box}>
          <div style={{backgroundColor: 'white'}}>

            {this.props.details.map((detail) => (
              (detail.type !== 'location') ?
              <div>
              <Subheader>
                {detail.question}
              </Subheader>
              <div style={{display: 'flex'}}>
                <DropDownMenu value={this.state.details[detail._id] ? this.state.details[detail._id].equal: 'equal'} onChange={this.handleChange.bind(this, detail._id)}>
                  <MenuItem value='equal' primaryText='Equals'/>
                  <MenuItem value='notEqual' primaryText="Not equal to"/>
                </DropDownMenu>
                {detail.options ?
                  <div style={{display: 'flex'}}>
                <DropDownMenu value={this.state.details[detail._id] ? this.state.details[detail._id].choice : ''}
                        onChange={this.handleChoice.bind(this, detail._id)}>
                  {detail.options.map((response) => (
                    <MenuItem value={response} primaryText={response}/>
                  ))}
                </DropDownMenu>
              </div> :
                <TextField hintText = 'Type Response' />
              }
              </div>
              </div>
            : null) )}


          <Subheader>
            Filter by location
          </Subheader>

          <DropDownMenu value={this.state.locationChoice} onChange={this.handleLocationChange}>

              <MenuItem value='user' primaryText='User Location'/>

                {this.props.details.map((detail) => (
                (detail.type === 'location') ?
                <MenuItem value={detail._id} primaryText={detail.question}/>
                : null
                ))}


          </DropDownMenu>



          <Map locationChoice={this.state.locationChoice}
            findGeoMatching={this.handleFindGeoMatching}/>


          <div>
            Payment status
          </div>

          <div>
            Role Existing Groups
          </div>
          <div>
            {this.state.overallUsers ?
              <div>
              <Subheader style={{backgroundColor: 'white'}}>
                <b>{this.state.overallUsers.length}</b> matched users
              </Subheader>
              <div>
              {this.state.overallUsers.map((user) => (
              <ListItem style={{backgroundColor: 'white'}}
                primaryText={Meteor.users.findOne({_id: user}).profile.name}
                rightIcon={<a target="_blank" href={'/profile/' + user}>View</a>}
              />
          ))}
            </div>
            </div>
             : null}
          </div>
          </div>
          <TextField hintText='Give this user group a name' onChange={this.handleChangeGroupName}/>
          <RaisedButton label='Save Group' onTouchTap={this.handleMakeGroup}/>
        </div>
      }

      </div>
      </div>
    )
  }
}

Groups.propTypes = {
  pledge: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe("editor", params._id);
  const reviewHandler = Meteor.subscribe("pledgeReviews", params._id);
  const detailHandler = Meteor.subscribe("details", params._id);
  const pledgeUserHandler = Meteor.subscribe("pledgeUsers", params._id);
  const roleHandler = Meteor.subscribe("pledgeRoles", params._id);

  return {
    loading: !subscriptionHandler.ready() || !reviewHandler.ready()
    || !detailHandler.ready() || !pledgeUserHandler.ready(),
    pledge: Pledges.find({_id: params._id}).fetch()[0],
    reviews: Reviews.find({type: 'volunteer'}).fetch(),
    users: Meteor.users.find({}).fetch(),
    details: Details.find({}).fetch(),
    roles: Meteor.roles.find({}),
  };
}, Groups);
