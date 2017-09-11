import React , {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Pledges} from '/imports/api/pledges.js';
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
import IconButton from 'material-ui/IconButton';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';

import {Link, browserHistory} from 'react-router';

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


export class PledgedUsers extends React.Component{
  constructor(props) {
    super(props);
    console.log(this.props)
    this.state = {rating: 5, review: '', open: null}
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loading) {
      for (var i in nextProps.reviews) {
        this.setState({[nextProps.reviews[i].userId]:
          {rating: nextProps.reviews[i].rating,
          review: nextProps.reviews[i].review}
        })
      }
    }
  }


  handleRatingChange = (id, newRating) => {
    console.log(newRating)
    this.setState({[id]: {rating: newRating}})
  }

  handleSubmit  (id, pledgeId, e)  {
    e.preventDefault()
    Meteor.call('submitReview', this.state[id], id, pledgeId, 'volunteer', (err, result) => {
      if (err) {
        Bert.alert(err.reason, 'danger')
      } else {
        Bert.alert('Review added', 'success')
      }
    })
    this.setState({review: ''})
  }

  handleToggle (id, listItem) {
    if (listItem.state.open) {
      this.setState({open: id})
    } else {
      this.setState({open: null})
    }
  }

  handleReviewChange (id, e, newValue) {
    console.log(newValue)
    var current = this.state[id] ? this.state[id] : {}
    current.review = newValue
    this.setState({[id]: current})
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
          Leave some feedback
        </Subheader>
        {this.props.loading ? null :
          Meteor.userId() === this.props.pledge.creatorId || Roles.userIsInRole('admin', Roles.GLOBAL_GROUP)
          || Roles.userIsInRole('administrator', this.props.params._id)
          ?
        <div style={styles.box}>
          <List style={{backgroundColor: 'white'}}>
        {this.props.pledge.pledgedUsers.map((id) => (
              <ListItem
                style={{backgroundColor: 'white'}}
                primaryText={Meteor.users.findOne({_id: id}).profile.name}
                primaryTogglesNestedList={true}
                onNestedListToggle={this.handleToggle.bind(this, id)}
                leftAvatar={<Avatar src={Meteor.users.findOne({_id: id}).profile.picture}/>}
                secondaryText={
                    this.state.open === id ? null :
                    <div style={{display: 'flex'}}>
                          <ReactStars
                            count={5}
                            edit={false}
                            half={false}
                            value={this.state[id] ? this.state[id].rating : 0}
                            onChange={this.handleRatingChange}
                            size={24}
                            color2={'#ffd700'} />
                    </div>
                      }
                nestedItems={
                  [
                    <div style={{paddingLeft: '72px', paddingRight: '16px'}}>
                      <ReactStars
                        count={5}
                        half={false}
                        value={this.state[id] ? this.state[id].rating : 0}
                        onChange={this.handleRatingChange.bind(this, id)}
                        size={24}
                        color2={'#ffd700'} />
                      <TextField multiLine={true}
                        fullWidth={true}
                        defaultValue={this.state[id] ? this.state[id].review : ''}
                        onChange={this.handleReviewChange.bind(this, id)}
                        hintText='Leave a review'/>
                      <RaisedButton label='Submit' onTouchTap={this.handleSubmit.bind(this, id, this.props.params._id)}/>
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

PledgedUsers.propTypes = {
  pledge: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe("editor", params._id);
  const reviewHandler = Meteor.subscribe("pledgeReviews", params._id);
  const pledgeUsers = Meteor.subscribe("pledgeUsers", params._id);

  return {
    loading: !subscriptionHandler.ready() || !reviewHandler.ready() || !pledgeUsers.ready(),
    pledge: Pledges.find({_id: params._id}).fetch()[0],
    reviews: Reviews.find({type: 'volunteer'}).fetch(),
  };
}, PledgedUsers);
