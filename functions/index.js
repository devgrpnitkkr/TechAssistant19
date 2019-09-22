const functions = require('firebase-functions');
const { dialogflow, Carousel, List } = require('actions-on-google')
const rp = require('request-promise')
const timestamp = require('unix-timestamp')

const app = dialogflow({ debug: true })

const EVENT_DESCRIPTION = 'eventDescription'
const CATEGORY_LIST = 'categoryList'
const CATEGORY_LIST_OPTION = 'categoryList - OPTION'
const EVENT_LIST = 'eventList'
const FACTS = 'facts'
const GUEST_LECTURE = 'guestLecture'
const SPONSERS = 'sponsers'
const SPECIFIC_DETAIL = 'specificDetail'
const PARTICULAR_GUEST = 'particularGuest'
const ABOUT = 'about'
const ABOUT_TECH = 'aboutTechspardha'

app.intent('Default Fallback Intent', conv => {
  conv.close("Please be more specific and try again.")
})


app.intent('Default Welcome Intent', conv => {
  conv.ask(`Welcome to Techspardha'18 Prime.Here you can ask any query related to fest like Category Of Events,
    Events of particular category,any detail of event,guest lectures information.
    Say bye at any time to end the conversation.
    Ask something .... I m listening`)
})


app.intent(ABOUT_TECH, conv => {
  conv.ask(`Techspardha is the Annual Techno-Managerial Fest of NIT Kurukshetra.
    It is one of the biggest fest of North India.It is to be held from 26th October to 28th October.
    It witnesses an active participation from over 30 NITs, IITs, and other institutes of repute across the nation every year.
    Has always been graced by the presence of several renowned personality for Guest Lectures and Interactive sessions.
    Ask anything ..... m listening to you.`)
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


app.intent(CATEGORY_LIST_OPTION, (conv, params, category) => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/events?eventCategory=${category}`)
    .then(res => {

      let eventList = JSON.parse(res).data.events
      let list = {}

      for (let i in eventList)
        list[eventList[i].eventName] = {
          title: eventList[i].eventName,
          description: 'Tap for details'
        }

      conv.ask('Here are the different categories of events')
      conv.ask(new List({
        title: 'List of ' + category + ' Events',
        items: list
      }))
    })
    .catch(res =>
      conv.ask("Sorry, you can ask something else. Ask anything ..... m listening to you."))
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

      conv.ask('Here are the different categories of events')
      conv.ask(new List({
        title: 'List of ' + category + ' Events',
        items: list
      }))
    })
    .catch(res =>
      conv.ask("Sorry, you can ask something else. Ask anything ..... m listening to you."))
})


app.intent(EVENT_DESCRIPTION, (conv, { eventName }) => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/events/search?eventName=${eventName}`)
    .then(res => {

      let allData = JSON.parse(res)
      let data = allData.data
      let name = `The name of your event is ${data.eventName}` + "\n";
      let description = `Description : ${data.description}` + "\n";
      /*let startTime = 'Start time of event is' + timestamp.toDate(data.startTime);
      let endTime = 'End time of event is' + timestamp.toDate(data.endTime); */
      let venue = `Venue is ${data.venue}` + "\n";

      return conv.ask(name + description + venue + 'Ask anything ..... m listening to you.')
    })
    .catch(err =>
      conv.ask("Sorry, you can ask something else.Ask anything ..... m listening to you."))
})


app.intent(SPECIFIC_DETAIL, (conv, { specificDetail, eventName }) => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/events/search?eventName=${eventName}`)
    .then((res) => {

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
        for (let i in data.coordinators) {
          detail = detail + data.coordinators[i].coordinator_name + ' having contact number ' + data.coordinators[i].coordinator_number + '\n';
        }
      }
      else {
        return conv.ask("Please asking something else like start time,end time,venue,cash prize,etc.Ask anything ..... m listening to you.")
      }
      return conv.ask(`${specificDetail} of event ${eventName} : \r\n ${detail}  \r\n Ask anything ..... m listening to you.`)
    })
    .catch(err =>
      conv.ask("Please try again. Ask anything ..... m listening to you."))
})


app.intent(FACTS, (conv) => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/facts`)
    .then(res => {

      let allData = JSON.parse(res)
      let fact = allData.data.message

      return conv.ask(fact + '\r\n Ask anything ..... m listening to you.')
    })
    .catch(err =>
      conv.ask("Come on ask something else. We have much more than this!.Ask anything ..... m listening to you."))
})


app.intent(GUEST_LECTURE, conv => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/lectures`)
    .then(res => {

      let allData = JSON.parse(res)
      let lectures = allData.data.lectures
      let output = ''

      for (let i in lectures) {
        let title = lectures[i].name
        let time = lectures[i].time
        let date = lectures[i].date

        output = output + title + " at " + time + " on " + date + "\n"
        /*let text = lectures[i].desc
        let subtitle = lectures[i].date + ' ' + lectures[i].time 
        let imageUrl = lectures[i].imageUrl */
      }
      let finalOutput = output + "\n" + "About whom u wanna know know in detail ?"
      conv.ask(finalOutput)
    })
    .catch(err =>
      conv.ask("Sorry cannot fulfill your request.Ask anything ..... m listening to you."))
})


app.intent(PARTICULAR_GUEST, (conv, { guestName }) => {
  return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/lectures`)
    .then(res => {

      let allData = JSON.parse(res)
      let lectures = allData.data.lectures

      for (let i in lectures) {
        let name = lectures[i].name

        if (name == guestName) {
          let description = lectures[i].desc

          let output = "About" + guestName + "\n" + description
          conv.add(output)
        }
      }
      conv.ask('Wanna know about other guests.Ask anything ..... m listening to you.')
    })
    .catch(err =>
      conv.ask("Sorry Guest Name is not clear.Ask anything ..... m listening to you."))
})


app.intent(ABOUT, conv => {
  let output = "Sahil Singla" + "\n" + "Gaurav Rattan" + "\n" + "Ankur Charan" + "\n" + "Ritu Singla" + "\n" + "Sakshi Garg" + "\n"
  output = output + "Gaurav Arora" + "\n" + "Harshita Aggarwal" + "\n" + "Sushant Aggarwal" + "\n" + "Aryan Kaul" + "\n" + "Vaibhav Garg" + "\n" + "Arti Jangra"

  conv.ask(output + '\r\n Ask anything ..... m listening to you.')
})


exports.techspardha = functions.https.onRequest(app)