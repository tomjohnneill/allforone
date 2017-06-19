import React from 'react';
import ReactDOM from 'react-dom';
import {grey200, grey500} from 'material-ui/styles/colors'
import RaisedButton from 'material-ui/RaisedButton'
import {Link, browserHistory} from 'react-router'
import TypeWriter from 'react-typewriter';

const styles = {
  box: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    margin: '10px',
    padding: '10px',
    width: '60%',
    fontFamily: 'Love Ya Like A Sister',
    fontSize: '60pt',
    textAlign: 'center',
    lineHeight: 1
  },
  header: {
    fontFamily: 'Love Ya Like A Sister',
    color: grey500,
    textAlign: 'center',
    fontSize: '40pt',
    position: 'absolute',
    top: '10vh'
  },
  text: {
    color: grey500,
    textAlign: 'center',
    fontVariant: 'small-caps',
    fontSize: '16pt'
  }
}

export class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {finished: false, counter: 0}
    this.addOne = this.addOne.bind(this)
  }

  handleButtonClick(event) {
    event.preventDefault()
    browserHistory.push('/pledge')
  }

  handleButtonReveal() {
    this.setState({finished: true})
  }

  addOne() {
    this.setState({counter: this.state.counter + 1})
  }

  componentDidMount() {
  this.timer = setInterval(this.addOne, 3000);
}

  componentWillUnmount() {
  clearInterval(this.timer);
  }

  render () {
    console.log(window.innerHeight)
    return (
      <div style={{overflowX: 'hidden'}}>
        <div style={{width: '100%', overflowX: 'hidden'}}><img style={{position: 'absolute', top: '32%', zIndex: '-1', overflow: 'hidden' ,left: '0px', width: '100%', objectFit: 'cover'}}
          src='/images/splash.jpg'/>
      </div>

        <div style={{height: '85vh',display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <div style={styles.header}>
              ALL FOR ONE
            </div>

            <div  style={{position: 'absolute', top: '25vh'}}>
            <div style={styles.text}>
              Make a Change
            </div>
            <div style={{height: '20px'}}/>
            <div style={styles.text}>
              Make Others Change
            </div>
            </div>

            <div style={{width: '80%',bottom: '15px', left: '10%',position: 'absolute'}}>
          <RaisedButton
            fullWidth={true} primary={true} label="Change the world" onTouchTap = {this.handleButtonClick.bind(this)}/>
            </div>

            </div>



      </div>
    )
  }
}
