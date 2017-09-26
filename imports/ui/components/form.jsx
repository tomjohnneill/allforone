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
import TextField from 'material-ui/TextField';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import Checkbox from 'material-ui/Checkbox';
import {Details} from '/imports/api/pledges.js';
import GooglePlaceAutocomplete from 'material-ui-autocomplete-google-places';
import Dropzone from 'react-dropzone';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FontIcon from 'material-ui/FontIcon';
import FormMap from '/imports/ui/components/formmap.jsx';


export class Form extends React.Component{
  constructor(props) {
    super(props);
    this.state = {stepIndex: 0, response: {}}
  }

  upload = (acceptedFiles, rejectedFiles) => {
    console.log(this.props.pledgeId)
    var metaContext = {pledgeId: this.props.pledgeId};
    console.log(metaContext)
    console.log(this.props.params)
    this.setState({loader: true})
    var uploader = new Slingshot.Upload("UserPledgeUploads", metaContext);
    uploader.send(acceptedFiles[0], (error, downloadUrl) => { // you can use refs if you like
      if (error) {
        // Log service detailed response
        //console.error('Error uploading', uploader.xhr.response);
        Bert.alert(error, 'danger'); // you may want to fancy this up when you're ready instead of a popup.
      }
      else {
      Meteor.call('addUserUpload', downloadUrl, this.props.pledgeId)
      // you will need this in the event the user hit the update button because it will remove the avatar url
      this.setState({loader: false})
    }
    });
  }

  handleNext = () => {
    const stepIndex = this.state.stepIndex;
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2,
    });

    Meteor.call('updateDetail', this.state.response, (err, result) => {
      if (err) {
        Bert.alert(err.reason, 'danger')
      } else {
        this.setState({response: {}})
      }
    })
  };

  handlePrev = () => {
    const stepIndex = this.state.stepIndex;
    if (stepIndex > 0) {
      this.setState({stepIndex: stepIndex - 1});
    }
  };

  renderStepActions(step) {
    const stepIndex = this.state.stepIndex;

    return (
      <div style={{margin: '12px 0'}}>
        <RaisedButton
          label={stepIndex === this.props.details.length - 1 ? 'Finish' : 'Next'}
          disableTouchRipple={true}
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

  handleTextChange (id, e, newValue) {
    this.setState({response: {id: id, value: newValue}})
  }

  getCoords(id, lat, lng, desc){
    console.log(lat, lng);
    console.log(desc)
    this.setState({response: {id: id, value:{place: desc, location: {type: "Point", coordinates : [lng, lat]}}}})
  }

  handleCheckChange (id, option, e, checked) {
    var options = this.state.response.value ? this.state.response.value : []

    if (checked) {
      options.push(option)
    } else {
      options.splice(options.indexOf(option), 1)
    }
    console.log(options)
    this.setState({response: {id: id, value: options}})
  }

  renderStep = (item, step) => {
    var allResponses, userResponse
    if (item.members) {
      allResponses = item.members.filter(function(response){
          return response.userId == Meteor.userId();
      });
       userResponse = allResponses[0]
    } else {
      userResponse = {}
    }

    console.log(userResponse)
    if (item.type === 'text') {

      return (
        <Step>
          <StepLabel>{item.question}</StepLabel>
          <StepContent>
            <TextField onChange={this.handleTextChange.bind(this, item._id)}
              value={this.state.response && this.state.response.value ? this.state.response.value : userResponse ? userResponse.response : null}
              hintText={item.question}/>
            {this.renderStepActions(step)}
          </StepContent>
        </Step>

      )
    } else if (item.type === 'checkbox') {
      var checkedOption = userResponse ? userResponse.response : null
      return (
        <Step>
          <StepLabel>{item.question}</StepLabel>
          <StepContent>
            {item.options.map((option) => (
              <Checkbox onCheck={this.handleCheckChange.bind(this, item._id, option)}
                  label={option}
                  defaultChecked={checkedOption ? checkedOption.includes(option) : false}/>
            ))}
            {this.renderStepActions(step)}
          </StepContent>
        </Step>
      )
    } else if (item.type === 'multipleChoice') {
      var chosenOption = userResponse ? userResponse.response : null
      return (
        <Step>
          <StepLabel>{item.question}</StepLabel>
          <StepContent>
            <RadioButtonGroup
              defaultSelected={chosenOption}
              onChange={this.handleTextChange.bind(this, item._id)}
              name={item.question}>
            {item.options.map((option) => (
              <RadioButton label={option} value={option}/>
            ))}
            </RadioButtonGroup>
            {this.renderStepActions(step)}
          </StepContent>
        </Step>
      )
    } else if (item.type === 'location') {
      if (userResponse && userResponse.response && userResponse.response.place) {
        return (
          <Step>
            <StepLabel>{item.question}</StepLabel>
            <StepContent>
              <FormMap lat={userResponse.response.location.coordinates[1]}
                place={userResponse.response.place}
                lng={userResponse.response.location.coordinates[0]}/>
              {this.renderStepActions(step)}
            </StepContent>
          </Step>
        )
      } else {
        return (
          <Step>
            <StepLabel>{item.question}</StepLabel>
            <StepContent>
              <GooglePlaceAutocomplete
                searchText={this.state.response && this.state.response.value ?
                   this.state.response.value : userResponse && userResponse.response ? userResponse.response.place : ''}
                menuItemStyle={{ fontSize: 13,
                      display: 'block',
                      paddingRight: 20,
                      overflow: 'hidden'}}
                  menuStyle={{cursor: 'default'}}
                  disableFocusRipple={false}
                  results={this.getCoords.bind(this, item._id)}
                />
              {this.renderStepActions(step)}
            </StepContent>
          </Step>
        )
      }
    } else if (item.type === 'image') {
      return (
        <Step>
          <StepLabel>{item.question}</StepLabel>
          <StepContent>
            <Dropzone key={'photos'} onDrop={this.upload}  style={{}}>
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
            {this.renderStepActions(step)}
          </StepContent>
        </Step>
      )
    }
  }

  render() {
    console.log('Form details:')
    console.log(this.props.details)
    return (
      <div>
        {!this.props.loading && this.props.details ?

          <div style={{position: 'relative'}}>
            {Meteor.userId() === null || !this.props.pledgedUsers.includes(Meteor.userId()) ?
            <div style={{width: '100%', height: '400px', zIndex: 10, backgroundColor: 'rgba(238,238,238,0.4)'
              , position:'absolute', top: '0px', verticalAlign: 'bottom', textAlign: 'center',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>


              <div style={{display: 'flex', justifyContent: 'center', backgroundColor: 'rgba(238,238,238,0.4)'}}>


                <div style={{width: '60%'}}>
                  <p style={{marginBottom: '16px'}}>Once you've joined the pledge, we might need a bit more info </p>
              <RaisedButton

                 primary={true} fullWidth={true} label="Join Now" onTouchTap={this.props.setModal} />

                </div>
                </div>
              </div>
               : null}

            <Subheader>
              Add your input
            </Subheader>

        <Stepper activeStep={this.state.stepIndex} orientation="vertical" >
          {this.props.details.map((item) => (
            this.renderStep(item, this.props.details.indexOf(item))
          ))}
        </Stepper>
        </div>

         : null

    }
    </div>
  )
  }
}

Form.propTypes = {
  loading: PropTypes.bool.isRequired,
  details: PropTypes.array
};

export default createContainer((props) => {
  console.log(props)
  const detailHandler = Meteor.subscribe("details", props.pledgeId);

  return {
    loading: !detailHandler.ready(),
    details: Details.find({}).fetch(),
  };
}, Form);
