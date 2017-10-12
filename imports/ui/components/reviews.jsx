import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500, grey400} from 'material-ui/styles/colors'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar'
import { Session } from 'meteor/session';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {Link, browserHistory} from 'react-router';
import {Reviews} from '/imports/api/reviews.js';
import {Pledges} from '/imports/api/pledges.js';
import MoreHoriz from 'material-ui/svg-icons/navigation/more-horiz';
import CircularProgress from 'material-ui/CircularProgress';
import ReactStars from 'react-stars';

export class ReviewList extends Component {
  constructor(props) {
    super(props);
    this.state = {open: null}
  }

  handleToggle (id, listItem) {
    if (listItem.state.open) {
      this.setState({open: id})
    } else {
      this.setState({open: null})
    }
  }

  render() {
    return(
      <div>
      {this.props.loading === true ? <div style={{height: '80vh', width: '100%',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <CircularProgress/>
      </div> :
      <div>
        
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
      }
      </div>
    )
  }
}

ReviewList.propTypes = {
  loading: PropTypes.bool.isRequired,
  reviews: PropTypes.array.isRequired,
};

export default createContainer((props) => {
  const scoreHandler = Meteor.subscribe("userReviews", props.userId);

  return {
    loading:  !scoreHandler.ready(),
    reviews: Reviews.find({}).fetch(),
  };
}, ReviewList);
