import React , {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField'
import LinearProgress from 'material-ui/LinearProgress';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Session } from 'meteor/session';
import Dialog from 'material-ui/Dialog';
import {Link, browserHistory} from 'react-router'
import {Pledges} from '/imports/api/pledges.js';
import ReactHelpers from 'react-helpers';
import InfoIcon from '/imports/ui/components/infoicon.jsx';
import DatePicker from 'material-ui/DatePicker';
import Dropzone from 'react-dropzone';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Loadable from 'react-loadable';
import MessengerPlugin from 'react-messenger-plugin';
import Subheader from 'material-ui/Subheader';
import Chip from 'material-ui/Chip';
import TimePicker from 'material-ui/TimePicker';
import GooglePlaceAutocomplete from 'material-ui-autocomplete-google-places';

var removeMd = require('remove-markdown')

const Loading = () => (
  <div>
    Hi
  </div>
)


const LoadableComponent = Loadable({
  loader: () => import('/imports/ui/pages/texteditor.jsx'),
  loading: Loading
});

const styles = {
  box: {
    backgroundColor: grey200,
    marginTop: '10px',
    marginBottom: '10px',
    padding: '10px',
    overflow: 'hidden',
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '800px'
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
  flexWrapTitle: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '10px',
    padding: '5px'
  },
  bigTitle: {
    width: '50%',
    fontStyle: 'italic',
    color: grey500
  },
  bigWrapTitle: {
    width: '50%',
    fontStyle: 'italic',
    minWidth: '250px',
    color: grey500,
    boxSizing: 'border-box'
  },
  currentCommitments: {
    textAlign: 'center',

  },
  targetCommitments: {
    textAlign: 'center'
  },
  explanation: {
    fontSize: '8pt',
    color: grey500
  }

}


export class EditPledge extends React.Component{
  constructor(props) {
    super(props);
    console.log(this.props)
    this.state = {open: false, renderMessenger: false, tags: [], tagText: ''}
  }

  componentWillMount() {
  Slingshot.fileRestrictions("avatar", {
    allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
    maxSize: 2 * 500 * 500
  });
}


componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
}

componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }


  handleScroll = () => {
    var scrollHeight = document.documentElement.scrollHeight
      var pageYOffset = window.pageYOffset
      var innerHeight = window.innerHeight
      console.log(this.state.renderMessenger)
      console.log(scrollHeight - innerHeight - pageYOffset)
      if (scrollHeight - innerHeight - pageYOffset < 150 && !this.state.renderMessenger) {
        this.setState({renderMessenger :true})
      }
  }

generateSlug = (event) => {
  var title = event.target.value
  this.setState({slug: getSlug(title, {custom: {"'":""}}), title: title})
  console.log(this.state)
}

changeContent = (event) => {
  var content = event.target.value
  this.setState({content: content})
}

handleDuration = (event, index, obj) => {
  var duration = obj
  this.setState({duration: duration})
}

handleWhat = (event) => {
  var what = removeMd(event.target.value)
  this.setState({what: what})
}

handleWhy = (event) => {
  var why = removeMd(event.target.value)
  this.setState({why: why})
}

handleHow = (event) => {
  var how = removeMd(event.target.value)
  this.setState({how: how})
}

handleTarget = (event) => {
  var target = event.target.value
  this.setState({target: target})
}

handleImpact = (event) => {
  var impact = event.target.value
  this.setState({impact: impact})
}

handleSummary = (event) => {
  var summary = event.target.value
  this.setState({summary: summary})
}

handleDeadline = (event, date) => {
  var deadline = date.toISOString()
  console.log(date)
  this.setState({deadline: date})
}

handleEventDate = (event, date) => {
  var deadline = date.toISOString()
  console.log(date)
  this.setState({eventDate: date})
}


handleEventTime = (event, date) => {

  console.log(date)
  this.setState({eventTime: date})

}


componentWillReceiveProps(nextProps) {
  if (!nextProps.loading) {
    this.setState({tags: nextProps.pledge.tags ? nextProps.pledge.tags : [],
      facebookURL: nextProps.pledge.facebookURL ? nextProps.pledge.facebookURL : ''})
  }
}

submitPledge = (event) => {
  var title = this.state.title ? this.state.title: this.props.pledge.title
  var target = this.state.target ? this.state.target: this.props.pledge.target
  var deadline = this.state.deadline ? this.state.deadline.toISOString() : this.props.pledge.deadline
  var description = this.state.description ? this.state.description : this.props.pledge.description
  var why = this.state.why ? this.state.why : this.props.pledge.why
  var how = this.state.how ? this.state.how: this.props.pledge.how
  var slug = this.state.slug? this.state.slug: this.props.pledge.slug
  var picture = this.props.pledge.creatorPicture

  var impact = this.state.impact ? this.state.impact: this.props.pledge.impact ? this.props.pledge.impact : ''
  var summary = this.state.summary ? this.state.summary: this.props.pledge.summary ? this.props.pledge.summary : ''
  var facebookURL = this.state.facebookURL ? this.state.facebookURL : this.props.pledge.facebookURL
  var tags = this.state.tags ? this.state.tags : this.props.pledge.tags

  var eventDate = this.state.eventDate ? this.state.eventDate : this.props.pledge.eventDate
  var eventTime = this.state.eventTime ? this.state.eventTime : this.props.pledge.eventTime
  var location = this.state.location ? this.state.location : this.props.pledge.location

  var eventDate
  if (this.state.hours) {
    let tempDate = this.state.eventDate
    tempDate.setHours(this.state.hours)
    tempDate.setMinutes(this.state.minutes)
    console.log(tempDate)
    eventDate = tempDate
  } else {
    let tempDate = this.state.eventDate
    eventDate = tempDate
  }



  if (title === 'Untitled Pledge' || title === '') {
    Bert.alert('Your pledge needs a title')
  }
  else if (target === '' || target === undefined ) {
    Bert.alert('Your pledge needs a target', 'danger')
  } else if (deadline === '' || deadline === undefined) {
    Bert.alert('Your pledge needs a deadline', 'danger')
  } else if (description === '' || description === undefined) {
    Bert.alert("You need to provide a bit more detail on the description tab", 'danger')
  } else {

    var pledge = {
      title: title,
      target: target,
      deadline: deadline,
      description: description,
      slug: slug,
      creatorPicture: picture,
      _id: this.props.params._id,
      creatorId: Meteor.userId(),
      creator: this.props.pledge.creator,
      updated: this.props.pledge.updated,
      pledgedUsers: this.props.pledge.pledgedUsers,
      pledgeCount: this.props.pledge.pledgeCount,
      eventDate: eventDate,
      eventTime: eventTime,
      location: location,
      facebookURL: facebookURL,
      impact: impact,
      tags: tags,
      summary: summary,
      approved: this.props.pledge.approved ? this.props.pledge.approved : false
    }

    console.log(pledge)

    Meteor.call( 'savePledge', pledge, ( error, response ) => {
      if ( error ) {
        Bert.alert( error.reason, 'danger' );
      } else {
        Bert.alert( 'Pledge saved!', 'success' );
        Meteor.call('recalculateScore', Meteor.userId())
        browserHistory.push('/pages/pledges/' + slug + '/' + this.props.pledge._id)
      }
    });
  }
}

getCoords = (lat, lng, desc) => {
  console.log(lat, lng);
  console.log(desc)
  this.setState({location:{place: desc, location: {type: "Point", coordinates : [lng, lat]}}})
}

getTags() {
  let pledge = this.props.pledge;

  if ( pledge && pledge.tags ) {
    return pledge.tags.join( ', ' );
  }
}

upload(acceptedFiles, rejectedFiles){
  var metaContext = {pledgeId: this.props.pledge._id};
  console.log(metaContext)
  this.setState({loader: true})
  var uploader = new Slingshot.Upload("UsersAvatar", metaContext);
  uploader.send(acceptedFiles[0], function (error, downloadUrl) { // you can use refs if you like
    if (error) {
      // Log service detailed response
      //console.error('Error uploading', uploader.xhr.response);
      Bert.alert(error, 'danger'); // you may want to fancy this up when you're ready instead of a popup.
    }
    else {
    Meteor.call('addPictureToPledge', downloadUrl, this.props.pledge._id)
    // you will need this in the event the user hit the update button because it will remove the avatar url
    this.setState({loader: false})
  }
  }.bind(this));
}


handleSubmit( event ) {
  event.preventDefault();
}

handleDelete = (e) => {
  e.preventDefault()
  this.setState({open: true})
}

handleClose = (e) => {
  e.preventDefault()
  this.setState({open: false})
}

deletePledge = (e) => {
  e.preventDefault()
  Meteor.call('deletePledge', this.props.params._id, function(result, error) {
    if (error) {
      Bert.alert(error.reason, 'danger')
    } else {
      Bert.alert('Pledge deleted', 'success')
      browserHistory.push('/pages/pledges')
    }
  })
}

handleFacebookURL = (e, newValue) => {
  this.setState({facebookURL: newValue})
}



handleOnChange = (string) => {
  this.setState({description: string})
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

render() {


  if ( !this.props.pledge ) { return <div />; }
    else {
      console.log(this.props.thisUser[0].userMessengerId)
      console.log(this.props.pledge)
  return(
  <div style={{display: 'flex', justifyContent: 'center', backgroundColor: grey200}}>
      <div style={styles.box}>
        <Card>
          <CardHeader
              title="My pledge application"
              subtitle={this.props.pledge.creator}
              avatar={this.props.pledge.creatorPicture}
            />
          <CardMedia
            overlay={
              <CardTitle title={<TextField name='title' multiLine={true}
                defaultValue={this.state.title ? this.state.title : this.props.pledge.title === 'Untitled Pledge' ? '' : this.props.pledge.title}
                onChange={this.generateSlug}
                style={{color: 'white'}}
                hintText='Enter pledge title'
                textareaStyle={{color: 'white'}}
                inputStyle={{color: 'white'}}/>
              }


           />}

          >
          <img src={this.props.pledge.coverPhoto === undefined ? '/images/white.png' : this.props.pledge.coverPhoto}/>
          </CardMedia>
          <CardTitle children={
              <div>
                <div style={styles.cardTitle}>
                  <div style={styles.bigTitle}>
                    Target:
                  <div style={styles.smallTitle}>
                    <TextField name='target' style={{width: '50%'}}
                      defaultValue={this.state.target ? this.state.target: this.props.pledge.target}
                      onChange={this.handleTarget}/> people
                  </div>
                  </div>
                  <div style={styles.bigTitle}>
                    Deadline:
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>

                         <DatePicker value={this.state.deadline ? this.state.deadline : this.props.pledge.deadline} onChange={this.handleDeadline} style={{width: 'auto'}} hintText="Deadline" textFieldStyle={{width: 'auto'}}/>
                    </div>
                  </div>
                </div>
              </div>
            }/>
        </Card>
          <Card style={{marginTop: '20px'}}>

            <CardTitle
              title='Event details'
              children={
                <div>
                  <div style={styles.explanation}>
                    If your pledge has a physical event, set the time, date and location here. This section is optional.
                  </div>
                  <div style={styles.flexWrapTitle}>
                    <div style={styles.bigWrapTitle}>
                      Event Date:
                    <div style={styles.smallTitle}>
                      <DatePicker value={this.state.eventDate ? this.state.eventDate : this.props.pledge.eventDate}
                        onChange={this.handleEventDate} style={{width: 'auto'}}



                         hintText="Event Date" textFieldStyle={{width: 'auto'}}/>
                      <TimePicker value={this.state.eventTime ? this.state.eventTime : this.props.pledge.eventTime}
                          onChange={this.handleEventTime} style={{width: 'auto'}} hintText="Event Time" textFieldStyle={{width: 'auto'}}/>
                    </div>
                    </div>
                    <div style={styles.bigWrapTitle}>
                      <div>
                      Location:
                      </div>
                      <div style={{ alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                        <GooglePlaceAutocomplete
                          className='autocomplete'
                          style={{width: '100%'}}
                          textFieldStyle={{width: '100%'}}
                          searchText={this.state.location && this.state.location.value ? this.state.location.value: this.props.pledge.location ? this.props.pledge.location.value : ''}
                          menuItemStyle={{ fontSize: 13,
                                display: 'block',
                                paddingRight: 20,
                                overflow: 'hidden'}}
                            menuStyle={{cursor: 'default'}}
                            fullWidth={true}
                            disableFocusRipple={false}
                            results={this.getCoords}
                          />
                      </div>
                    </div>
                  </div>
                </div>
              }/>
          </Card>
            <Card style={{marginTop: '20px'}}>

            <CardTitle
              title = "Pledge blurb"
              children={
            <div>
              <div style={styles.explanation}>
                Give people an idea of what you’re doing. Skip “Help me” and focus on your plan.
              </div>
              <TextField name='summary'
                fullWidth={true}
                multiLine={true}
                hintText='An overall summary'
                defaultValue={this.state.summary ? this.state.summary: this.props.pledge.summary }
                onChange={this.handleSummary}/>

            </div>
          }/>
      </Card>

        <Card style={{marginTop: '20px'}}>
          <CardTitle style={{marginBottom: '10px'}} title='Pledge description'
            children={
              <div>
          <div style={styles.explanation}>
            Use your pledge description to share more about what you’re finding people to do and how you plan to pull it off. It’s up to you to make the case for your pledge.
          </div>
          <div style={{height: '16px'}}/>
          <LoadableComponent styles={{fontFamily: 'Roboto', padding: '10px', marginTop: '10px'}}
            returnableValue={this.props.pledge.returnableValue}
            description={this.props.pledge.description}
            onChange={this.handleOnChange}/>
          </div>
          }/>
      </Card>

      <Card style={{marginTop: '20px'}}>
        <CardTitle style={{marginBottom: '10px'}} title='Add social media accounts'
          children={
            <div>
        <div style={styles.explanation}>
          Add your social media accounts and we'll give people the option to like your Facebook page just under the story. Add the whole url, not the just the account name.
        </div>
        <div style={{height: '16px'}}/>
          <TextField hintText='Facebook Page URL' value={this.state.facebookURL ? this.state.facebookURL: this.props.pledge.facebookURL} onChange={this.handleFacebookURL}/>
        </div>
        }/>
    </Card>

    <Card style={{marginTop: '20px'}}>
      <CardTitle style={{marginBottom: '10px'}} title='Add subject tags'
        children={
          <div>
        <div style={styles.explanation}>
          Add some subject tags to this pledge so we can show it to people who might be interested. Type each tag separated by a comma, or hit Enter after each one.
        </div>
        <div style={{marginTop: '10px'}}>
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
          <div >
          <TextField
            hintText='Type each tag separated by a comma'
            fullWidth={true}
            multiLine={true}
            onChange={this.handleTagType}
            onKeyPress={this.handleTagSubmit}
            value={this.state.tagText}

      /></div>
    </div>}
    />
</Card>


      <Card style={{marginTop: '20px'}}>

          />
        <CardTitle title='Add a cover photo'
          children={
            <div style={styles.explanation}>
              This is the first thing that people will see when they come across your pledge, both on Who's In and on social media. Choose an image that’s crisp and text-free.
            </div>
          }
        />

        <div style={{padding: '16px'}}>
          <Dropzone key={'photos'} onDrop={this.upload.bind(this)}  style={{}}>
                {({ isDragActive, isDragReject }) => {
                  let styles = {
                    width: 'auto',
                    height: 100,
                    textAlign: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: grey500,
                    borderStyle: 'dashed',
                    borderRadius: 5,
                    color: grey500,

                  }

                  const acceptedStyles = {
                    ...styles,
                    borderStyle: 'solid',
                    borderColor: '#6c6',
                    backgroundColor: '#eee'
                  }

                  const rejectStyles = {
                    ...styles,
                    borderStyle: 'solid',
                    borderColor: '#c66',
                    backgroundColor: '#eee'
                  }

                  if (isDragActive) {
                    return (
                      <div style={acceptedStyles}>
                        File will be accepted
                      </div>
                    )
                  }
                  if (isDragReject) {
                    return (
                      <div style={rejectStyles}>
                        File will be rejected
                      </div>
                    )
                  }
                  // Default case
                  return (
                    <div style={styles}>
                      Drag and drop (or click) to upload
                    </div>
                  )
                }}
              </Dropzone>
        </div>
      </Card>
        <Card style={{marginTop: '20px'}}>
        <CardTitle title='Submit Application' children={
          <div style={styles.explanation}>
            Before your pledge appears on the front page of Who's In, we will get in contact with you to talk through your pledge, and work out how best we can work together to make it happen.
          </div>
          }/>
        {this.props.thisUser[0].userMessengerId || !this.state.renderMessenger ? null :
        <div style={{paddingBottom: '16px'}}>
          <Subheader>
            We will reply to your application on Messenger
          </Subheader>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6px', flexDirection: 'column'}}>
            <div style={{marginLeft: '103px', marginBottom: '20px', marginTop: '5px'}}>
        <MessengerPlugin
          appId={Meteor.settings.public.FacebookAppId}
          pageId={Meteor.settings.public.FacebookPageId}
          size='large'
          color='blue'
          passthroughParams={Meteor.userId()}
        />

      </div>
      <div style={styles.explanation}>
        <p style={{textAlign: 'center'}}>You need to click this button so we can send you a message once your pledge is approved.</p>
      </div>
      </div>
    </div>
    }

        <RaisedButton label='Submit Application'

          onTouchTap={this.submitPledge} secondary={true} fullWidth={true}/>
        <div style={{height: '20px'}}/>
        <FlatButton label='Delete Pledge' onTouchTap={this.handleDelete} fullWidth={true}/>
        </Card>
      </div>
      <Dialog

          actions={[
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Delete"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.deletePledge}
      />,
    ]}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
        Are you sure you want to delete this pledge?
        </Dialog>
    </div>
    );
  }
  }
}





EditPledge.propTypes = {
  pledge: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe("editor", params._id);
  const messengerHandler = Meteor.subscribe("messengerIDExists");
  console.log(params)
  console.log(Pledges.findOne({_id: params._id}))
  return {
    loading: !subscriptionHandler.ready() || !messengerHandler.ready(),
    pledge: Pledges.findOne({_id: params._id}),
    thisUser: Meteor.users.find({}).fetch(),
  };
}, EditPledge);
