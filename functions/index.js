const functions = require('firebase-functions');
const rp = require('request-promise')
const timestamp = require('unix-timestamp')
const {
  dialogflow,
  BasicCard,
  Carousel,
  BrowseCarousel,
  BrowseCarouselItem,
  List,
  Image
} = require('actions-on-google')

const app = dialogflow({ debug: true })

const EVENT_DETAILS = 'eventDetails'
const CATEGORY_LIST = 'categoryList'
const EVENT_LIST_2 = 'eventList - 2'
const EVENT_DETAILS_2 = 'eventDetails - 2'
const EVENT_LIST = 'eventList'
const EVENT_DETAILS_3 = 'eventDetails - 3'
const FACTS = 'facts'
const GUEST_LECTURE = 'guestLecture'
const GUEST_LECTURE_OPTION = 'guest'
const SPONSERS = 'sponsers'
const SPECIFIC_DETAIL = 'specificDetail'
const PARTICULAR_GUEST = 'particularGuest'
const ABOUT = 'about'
const ABOUT_TECH = 'aboutTechspardha'

app.intent('Default Fallback Intent', conv => {
  conv.ask("Please be more specific and try again.")
})


app.intent('Default Welcome Intent', conv => {
  conv.ask(`<speak>` + 
    `Welcome to Techspardha'19 Prime. Here you can ask any query related to fest like ` +
    `Category of Events, events of particular category, any detail of event, ` +
    `Guest Lectures information <sub alias="etcetra">etc</sub>. ` +
    `Say bye at any time to end the conversation.` +
    `</speak>`)
  conv.ask(`Ask something .... I m listening`)
})


app.intent(ABOUT_TECH, conv => {
  conv.ask(`<speak>
    Techspardha is the Annual Techno-Managerial Fest of <say-as interpret-as="characters">NIT</say-as> Kurukshetra.
    It is one of the biggest fest of North India.It is to be held from 26th October to 28th October.
    It witnesses an active participation from over 30 NITs, IITs, and other institutes of repute across the nation every year.
    It has always been graced by the presence of several renowned personality for Guest Lectures and Interactive sessions.</speak>`)
  conv.ask(`Ask anything ..... m listening to you.`)
})


app.intent(CATEGORY_LIST, conv => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/events/categories`)
    .then(res => {

      let categoryList = JSON.parse(res).data.categories
      let list = {}

      for (let i in categoryList)
        list[categoryList[i]] = {
          title: categoryList[i],
          description: categoryList[i] + ' events'
        }

      conv.ask('Here are the different categories of events')
      conv.ask(new Carousel({
        title: 'List of Categories',
        items: list
      }))
    })
    .catch(res =>
      conv.ask("Sorry, you can ask something else. Ask anything ..... m listening to you."))
})


app.intent(EVENT_LIST_2, (conv, params, category) => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/events?eventCategory=${category}`)
    .then(res => {

      let eventList = JSON.parse(res).data.events
      let list = {}

      for (let i in eventList)
        list[eventList[i].eventName] = {
          title: eventList[i].eventName,
          description: 'Tap for details'
        }

      conv.ask('Here are the different ' + category + ' Events')
      conv.ask(new List({
        title: 'List of ' + category + ' Events',
        items: list
      }))
    })
    .catch(res =>
      conv.ask('Sorry, you can ask something else. Ask anything ..... m listening to you.'))
})


app.intent([EVENT_DETAILS_2, EVENT_DETAILS_3], (conv, params, eventName) => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/events/search?eventName=${eventName}`)
    .then(res => {

      let data = JSON.parse(res).data
      let description = data.description + '  \n  \n**VENUE: ' + data.venue + '**'

      conv.ask('Here are the details of ' + data.eventName)
      conv.ask(new BasicCard({
        title: data.eventName,
        image: new Image({
          url: data.banner,
          alt: data.eventName
        }),
        text: description
      }))
    })
    .catch(err =>
      conv.ask('Sorry, you can ask something else. Ask anything ..... m listening to you.'))
})

app.intent(EVENT_LIST, (conv, { category }) => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/events?eventCategory=${category}`)
    .then(res => {

      let eventList = JSON.parse(res).data.events
      let list = {}

      for (let i in eventList)
        list[eventList[i].eventName] = {
          title: eventList[i].eventName,
          description: 'Tap for details'
        }

      conv.ask('Here are the different ' + category + ' Events')
      conv.ask(new List({
        title: 'List of ' + category + ' Events',
        items: list
      }))
    })
    .catch(res =>
      conv.ask('Sorry, you can ask something else. Ask anything ..... m listening to you.'))
})


app.intent(EVENT_DETAILS, (conv, { eventName }) => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/events/search?eventName=${eventName}`)
    .then(res => {

      let data = JSON.parse(res).data
      let description = data.description + '  \n  \n**VENUE: ' + data.venue + '**'

      conv.ask('Here are the details of ' + data.eventName)
      conv.ask(new BasicCard({
        title: data.eventName,
        image: new Image({
          url: data.banner,
          alt: data.eventName
        }),
        text: description
      }))
    })
    .catch(err =>
      conv.ask('Sorry, you can ask something else. Ask anything ..... m listening to you.'))
})


app.intent(SPECIFIC_DETAIL, (conv, { specificDetail, eventName }) => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/events/search?eventName=${eventName}`)
    .then(res => {

      let allData = JSON.parse(res)
      let data = allData.data
      let detail = ''

      if (specificDetail == 'endTime') {
        detail = timestamp.toDate(data.endTime / 1000)
      }
      else if (specificDetail == 'startTime') {
        detail = timestamp.toDate(data.startTime / 1000)
      }
      else if (specificDetail == 'venue') {
        detail = data.venue
      }
      else if (specificDetail == 'coordinators') {
        for (let i in data.coordinators)
          detail = detail + data.coordinators[i].coordinator_name + ' having contact number ' + data.coordinators[i].coordinator_number + '\n'
      }
      else {
        conv.ask('Please asking something else like start time, end time, venue, cash prize, etc.')
        return conv.ask('Ask anything ..... m listening to you.')
      }
      conv.ask(`${specificDetail} of event ${eventName} : \r\n ${detail}`)
      conv.ask('Ask anything ..... m listening to you.')
    })
    .catch(err =>
      conv.ask('Please try again. Ask anything ..... m listening to you.'))
})


app.intent(FACTS, conv => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/facts`)
    .then(res => {

      let allData = JSON.parse(res)
      let fact = allData.data.message

      conv.ask(fact)
      conv.ask('Ask anything ..... m listening to you.')
    })
    .catch(err =>
      conv.ask('Come on ask something else. We have much more than this!.Ask anything ..... m listening to you.'))
})


app.intent(GUEST_LECTURE, conv => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/lectures`)
    .then(res => {

      let lectures = JSON.parse(res).data.lectures
      let list = {}

      for (let i in lectures)
        list[lectures[i].name] = {
          title: lectures[i].name,
          description: lectures[i].name,
          image: new Image({
            url: lectures[i].imageUrl,
            alt: lectures[i].name
          })
        }

      conv.ask('Here are the details of guest lectures....')
      conv.ask(new Carousel({
        title: 'Guest Lectures',
        items: list
      }))
    })
    .catch(err =>
      conv.ask('Sorry cannot fulfill your request.Ask anything ..... m listening to you.'))
})


app.intent(GUEST_LECTURE_OPTION, (conv, params, guestName) => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/lectures`)
    .then(res => {

      let allData = JSON.parse(res)
      let lectures = allData.data.lectures

      for (let i in lectures) {
        let name = lectures[i].name
        if (name == guestName) {
          conv.ask('Here are the details of ' + name)
          conv.ask(new BasicCard({
            text: lectures[i].desc,
            title: name,
            image: new Image({
              url: lectures[i].imageUrl,
              alt: lectures[i].name,
            }),
            display: 'CROPPED'
          }))
        }
      }
    })
    .catch(err =>
      conv.ask('Sorry Guest Name is not clear. Ask anything ..... m listening to you.'))
})


app.intent(PARTICULAR_GUEST, (conv, { guestName }) => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/lectures`)
    .then(res => {

      let allData = JSON.parse(res)
      let lectures = allData.data.lectures

      for (let i in lectures) {
        let name = lectures[i].name
        if (name == guestName) {
          conv.ask('Here are the details of ' + name)
          conv.ask(new BasicCard({
            text: lectures[i].desc,
            title: name,
            image: new Image({
              url: lectures[i].imageUrl,
              alt: lectures[i].name,
            }),
            display: 'CROPPED'
          }))
        }
      }
    })
    .catch(err =>
      conv.ask('Sorry Guest Name is not clear. Ask anything ..... m listening to you.'))
})


app.intent(SPONSERS, conv => {
  return rp('https://us-central1-techspardha-87928.cloudfunctions.net/api/sponsors')
    .then(res => {

      let sponsors = JSON.parse(res).data.paisa
      let items = []

      for(let i in sponsors)
        items.push(new BrowseCarouselItem({
          title: sponsors[i].sponsorSection,
          url: sponsors[i].sponsors['0'].targetUrl,
          image: new Image({
            url: sponsors[i].sponsors['0'].imageUrl
          })
        }))

      conv.ask('Our Sponsors');
      conv.ask(new BrowseCarousel({
        items: items
      }))
    })
    .catch(err => 
      conv.ask('Sorry cannot fulfill your request. Ask anything ..... m listening to you.'))
})


app.intent(ABOUT, conv => {
  let output = "Sahil Singla" + "\n" + "Gaurav Rattan" + "\n" + "Ankur Charan" + "\n" + "Ritu Singla" + "\n" + "Sakshi Garg" + "\n"
  output = output + "Gaurav Arora" + "\n" + "Harshita Aggarwal" + "\n" + "Sushant Aggarwal" + "\n" + "Aryan Kaul" + "\n" + "Vaibhav Garg" + "\n" + "Arti Jangra"

  conv.ask(output + '\r\n Ask anything ..... m listening to you.')
})


exports.techspardha = functions.https.onRequest(app)