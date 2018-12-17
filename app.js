const axios = require('axios');
const https = require('https');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const agent = new https.Agent({  
  rejectUnauthorized: false
});

let isAppUp = true;
let appEmailLastSentAt = 0;
let isApp3Up = true;
let app3EmailLastSentAt = 0;

const appUrl = 'https://e33d2ea501994214:b4b699b082a2f685@cjpoeiifd000101m3i4tz8dm5.es.vizion.ai';
const app3Url = '';
const emailsSendTo = 'markstrelecky@yandex.com';

if(appUrl){
  setInterval(function(){
    axios({
      method:'post',
      url: appUrl + '/tests/_doc',
      data: {"datapoint": "test"},
      headers: {'Content-Type':'application/json'},
      httpsAgent: agent 
    })
      .then(function(response) {
        if(!isAppUp){
          const msg = {
            to: emailsSendTo,
            from: 'streleck@gmail.com',
            subject: 'app.vizion.ai is back up',
            text: 'Elasticsearch url: ' + appUrl,
          };
          sgMail.send(msg);
        }
        isAppUp = true;
      })
      .catch(function(error) {
        let timeElapsedSinceLastEmail = Date.now() - appEmailLastSentAt;
        if(isAppUp){
          const msg = {
            to: emailsSendTo,
            from: 'streleck@gmail.com',
            subject: 'app.vizion.ai has gone down',
            text: 'Elasticsearch url: ' + appUrl,
          };
          sgMail.send(msg);
          appEmailLastSentAt = Date.now();
        }
        else if(timeElapsedSinceLastEmail > (1000 * 60 * 60)){
          const msg = {
            to: emailsSendTo,
            from: 'streleck@gmail.com',
            subject: 'app.vizion.ai is still down',
            text: 'Elasticsearch url: ' + appUrl,
          };
          sgMail.send(msg);
          appEmailLastSentAt = Date.now();
        }
        isAppUp = false;
      } 
    );
  }, (1000 * 60 * 5));
}

if(app3Url){
  setInterval(function(){
    axios({
      method:'post',
      url: app3Url + '/tests/_doc',
      data: {"datapoint": "test"},
      headers: {'Content-Type':'application/json'},
      httpsAgent: agent 
    })
      .then(function(response) {
        if(!isApp3Up){
          const msg = {
            to: emailsSendTo,
            from: 'streleck@gmail.com',
            subject: 'app3.vizion.ai is back up',
            text: 'Elasticsearch url: ' + app3Url,
          };
          sgMail.send(msg);
        }
        isApp3Up = true;
      })
      .catch(function(error) {
        let timeElapsedSinceLastEmail = Date.now() - app3EmailLastSentAt;
        if(isApp3Up){
          const msg = {
            to: emailsSendTo,
            from: 'streleck@gmail.com',
            subject: 'app3.vizion.ai has gone down',
            text: 'Elasticsearch url: ' + app3Url,
          };
          sgMail.send(msg);
          app3EmailLastSentAt = Date.now();
        }
        else if(timeElapsedSinceLastEmail > (1000 * 60 * 60)){
          const msg = {
            to: emailsSendTo,
            from: 'streleck@gmail.com',
            subject: 'app3.vizion.ai is still down',
            text: 'Elasticsearch url: ' + app3Url,
          };
          sgMail.send(msg);
          app3EmailLastSentAt = Date.now();
        }
        isApp3Up = false;
      } 
    );
  }, (1000 * 60 * 5));
}

