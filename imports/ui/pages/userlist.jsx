import React , {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Pledges, Details} from '/imports/api/pledges.js';
import {Reviews} from '/imports/api/reviews.js';
import {List, ListItem} from 'material-ui/List';
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
import Loadable from 'react-loadable';

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

const Loading = () => (
  <div/>
)

const EmojiLoadable = Loadable({
  loader: () => import('/imports/ui/components/countryemoji.jsx'),
  loading: Loading
});


export class UserList extends React.Component{
  constructor(props) {
    super(props);
    console.log(this.props)
    this.state ={emailArray: {}, smsArray: {}, oneSignalArray: {}, messengerArray:{}}
  }


  componentWillReceiveProps(nextProps) {

    var userResponses = {}
    if (!nextProps.loading) {
      Meteor.call('whosGotEmail', nextProps.users, (err, response) => {
        this.setState({emailArray: response})
      })
      Meteor.call('whosGotSMS', nextProps.users, (err, response) => {
        this.setState({smsArray: response})
      })
      Meteor.call('whosGotOneSignal', nextProps.users, (err, response) => {
        this.setState({oneSignalArray: response})
      })
      Meteor.call('whosGotMessenger', nextProps.users, (err, response) => {
        this.setState({messengerArray: response})
      })
      var details = nextProps.details

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
    console.log(this.state)
  }

  handleBackClick = (e) => {
    e.preventDefault()
    browserHistory.push('/pages/pledges/' + this.props.params.pledge +'/' + this.props.params._id)
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
          A full list of users pledged
        </Subheader>
        {this.props.loading ? null :
          Meteor.userId() === this.props.pledge.creatorId || Roles.userIsInRole('admin', Roles.GLOBAL_GROUP)
          || Roles.userIsInRole('administrator', this.props.params._id) ?



        <div style={styles.box}>
          <List style={{backgroundColor: 'white'}}>
        {this.props.users.map((user) => (
              <ListItem
                style={{backgroundColor: 'white'}}
                primaryText={user.profile.name}
                primaryTogglesNestedList={true}
                rightAvatar={<Avatar backgroundColor='rgba(0,0,0,0)'
                  style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                  children={<span style={{position: 'inherit', marginTop: '3px'}}>
                    <EmojiLoadable user = {user}/>
                </span>}
                />}
                nestedItems={
                  [
                    <div style={{paddingLeft: '16px',paddingRight: '16px'}}>
                      <div>
                        <div >


                          <div style={{display: 'flex', paddingLeft: '10px', paddingBottom: '10px'}}>
                          <div style={{}}>
                          {this.state.messengerArray[user._id] ? <i className="fa fa-facebook-official fa-2x" style={{color: '#FF9800'}}
                             aria-hidden="true"></i> : <i className="fa fa-facebook-official fa-2x" style={{color: grey200}}
                                aria-hidden="true"></i>}
                          </div>
                          <div style={{marginLeft: '10px'}}>
                            {this.state.oneSignalArray[user._id] ? <i className="fa fa-bell fa-2x" style={{color: '#FF9800'}}
                               aria-hidden="true"></i> : <i className="fa fa-bell fa-2x" style={{color: grey200}}
                                  aria-hidden="true"></i>}
                          </div>
                          <div style={{marginLeft: '10px'}}>
                            {this.state.emailArray[user._id] ? <i className="fa fa-envelope-o fa-2x" style={{color: '#FF9800'}}
                               aria-hidden="true"></i> : <i className="fa fa-envelope-o fa-2x" style={{color: grey200}}
                                  aria-hidden="true"></i>}
                          </div>
                          <div style={{marginLeft: '10px'}}>
                            {this.state.smsArray[user._id] ? <i className="fa fa-comment fa-2x" style={{color: '#FF9800'}}
                               aria-hidden="true"></i> : <i className="fa fa-comment fa-2x" style={{color: grey200}}
                                  aria-hidden="true"></i>}
                          </div>
                          </div>

                          {/*
                          <i className="fa fa-twitter" aria-hidden="true"></i>
                          <i className="fa fa-facebook-official" aria-hidden="true"></i>
                          <i className="fa fa-comment" aria-hidden="true"></i>
                          <i className="fa fa-envelope-o" aria-hidden="true"></i>
                          <i className="fa fa-bell" aria-hidden="true"></i>
                          */}

                        </div>
                        <div style={{marginTop: '10px'}}>


                        </div>
                        {this.props.details.map((detail) => (
                          <div>
                            <b>{detail.question} </b> {this.state.data[detail.question][user._id]}
                          </div>
                        ))}

                      </div>
                    </div>
                  ]
                }
                      />
        ))}
      </List>

        </div>
        :
        <div style={{display: 'flex', backgroundColor: grey200, height: '250px', width: '100%', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{padding: '5px'}}>
              You do not have permission to access this page
            </div>
      </div>
      }
      </div>
    )
  }
}

UserList.propTypes = {
  pledge: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe("editor", params._id);
  const reviewHandler = Meteor.subscribe("pledgeReviews", params._id);
  const detailHandler = Meteor.subscribe("details", params._id);
  const pledgeUserHandler = Meteor.subscribe("pledgeUsers", params._id);

  return {
    loading: !subscriptionHandler.ready() || !reviewHandler.ready()
    || !detailHandler.ready() || !pledgeUserHandler.ready(),
    pledge: Pledges.find({_id: params._id}).fetch()[0],
    reviews: Reviews.find({type: 'volunteer'}).fetch(),
    users: Meteor.users.find({}).fetch(),
    details: Details.find({}).fetch(),
  };
}, UserList);
