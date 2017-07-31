import React , {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500, blue200} from 'material-ui/styles/colors'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField'
import LinearProgress from 'material-ui/LinearProgress';
import {Pledges} from '/imports/api/pledges.js';
import {Projects} from '/imports/api/projects.js';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Session } from 'meteor/session';
import FacebookProvider, { Comments } from 'react-facebook';
import Dialog from 'material-ui/Dialog';
import {Link, browserHistory} from 'react-router'
import {Threads} from '/imports/api/threads.js';
import ReactHelpers from 'react-helpers';
import InfoIcon from '/imports/ui/components/infoicon.jsx';
import IconButton from 'material-ui/IconButton';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import Toggle from 'material-ui/Toggle';
import Subheader from 'material-ui/Subheader';
import {List, ListItem} from 'material-ui/List';
import {
  Step,
  Stepper,
  StepLabel,
  StepContent,
} from 'material-ui/Stepper';
import Refresh from 'material-ui/svg-icons/navigation/refresh';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';

var removeMd = require('remove-markdown')

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
  chip: {
        margin: 4,
      },

}

export class Admin extends React.Component{
  constructor(props) {
    super(props);
    console.log(this.props)
    this.state = {preferences: [], pledge: {}, dataSource: [], list: [], refinedList:[]}
  }

  componentWillReceiveProps(nextProps) {
    if(!nextProps.loading) {
      var names = []
      for (var i in nextProps.users) {
        names.push(nextProps.users[i].profile.name)
      }
      this.setState({dataSource: names})
    }
  }

  handleClose = () => {
  this.setState({open: false});
};


  handleDialogClick(link, e) {
    window.open(link)
  }

  handleRequestDelete(interest, e) {
    this.state.preferences.slice(this.state.preferences.indexOf(interest), 1)
    Meteor.call('removeSkill', interest)
  }

  pickUser = (text) => {
    this.setState({list: this.state.list.concat([text])})
  }

  selectUserProperly(user) {
    this.setState({refinedList: this.state.refinedList.concat([user._id])})
  }

  removeUser(id) {
    var array = this.state.refinedList;
    var index = array.indexOf(id)
    array.splice(index, 1);
    this.setState({refinedList: array });
  }

  addToGroup (hi) {
    Meteor.call('changeUserRole', this.state.refinedList, hi)
  }

  render() {
    console.log(this.state)

    return(
      <div>

          <div style={styles.box}>
            {this.props.loading ? null :
            <Card style={{padding: '16px'}}>
              <div >

              </div>

                <div>
              <div style={{width: '100%'}}>
              <AutoComplete
                hintText="Look for a name"
                fullWidth={true}
                searchText = {this.state.searchText}
                dataSource={this.state.dataSource}
                onNewRequest={this.pickUser}
                onUpdateInput={(searchText, dataSource) => {this.setState({searchText: searchText})}}
              />
              </div>
            <List>
            {this.props.users.map((user) => (
              (this.state.list && this.state.list.includes(user.profile.name)) ?
              <ListItem primaryText={user.profile.name} secondaryText={user.profile.email}
                onTouchTap={this.selectUserProperly.bind(this, user)}
                /> : null
            ))}
          </List>

          <Divider/>
          <Subheader>
            Users selected
          </Subheader>
          <List>
            {this.props.users.map((user) => (
              (this.state.refinedList && this.state.refinedList.includes(user._id)) ?
              <ListItem primaryText={user.profile.name} secondaryText={user.profile.email}
                onTouchTap={this.removeUser.bind(this, user._id)}
                /> : null
            ))}
          </List>

          <Subheader>
            Add to admin
          </Subheader>
          <FlatButton label='Add to group' onTouchTap={this.addToGroup.bind(this, 'admin')}/>

              </div>


            </Card>

          }
          </div>


        </div>

      );
    }
  }





Admin.propTypes = {
  loading: PropTypes.bool.isRequired,

};

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe("userScores");


  return {
    loading: !subscriptionHandler.ready(),
    users: Meteor.users.find({_id: Meteor.userId()}).fetch(),
  };
}, Admin);
