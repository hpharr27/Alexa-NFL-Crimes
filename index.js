const Alexa = require('alexa-sdk');
const Axios = require('axios');
const csv = require('csvtojson')

const csvFilePath='nfl-names.csv'

const handlers = {
    'LaunchRequest': function () {
        var welcomeSpeech = 'Welcome to the Football Arrests skill. What would you like to know?'
        var repromptSpeech = 'Anything else you would like to ask?'
        this.response.speak(welcomeSpeech).listen(repromptSpeech);
        this.emit(':responseReady');
	},
	'CrimeIntent': function () {
        const intentObj = this.event.request.intent;
        const self = this;
        if (intentObj.slots.date.value){
            console.log(intentObj.slots.date.value);
        }
        if (intentObj.slots.team.value){
          console.log(intentObj.slots.team.value);
          team_slot = intentObj.slots.team.value;
          var response = '';
          csv()
          .fromFile(csvFilePath)
          .on('json',(jsonObj)=>{
              obj = jsonObj
              if (team_slot.toLowerCase().indexOf(jsonObj['TEAM'].toLowerCase()) > -1)
              {
                 team_name = jsonObj['NAME']
                 Axios.get('http://nflarrest.com/api/v1/team/topCrimes/' + team_name + '?limit=1')
                   .then(function (response) {
                     var data = response.data[0]
                     response = `The most common crime on the ${team_slot} is ${data['Category']} with ${data['arrest_count']} arrests`
                        self.emit(':tell', response );
                   })
                   .catch(function (error) {
                     console.log(error);
                   });
                   response = 'wait'
              }
          })
          .on('done',(error)=>{
              if (response.length > 2)
              {
               console.log('waiting for axios')
              }
              else{
                self.emit(':tell', 'Could not recognize the team name. For example ask what is the most common crime on the jets')
              }
          })
        }
        else{
            Axios.get('http://nflarrest.com/api/v1/crime?limit=1')
              .then(function (response) {
                var data = response.data[0]
                var response = `The most common crime is  ${data['Category']} and was committed ${data['arrest_count']} times`
                self.emit(':tell',response );
              })
              .catch(function (error) {
                console.log(error);
              });
	    }
	},
    'PlayerIntent': function () {
        const intentObj = this.event.request.intent;
        const self = this;
        if (intentObj.slots.date.value){
            console.log(intentObj.slots.date.value);
        }
       if (intentObj.slots.team.value){
         console.log(intentObj.slots.team.value);
         team_slot = intentObj.slots.team.value;
        var response = ''
         csv()
         .fromFile(csvFilePath)
         .on('json',(jsonObj)=>{

             obj = jsonObj
             if (team_slot.toLowerCase().indexOf(jsonObj['TEAM'].toLowerCase()) > -1)
             {
                team_name = jsonObj['NAME']
                console.log(team_name)
                Axios.get('http://nflarrest.com/api/v1/team/topPlayers/' + team_name + '?limit=1')
                  .then(function (response) {
                    var data = response.data[0]
                    response = `The most arrested player on the ${team_slot} is ${data['Name']} with ${data['arrest_count']} arrests`
                    self.emit(':tell', response );
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
                  response = 'wait'
             }
         })
         .on('done',(error)=>{
             if (response.length > 2)
              {
                console.log('waiting for axios')
              }
              else{
                self.emit(':tell', 'Could not recognize the team name. For example ask who has the most arrests on the jets')
             }
         })
       }
       else
       {
        Axios.get('http://nflarrest.com/api/v1/player?limit=1')
          .then(function (response) {
            var data = response.data[0]
            var response = `The player with the most arrests is ${data['Name']} on the ${data['Team_name']} with ${data['arrest_count']} arrests`
            self.emit(':tell', response );
          })
          .catch(function (error) {
            console.log(error);
          });
        }
    },
    'TeamIntent': function () {
        const intentObj = this.event.request.intent;
        const self = this;

        Axios.get('http://nflarrest.com/api/v1/team?limit=1')
          .then(function (response) {
            var data = response.data[0]
            var response = `The team with the most player arrests is ${data['Team_preffered_name']} with ${data['arrest_count']} arrests`
            self.emit(':tell', response);
          })
          .catch(function (error) {
            console.log(error);
          });

    },

};




exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.appId = 'amzn1.ask.skill.844848f2-f3e9-48fa-88df-1055d93e976a' // APP_ID is your skill id which can be found in the Amazon developer console where you create the skill.

    alexa.execute();
};