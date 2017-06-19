import React , {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField'
import LinearProgress from 'material-ui/LinearProgress';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Session } from 'meteor/session';
import FacebookProvider, { Comments } from 'react-facebook';
import Dialog from 'material-ui/Dialog';
import {Link, browserHistory} from 'react-router'
import {Threads} from '/imports/api/threads.js';
import ReactHelpers from 'react-helpers';
import InfoIcon from '/imports/ui/components/infoicon.jsx';
import IconButton from 'material-ui/IconButton'
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import CommunicationChatBubble from 'material-ui/svg-icons/communication/comment';
import Avatar from 'material-ui/Avatar';
import {List, ListItem} from 'material-ui/List';
import SwipeableViews from 'react-swipeable-views';
import Subheader from 'material-ui/Subheader';
import PhotoCamera from 'material-ui/svg-icons/image/photo-camera';
import { Random } from 'meteor/random'
import Webcam from 'react-webcam';

var removeMd = require('remove-markdown')
var Buffer = require('buffer/').Buffer

const styles = {
  box: {
    backgroundColor: grey200,
    marginTop: '10px',
    marginBottom: '10px',
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
  } ,
   smallIcon: {
      width: 24,
      height: 24,
      color: 'white',
    },
    mediumIcon: {
      width: 48,
      height: 48,
    },
    largeIcon: {
      width: 60,
      height: 60,
    },
    small: {
      width: 36,
      height: 36,
      padding: '4px 4px 4px 20px'
    },
    medium: {
      width: 96,
      height: 96,
      padding: 24,
    },
    large: {
      width: 120,
      height: 120,
      padding: 30,
    },

}

export class Thread extends React.Component{
  constructor(props) {
    super(props);
    console.log(this.props)
    this.state = {focused: null, frontCamera: true}
  }



getTags() {
  let thread = this.props.thread;

  if ( thread && thread.tags ) {
    return thread.tags.join( ', ' );
  }
}

handlePictureTap(comment, e) {
  e.preventDefault()
  this.setState({focused: comment})
}

handlePictureUnfocus = (e) => {

  this.setState({focused: null, camera: false})
}

getComments() {
  let thread = this.props.thread

  if (thread && thread.comments) {
    return (<List>
    {thread.comments.map((comment) => (
      (comment.content) ?
      <ListItem
        style={{backgroundColor: 'white', marginTop: '5px', marginBottom: '5px'}}
       leftAvatar={<Avatar src={comment.creatorPicture} />}
       primaryText={comment.content}
       name = {comment.content}
       rightIcon={<CommunicationChatBubble />}

     />
   :
       <ListItem
         style={{backgroundColor: 'white', marginTop: '5px', marginBottom: '5px'}}
        leftAvatar={<Avatar src={comment.creatorPicture} />}
        name = {comment.content}
        rightIcon={<CommunicationChatBubble />}
      >
      <img onTouchTap={this.handlePictureTap.bind(this, comment)} style={{width: '100%', height: 'auto'}} src={comment.picture}/>
      </ListItem>
    ))}
    </List>
  )
  }
}

dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], {type: mimeString});
  return blob;

}

handleComment = (e) => {
  console.log(this.refs.commentBox)
  console.log(this.refs.commentBox.input)
  console.log(e.target.value)
  this.setState({comment: removeMd(e.target.value)})
}


convertDataURIToBinaryBuffer(dataURI) {
  var BASE64_MARKER = ';base64,';
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  var buf = Buffer.from(base64, 'base64');
  return buf;
}

handleCameraClick = (e) => {
  e.preventDefault()
  var cameraOptions = {
    width: 800,
    height: 600
  };
  MeteorCamera.getPicture(cameraOptions, function (error, data) {
    if (error) {
      Bert.alert(error.reason, 'danger')
    }
    else {
        var canvas = document.createElement('canvas');
        var metaContext = {threadId: this.props.params._id};
        var uploader = new Slingshot.Upload("ThreadImage", metaContext);
        var blob = window.dataURLtoBlob && window.dataURLtoBlob(data)
        var arr = this.convertDataURIToBinaryBuffer(data)
        var blob = new Blob([arr] , {type:'image/jpg', name: 'thisfilehere.jpeg'})
        blob.name = Random.id() + '.jpg'
        console.log(blob)
        this.setState({blob: blob, src: data})
            uploader.send(blob, function(error, downloadUrl) {
              if (error) {
                  Bert.alert(error, 'danger');
              } else {
                console.log(downloadUrl)
                Meteor.call('addPictureComment', downloadUrl, this.props.params._id)
              }
            }.bind(this)) ;

        }

      console.log(data)
      var image = new Image();
      image.src = data
      console.log(image)

}.bind(this))
}

submitComment = (e) => {
  e.preventDefault()
  if (Meteor.userId() === null) {
    Bert.alert('You need to join a pledge before you can do that', 'danger')
  } else {
  Meteor.call('addComment', this.state.comment, this.props.thread._id, (error, response) => {
    if (error) {
      Bert.alert(error.reason, 'danger');
    } else {
      Bert.alert('Comment added', 'success')
      this.setState({
        comment: ''
      })
    }
  })
}

}

handleSubmit( event ) {
  event.preventDefault();
}

getMarkup() {
  return {__html: this.props.thread.content.replace(/\n/g, "<br />")}
}

handleReactCameraClick = (e) => {
  e.preventDefault()
  this.setState({camera: true})
}

handleCameraUnfocus = (e) => {
  this.setState({camera: false})
}

setRef = (webcam) => {
  this.webcam = webcam;
}

switchCamera = (e) => {
  e.preventDefault()
  this.setState({frontCamera: !this.state.frontCamera})
}

capture = (e) => {
  const data = this.webcam.getScreenshot();
  console.log(data)
  var canvas = document.createElement('canvas');
  var metaContext = {threadId: this.props.params._id};
  var uploader = new Slingshot.Upload("ThreadImage", metaContext);

  var arr = this.convertDataURIToBinaryBuffer(data)
  var blob = new Blob([arr] , {type:'image/jpeg'})
  blob.name = Random.id() + '.jpeg'
  console.log(blob)
  this.setState({blob: blob, src: data})
      uploader.send(blob, function(error, downloadUrl) {
        if (error) {
            Bert.alert(error, 'danger');
        } else {
          console.log(downloadUrl)
          Meteor.call('addPictureComment', downloadUrl, this.props.params._id)
          Bert.alert('Picture added', 'success');
          this.setState({camera: false})
        }
      }.bind(this)) ;
};

render() {
  console.log(this.state)
  if ( !this.props.thread ) { return <div />; }
    else {
  return(
  <div>
    <Link to='/pages/community'>
      <div style={{display: 'flex' ,backgroundColor: grey500, color: 'white'}}>
                  <IconButton
            iconStyle={styles.smallIcon}
            style={styles.small}
          >
            <ArrowBack />
          </IconButton>

        <div style={{width: '100%', paddingLeft: '16px', backgroundColor: grey500, color: 'white', alignItems: 'center', display: 'flex'}}>

          BACK TO COMMUNITY
        </div>
      </div>
    </Link>

    {/* The main body of the page */}
  <div style={styles.box}>
    <Card>
      <CardHeader
        style = {{overflow: 'hidden'}}
        title={this.props.thread.title}
        subtitle={this.props.thread.creator}
        avatar={this.props.thread.creatorPicture}
        />
      <Divider/>
      <CardText>
        <div dangerouslySetInnerHTML={this.getMarkup()}/>
      </CardText>

    </Card>
    {this.getComments()}
    <Card style={{marginTop: '10px'}}>
      <SwipeableViews>
        <div>
          <Subheader>
            Swipe left for camera
          </Subheader>
          <div style={{width: '100%', display: 'flex'}}>
            <List style={{width: '100%'}}>
              <ListItem
                innerDivStyle={{padding: '0px 16px 0px 72px'}}
                leftAvatar={<Avatar src={this.props.loading === true || !this.props.user ? null : this.props.user.profile.picture}/>}
                children={<TextField multiLine={true}
                ref = 'commentBox'
                onKeyPress={this.handleKeypress}
                value={this.state.comment}
                hintText='What do you want to say?' multiLine={true} rows={1}
                onChange={this.handleComment} fullWidth={true}/>}
              />
            </List>
          </div>
            <div style={{display: 'flex'}}>
              <div style={{width: '60%'}}/>
              <div style={{width: '40%'}}>
                <RaisedButton label='Comment' onTouchTap={this.submitComment} secondary={true} fullWidth={true}/>
              </div>
            </div>
        </div>


        <div>
          <Subheader>
            Swipe right to write a comment
          </Subheader>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '75%', paddingBottom: '10px'}}>
            <div style={{borderWidth: '2px', borderColor: grey500, borderStyle: 'dashed', borderRadius: '10px'}}>
              <IconButton
                tooltip='Add a photo'
                touch={true}
                iconStyle={{width: '48px', height: '48px'}}
                style={{width: '96px', height: '96px', padding: '24px', borderWidth: '2px', borderColor: grey500}}
                onTouchTap={this.handleReactCameraClick}
              >
                <PhotoCamera color={grey500} />
              </IconButton>

            </div>
          </div>
        </div>
      </SwipeableViews>
    </Card>
  </div>
  <Dialog
    modal={false}
    contentStyle={{width: '90%'}}
    bodyStyle={{padding: '5px'}}
    open={this.state.focused !== null}
    onRequestClose={this.handlePictureUnfocus}
    >
      <div>
        {this.state.focused ?
          <div>
            <ListItem
              style={{backgroundColor: 'white', marginTop: '5px', marginBottom: '5px'}}
             leftAvatar={<Avatar src={this.state.focused.creatorPicture} />}
             name = {this.state.focused.content}
             primaryText={this.state.focused.creator}
             />
           <img src={this.state.focused.picture} style={{width: '100%', padding: '10px'}}/>
         </div>
         : null}
     </div>
  </Dialog>
  <Dialog
    modal={false}
    contentStyle={{width: '90%'}}
    bodyStyle={{padding: '5px'}}
    open={this.state.camera}
    onRequestClose={this.handleCameraUnfocus}>
    <div>
      {this.state.camera ?
      <Webcam
        audio={false}
        height={350}
        ref={this.setRef}
        screenshotFormat="image/jpeg"
        width={350}
        videoSource={this.state.frontCamera ? [{"facingMode":"user"}] : [{"facingMode":"environment"}]}
      /> : null}
      <button onClick={this.capture}>Capture photo</button>
    </div>
  </Dialog>

</div>

    );
  }
  }
}





Thread.propTypes = {
  thread: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe("threadEditor", params._id);
  const userHandler = Meteor.subscribe("userData");
  console.log(params)
  console.log(Threads.findOne({_id: params._id}))
  return {
    loading: !subscriptionHandler.ready() || !userHandler.ready(),
    thread: Threads.findOne({_id: params._id}),
    user: Meteor.users.findOne({_id: Meteor.userId()})
  };
}, Thread);
