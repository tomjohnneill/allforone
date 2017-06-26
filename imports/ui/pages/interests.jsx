import React , {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

export  class Interests extends React.Component{
  constructor(props) {
    super(props);
    this.state={interest: ''}
  }

  handleChange = (event, newValue) => {
    this.setState({interest: newValue})
  }

  handleSubmit = (e) => {
    e.preventDefault()
    Meteor.call('newInterest', this.state.interest)
  }

  render() {
    return (
      <div>
        <TextField value = {this.state.interest } onChange={this.handleChange}/>
        <FlatButton label='Submit' onTouchTap = {this.handleSubmit}/>
      </div>
    )
  }
}
