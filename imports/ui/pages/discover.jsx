import React , {PropTypes} from 'react';
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

export class Discover extends React.Component{
  constructor(props) {
    super(props);
    console.log(this.props)
    this.state = {preferences: [], pledge: {}}
  }


  componentWillReceiveProps(nextProps) {
    if(!nextProps.loading) {
      var skills = []
      var options=[]
      for (var i in nextProps.projects) {
        var skillset = nextProps.projects[i].skills
        for (var j in skillset) {
          var skill = skillset[j].replace('#','')
          if (!skills.includes(skill)) {
            skills.push(skill)
            options.push(skillset[j])
          }
        }
      }
      this.setState({dataSource: skills, hashOptions: options, preferences: this.props.user[0].skills})
    }
  }

  handleUpdateInput = (text) => {
    console.log(text)
    var preferences = this.state.preferences
    preferences.push('#' + text)
    this.setState({preferences: preferences})
    Meteor.call('addSkillToUser', '#' + text)
    this.setState({searchText: ''})
  }



  handleListClick (pledgeId, e)  {
    e.preventDefault()
    console.log('List clicking')
    var pledge = Pledges.findOne({_id: pledgeId})
    var link = 'https://trello.com/b/' + pledge.trelloBoardUrl
    this.setState({open: true, pledge: {link: link, coverPhoto: pledge.coverPhoto, title: pledge.title}})

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

  render() {
    console.log(this.state)
    var userSkills =
          this.props.user[0] && this.props.user[0].skills ? this.props.user[0].skills : []

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

            <Card style={{padding: '16px'}}>
              <div style={{height: userSkills.length > 0 ? '40px' : '0px'}}>
                {userSkills.map((each) => (
                  <div style={{float: 'left'}}>
                  <Chip
                    onRequestDelete={this.handleRequestDelete.bind(this, each)}
                    style={styles.chip}
                  >
                    {each}
                  </Chip>
                  </div>
                ))}
              </div>
              {this.state.dataSource ?
                <div>
              <div style={{width: '100%'}}>
              <AutoComplete
                hintText="Enter your skills"
                fullWidth={true}
                searchText = {this.state.searchText}
                dataSource={this.state.dataSource}
                onNewRequest={this.handleUpdateInput}
                onUpdateInput={(searchText, dataSource) => {this.setState({searchText: searchText})}}
              />
              </div>
            <List>
            {this.props.projects.map((project) => (
              (userSkills.length == 0 || project.skills.some(r=> userSkills.includes(r))) ?
              <ListItem primaryText={project.task} secondaryText={project.skills}
                 onTouchTap={this.handleListClick.bind(this, project.pledgeId)}/> : null
            ))}
          </List>
          <Dialog
            modal={false}
            open={this.state.open}
            onRequestClose={this.handleClose}>
              <div>


                <Card>
                 <CardMedia onTouchTap={this.handleDialogClick.bind(this, this.state.pledge.link)}
                   overlay={<CardTitle title={this.state.pledge.title} subtitle='Click to go to the project board' />}
                 >
                   <img src={this.state.pledge.coverPhoto} alt={this.state.pledge.title} />
                 </CardMedia>
                </Card>


              </div>
          </Dialog>

              </div>
        : null}

            </Card>
          </div>


        </div>

      );
    }
  }





Discover.propTypes = {
  loading: PropTypes.bool.isRequired,
  pledges: PropTypes.array.isRequired,
};

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe("userScores");
  const userData = Meteor.subscribe("userData");
  const projectHandler = Meteor.subscribe("allProjects");
  const pledgeHandler = Meteor.subscribe("pledgeTrelloUrl")

  return {
    loading: !subscriptionHandler.ready() || !projectHandler.ready() || !pledgeHandler.ready() || !userData.ready(),
    projects: Projects.find({}).fetch(),
    pledges: Pledges.find({}).fetch(),
    user: Meteor.users.find({_id: Meteor.userId()}).fetch(),
  };
}, Discover);
