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

const cheerio = require('cheerio');
const getUrls = require('get-urls');

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

  Meteor.publish("suggestions", function(_id) {
    return Suggestions.find({$or: [{stars: _id}, {contributor: _id} ]})
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
  var today = new Date()
  today = today.toISOString().slice(0,10).replace(/-/g,"")
  var user = Meteor.users.findOne({_id: Meteor.userId()})
  var location = user.location
  var userLat = location.lat
  var userLng = location.lng
  var interestLength = interests.length
  var k = 0
  console.log(interests)
  for (var j in interests) {
    var interest = interests[j]
    const interestEventLength = Suggestions.find(
      {$and:[{interest: { $in: interests }},
            {lat: {$gte: userLat - 0.25}}, {lat: {$lt: userLat + 0.25}},
            {lng: {$gte: userLng - 0.25}}, {lng: {$lt: userLng + 0.25}},
            {seen: {$nin: [this.userId]}},
            {source: 'Eventbrite'},
            {dateFound: today}]}
        ).count()
    if (interestEventLength < 8)
    {
      var options = {
          url: 'https://www.eventbriteapi.com/v3/events/search',
          headers: {
            "Authorization": "Bearer " + Meteor.settings.public.eventbriteAPIKey,
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
      } else {
          k += 1
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
    meetupEventSearchSync(interests)
    console.log('meetup search complete')
    Meteor.call('newTodayEventSuggestions')
    return
  }
})

Meteor.methods({
  searchEventsNoUpdate: function(interests) {
    this.unblock()
    EventbriteEventSearchSync(interests)
    console.log('event search complete')
    meetupEventSearchSync(interests)
    console.log('meetup search complete')
    return
  }
})

Meteor.methods({
  callMeetupGroupSearch : function(interests) {
    meetupGroupSearch(interests)
  }
})




Meteor.methods({
  addToEventList: function(details, interest, lat, lng) {
    var today = new Date()
    today = today.toISOString().slice(0,10).replace(/-/g,"")
    var i
    for (i = 0; i < 20; i++) {
      if (details[i]) {

        var logo = details[i].logo ? details[i].logo.url : undefined

        Suggestions.upsert({localId: details[i].id}, {$set: {
          localId: details[i].id,
          start: details[i].start.utc,
          end: details[i].end.utc,
          venue: details[i].venue_id,
          image: logo,
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
        }, $addToSet: {
          interest: interest
        }})
      }
    }
  }
})

function getMeetupImageURL(html) {
  try {
    for (let item of getUrls(html)) {
      if (item.match(/\.(jpeg|jpg|gif|png)$/) != null) {
            return item
            break;
      }
      else {
        return '/images/eventdefault.jpg';
        break;
      }
  }
  }
  catch(err) {return '/images/eventdefault.jpg'}
}

Meteor.methods({
  addToMeetupList: function(details, interest, lat, lng) {
    var today = new Date()
    today = today.toISOString().slice(0,10).replace(/-/g,"")
    var i
    for (i = 0; i < 20; i++) {
      if (details[i]) {

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

        var image = getMeetupImageURL(details[i].description) ? getMeetupImageURL(details[i].description) :
              '/images/eventdefault.jpg'

        console.log(getMeetupImageURL(details[i].description))

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
          image: image,
          dateFound: today,
          source: 'Meetup',
          type: 'event'
        }, $addToSet: {
          interest: interest
        }}
        )


      }
    }
  }
})

Meteor.methods({
  addToMeetupGroupList: function(details, interest, lat, lng) {
    var today = new Date()
    today = today.toISOString().slice(0,10).replace(/-/g,"")
    var i
    for (i = 0; i < 20; i++) {
      if (details[i]) {

        var image = getMeetupImageURL(details[i].description) ? getMeetupImageURL(details[i].description) :
              '/images/eventdefault.jpg'

        console.log('adding to Meetup List: ' + details[i].id)
        console.log(details[i].members)
        Suggestions.upsert({localId: details[i].id}, {$set: {
          localId: details[i].id,
          start: null,
          end: null,
          venue: null,
          description: details[i].description,
          title: details[i].name,
          fee: null,
          free: null,
          url: details[i].link,
          lat: lat,
          lng: lng,
          dateFound: today,
          source: 'Meetup',
          image: image,
          type: 'group',
          members: details[i].members
        }, $addToSet: {
          interest: interest
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

function meetupGroupSearch(interests, callback) {
    var user = Meteor.users.findOne({_id: Meteor.userId()})
    var location = user.location
    var interestLength = interests.length
    var k = 0
    for (var j in interests) {
      var interest = interests[j]
      console.log('Meetup, searching groups for: ' + interest)
      var options = {
        url: 'https://api.meetup.com/find/groups/?key=' +Meteor.settings.public.MeetupAPIKey ,
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
            Meteor.call('addToMeetupGroupList', info, interest, location.lat, location.lng)
            k += 1
            console.log('k = ' + k)
          }
      } catch (error) {
          console.log(error)
            // See below for info on errors
        }
  }
    if (k === interestLength) {
       callback && callback( null, 'it worked' )
     }
  }

Meteor.methods({
  checkCurrentSuggestions: function() {
    if (this.userId) {
      var today = new Date()
      today = today.toISOString().slice(0,10).replace(/-/g,"")
      var user = Meteor.users.findOne({_id: this.userId})
      var interests = user.interests
      var userLat = user.location.lat
      var userLng = user.location.lng
      const relevantEventsLength = Suggestions.find({
        $or: [
        {$and:[{interest: { $in: interests }},
              {lat: {$gte: userLat - 0.25}}, {lat: {$lt: userLat + 0.25}},
              {lng: {$gte: userLng - 0.25}}, {lng: {$lt: userLng + 0.25}},
              {seen: {$nin: [this.userId]}}]},
        {interest: { $in: interests },
              source: 'Experiment',
              seen: {$nin: [this.userId]}},
        {interest: { $in: interests },
              source: 'contribution',
              seen: {$nin: [this.userId]}}
            ]
          }).count()
          console.log(relevantEventsLength)
      if (relevantEventsLength > 4) {
        return true
      } else {
        return false
      }
    }
  }
})


Meteor.methods({
  newTodayEventSuggestions: function() {
    if (this.userId)
    var today = new Date()
    today = today.toISOString().slice(0,10).replace(/-/g,"")
    var user = Meteor.users.findOne({_id: this.userId})
    var interests = user.interests
    var userLat = user.location.lat
    var userLng = user.location.lng
    const relevantEventsCursor = Suggestions.find({
      $or: [
      {$and:[{interest: { $in: interests }},
            {lat: {$gte: userLat - 0.25}}, {lat: {$lt: userLat + 0.25}},
            {lng: {$gte: userLng - 0.25}}, {lng: {$lt: userLng + 0.25}},
            {seen: {$nin: [this.userId]}}]},
      {interest: { $in: interests },
            source: 'Experiment',
            seen: {$nin: [this.userId]}},
      {interest: { $in: interests },
            source: 'contribution',
            seen: {$nin: [this.userId]}},
      {interest: { $in: interests },
            source: 'Indiegogo',
            seen: {$nin: [this.userId]}}
          ]
        })
    var relevantEvents = []
    relevantEventsCursor.forEach(function(doc) {
      relevantEvents.push(doc)
    })



    var events = sortingAlgorithm(relevantEventsCursor.fetch())



    // Here is where the complicated algorithm goes.


    for (var i in events) {
      Suggestions.update({localId: events[i].localId}, {$addToSet: {
        seen: this.userId
      }})
    }

    var updateString = 'suggestions.' + today
    Meteor.users.update({_id: this.userId}, {
      $set: {
        [updateString] :
            events
        }
    })

  }
})

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function dynamicSortMultiple() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    var props = arguments;
    return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;
        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
        while(result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    }
}


function sortingAlgorithm(cursor) {
  for (var i in cursor) {
    var doc = cursor[i]
    var stars = doc.stars ? doc.stars.length : 0
    var starFrequency = doc.stars && doc.seen ? doc.stars.length/doc.seen.length * 5 : 0
    var crosses = doc.crosses ? doc.crosses.length : 0
    var contribution = doc.source === 'contribution' ? 10 : 0
    var score = stars + starFrequency - crosses + contribution
    var randomScore = score * -1  + Math.random()
    doc.score = randomScore
    console.log(doc._id + ': ' + doc.score)
  }
  console.log(cursor[0])
  cursor = cursor.sort(dynamicSortMultiple("score"))
  console.log(cursor)
/*  console.log(cursor[0].score)
  console.log(cursor[1].score)
  console.log(cursor[2].score)
  console.log(cursor[4].score)
  console.log(cursor[7].score) */
  return cursor.slice(0, 8)
}


Meteor.methods({
  starEvent: function(event, today) {
    if (this.userId) {
      Suggestions.update({
        _id: event._id
      }, {$addToSet: {
        stars: this.userId
      }})

      var queryString = 'suggestions.' + today + '._id'
      var updateString = 'suggestions.' + today + '.$.starred'

      Meteor.users.update({$and:[{_id: this.userId}, {[queryString]: event._id}]}, {$set:
        {[updateString]: true}
      })
    }
  }
})

Meteor.methods({
  unStarEvent: function(event, today) {
    if (this.userId) {
      Suggestions.update({
        _id: event._id
      }, {$pull: {
        stars: this.userId
      }})

      var queryString = 'suggestions.' + today + '._id'
      var updateString = 'suggestions.' + today + '.$.starred'

      Meteor.users.update({$and:[{_id: this.userId}, {[queryString]: event._id}]}, {$set:
        {[updateString]: false}
      })
    }
  }
})

Meteor.methods({
  crossEvent: function(event, today) {
    console.log('about to get crossed: ' + event._id)
    if (this.userId) {
      Suggestions.update({
        _id: event._id
      }, {$addToSet: {
        crosses: this.userId,
        seen: this.userId
      }})


      var queryString = 'suggestions.' + today + '._id'
      var updateString = 'suggestions.' + today + '.$.crossed'
      var seenUpdateString = 'suggestions.' + today + '.$.seen'

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
  registerEventClick: function(eventId, today) {
    if (this.userId) {
      Suggestions.update({
        _id: eventId
      }, {$addToSet: {
        clicks: this.userId
      }})

      var queryString = 'meetupSuggestions.' + today + '._id'
      var updateString = 'meetupSuggestions.' + today + '.$.clicked'

      Meteor.users.update({$and:[{_id: this.userId}, {[queryString]: eventId}]}, {$set:
        {[updateString]: true}
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
    Suggestions.update({
      _id: event._id
    }, {$addToSet: {
      seen: this.userId
    }})

    var queryString = 'suggestions.' + today + '._id'
    var seenUpdateString = 'suggestions.' + today + '.$.seen'

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
          url = domain
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
  confirmContribution: function(contributionId) {
    console.log('hello there, somoething about contribution')

    var contribution = Contributions.findOne({_id: contributionId})
    var today = new Date()
    today = today.toISOString().slice(0,10).replace(/-/g,"")

    Suggestions.upsert({url: contribution.url}, {$set: {
      url: contribution.url,
      description: contribution.description,
      image: contribution.image,
      title: contribution.title,
      source: 'contribution',
      dateFound: today
    }, $addToSet: {
      interest: {$each: contribution.tags},
      contributor: contribution.creator
    }})

    console.log(Suggestions.findOne({url: contribution.url, title: contribution.title}))
  }
})

Meteor.methods({
  removeContribution: function(contributionId) {
    Contributions.remove({_id: contributionId})
  }
})

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

Meteor.methods({
  attachTags: function(contributionId, tags) {
    var i
    var expandedTags = []
    console.log(tags)
    for (i = 0; i < tags.length; i++) {
      Meteor.call('expandTags', tags[i], function(error, result){
        if (error) {
          console.log('there was an error')
        } else {
          for (var j in result) {
            expandedTags.push(toTitleCase(result[j]))
          }
        }
      } )
    }
    for (var k in tags) {
      expandedTags.push(toTitleCase(tags[k]))
    }

    Contributions.update({
      _id: contributionId
    }, {$set: {
      tags: expandedTags
    }})
  }
})

Meteor.methods({
  expandTags: function(tag) {
    try {
        var res = request.sync('https://api.datamuse.com/words?ml='+tag.replace(/ /g, "+") + '&max=5');
        console.log('https://api.datamuse.com/words?ml='+tag.replace(/ /g, "+") + '&max=5')
        if (res.response.statusCode == 200) {
            var info = JSON.parse(res.body);
            console.log(info)
            var j
            var words = []
            for (j=0;j<info.length;j++) {
              if (info[j].score > 25000) {
              words.push(info[j].word)
            }
            }
            words.push(tag)
            return (words)
        }
    } catch (error) {
        console.log(error)
          // See below for info on errors
      }
  }
})

Meteor.methods({
  newInterest: function(interest) {
    Interests.insert({
      interest: interest
    })
  }
})

Meteor.methods({
  scrapeExperiment: function(tag) {
    var today = new Date()
    today = today.toISOString().slice(0,10).replace(/-/g,"")
    const scienceListLength = Suggestions.find({interest: tag,
          source: 'Experiment',
          seen: {$nin: [this.userId]},
          dateFound: today}).count()
    if (scienceListLength < 1) {
      try {
          var res = request.sync('https://experiment.com/search/results?utf8=%E2%9C%93&q=' + tag +'&commit=Search');
          if (res.response.statusCode == 200) {
            var $ = cheerio.load(res.body);
            const fruits = [];
            $('#live').find('.plain.project-link').each(function(i, elem){
              fruits[i] = {link: $(this).attr('href')}
            })
            $('#live').find('.project-card').each(function(i, elem){
              var id = $(this).attr('id').replace('project_', '');
              fruits[i].id= id
                      })
            console.log(fruits)
            var j
            for (j=0;j<fruits.length;j++) {
              try {
                var res2 = request.sync('https://experiment.com/' + fruits[j].link);
                console.log('https://experiment.com/' + fruits[j].link)
                if (res2.response.statusCode == 200) {
                  var title, image, url, description, siteName, localId

                  var $ = cheerio.load(res2.body);

                  title = $('meta[property="og:title"]').attr('content')
                  console.log(title)
                  image = $('meta[property="og:image"]').attr('content')
                  url = $('meta[property="og:url"]').attr('content')
                  description = $('meta[property="og:description"]').attr('content')

                  Suggestions.upsert({localId: fruits[j].id}, {$set: {
                    localId: fruits[j].id,
                    start: null,
                    end: null,
                    venue: null,
                    description: description,
                    title: title,
                    fee: null,
                    free: null,
                    url: url,
                    lat: null,
                    lng: null,
                    dateFound: today,
                    source: 'Experiment',
                    type: 'science',
                    image: image
                  }, $addToSet: {
                    interest: tag
                  }}
                  )
              }
            } catch (error) {
              console.log(error)
            }
          }
      }
    } catch (error) {
            console.log(error)
        }
    } else {
      return
    }
  }
})

Meteor.methods({
  indiegogoSearch: function(interest) {
    var today = new Date()
    today = today.toISOString().slice(0,10).replace(/-/g,"")

    if (0 < 1) {
      try {
          var res = request.sync('https://api.indiegogo.com/1.1/search/campaigns.json?sort=popular_all&title=' + interest + '&percent_funded=25_to_100&status=open&api_token=' + Meteor.settings.public.IndiegogoAPIKey);

          if (res.response.statusCode == 200) {
            var info = JSON.parse(res.body)
            var details
            details = info.response
            console.log(details[0])
            var i
            for (i = 0; i < Math.min(details.length, 20); i++) {
              if (details[i]) {
                var fundingProgress
                if (details[i].collected_funds && details[i].goal) {
                  fundingProgress = (details[i].collected_funds/details[i].goal)*100
                } else {
                  fundingProgress = null
                }

                console.log('adding to Indiegogo List: ' + details[i].id)

                Suggestions.upsert({localId: details[i].id}, {$set: {
                  localId: details[i].id,
                  start: null,
                  end: null,
                  venue: null,
                  description: details[i].tagline,
                  title: details[i].title,
                  fee: null,
                  free: null,
                  url: details[i].web_url,
                  lat: null,
                  lng: null,
                  dateFound: today,
                  source: 'Indiegogo',
                  image: details[i].image_types.small,
                  type: 'funding',
                  fundingProgress: fundingProgress,
                  goal: details[i].goal
                }, $addToSet: {
                  interest: interest
                }}
                )


              }
            }
      }
      return
    } catch (error) {
            console.log(error)
        }
    } else {
      return
    }
  }
})
