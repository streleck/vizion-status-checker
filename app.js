const axios = require('axios');
const https = require('https');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const agent = new https.Agent({  
  rejectUnauthorized: false
});

let appStatus = {};

const appUrls = ['https://e33d2ea501994214:b4b699b082a2f685@cjpoeiifd000101m3i4tz8dm5.es.vizion.ai', 'https://2e967f17d9c64cbe:adc45891cdf82512@cjpsnybuk000f01iu3daq9js6.es3.vizion.ai']
const emailsSendTo = 'markstrelecky@yandex.com';

axios({
  method:'get',
  url: 'https://e33d2ea501994214:b4b699b082a2f685@cjpoeiifd000101m3i4tz8dm5.es.vizion.ai' + '/tests/_doc/1',
  data: {"fidelityTest": "ChesapeakeScooter"},
  headers: {'Content-Type':'application/json'},
  httpsAgent: agent 
})
.then(function(response) {
  // Read data to see if it has maintained fidelity
  console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%', response.data._source.fidelityTest);
})
.catch(function(error) {
  console.log('*******************************************************************', error);
})



for (let appUrl of appUrls){
  // Set up an initial 'put' to test later for data fidelity
  axios({
    method:'put',
    url: appUrl + '/tests/_doc/1',
    data: {"fidelityTest": "ChesapeakeScooter"},
    headers: {'Content-Type':'application/json'},
    httpsAgent: agent 
  })
  // If successful, start a testing interval on that url
  .then(function(response) {
    appStatus[appUrl]['post'] = true;
    appstatus[appUrl]['get'] = true;
    let msg = {
      to: emailsSendTo,
      from: 'streleck@gmail.com',
      subject: 'Your vizion.ai ES app is being tested',
      text: 'Elasticsearch url: ' + appUrl + '\n \n This app has successfully recieved an initial PUT and will now be tested every five minutes.',
    };
    sgMail.send(msg);
    setInterval(function(){

      // Post test
      axios({
        method:'post',
        url: appUrl + '/tests/_doc',
        data: {"datapoint": "test"},
        headers: {'Content-Type':'application/json'},
        httpsAgent: agent 
      })
      .then(function(response) {
        console.log('App Success');
        if(!appStatus[appUrl]['post']){
          let msg = {
            to: emailsSendTo,
            from: 'streleck@gmail.com',
            subject: 'Your vizion.ai ES app is functioning for POST',
            text: 'Elasticsearch url: ' + appUrl + '\n \n After having previously failed a POST attempt, this app has now successfully accepted a POST.',
          };
          sgMail.send(msg);
        }
        appStatus[appUrl]['post'] = true;
      })
      .catch(function(error) {
        console.log('App fail!!!!! \n', error);
        let msg = {
          to: emailsSendTo,
          from: 'streleck@gmail.com',
          subject: 'Your vizion.ai ES app has failed a POST attempt',
          text: 'Elasticsearch url: ' + appUrl,
        };
        sgMail.send(msg);
        appStatus[appUrl]['post'] = false;
      });

      // GET test
      axios({
        method:'get',
        url: appUrl + '/tests/_doc/1',
        headers: {'Content-Type':'application/json'},
        httpsAgent: agent 
      })
      .then(function(response) {
        // Read data to see if it has maintained fidelity
        if(response.data._source.fidelityTest !== "ChesapeakeScooter") {
          let msg = {
            to: emailsSendTo,
            from: 'streleck@gmail.com',
            subject: 'Your vizion.ai ES app has failed a data fidelity check',
            text: 'Elasticsearch url: ' + appUrl + '\n \n This app was successfully able to return data from a GET request, but that data did not match what was expected.',
          };
          sgMail.send(msg);
          appStatus[appUrl]['get'] = false;
        }
        else {
          if(appStatus[appUrl]['get'] === false){
            let msg = {
              to: emailsSendTo,
              from: 'streleck@gmail.com',
              subject: 'Your vizion.ai ES app is functioning for GET',
              text: 'Elasticsearch url: ' + appUrl + '\n \n After having previously failed a GET attempt, this app has now successfully accepted a GET and returned the expected data.',
            };
          }
          sgMail.send(msg);
          appStatus[appUrl]['get'] = true;
        }
      })
      .catch(function(error) {
        let msg = {
          to: emailsSendTo,
          from: 'streleck@gmail.com',
          subject: 'Your vizion.ai ES app has failed a GET attempt',
          text: 'Elasticsearch url: ' + appUrl,
        };
        sgMail.send(msg);
        appStatus[appUrl]['post'] = false;
      })

    }, (1000 * 60 * 5));
  })
  // Initial put has failed, email about the failure
  .catch(function(error) {
    let msg = {
      to: emailsSendTo,
      from: 'streleck@gmail.com',
      subject: 'Your vizion.ai ES app is not functioning.',
      text: 'Elasticsearch url: ' + appUrl + '\n \n This app was not successful in an initial PUT test and will not continue to be tested.',
    };
  });
}


