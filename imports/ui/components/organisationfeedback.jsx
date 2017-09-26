import React , {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Link, browserHistory} from 'react-router';
import {
  Step,
  Stepper,
  StepLabel,
  StepContent,
} from 'material-ui/Stepper';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar'
import TextField from 'material-ui/TextField';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import Checkbox from 'material-ui/Checkbox';
import {Reviews} from '/imports/api/reviews.js';
import {Pledges} from '/imports/api/pledges.js';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors';
import ReactStars from 'react-stars';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';

export class OrgFeedback extends React.Component{
  constructor(props) {
    super(props);
    this.state = {stepIndex: 0, response: {}}
  }


  handleTextChange (id, e, newValue) {
    this.setState({response: {id: id, value: newValue}})
  }

  handleRatingChange = (newRating) => {
    console.log(newRating)
    this.setState({rating: newRating})
  }

  handleReviewChange = (e, newValue) => {
    console.log(newValue)
    this.setState({review: newValue})
    console.log(this.state)
  }

  handleSubmit  (pledgeId, e)  {
    e.preventDefault()
    Meteor.call('submitReview', this.state, this.props.pledgeCreatorId, pledgeId, 'organiser' ,(err, result) => {
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

  render() {

    return (

      <div>
        <Subheader>
          Organiser feedback
        </Subheader>
        <div style={{backgroundColor: grey200, padding: '10px'}}>
        <List style={{backgroundColor: 'white'}}>
      {this.props.reviews.map((review) => (
            <ListItem
              style={{backgroundColor: 'white'}}
              primaryText={review.reviewerName}
              primaryTogglesNestedList={true}
              onNestedListToggle={this.handleToggle.bind(this, review._id)}
              leftAvatar={<Avatar src={review.reviewerPicture}/>}
              secondaryText={
                  this.state.open === review._id ? null :
                  <div style={{display: 'flex'}}>
                        <ReactStars
                          count={5}
                          edit={false}
                          half={false}
                          value={review.rating}
                          size={24}
                          color2={'#ffd700'} />
                  </div>
                    }
              nestedItems={
                [
                  <div style={{paddingLeft: '72px', paddingRight: '16px'}}>
                    <div>
                      <b>{Pledges.findOne({_id: review.pledgeId}).title}</b>
                    </div>
                    <ReactStars
                      count={5}
                      half={false}
                      edit={false}
                      value={review.rating}
                      size={24}
                      color2={'#ffd700'} />
                    <div>
                      {review.review}
                    </div>
                  </div>
                ]
              }
                    />
      ))}
    </List>
    </div>

    <Subheader>Add your own review</Subheader>


    <div style={{backgroundColor: grey200, padding: '10px'}}>
      {Meteor.userId() !== null && this.props.pledgedUsers.includes(Meteor.userId()) ?
        <div style={{ backgroundColor: 'white', position: 'relative'}}>
          <ListItem
            leftAvatar={<Avatar src={Meteor.users.findOne({_id: Meteor.userId()}).profile.picture}/>}
            style={{backgroundColor: 'white'}}
            disableTouchRipple={true}
            children={
              <div>
                <p style={{marginBottom: '10px'}}>{Pledges.findOne({_id: this.props.pledgeId}).title}</p>
                <div style={{marginTop: '10px'}}>
          <ReactStars
            count={5}
            half={false}
            value={this.state.rating}
            onChange={this.handleRatingChange}
            size={24}
            color2={'#ffd700'} />
          </div>
          <TextField multiLine={true}
            fullWidth={true}
            defaultValue={this.state.review}
            onChange={this.handleReviewChange}
            hintText='Leave a review'/>
          <div style={{width: '100%', height: '36px'}}/>
          <RaisedButton style={{position: 'absolute', right: '10px', bottom: '10px'}} primary={true} label='Submit' onTouchTap={this.handleSubmit.bind(this, this.props.pledgeId)}/>
          </div>
        }/>
        </div>
        :
        <div style={{textAlign: 'center', width: '100%'}}>
          Join in to leave a review
        </div>}
        </div>

        </div>

  )
  }
}

OrgFeedback.propTypes = {
  loading: PropTypes.bool.isRequired,
  reviews: PropTypes.array
};

export default createContainer((props) => {
  console.log(props)
  const reviewHandler = Meteor.subscribe("orgReviews", props.pledgeCreatorId);
  const pledgeHandler = Meteor.subscribe("pledgeTitles", props.pledgeCreatorId);

  return {
    loading: !reviewHandler.ready() || !pledgeHandler.ready(),
    reviews: Reviews.find({}).fetch(),
  };
}, OrgFeedback);
