const functions = require('firebase-functions');
const {dialogflow} = require('actions-on-google')
const rp = require('request-promise')
const timestamp = require('unix-timestamp')
const {BasicCard} = require('actions-on-google')

const app = dialogflow()
const GUEST_LECTURE_OPTION = 'guest'
const EVENT_DESCRIPTION = 'eventDescription'
const CATEGORY_LIST = 'categoryList'
const EVENT_LIST = 'eventList'
const FACTS = 'facts'
const GUEST_LECTURE = 'guestLecture'  
const SPONSERS = 'sponsers'
const SPECIFIC_DETAIL = 'specificDetail'
const PARTICULAR_GUEST = 'particularGuest'
const ABOUT = 'about'
const ABOUT_TECH = 'aboutTechspardha'
 
app.intent('Default Fallback Intent',conv => {
    conv.close("Please be more specific and try again.")
})

app.intent('Default Welcome Intent',conv => {
    conv.ask(`Welcome to Techspardha'18 Prime.Here you can ask any query related to fest like Category Of Events,
    Events of particular category,any detail of event,guest lectures information.
    Say bye at any time to end the conversation.
    Ask something .... I m listening`)
})

app.intent(ABOUT_TECH,(conv) => {

    let output = `Techspardha is the Annual Techno-Managerial Fest of NIT Kurukshetra.
    It is one of the biggest fest of North India.It is to be held from 26th October to 28th October.
    It witnesses an active participation from over 30 NITs, IITs, and other institutes of repute across the nation every year.
    Has always been graced by the presence of several renowned personality for Guest Lectures and Interactive sessions.
    Ask anything ..... m listening to you.`

    conv.ask(output)
})

app.intent(CATEGORY_LIST,(conv) => {

    return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/events/categories`)
    .then((res) => {

        let allData = JSON.parse(res);
        let data = allData.data;
        let categoryList = data.categories;
        let output = '';

        for(i in categoryList)
        {
            let number = +i + 1;
            output = output + number + "." + categoryList[i] + '\n';
        }
        output = output + 'Ask anything ..... m listening to you.'
        return conv.ask(output)
    })
    .catch((res) => {
        return conv.ask("Sorry, you can ask something else.Ask anything ..... m listening to you.")
    })
})

app.intent(EVENT_LIST,(conv,{category}) => {

    return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/events?eventCategory=${category}`)
    .then((res) => {

        let allData = JSON.parse(res);
        let data = allData.data;
        let eventList = data.events;
        let output = '';

        for(i in eventList)
        {
            let number = +i + 1;
            output = output + number + "." + eventList[i].eventName + '\n';
        }
        output = output + 'Ask anything ..... m listening to you.';
        return conv.ask(output)
    })
    .catch((err) => {
        return conv.ask("Sorry, you can ask something else.Ask anything ..... m listening to you.")
    })
})

app.intent(EVENT_DESCRIPTION,(conv,{eventName}) => {

    return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/events/search?eventName=${eventName}`)
    .then((res) => {

        let allData = JSON.parse(res)
        let data = allData.data
        let name = `The name of your event is ${data.eventName}` + "\n";
        let description = `Description : ${data.description}` + "\n";
        /*let startTime = 'Start time of event is' + timestamp.toDate(data.startTime);
        let endTime = 'End time of event is' + timestamp.toDate(data.endTime); */
        let venue = `Venue is ${data.venue}` + "\n";

        return conv.ask(name + description + venue + 'Ask anything ..... m listening to you.')
    })
    .catch((err) => {
        return conv.ask("Sorry, you can ask something else.Ask anything ..... m listening to you.")
    })
})

app.intent(SPECIFIC_DETAIL,(conv,{specificDetail,eventName}) => {

    return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/events/search?eventName=${eventName}`)
    .then((res) => {

        let allData = JSON.parse(res)
        let data = allData.data
        let detail = ''

        if(specificDetail == 'endTime')
        {
            detail = timestamp.toDate(data.endTime/1000)
        }
        else if(specificDetail == 'startTime')
        {
            detail = timestamp.toDate(data.startTime/1000)
        }
        else if(specificDetail == 'venue')
        {
            detail = data.venue
        }
        else if(specificDetail == 'coordinators')
        {
            for(i in data.coordinators)
            {
                detail = detail + data.coordinators[i].coordinator_name + ' having contact number ' + data.coordinators[i].coordinator_number + '\n'; 
            }
        }
        else
        {
            return conv.ask("Please asking something else like start time,end time,venue,cash prize,etc.Ask anything ..... m listening to you.")
        }
        return conv.ask(`${specificDetail} of event ${eventName} : \r\n ${detail}  \r\n Ask anything ..... m listening to you.`)
    })
    .catch((err) => {
        return conv.ask("Please try again. Ask anything ..... m listening to you.")
    })
    
})

app.intent(FACTS,(conv) => {

    return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/facts`)
    .then((res) => {

        let allData = JSON.parse(res)
        let fact = allData.data.message

        return conv.ask(fact + '\r\n Ask anything ..... m listening to you.')
    })
    .catch((err) => {
        return conv.ask("Come on ask something else. We have much more than this!.Ask anything ..... m listening to you.")
    })
})

app.intent(GUEST_LECTURE,(conv) => {

    return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/lectures`)
    .then((res) => {

      let categoryList = JSON.parse(res).data.lectures
      let list = {}

      for (let i in categoryList)
             list[categoryList[i].name] = {
                       title: categoryList[i].name,
                       description: categoryList[i].name,
                       image : new Image({
                         url : categoryList[i].imageUrl,
                         alt : categoryList[i].name,
                      }),
                }
      
       conv.ask('Here are the different categories of events')
       conv.ask(new Carousel({
                    title: 'List of Categories',
                     items: list
              }))
 })
        
        
    }).catch((err) => {
        return conv.ask("Sorry cannot fulfill your request.Ask anything ..... m listening to you.")
    })


app.intent(GUEST_LECTURE_OPTION, (conv, params, guestName) => {
     return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/lectures`)
    .then((res) => {

           let allData = JSON.parse(res)
        let lectures = allData.data.lectures

        for(let i in lectures)
        {
            let name = lectures[i].name
            if(name == guestName)
            {
                 conv.ask('Here are the details of ' + name)
                 conv.ask(new BasicCard({
                 text: lectures[i].desc,
                 subtitle: name,
                  title: name,
                  image: new Image({
                     url: lectures[i].imageUrl,
                     alt: 'Image alternate text',
                     }),
                  display: 'CROPPED',
               }));
            
            }}})

        return conv.ask('Wanna know about other guests.Ask anything ..... m listening to you.')
    }).catch(err =>
      conv.ask("Sorry, you can ask something else." + JSON.parse(err)))



app.intent(PARTICULAR_GUEST,(conv,{guestName}) => {

    return rp(`https://us-central1-techspardha-87928.cloudfunctions.net/api/lectures`)
    .then((res) => {

        let allData = JSON.parse(res)
        let lectures = allData.data.lectures

        for(let i in lectures)
        {
            let name = lectures[i].name
            if(name == guestName)
            {
                 conv.ask('Here are the details of ' + name)
                 conv.ask(new BasicCard({
                 text: lectures[i].desc,
                 subtitle: name,
                  title: name,
                  image: new Image({
                     url: lectures[i].imageUrl,
                     alt: 'Image alternate text',
                     }),
                  display: 'CROPPED',
               }));
            
            }}})
        return conv.ask('Wanna know about other guests.Ask anything ..... m listening to you.')
    })
    .catch((err) => {
        return conv.ask("Sorry Guest Name is not clear.Ask anything ..... m listening to you.")
    })










app.intent(ABOUT,(conv) => {

    let output = "Sahil Singla" + "\n" + "Gaurav Rattan" + "\n" + "Ankur Charan" + "\n" + "Ritu Singla" + "\n" + "Sakshi Garg" + "\n"
    output = output + "Gaurav Arora" + "\n" + "Harshita Aggarwal" + "\n" + "Sushant Aggarwal" + "\n" + "Aryan Kaul" + "\n" + "Vaibhav Garg" + "\n" + "Arti Jangra"

    conv.ask(output + '\r\n Ask anything ..... m listening to you.')
})

exports.techspardha = functions.https.onRequest(app)