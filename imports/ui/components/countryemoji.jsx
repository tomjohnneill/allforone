import {emojify} from 'react-emojione';
var countries = require('country-data').countries
import React from 'react'

export default class Emoji extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div>
        {emojify(countries[this.props.user.geo ?
        this.props.user.geo.country : 'GB'].emoji)}
      </div>
    )
  }
}
