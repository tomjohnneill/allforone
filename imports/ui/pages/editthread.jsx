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
import IconButton from 'material-ui/IconButton';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';

var removeMd = require('remove-markdown')

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

}

export class EditThread extends React.Component{
  constructor(props) {
    super(props);
    console.log(this.props)
    this.state = {}
  }

/*
  validations() {
  let component = this;

  return {
    rules: {
      pledgeTitle: {
        required: true
      }
    },
    messages: {
      pledgeTitle: {
        required: "Hang on there, a pledge title is required!"
      }
    },
    submitHandler() {
      let { getValue, isChecked } = ReactHelpers;

      let form = component.refs.editp=PledgeForm.refs.form,
          pledge = {
            _id: component.props.pledge,
            title: getValue( form, '[name="pledgeTitle"]' ),
            slug: getValue( form, '[name="pledgeSlug"]' ),
            content: getValue( form, '[name="pledgeContent"]' ),
            published: isChecked( form, '[name="pledgePublished"]' ),
            tags: getValue( form, '[name="pledgeTags"]' ).split( ',' ).map( ( string ) => {
              return string.trim();
            })
          };

      Meteor.call( 'savePledge', pledge, ( error, response ) => {
        if ( error ) {
          Bert.alert( error.reason, 'danger' );
        } else {
          Bert.alert( 'Pledge saved!', 'success' );
        }
      });
    }
  };
}


generateSlug( event ) {
  let { setValue } = ReactHelpers,
      form         = this.refs.editPledgeForm.refs.form,
      title        = event.target.value;

  setValue( form, '[name="pledgeSlug"]', getSlug( title, { custom: { "'": "" } } ) );
}
*/

generateSlug = (event) => {
  var title = event.target.value
  this.setState({slug: getSlug(title, {custom: {"'":""}}), title: title})
  console.log(this.state)
}

changeContent = (event) => {
  var content = event.target.value
  this.setState({content: content})
}


/*
getLastUpdate() {
  if ( this.props ) {
    let { formatLastUpdate } = ReactHelpers,
        pledge                 = this.props.pledge;

    return `${ formatLastUpdate( pledge.updated ) } by ${ pledge.creator }`;
  }
}

*/

handleContent = (event) => {
  var content = removeMd(event.target.value)
  this.setState({content: content})
}



submitThread = (event) => {
  var title = this.state.title ? this.state.title: this.props.thread.title
  var content = this.state.content ? this.state.content: this.props.thread.content
  var slug = this.state.slug? this.state.slug: this.props.thread.slug
  var picture = this.props.thread.creatorPicture

  if (title === 'Untitled thread' || title === '') {
    Bert.alert('Your thread needs a title')

} else if (content === '' || content === undefined) {
    Bert.alert("You need to write something", 'danger')
  } else {

    var thread = {
      title: title,
      content: content,
      slug: slug,
      creatorPicture: picture,
      _id: this.props.params._id,
      creatorId: this.props.thread.creatorId,
      creator: this.props.thread.creator
    }

    Meteor.call( 'saveThread', thread, ( error, response ) => {
      if ( error ) {
        Bert.alert( error.reason, 'danger' );
      } else {
        Bert.alert( 'Thread saved!', 'success' );
        browserHistory.push('/pages/community/' + slug + '/' + this.props.thread._id)
      }
    });
  }
}

getTags() {
  let thread = this.props.thread;

  if ( thread && thread.tags ) {
    return thread.tags.join( ', ' );
  }
}

handleSubmit( event ) {
  event.preventDefault();
}

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
      <div style={styles.box}>
        <Card>
          <CardHeader
            titleStyle = {{paddingRight: '0px'}}
            style = {{overflow: 'hidden'}}
            subtitleStyle = {{paddingRight: '0px'}}
              title={<TextField name='title' multiLine={true} hintText={'What do you want to talk about?'}
              defaultValue={this.state.title ? this.state.title : this.props.thread.title === 'Untitled thread' ? '' : this.props.thread.title}
              onChange={this.generateSlug} /> }

              subtitle={this.props.thread.creator}
              avatar={this.props.thread.creatorPicture}
            />


          <Divider/>
          <CardText  children = {

                    <div>

                   <TextField multiLine={true}
                     onChange={this.handleContent}
                     hintText='Add some text so people can get a bit more detail about what you mean'
                     fullWidth={true}
                     defaultValue={this.state.what ? this.state.what : null} rows={2}/>
              </div>
            }

          />
        <RaisedButton label='Save Thread' onTouchTap={this.submitThread} secondary={true} fullWidth={true}/>
        </Card>
      </div>
    </div>
    );
  }
  }
}





EditThread.propTypes = {
  thread: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe("threadEditor", params._id);
  console.log(params)
  console.log(Threads.findOne({_id: params._id}))
  return {
    loading: !subscriptionHandler.ready(),
    thread: Threads.findOne({_id: params._id}),
  };
}, EditThread);
