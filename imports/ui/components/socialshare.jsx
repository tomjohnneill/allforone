import React , {PropTypes} from 'react';
import {
  ShareButtons,
  ShareCounts,
  generateShareIcon
} from 'react-share';
const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');

const {
  FacebookShareButton,
  TwitterShareButton,
} = ShareButtons;

export default class SocialShare extends React.Component{
  constructor(props) {
    super(props)
  }

  render () {
    return (
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <FacebookShareButton
          style={{cursor: 'pointer'}}
          children = {<div>
            <FacebookIcon size={36} round={true}/>
        </div>}
          url = {'https://www.allforone.io/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id}
          title={this.props.pledge.title} description={"I just agreed to " +this.props.pledge.title.toLowerCase() + " for " + this.props.pledge.duration.toLowerCase() + " - as long as " + (this.props.pledge.target-this.props.pledge.pledgedUsers.length).toString() + " more people do the same. Care to join me?"}
          picture = {this.props.pledge.coverPhoto ? this.props.pledge.coverPhoto : 'https://www.allforone.io/splash.jpg'}
          />
        <div style={{width: '10px'}}></div>
        <TwitterShareButton
          style={{cursor: 'pointer'}}
          children = {<TwitterIcon size={36} round={true}/>}
          url = {'https://www.allforone.io/pages/pledges/' + this.props.pledge.slug + '/' + this.props.pledge._id}
          title={"If another " + (this.props.pledge.target-this.props.pledge.pledgedUsers.length).toString() + ' people join me, I am ' + this.props.pledge.title + ' for ' + this.props.pledge.duration }
          />
      </div>
    )
  }
}
