import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Interests } from '/imports/api/interests.js';
import { Events } from '/imports/api/events.js';
import { Meetups } from '/imports/api/meetups.js';
import { Suggestions } from '/imports/api/suggestions.js';
import { Contributions } from '/imports/api/contributions.js';
import { geocodeByAddress, geocodeByPlaceId, getLatLng } from 'react-places-autocomplete';
import { HTTP } from 'meteor/http';
import { request } from "meteor/froatsnook:request";
import { Random } from 'meteor/random'

var _ = require('underscore');
const cheerio = require('cheerio');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("interestList", function () {
    return Interests.find({}, {
      fields: {interest: 1}
    })
  });

  Meteor.publish("myContributions", function() {
    return Contributions.find({creator: this.userId})
  })

}

Meteor.methods({
  addInterest: function(interest) {
    if (this.userId)
    Meteor.users.update({_id: this.userId}, {$push: {
      interests: interest
    }})
  }
})

Meteor.methods({
  removeInterest: function(interest) {
    if (this.userId)
    Meteor.users.update({_id: this.userId}, {$pull: {
      interests: interest
    }})
  }
})

Meteor.methods({
  updateLocation: function(address, lat, lng) {
    Meteor.users.update({_id: this.userId}, {
      $set: {
        location: {address: address, lat: lat, lng: lng}
      }
    })
  }
})


function EventbriteEventSearch(interests, callback) {
  var user = Meteor.users.findOne({_id: Meteor.userId()})
  var location = user.location
  var interestLength = interests.length
  var k = 0
  console.log(interests)
  for (var j in interests) {
    var interest = interests[j]
    console.log(interest)
    var options = {
        url: 'https://www.eventbriteapi.com/v3/events/search',
        headers: {
          "Authorization": "Bearer X7YIS4ONHKVGXTJTNDIW",
      },
        qs: {
          q:interest,
          'location.latitude':location.lat,
          'location.longitude': location.lng,
          'location.within': '20km'
        }
      };

      try {
          var res = request.sync(options);
          if (res.response.statusCode == 200) {
            var info = JSON.parse(res.body);
            Meteor.call('addToEventList', info.events, interest, location.lat, location.lng)
            k += 1
            console.log('k = ' + k)
          }
      } catch (error) {
            // See below for info on errors
        }
  }
    if (k === interestLength) {
       callback && callback( null, 'it worked' )
     }
  }

const EventbriteEventSearchSync = Meteor.wrapAsync(EventbriteEventSearch);
const meetupEventSearchSync = Meteor.wrapAsync(meetupEventSearch)

Meteor.methods({
  callEventbriteEventSearch: function(interests) {
    EventbriteEventSearchSync(interests)
    console.log('event search complete')
    Meteor.call('newTodayEventSuggestions')
    return
  }
})

Meteor.methods({
  callMeetupEventSearch: function(interests) {
    meetupEventSearchSync(interests)
    console.log('meetup search complete')
    Meteor.call('newTodayMeetupSuggestions')
    return
  }
})


Meteor.methods({
  addToEventList: function(details, interest, lat, lng) {
    var today = new Date()
    today = today.toISOString().slice(0,10).replace(/-/g,"")
    var i
    for (i = 0; i < 20; i++) {
      if (details[i]) {
        console.log('Event ID: ' + details[i].id)
        Events.upsert({_id: details[i].id}, {$set: {
          eventInfo: details[i],
          lat: lat,
          lng: lng,
          date: today
        }, $addToSet: {
          interest: interest
        }})

        Suggestions.upsert({localId: details[i].id}, {$set: {
          localId: details[i].id,
          start: details[i].start.utc,
          end: details[i].end.utc,
          venue: details[i].venue_id,
          description: details[i].description.html,
          title: details[i].name.text,
          fee: null,
          free: details[i].is_free,
          url: details[i].url,
          lat: lat,
          lng: lng,
          dateFound: today,
          source: 'Eventbrite',
          type: 'event'
        }})
      }
    }
  }
})

Meteor.methods({
  addToMeetupList: function(details, interest, lat, lng) {
    var today = new Date()
    today = today.toISOString().slice(0,10).replace(/-/g,"")
    var i
    for (i = 0; i < 20; i++) {
      if (details[i]) {

        Meetups.upsert({_id: details[i].id}, {$set: {
          meetupInfo: details[i],
          lat: lat,
          lng: lng,
          date: today
        }, $addToSet: {
          interest: interest
        }})

        var start, end
        if (details[i].time && details[i].duration) {
          start = new Date(Number(details[i].time))
          end = new Date(Number(details[i].time) + Number(details[i].duration))
        } else if (details[i].time) {
          start = new Date(Number(details[i].time))
          end = null
        } else {
          start = null
          end = null
        }

        var fee, free
        if (details[i].fee && details[i].fee.amount) {
          free = false
          fee = details[i].fee.amount
        } else {
          free = true
          fee = null
        }

        console.log('Start: ' + start)
        console.log('End: ' + end)
        console.log('Fee: ' + fee)
        console.log('Free: ' + free)

        Suggestions.upsert({localId: details[i].id}, {$set: {
          localId: details[i].id,
          start: start,
          end: end,
          venue: details[i].venue,
          description: details[i].description,
          title: details[i].name,
          fee: fee,
          free: free,
          url: details[i].link,
          lat: lat,
          lng: lng,
          dateFound: today,
          source: 'Meetup',
          type: 'event'
        }}
        )


      }
    }
  }
})

function meetupEventSearch(interests, callback) {
    var user = Meteor.users.findOne({_id: Meteor.userId()})
    var location = user.location
    var interestLength = interests.length
    var k = 0
    for (var j in interests) {
      var interest = interests[j]
      var options = {
        url: 'https://api.meetup.com/find/events/?key=' +Meteor.settings.public.MeetupAPIKey ,
        qs: {
          'lat':location.lat,
          'lon':location.lng,
          'radius':'smart',
          'text':interest
        }
      }
      try {
          var res = request.sync(options);
          if (res.response.statusCode == 200) {
            var info = JSON.parse(res.body);
            Meteor.call('addToMeetupList', info, interest, location.lat, location.lng)
            k += 1
            console.log('k = ' + k)
          }
      } catch (error) {
            // See below for info on errors
        }
  }
    if (k === interestLength) {
       callback && callback( null, 'it worked' )
     }
  }




Meteor.methods({
  newTodayEventSuggestions: function() {
    if (this.userId)
    var today = new Date()
    today = today.toISOString().slice(0,10).replace(/-/g,"")
    var user = Meteor.users.findOne({_id: this.userId})
    var interests = user.interests
    var userLat = user.location.lat
    var userLng = user.location.lng
    const relevantEventsCursor = Events.find({$and:[{interest: { $in: interests }},
                                    {lat: {$gte: userLat - 0.25}}, {lat: {$lt: userLat + 0.25}},
                                    {lng: {$gte: userLng - 0.25}}, {lng: {$lt: userLng + 0.25}},
                                    {seen: {$nin: [this.userId]}}]})
    var relevantEvents = []
    relevantEventsCursor.forEach(function(doc) {
      console.log('pushing')
      relevantEvents.push(doc)
    })
    var events = _.sample(relevantEvents, 5)

    for (var i in events) {
      Events.update({_id: events[i]._id}, {$addToSet: {
        seen: this.userId
      }})
    }

    var updateString = 'eventSuggestions.' + today
    Meteor.users.update({_id: this.userId}, {
      $set: {
        [updateString] :
            events
        }
    })

  }
})

Meteor.methods({
  newTodayMeetupSuggestions: function() {
    if (this.userId)
    var today = new Date()
    today = today.toISOString().slice(0,10).replace(/-/g,"")
    var user = Meteor.users.findOne({_id: this.userId})
    var interests = user.interests
    var userLat = user.location.lat
    var userLng = user.location.lng
    const relevantMeetupsCursor = Meetups.find({$and:[{interest: { $in: interests }},
                                    {lat: {$gte: userLat - 0.25}}, {lat: {$lt: userLat + 0.25}},
                                    {lng: {$gte: userLng - 0.25}}, {lng: {$lt: userLng + 0.25}},
                                    {seen: {$nin: [this.userId]}}]})
    var relevantMeetups = []
    relevantMeetupsCursor.forEach(function(doc) {
      console.log('pushing')
      relevantMeetups.push(doc)
    })
    var meetups = _.sample(relevantMeetups, 5)

    for (var i in meetups) {
      Meetups.update({_id: meetups[i]._id}, {$addToSet: {
        seen: this.userId
      }})
    }

    var updateString = 'meetupSuggestions.' + today
    Meteor.users.update({_id: this.userId}, {
      $set: {
        [updateString] :
            meetups

        }

    })
  }
})



Meteor.methods({
  starEvent: function(event, today) {
    if (this.userId) {
      Events.update({
        _id: event._id
      }, {$addToSet: {
        stars: this.userId
      }})

      var queryString = 'eventSuggestions.' + today + '._id'
      var updateString = 'eventSuggestions.' + today + '.$.starred'

      Meteor.users.update({$and:[{_id: this.userId}, {[queryString]: event._id}]}, {$set:
        {[updateString]: true}
      })
    }
  }
})

Meteor.methods({
  crossEvent: function(event, today) {
    console.log('about to get crossed: ' + event._id)
    if (this.userId) {
      Events.update({
        _id: event._id
      }, {$addToSet: {
        crosses: this.userId
      }})


      var queryString = 'eventSuggestions.' + today + '._id'
      var updateString = 'eventSuggestions.' + today + '.$.crossed'
      var seenUpdateString = 'eventSuggestions.' + today + '.$.seen'

      Meteor.users.update({$and:[{_id: this.userId}, {[queryString]: event._id}]}, {$set:
        {[updateString]: true, [seenUpdateString]: true}
      })
    }
  }
})

Meteor.methods({
  starMeetup: function(event, today) {
    if (this.userId) {
      Meetups.update({
        _id: event._id
      }, {$addToSet: {
        stars: this.userId
      }})

      var queryString = 'meetupSuggestions.' + today + '._id'
      var updateString = 'meetupSuggestions.' + today + '.$.starred'

      Meteor.users.update({$and:[{_id: this.userId}, {[queryString]: event._id}]}, {$set:
        {[updateString]: true}
      })
    }
  }
})

Meteor.methods({
  crossMeetup: function(event, today) {
    if (this.userId) {
      Meetups.update({
        _id: event._id
      }, {$addToSet: {
        crosses: this.userId
      }})

      var queryString = 'meetupSuggestions.' + today + '._id'
      var updateString = 'meetupSuggestions.' + today + '.$.crossed'
      var seenUpdateString = 'meetupSuggestions.' + today + '.$.seen'

      Meteor.users.update({$and:[{_id: this.userId}, {[queryString]: event._id}]}, {$set:
        {[updateString]: true, [seenUpdateString]: true}
      })
    }
  }
})

Meteor.methods({
  markMeetupSeen: function(event, today) {
    var queryString = 'meetupSuggestions.' + today + '._id'
    var seenUpdateString = 'meetupSuggestions.' + today + '.$.seen'

    Meteor.users.update({$and:[{_id: this.userId}, {[queryString]: event._id}]}, {$set:
      {[seenUpdateString]: true}
    })
  }
})

Meteor.methods({
  markEventSeen: function(event, today) {
    var queryString = 'eventSuggestions.' + today + '._id'
    var seenUpdateString = 'eventSuggestions.' + today + '.$.seen'

    Meteor.users.update({$and:[{_id: this.userId}, {[queryString]: event._id}]}, {$set:
      {[seenUpdateString]: true}
    })
  }
})

Meteor.methods({
  scrapeOpenGraph: function(domain) {
    var userId = this.userId
    var title, image, url, description, siteName

    try {
        var res = request.sync(domain);
        if (res.response.statusCode == 200) {
          var $ = cheerio.load(res.body);

          title = $('meta[property="og:title"]').attr('content')
          console.log(title)
          image = $('meta[property="og:image"]').attr('content')
          url = $('meta[property="og:url"]').attr('content')
          description = $('meta[property="og:description"]').attr('content')
          siteName = $('meta[property="og:site_name"]').attr('content')

          return Contributions.insert({title: title, image: image, url: url
            , description: description, siteName: siteName, creator: Meteor.userId()})
        }
    } catch (error) {
          // See below for info on errors
      }

/*    request(domain, Meteor.bindEnvironment(function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);

        title = $('meta[property="og:title"]').attr('content')
        console.log(title)
        image = $('meta[property="og:image"]').attr('content')
        url = $('meta[property="og:url"]').attr('content')
        description = $('meta[property="og:description"]').attr('content')
        siteName = $('meta[property="og:site_name"]').attr('content')



      }
    }));*/
  //  console.log(title)
    //return Contributions.insert({title: title, image: image, url: url
      //, description: description, siteName: siteName, creator: Meteor.userId()})
  }
})

Meteor.methods({
  removeContribution: function(contributionId) {
    Contributions.remove({_id: contributionId})
  }
})

Meteor.methods({
  attachTags: function(contributionId, tags) {
    Contributions.update({
      _id: contributionId
    }, {$set: {
      tags: tags
    }})
  }
})

Meteor.methods({
  newInterest: function(interest) {
    Interests.insert({
      interest: interest
    })
  }
})
