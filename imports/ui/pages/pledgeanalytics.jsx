import React , {PropTypes} from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {grey200, grey500, grey100, amber500} from 'material-ui/styles/colors'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Session } from 'meteor/session';
import Dialog from 'material-ui/Dialog';
import {Link, browserHistory} from 'react-router';
import {PledgeVisits, Pledges} from '/imports/api/pledges.js';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import DocumentTitle from 'react-document-title';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import DatePicker from 'material-ui/DatePicker';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import IconButton from 'material-ui/IconButton';

var _ = lodash

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
  chip: {
  margin: 4,
},
}

export class PledgeAnalytics extends React.Component{
  constructor(props) {
    super(props);
    this.state={pledge: 'all', byPledge:[]}
  }


  componentDidMount(){
    if (google.charts) {
      google.charts.load('current', {'packages':['corechart', 'geochart'], 'mapsApiKey': Meteor.settings.public.GoogleMapsAPIKey});
    }
    if (google.visualization && !this.props.loading) {
      this.drawCharts(this.props.pledge);
    }
  }
  componentDidUpdate(){
    if (google.charts) {
    google.charts.load('current', {'packages':['corechart', 'geochart'], 'mapsApiKey': Meteor.settings.public.GoogleMapsAPIKey});
    }
    if (google.visualization && !this.props.loading) {
      this.drawCharts(this.props.pledge);
    }

  }

  componentWillReceiveProps(nextProps) {
  if (!nextProps.loading)
  {var dateList = this.getDateList(nextProps.pledge)

    var pledgeGrouped = _.countBy(dateList, 'pledgeId')
    //pledgeGrouped = _.sortBy(pledgeGrouped, )
    console.log(pledgeGrouped)
    var signUpList = []
    for (var i in dateList) {
      if (dateList[i].signUpClick) {
        signUpList.push(dateList[i])
      }
    }
    var signUpPledgeGrouped = _.countBy(signUpList, 'pledgeId')
    var cleanPledges = []
    var keys = Object.keys(pledgeGrouped)
    for (var j in pledgeGrouped) {
      console.log(keys)
      console.log(j)
      var title = Pledges.findOne({_id: j}) ? Pledges.findOne({_id: j}).title : null
      if (j !== 'returning' && j !== 'null' && j !== 'true' && title ) {

        cleanPledges.push({id: j, visits: pledgeGrouped[j], signups: signUpPledgeGrouped[j] ? signUpPledgeGrouped[j] : 0,
                            title: title})
      }
    }
    this.setState({byPledge: cleanPledges})
    console.log(this.state)
    console.log('hello')
  }
  }

  getDateList(pledge) {

      var dateList
      if (this.state.minDate && this.state.maxDate) {
        var minDate = this.state.minDate
        var newMaxDate = moment(this.state.maxDate).clone().toDate()
        var otherDate = new Date(newMaxDate.setHours(23,59,59,999) )
        dateList = PledgeVisits.find({'visit.date': {$ne: undefined},
        'visit.date': {$gte: minDate}, 'visit.date': {$lte: otherDate}, pledgeId: pledge._id},
        {fields: {'visit.date' : 1, user: 1, signUpClick: 1,  'visit.referer': 1,
          'visit.geo.ll': 1, 'visit.userAgent.device.type':1, 'pledgeId': 1, 'type': 1}}).fetch()
      } else {
        dateList = PledgeVisits.find({'visit.date': {$ne: undefined}, pledgeId: pledge._id},
        {fields: {'visit.date' : 1, user: 1, signUpClick: 1,  'visit.referer': 1,
          'visit.geo.ll': 1, 'visit.userAgent.device.type':1, 'pledgeId': 1, 'type': 1}}).fetch()
      }
    return (
      dateList
    )
  }

  drawCharts = (pledge) => {
    var dateList = this.getDateList(pledge)

    var dateCount = {}
    var userCount = {}
    var signUpCount = {}
    for (var i in dateList) {
      var x = Object.keys(dateCount)
      var y = Object.keys(userCount)
      var z = Object.keys(signUpCount)
      var date = new Date(dateList[i].visit.date.setHours(0,0,0,0))
      if (x.includes(date.toString())) {
        dateCount[date] = dateCount[date] + 1

      } else {
        dateCount[date] = 1
      }
      if (y.includes(date.toString()) && dateList[i].user) {
                userCount[date] = userCount[date] +  1
              } else if (dateList[i].user)
              {
                userCount[date] = 1
              }
      if (z.includes(date.toString()) && dateList[i].signUpClick) {
        signUpCount[date] = signUpCount[date] +  1
      } else if (dateList[i].signUpClick) {
        signUpCount[date] = 1
      }
    }

    var mobileCount = 0
    var totalCount = 0
    for (var i in dateList) {
      if (dateList[i].visit.userAgent && dateList[i].visit.userAgent.device
          && dateList[i].visit.userAgent.device.type == 'mobile') {
        mobileCount += 1
        totalCount += 1
      } else {
        totalCount += 1
      }
    }

    var facebookCount = 0
    var totalCount = 0
    var twitterCount = 0
    var googleCount = 0
    var linkedInCount = 0
    var directCount = 0
    var allforoneCount = 0

    for (var i in dateList) {
      if (dateList[i].visit && dateList[i].visit.referer && dateList[i].visit.referer.indexOf("facebook.com") != -1) {
        facebookCount += 1
        totalCount += 1
      } else if (dateList[i].visit && dateList[i].visit.referer && (dateList[i].visit.referer.indexOf("twitter.com") != -1
          || dateList[i].visit.referer.indexOf("t.co") != -1)) {
        twitterCount += 1
        totalCount += 1
      } else if (dateList[i].visit && dateList[i].visit.referer && dateList[i].visit.referer.indexOf("linkedin.com") != -1) {
        linkedInCount += 1
        totalCount += 1
      } else if (dateList[i].visit && dateList[i].visit.referer  && dateList[i].visit.referer.indexOf("google") != -1) {
        googleCount += 1
        totalCount += 1
      } else if (dateList[i].visit && dateList[i].visit.referer === null) {
        directCount += 1
        totalCount += 1
      } else if (dateList[i].visit && dateList[i].visit.referer && dateList[i].visit.referer.indexOf("allforone.io") != -1) {
        allforoneCount += 1
        totalCount += 1
      }

      else {
        totalCount += 1
      }
    }

    function enumerateDaysBetweenDates(startDate, endDate) {
        var dates = [];

        var currDate = startDate.clone().startOf('day');
        var lastDate = endDate.clone().startOf('day');

        while(currDate.add(1, 'days').diff(lastDate) < 0) {
            dates.push(currDate.clone().toDate());
        }
        dates.push(endDate.startOf('day').toDate())
        return dates;
    };


    var axisDates
    if (this.state.minDate && this.state.maxDate) {
      axisDates = enumerateDaysBetweenDates(moment(this.state.minDate).clone().subtract(1, 'days'), moment(this.state.maxDate))
    } else {
      var today = new Date()
      axisDates = enumerateDaysBetweenDates(moment(today).clone().subtract(7, 'days'), moment(new Date()))
    }


    var dataTable =[]
    for (var i in axisDates) {
      dataTable[i] = [axisDates[i], dateCount[axisDates[i]] ? dateCount[axisDates[i]]: 0,
                    //    userCount[axisDates[i]] ? userCount[axisDates[i]] : 0,
                        signUpCount[axisDates[i]] ? signUpCount[axisDates[i]] : 0
                      ]
    }



    var data = new google.visualization.DataTable();
    data.addColumn('date', 'Date');
    data.addColumn('number', 'Visits')
  //  data.addColumn('number', 'Visits from Users')
    data.addColumn('number', 'Signups')


    data.addRows(dataTable);



    var wrapper = new google.visualization.ChartWrapper({
      chartType: 'AreaChart',
      dataTable: data,
      options: {'title': 'Visits', 'hAxis.maxValue': new Date(), 'legend':{'position': 'top', 'margin-top': '20px'}},
      containerId: 'graph'
    });
    wrapper.draw();

    var rows = [['Mobile', mobileCount],['Desktop', totalCount-mobileCount]]
    var trafficSourceDataRows = [
      ['Facebook', facebookCount],
      ['Twitter', twitterCount],
      ['All For One', allforoneCount],
      ['Direct', directCount],
      ['LinkedIn', linkedInCount],
      ['Google', googleCount],
      ['Other', totalCount - facebookCount - twitterCount - allforoneCount - directCount - linkedInCount - googleCount]
    ]

    var pieData = new google.visualization.DataTable();
    pieData.addColumn('string', 'Type')
    pieData.addColumn('number', 'Visits')
    pieData.addRows(rows)

    var trafficSourceData = new google.visualization.DataTable();
    trafficSourceData.addColumn('string', 'Traffic Source')
    trafficSourceData.addColumn('number', 'Visits')
    trafficSourceData.addRows(trafficSourceDataRows)

    var pieWrapper = new google.visualization.ChartWrapper({
      chartType: 'PieChart',
      dataTable: pieData,
      options: {'title': 'Device', 'legend':{'position':'top'}},
      containerId: 'device'
    })
    pieWrapper.draw()

    var trafficSourceWrapper = new google.visualization.ChartWrapper({
      chartType: 'PieChart',
      dataTable: trafficSourceData,
      options: {'title': 'Traffic Source', 'legend':{'position':'top'}},
      containerId: 'trafficSource'
    })
    trafficSourceWrapper.draw()

    var markerLocations = []
    for (var i in dateList) {
      if (dateList[i].visit.geo && dateList[i].visit.geo.ll) {
        markerLocations.push([dateList[i].visit.geo.ll[0], dateList[i].visit.geo.ll[1],1])
      }
    }

    var geoData = new google.visualization.DataTable();
    geoData.addColumn('number', 'Lat')
    geoData.addColumn('number', 'Lng')
    geoData.addColumn('number', 'Visits')
    geoData.addRows(markerLocations)

    var geoWrapper = new google.visualization.ChartWrapper({
      chartType: 'GeoChart',
      dataTable: geoData,
      options: {displayMode: 'markers', 'title': 'Visitor Locations', 'sizeAxis': {'maxSize': 4}},
      containerId: 'geochart'
    })
    geoWrapper.draw()

  }

  handleSetState = (e) => {
    e.preventDefault()
    this.setState({la: true})
  }

  handleChangeMinDate = (event, date) => {
    this.setState({
      minDate: date,
    });
  };

  handleChangeMaxDate = (event, date) => {
    this.setState({
      maxDate: date,
    });
  };

  handleChange = (event, index, value) => {
    this.setState({pledge: value})
  }

  handleBackClick = (e) => {
    e.preventDefault()
    browserHistory.push('/pages/pledges/' + this.props.params.pledge +'/' + this.props.params._id)
  }


  render() {

    console.log(this.state)
    if (google.charts) {
      google.charts.load('current', {'packages':['corechart', 'geochart'], 'mapsApiKey': Meteor.settings.public.GoogleMapsAPIKey});
    }
    if (google.visualization && !this.props.loading) {
      this.drawCharts(this.props.pledge);
    }

    if (this.props.user && this.props.user.justAddedPledge) {
      this.handleNewPledge
    }

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
        <Subheader>
          Analytics - who is looking at your pledge
        </Subheader>
        <Divider/>
        <Subheader style={{height: '36px'}}>
          Choose custom dates
        </Subheader>
        <div style={{display: 'flex', paddingLeft: '16px', paddingRight: '16px'}}>
        <div style={{width: '50%', padding: '10px', boxSizing: 'border-box'}}>
        <DatePicker hintText="Start Date" onChange={this.handleChangeMinDate}
          defaultDate={this.state.minDate}
          maxDate={new Date()}
          fullWidth={true}
          autoOk={true}/>
      </div>
      <div style={{width: '50%', padding: '10px', boxSizing: 'border-box'}}>
        <DatePicker hintText="End Date" maxDate={new Date()}
          minDate = {this.state.minDate}
          defaultDate={this.state.maxDate}
          autoOk={true}
          fullWidth={true}
          onChange={this.handleChangeMaxDate}/>
        </div>
      </div>
      <div style={{marginBottom: '20px'}} id="graph" ref='graph'>

      </div>

      <Divider style={{marginBottom: '20px'}}/>
      <div style={{display: 'flex', marginBottom: '2px', marginTop: '20px'}}>
      <div style={{width: '50%'}} id='device'/>
      <div style={{width: '50%'}} id='trafficSource'/>
      </div>
      <Divider style={{marginBottom: '20px'}}/>
      <div id='geochart'/>

        {this.props.loading ? <div style={{height: '60vh', width: '100%',
                                              display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>

        <CircularProgress/>
        <Subheader style={{paddingLeft: '0px', textAlign: 'center'}}>
          If nothing appears in 10 seconds, <br/>You should refresh the page
        </Subheader>

        </div> :
        <DocumentTitle title='Pledge Analytics'>
        <div>

        </div>
        </DocumentTitle>
      }
      </div>
    )
  }
}

PledgeAnalytics.propTypes = {
  loading: PropTypes.bool.isRequired
}

export default createContainer(({params}) => {
  const subscriptionHandler = Meteor.subscribe("pledgeVisits");
  const pledgeHandler = Meteor.subscribe("pledgeList");
  console.log(params)
  return {
    pledgeVisits: PledgeVisits.find({}).fetch(),
    pledge: Pledges.findOne({_id: params._id}),
    loading: !subscriptionHandler.ready() || !pledgeHandler.ready(),
  };
}, PledgeAnalytics);
