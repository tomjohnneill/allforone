import React , {PropTypes} from 'react'
import { createContainer } from 'meteor/react-meteor-data';
import {Pledges, Details} from '/imports/api/pledges.js';
import {Reviews} from '/imports/api/reviews.js';
import {List, ListItem} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import {grey200, grey500, grey100, amber500, blue200} from 'material-ui/styles/colors';
import Avatar from 'material-ui/Avatar';
import FileFolder from 'material-ui/svg-icons/file/folder';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import {blue500, yellow600, orange600, red600, blueGrey600} from 'material-ui/styles/colors';
import EditorInsertChart from 'material-ui/svg-icons/editor/insert-chart';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import Subheader from 'material-ui/Subheader';
import ActionInfo from 'material-ui/svg-icons/action/info';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import Edit from 'material-ui/svg-icons/content/add-circle-outline';
import IconButton from 'material-ui/IconButton';
import Close from 'material-ui/svg-icons/navigation/close';
import Remove from 'material-ui/svg-icons/content/remove-circle-outline';
import Checkbox from 'material-ui/Checkbox';
import CheckboxIcon from 'material-ui/svg-icons/toggle/check-box';
import RadioButtonIcon from 'material-ui/svg-icons/toggle/radio-button-checked';
import TextIcon from 'material-ui/svg-icons/content/text-format';
import Photo from 'material-ui/svg-icons/image/photo';
import LocationOn from 'material-ui/svg-icons/communication/location-on';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {Link, browserHistory} from 'react-router';
import {
  Step,
  Stepper,
  StepLabel,
  StepContent,
} from 'material-ui/Stepper';

const styles = {
  box: {
    backgroundColor: grey200,
    padding: '10px',
    width: '100%',
    overflowX: 'hidden',
    boxSizing: 'border-box'
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
  explanation: {
    fontSize: '8pt',
    color: grey500
  }

}

class MultipleChoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {formItems: [], open:false, radioOpen: false, options: this.props.options ? this.props.options : []
      , newOption: '',
    question : this.props.question ? this.props.question : ''}
  }

  state = {selectedIndex: 0};

  handleAddButton = (e) => {
    this.setState({radioOpen: true})
  }

  handleAdd = (e) => {
    e.preventDefault()
    if (this.state.newOption !== '') {
      var options = this.state.options
      options.push(this.state.newOption)
      this.setState({newOption: '', options: options})
      this.props.sendInfo({_id: this.props.index, question: this.state.question, options: this.state.options, type: "multipleChoice"})
    }
  }

  handleCancel = (e) => {
    e.preventDefault()
    this.setState({radioOpen: false})
  }

  handleChangeOption = (e, newValue) => {
    this.setState({newOption: newValue})
  }

  handleGetRid = (e) => {
    e.preventDefault()
    this.props.getRid(this.props.index)
  }

  handleTextChange = (e, newValue) => {
    this.setState({question: newValue})
    this.props.sendInfo({_id: this.props.index, question: newValue, options: this.state.options, type: "multipleChoice"})
  }

  handleRemoveOption (text) {
    var options = this.state.options
    options.splice(options.indexOf(text), 1)
    this.setState({options: options})
  }

  handleThisThing = (e) => {
    if (e.key == 'Enter') {
      e.preventDefault()
      console.log('Enter got hit')
      this.handleAdd(e)
    }
  }

  render() {

    return (
      <div style={{position: 'relative'}}>
        <Card style={{marginTop: '20px'}}>
          <IconButton style={{position: 'absolute', top: '0px', right: '0px'}}
            onTouchTap={this.handleGetRid} tooltip="Get rid of this question">
            <Close color='red'/>
          </IconButton>
        <CardTitle title={'Q' + (this.props.qNumber) + ': Multiple choice'}
          children={
            <div>
            <div style={styles.explanation}>
              Set the question you want to ask then add the different options for responses.
            </div>
          <TextField fullWidth={true}
            value={this.state.question}
            hintText='What do you want to ask?'
            onChange={this.handleTextChange}/>
          <div style={{display: 'flex'}}>
        <RadioButtonGroup style={{width: 'calc(100% - 48px)'}} name="shipSpeed" defaultSelected="1" >
            {this.state.options.map((text) => (
                <RadioButton
                  value={text}
                  label={text}
                />

            ))}
          </RadioButtonGroup>
          <div >
            {this.state.options.map((text) => (
              <div style={{position: 'relative', width: '48px', height: '28.8px'}}>
              <IconButton style={{position: 'absolute', top: '0px', right: '0px', padding: '0px', height: 'auto'}}
                  onTouchTap={this.handleRemoveOption.bind(this, text)} tooltip="Get rid of this option">
                  <Remove />
                </IconButton>
              </div>
            ))}
          </div>
          </div>
          {this.state.options.length < 11 ?
      <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
      <IconButton onTouchTap={this.handleAddButton} tooltip="Add an option">
        <Edit />
      </IconButton>
    </div> : null}
  </div> }
  />

      <Dialog open={this.state.radioOpen}
        actions={[<FlatButton label='Add' onTouchTap={this.handleAdd}/>
      ,<FlatButton label='Close' onTouchTap={this.handleCancel}/>]}>
        <div style={{color: 'rgba(0,0,0,0.84)', fontSize: '24px'}}>
          Add an option
        </div>
        <TextField
          value={this.state.newOption}
          hintText='Type in the option'
          onChange={this.handleChangeOption}
          onKeyPress={this.handleThisThing} />
      </Dialog>
      </Card>
      </div>

    )
  }
}

class Checkboxes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {formItems: [], open:false, checkboxOpen: false,
      options: this.props.options ? this.props.options : [], newOption: '',
      question : this.props.question ? this.props.question : ''}
  }

  state = {selectedIndex: 0};

  handleAddButton = (e) => {
    this.setState({checkboxOpen: true})
  }

  handleAdd = (e) => {
    e.preventDefault()
    if (this.state.newOption !== '') {
      var options = this.state.options
      options.push(this.state.newOption)
      this.setState({newOption: '', options: options})
      this.props.sendInfo({_id: this.props.index, question: this.state.question, options: this.state.options, type: "checkbox"})
    }
  }

  handleThisThing = (e) => {
    if (e.key == 'Enter') {
      e.preventDefault()
      console.log('Enter got hit')
      this.handleAdd(e)
    }
  }

  handleGetRid = (e) => {
    e.preventDefault()
    this.props.getRid(this.props.index)
  }

  handleCancel = (e) => {
    e.preventDefault()
    this.setState({checkboxOpen: false})
  }

  handleTextChange = (e, newValue) => {
    this.setState({question: newValue})
    this.props.sendInfo({_id: this.props.index, question: newValue, options: this.state.options, type: "checkbox"})
  }

  handleChangeOption = (e, newValue) => {
    this.setState({newOption: newValue})
  }

  handleRemoveOption (text) {
    var options = this.state.options
    options.splice(options.indexOf(text), 1)
    this.setState({options: options})
  }

  render() {

    return (
      <div style={{position: 'relative'}}>
        <Card style={{marginTop: '20px'}}>
          <IconButton style={{position: 'absolute', top: '0px', right: '0px'}}
            onTouchTap={this.handleGetRid} tooltip="Get rid of this question">
            <Close color='red'/>
          </IconButton>
        <CardTitle title={'Q' + (this.props.qNumber) + ': Checkboxes'}
          children={
            <div>
            <div style={styles.explanation}>
              Set the question you want to ask then add the different options for responses.
            </div>
            <TextField
              fullWidth={true} value={this.state.question} onChange={this.handleTextChange} hintText='What do you want to ask?'/>

                {this.state.options.map((text) => (
                  <div style={{position: 'relative'}}>
                    <Checkbox style={{width: 'calc(100% - 48px)'}}
                      label={text}
                    />
                  <IconButton style={{position: 'absolute', top: '0px', right: '0px', padding: '0px', height: 'auto'}}
                      onTouchTap={this.handleRemoveOption.bind(this, text)} tooltip="Get rid of this option">
                      <Remove/>
                    </IconButton>
                </div>
                ))}

              {this.state.options.length < 11 ?
          <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
          <IconButton onTouchTap={this.handleAddButton} tooltip="Add an option">
            <Edit />
          </IconButton>
        </div> : null}
        </div>
          }
        />



      <Dialog open={this.state.checkboxOpen}
        actions={[<FlatButton label='Add' onTouchTap={this.handleAdd}/>
      ,<FlatButton label='Close' onTouchTap={this.handleCancel}/>]}>
      <div style={{color: 'rgba(0,0,0,0.84)', fontSize: '24px'}}>
        Add an option
      </div>
        <TextField value={this.state.newOption} hintText='Type in the option' onKeyPress={this.handleThisThing} onChange={this.handleChangeOption}/>
      </Dialog>
      </Card>
      </div>

    )
  }
}

class ImageField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {options: [], newOption: '', question: this.props.question ? this.props.question : ''}
  }

  handleGetRid = (e) => {
    e.preventDefault()
    this.props.getRid(this.props.index)
  }

  handleChangeOption = (e, newValue) => {
    this.setState({newOption: newValue})
  }

  handleTextChange = (e, newValue) => {
    this.setState({question: newValue})
    this.props.sendInfo({_id: this.props.index, question: newValue, type: "image"})
  }

  render() {

    return (
      <div style={{position: 'relative'}}>
        <Card style={{marginTop: '20px'}}>
          <IconButton style={{position: 'absolute', top: '0px', right: '0px'}}
            onTouchTap={this.handleGetRid} tooltip="Get rid of this question">
            <Close color='red'/>
          </IconButton>
        <CardTitle title={'Q' + (this.props.qNumber) + ': Upload Image'}
          children={
            <div>
              <div style={styles.explanation}>
                A field for uploading an image. You need to specify what images people should upload.
              </div>

        <TextField fullWidth={true} value={this.state.question} hintText='What images should I upload?' onChange={this.handleTextChange}/>

        <div style={{ boxSizing: 'border-box',padding: '20px', height: '40%', alignItems: 'center'
          , textAlign: 'center', backgroundColor: grey200}}>
          Image upload box
        </div>

      </div>
    } />
        </Card>
      </div>

    )
  }
}

class LocationField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {options: [], newOption: '', question: this.props.question ? this.props.question : ''}
  }

  handleGetRid = (e) => {
    e.preventDefault()
    this.props.getRid(this.props.index)
  }

  handleChangeOption = (e, newValue) => {
    this.setState({newOption: newValue})
  }

  handleTextChange = (e, newValue) => {
    this.setState({question: newValue})
    this.props.sendInfo({_id: this.props.index, question: newValue, type: "location"})
  }

  render() {

    return (
      <div style={{position: 'relative'}}>
        <Card style={{marginTop: '20px'}}>
          <IconButton style={{position: 'absolute', top: '0px', right: '0px'}}
            onTouchTap={this.handleGetRid} tooltip="Get rid of this question">
            <Close color='red'/>
          </IconButton>
        <CardTitle title={'Q' + (this.props.qNumber) + ': Add Location'}
          children={
            <div>
              <div style={styles.explanation}>
                Here we will request a user's location. You need to ask for the correct one, i.e. do you need to know where they live, or where they work?
              </div>

        <TextField fullWidth={true} value={this.state.question} hintText='What do I need the location for?' onChange={this.handleTextChange}/>

        <div style={{ boxSizing: 'border-box',padding: '20px', height: '40%', alignItems: 'center'
          , textAlign: 'center', backgroundColor: grey200}}>
          Location drop down
        </div>

      </div>
    } />
        </Card>
      </div>

    )
  }
}


class SimpleTextField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {options: [], newOption: '', question: this.props.question ? this.props.question : ''}
  }

  handleChangeOption = (e, newValue) => {
    this.setState({newOption: newValue})
  }

  handleGetRid = (e) => {
    e.preventDefault()
    this.props.getRid(this.props.index)
  }

  handleTextChange = (e, newValue) => {
    this.setState({question: newValue})
    this.props.sendInfo({_id: this.props.index, question: newValue, type: "text"})
  }

  render() {

    return (
      <div style={{position: 'relative'}}>
        <Card style={{marginTop: '20px'}}>
          <IconButton style={{position: 'absolute', top: '0px', right: '0px'}}
            onTouchTap={this.handleGetRid} tooltip="Get rid of this question">
            <Close color='red'/>
          </IconButton>
        <CardTitle title={'Q' + (this.props.qNumber) + ': Text Question'}
          children={
            <div>
              <div style={styles.explanation}>
                A simple question that users can answer with one line of text.
              </div>

        <TextField fullWidth={true} onChange={this.handleTextChange} value={this.state.question} hintText='What do you want to ask?'/>

      </div>
    } />
        </Card>
      </div>

    )
  }
}



export class FormBuilder extends React.Component{
  constructor(props) {
    super(props);
    this.state = {optionLength: 0, open:false, formItems: [],  radioOpen: false, data:[], finished: false,
    stepIndex: 0}
  }


  componentWillReceiveProps(nextProps) {
    if (!nextProps.loading) {
      console.log(nextProps.details)
      if (nextProps.details.length > 0) {
        var items = []
        var dataItems = []
        var details = nextProps.details
        for (var i in details) {
          var qNo = i*1 + 1
          console.log(details[i])
          if (details[i].type === 'text') {
            items.push({_id: details[i]._id, component: <SimpleTextField index={details[i]._id} qNumber={qNo}
              getRid={this.getRid} sendInfo={this.setChildInfo}
             question={details[i].question}/>})
          } else if (details[i].type === 'checkbox') {
            items.push({_id: details[i]._id, component: <Checkboxes index={details[i]._id} qNumber={qNo}
              getRid={this.getRid} sendInfo={this.setChildInfo}
              options={details[i].options} question={details[i].question}/>})
          } else if (details[i].type === 'location') {
            items.push({_id: details[i]._id, component: <LocationField index={details[i]._id} qNumber={qNo}
              getRid={this.getRid} sendInfo={this.setChildInfo}
             question={details[i].question}/>})
          } else if (details[i].type === 'multipleChoice') {
            items.push({_id: details[i]._id, component: <MultipleChoice index={details[i]._id} qNumber={qNo}
              getRid={this.getRid} sendInfo={this.setChildInfo}
              options={details[i].options} question={details[i].question}/>})
          } else if (details[i].type === 'image') {
            items.push({_id: details[i]._id, component: <ImageField index={details[i]._id} qNumber={qNo}
              getRid={this.getRid} sendInfo={this.setChildInfo}
               question={details[i].question}/>})
          }
        }
        console.log(items)
        this.setState({formItems: items, data: details})
      }
    }
  }

  handleNext = () => {
    const stepIndex = this.state.stepIndex;
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2,
    });
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
          label={stepIndex === this.state.data.length - 1 ? 'Finish' : 'Next'}
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

  handleAddField = (e) => {
    e.preventDefault()
    this.setState({open: true})
  }

  handleClick = () => {
    this.setState({open: false})
  }

  setChildInfo = (data) => {
    var stuff = this.state.data
    var position = stuff.length
    for (var i in stuff) {
      if (stuff[i]._id === data._id) {
        position = i
      }
    }
    stuff.splice(position, 1)
    stuff.push(data)
    this.setState({data: stuff})
  }

  getRid = (index) => {
    var currentItems = this.state.formItems
    var currentData = this.state.data
    var position = 0
    for (var i in currentItems) {
      if (currentItems[i]._id === index) {
        position = i
      }
    }
    var dataPosition = this.state.data.length
    for (var j in currentData) {
      if (currentData[j]._id === index) {
        dataPosition = j
      }
    }
    currentItems.splice(position, 1)
    currentData.splice(dataPosition, 1)
    this.setState({formItems: currentItems, data: currentData})
  }

  handleTextFieldClick = () => {
    var items = this.state.formItems
    var index = Random.id(6)
    var textFieldItem =
      <SimpleTextField index={index} qNumber={this.state.formItems.length + 1} getRid={this.getRid} sendInfo={this.setChildInfo}/>
    items.push({_id: index, component: textFieldItem})
    this.setState({formItems: items, open: false})
  }

// pass a function from the parent to the child that update state in the parent to make a schema (don't need to bother with it looking pretty)

  handleMultipleChoiceClick = () => {
    var items = this.state.formItems
    var index = Random.id(6)
    var blah = 'child'
    var multiChoiceItem = <MultipleChoice index={index} qNumber={this.state.formItems.length + 1} getRid={this.getRid} sendInfo={this.setChildInfo}/>
    items.push({_id: index, component: multiChoiceItem})
    this.setState({formItems: items, open: false})
  }

  handleCheckboxClick = () => {
    var items = this.state.formItems
    var index = Random.id(6)
    var checkboxItem = <Checkboxes index={index} qNumber={this.state.formItems.length + 1}
      getRid={this.getRid} sendInfo={this.setChildInfo}/>
    items.push({_id: index, component: checkboxItem})
    this.setState({formItems: items, open: false})
  }

  handleImageFieldClick = () => {
    var items = this.state.formItems
    var index = Random.id(6)
    var imageItem = <ImageField index={index} qNumber={this.state.formItems.length + 1} getRid={this.getRid} sendInfo={this.setChildInfo}/>
    items.push({_id: index, component: imageItem})
    this.setState({formItems: items, open: false})
  }

  handleLocationOptionClick = () => {
    var items = this.state.formItems
    var index = Random.id(6)
    var locationItem = <LocationField index={index} qNumber={this.state.formItems.length + 1} getRid={this.getRid} sendInfo={this.setChildInfo}/>
    items.push({_id: index, component: locationItem})
    this.setState({formItems: items, open: false})
  }

  handlePrint = (e) => {
    e.preventDefault()
    console.log(this.state.data)
    this.setState({preview: true})
  }

  handleBackClick = (e) => {
    e.preventDefault()
    browserHistory.push('/pages/pledges/' + this.props.params.pledge +'/' + this.props.params._id)
  }

  handleSubmit = (e) => {
    e.preventDefault()
    Meteor.call('saveQuestions', this.props.params._id, this.state.data, (err, result) => {
      if (err) {
        Bert.alert(err.reason, 'danger')
      } else {
        Bert.alert('Questions Saved', 'success')
        browserHistory.push('/pages/pledges/' + this.props.params.pledge +'/' + this.props.params._id)
      }
    })
  }

  renderPreview = (item, step) => {
    if (item.type === 'text') {
      return (
        <Step>
          <StepLabel>{item.question}</StepLabel>
          <StepContent>
            <TextField hintText={item.question}/>
            {this.renderStepActions(step)}
          </StepContent>
        </Step>

      )
    } else if (item.type === 'checkbox') {
      return (
        <Step>
          <StepLabel>{item.question}</StepLabel>
          <StepContent>
            {item.options.map((option) => (
              <Checkbox label={option}/>
            ))}
            {this.renderStepActions(step)}
          </StepContent>
        </Step>
      )
    } else if (item.type === 'multipleChoice') {
      return (
        <Step>
          <StepLabel>{item.question}</StepLabel>
          <StepContent>
            <RadioButtonGroup name={item.question}>
            {item.options.map((option) => (
              <RadioButton label={option}/>
            ))}
            </RadioButtonGroup>
            {this.renderStepActions(step)}
          </StepContent>
        </Step>
      )
    } else if (item.type === 'location') {
      return (
        <Step>
          <StepLabel>{item.question}</StepLabel>
          <StepContent>
            Location box
            {this.renderStepActions(step)}
          </StepContent>
        </Step>
      )
    } else if (item.type === 'image') {
      return (
        <Step>
          <StepLabel>{item.question}</StepLabel>
          <StepContent>
            Image dropzone
            {this.renderStepActions(step)}
          </StepContent>
        </Step>
      )
    }
  }

  render () {
    console.log(this.state.data)
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
          Get Information
        </Subheader>
        {this.props.loading ? null :

        <div style={styles.box}>


            {this.state.formItems.map((item) => (
              item.component
            ))}

            <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '16px', marginTop: '16px'}}>
            <RaisedButton label='Add a new Question' onTouchTap={this.handleAddField}/>
            </div>
          <Dialog open={this.state.open}>
            <List>
              <Subheader>Types of questions</Subheader>
              <ListItem
                leftAvatar={<Avatar icon={<TextIcon />} backgroundColor={blue500} />}
                onTouchTap={this.handleTextFieldClick}
                primaryText="Simple Text Field"
                secondaryText="A question with a one line answer that can be different for everyone"
              />
              <ListItem
                leftAvatar={<Avatar icon={<RadioButtonIcon />} backgroundColor={yellow600} />}
                onTouchTap={this.handleMultipleChoiceClick}
                primaryText="Multiple Choice"
                secondaryText="Give your users up to 11 options to choose from"
              />
              <ListItem
                leftAvatar={<Avatar icon={<Photo />} backgroundColor={red600} />}
                onTouchTap={this.handleImageFieldClick}
                primaryText="Image Upload"
                secondaryText="Ask people to upload an image"
              />
              <ListItem
                leftAvatar={<Avatar icon={<CheckboxIcon />} backgroundColor={orange600} />}
                onTouchTap={this.handleCheckboxClick}
                primaryText="Checkboxes"
                secondaryText="A question where more than one option can be selected"
              />
              <ListItem
                leftAvatar={<Avatar icon={<LocationOn />} backgroundColor={blueGrey600} />}
                onTouchTap={this.handleLocationOptionClick}
                primaryText="Location"
                secondaryText="Ask for someone's preferred location"
              />
            </List>
          </Dialog>

          {this.state.data.length > 0 ?
            <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '16px'}}>
              <RaisedButton label='View Preview' onTouchTap={this.handlePrint}/>
            </div>
            : null }

          {this.state.preview ?
            <Card style={{marginTop: '20px'}}>
              <CardTitle title='Questions Preview' children={
                  <div style={styles.explanation}>
                    The form may look slightly different on different platforms, but this is a good idea of the basic layout.
                  </div>
                }/>
              <Stepper activeStep={this.state.stepIndex} orientation="vertical">
                {this.state.data.map((item) => (
                  this.renderPreview(item, this.state.data.indexOf(item))
                ))}
              </Stepper>
            </Card> : null
          }

            {this.state.preview ?
              <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '16px', marginTop: '16px'}}>
                <RaisedButton label='Save Questions' onTouchTap={this.handleSubmit}/>
              </div>
              : null }

        </div>
      }
      </div>
    )
  }
}

FormBuilder.propTypes = {
  pledge: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  details: PropTypes.array
};

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe("editor", params._id);
  const detailHandler = Meteor.subscribe("details", params._id);
  const randomHandler = Meteor.subscribe("random")

  return {
    loading: !subscriptionHandler.ready() || !detailHandler.ready() || !randomHandler.ready(),
    pledge: Pledges.find({_id: params._id}).fetch()[0],
    details: Details.find({hi: {$ne: "hi"}}).fetch(),
    random: Details.find({hi: "hi"}).fetch(),
  };
}, FormBuilder);
