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
import {
  Step,
  Stepper,
  StepLabel,
  StepContent,
} from 'material-ui/Stepper';
import Refresh from 'material-ui/svg-icons/navigation/refresh';


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

}

var Trello = window.Trello

export class Project extends React.Component{
  constructor(props) {
    super(props);
    console.log(this.props)
    this.state = {finished: false,
    stepIndex: 0, admin: false}
    var Trello = window.Trello
    jQuery.getScript("https://api.trello.com/1/client.js?key=" + Meteor.settings.public.TrelloAPIKey, function( data, textStatus, jqxhr ) {
      console.log(data)
      console.log(textStatus)
      console.log(jqxhr.status)
      Trello = window.Trello
      console.log(window.Trello)
    })

    if (Trello) {
      Trello.setKey(Meteor.settings.public.TrelloAPIKey)
    }
  }

  componentWillReceiveProps(nextProps) {
    var Trello = window.Trello
    if (Trello) {
      Trello.setKey(Meteor.settings.public.TrelloAPIKey)
    }
    if (!nextProps.loading && nextProps.pledges) {
      if (nextProps.pledges[0].trelloAdminSet) {
        this.setState({admin: true})
      }
    }
  }

  trelloAuthorize() {
    var Trello = window.Trello
    Trello.setKey(Meteor.settings.public.TrelloAPIKey)
    var authenticationSuccess = function() { console.log('Successful authentication'); };
    var authenticationFailure = function() { console.log('Failed authentication'); };

    Trello.authorize({
    type: 'popup',
    name: 'Getting Started Application',
    scope: {
      read: 'true',
      write: 'true' },
    expiration: 'never',
    success: authenticationSuccess,
    error: authenticationFailure
  });
}

  createCard() {
    var Trello = window.Trello
    var myList = '5969fc0793bede6b70362c20';
    var creationSuccess = function(data) {
      console.log('Card created successfully. Data returned:' + JSON.stringify(data));
    };
    var newCard = {
      name: 'New Test Card',
      desc: 'This is the description of our new card.',
      // Place this card at the top of our list
      idList: '5969fc0793bede6b70362c20',
      pos: 'top'
    };
    Trello.post('/cards/', newCard, creationSuccess);
  }

  createBoard = (pledgeId) => {
    var Trello = window.Trello
    this.trelloAuthorize()
    var creationSuccess = (data) => {
      console.log('Board created successfully. Data returned:' + JSON.stringify(data));
      var trelloBoardUrl = /[^/]*$/.exec(data.shortUrl)[0]
      Meteor.call('addBoardUrl', pledgeId,trelloBoardUrl)
    };
    var newBoard = {
      name: this.props.pledges[0].title,
      desc: 'This is a board created by the All For One for the purpose of ' + this.props.pledges[0].title,
    };
    Trello.post('/boards/', newBoard, creationSuccess)
  }

  findLists = () => {
    var Trello = window.Trello
    this.trelloAuthorize()
    var creationSuccess = (data)  => {
      console.log('Data returned:' + JSON.stringify(data));
      if (data.lists) {
        for (var i in data.lists) {
          if (data.lists[i].name === 'To Do') {
            console.log(data.lists[i].id)
            this.setState({trelloListId: data.lists[i].id})
            this.findToDoCards(data.lists[i].id)
            Meteor.call('setToDoListTrelloID', data.lists[i].id, (err, res) => {

            })

          }
        }
      }
    };
    var options = {
      fields: 'id,name,dateLastActivity',
      list_fields: 'id,name',
      lists: 'open'
    }
    Trello.get('/boards/' + this.props.pledges[0].trelloBoardUrl, options, creationSuccess)

  }

  handleToggle = (event, isInputChecked) => {
    event.preventDefault()
    if (isInputChecked && !this.props.pledges[0].trelloBoardUrl) {
      this.createBoard(this.props.params.pledgeId)
    }
  }

  findToDoCards = (trelloListId) => {
    var Trello = window.Trello
    console.log(this.props)

    console.log(trelloListId)

    var addTask = (id,hashArray, strNoHash, trelloId) => {
      Meteor.call('addTask', id, hashArray, strNoHash, trelloId, function(err, result) {
        if (err) {
          console.log(err)
        } else {
          console.log(hashArray)
          console.log(strNoHash)
        }
      })
    }

    var funcs = []
    var creationSuccess = (data) => {
      console.log('Data returned:' + JSON.stringify(data));
      console.log(data.cards)
      for (var i in data.cards) {
        var str = data.cards[i].name
        var hashArray = (str.match(/#(\w+)/g))
        var strNoHash = str.replace(/#(\w+)/g, "")
        var id = data.cards[i].id
        funcs[i] = addTask.bind(this, this.props.params.pledgeId, hashArray, strNoHash, id)
      }

    for (var j in funcs) {
      funcs[j]();
    }


    };
    var options = {
      fields: 'id',
      card_fields: 'name',
      cards: 'open'
    }
    Trello.get('/lists/' + trelloListId, options, creationSuccess)

  }

  handleRefresh = (e) => {
    e.preventDefault()
    this.trelloAuthorize()
    this.findLists()
  }

  handleTrelloProfile = (event, newValue) => {
    event.preventDefault()
    console.log(newValue)
    this.setState({adminProfile: newValue})
    this.makeUserAdmin(newValue)
  }

  makeUserAdmin = (profile) => {
    var Trello = window.Trello
    this.trelloAuthorize()
    var creationSuccess = (data) => {
      console.log('User made admin - nice:' + JSON.stringify(data));
      Meteor.call('addUserAsTrelloAdmin', this.props.params.pledgeId)
      this.setState({admin: true})
    };
    if (profile.indexOf('@') != -1) {
      var member = profile.replace('@', '')
      var options = {
        idMember: member,
        type: 'admin'
      }
      Trello.put('/boards/' + this.props.pledges[0].trelloBoardUrl + '/members/' + member, options, creationSuccess)
    } else if (profile.indexOf('https://trello.com/') != -1) {
      var member = profile.replace('https://trello.com/', '')
      var options = {
        type: 'admin'
      }
      console.log(options)
      Trello.put('/boards/' + this.props.pledges[0].trelloBoardUrl + '/members/' + member , options, creationSuccess)
    }
  }

  renderStepActions(step, thing) {
    const {stepIndex} = this.state;

    return (
      <div style={{margin: '12px 0'}}>
        <RaisedButton
          label={stepIndex === 2 ? 'Finish' : 'Next'}
          disableTouchRipple={true}
          disabled={!thing}
          disableFocusRipple={true}
          primary={true}
          onTouchTap={this.handleNext}
          style={{marginRight: 12}}
        />
        {step > 0 && (
          <FlatButton
            label="Back"
            disabled={stepIndex === 0}
            disableTouchRipple={true}
            disableFocusRipple={true}
            onTouchTap={this.handlePrev}
          />
        )}
      </div>
    );
  }

  handleNext = () => {
  const {stepIndex} = this.state;
  this.setState({
    stepIndex: stepIndex + 1,
    finished: stepIndex >= 2,
  });
};

handlePrev = () => {
  const {stepIndex} = this.state;
  if (stepIndex > 0) {
    this.setState({stepIndex: stepIndex - 1});
  }
};



  render() {
    console.log(this.state)
    if (!this.props.loading) {
      console.log(this.props.pledges[0].trelloBoardUrl)
    }
    return(
      <div>
        <script src={"https://api.trello.com/1/client.js?key=" + Meteor.settings.public.TrelloAPIKey}></script>
        <Link to={'/pages/pledges/' + this.props.params.pledge +'/' + this.props.params.pledgeId}>
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
        </Link>
          <div style={styles.box}>
            <Card style={{padding: '16px'}}>
              <Toggle
                label="Do you want to start a project?"
                style={styles.toggle}
                onToggle={this.handleToggle}
              />

          </Card>
          </div>

          {!this.props.loading && this.props.pledges[0].trelloBoardUrl ?
            <div style={styles.box}>
          <Card>
          <div style={{maxWidth: 380,  margin: 'auto', paddingBottom: '16px'}}>
        <Stepper activeStep={this.state.stepIndex} orientation="vertical">
          <Step>
            <StepLabel>Sign into your project board</StepLabel>
            <StepContent>
              <p>
                You can find your project board at this <a target="_blank" href={'https://trello.com/b/' + this.props.pledges[0].trelloBoardUrl}>link. </a>
              Go onto the board, sign in or create yourself a Trello account if necessary.
              </p>
              {this.renderStepActions(0, true)}
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Set yourself as admin</StepLabel>
            <StepContent>
              <p>Right, now we need to make sure you're a proper admin of the board.
                Copy the link to your trello profile into the box below
              </p>
              <TextField hintText='Your profile link' onChange={this.handleTrelloProfile}/>
              {this.renderStepActions(1, this.state.admin)}
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Create some To Dos</StepLabel>
            <StepContent>
              <p>
                Add a card to the To Dos list (on the project board).
                <br/><br/>
                At the end of the card, add the skills required as hashtags e.g. <i style={{color: grey500}}>#LegalAdvice #WebDevelopment #SocialMediaMarketing</i>
              </p>
              {this.renderStepActions(2, true)}
            </StepContent>
          </Step>
        </Stepper>
        {this.state.finished && (
          <div>
            <Subheader style={{marginLeft: '46px', boxSizing: 'border-box', width: '80%'}}>
              Your to dos
            </Subheader>
            {this.props.projects.map((project) => (
              <Card style={{marginBottom: '16px', marginLeft: '46px', backgroundColor: grey200, padding: '16px', marginRight: '16px'}}>
                <b>{project.task}</b>
                <i style={{color:grey500, textAlign: 'right'}}>{project.skills}</i>
              </Card>
            ))}
          <div style={{justifyContent: 'center', display: 'flex', marginTop: '-16px', marginLeft: '46px'}}>
            <IconButton tooltip='Click to fetch to dos' onTouchTap={this.handleRefresh}>
              <Refresh/>
            </IconButton>

          </div>
          <Subheader style={{marginLeft: '46px' , boxSizing: 'border-box', width: '80%'}}>
            Link to your project board
          </Subheader>
          <a target="_blank" href={'https://trello.com/b/' + this.props.pledges[0].trelloBoardUrl} style={{marginBottom: '16px'}} >
          <Card style={{ marginLeft: '46px', backgroundColor: blue200, padding: '16px', cursor:'pointer', marginBottom: '16px', marginRight: '16px'}}>
            <b>{this.props.pledges[0].title}</b>
          </Card>
          </a>
          </div>
        )}
      </div>
      </Card>
    </div>
       : null}

        </div>

      );
    }
  }





Project.propTypes = {
  loading: PropTypes.bool.isRequired,
  pledges: PropTypes.array.isRequired,
};

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe("userScores");
  const pledgeHandler = Meteor.subscribe("editor", params.pledgeId);
  const projectHandler = Meteor.subscribe("pledgeProjects", params.pledgeId);


  return {
    loading: !subscriptionHandler.ready() || !pledgeHandler.ready() || !projectHandler.ready(),
    pledges: Pledges.find({_id: params.pledgeId}).fetch(),
    projects: Projects.find({pledgeId: params.pledgeId}).fetch()
  };
}, Project);
