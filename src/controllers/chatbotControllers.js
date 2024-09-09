require("dotenv").config();
import request from "request";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

let getHomePage = (req, res) => {
    return res.send("Xin chao");
};

let getWebhook = (req, res) => {

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        }
    } else {
        res.sendStatus(403);
    }
}

let postWebhook = (req, res) => {
    let body = req.body;

    if (body.object === "page") {
        body.entry.forEach(function (entry) {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender id
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            //check if the event is a message or postback and pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });
        // Returns a '200 OK' response to all requests
        res.status(200).send("EVENT_RECEIVED");
        // Determine which webhooks were triggered and get sender PSIDs and locale, message content and more.
    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
}
//Handles messages events
function handleMessage(sender_psid, received_message) {
    let response;
    
    // Checks if the message contains text
    if (received_message.text) {    
      // Create the payload for a basic text message, which
      // will be added to the body of our request to the Send API
      response = {
        "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
      }
    } else if (received_message.attachments) {
      // Get the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url;
      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Đây có phải bức ảnh của bạn không?",
              "subtitle": "Tap a button to answer.",
              "image_url": attachment_url,
              "buttons": [
                {
                  "type": "postback",
                  "title": "Đúng!",
                  "payload": "yes",
                },
                {
                  "type": "postback",
                  "title": "Không!",
                  "payload": "no",
                }
              ],
            }]
          }
        }
      }
    } 
    
    // Send the response message
    callSendApi(sender_psid, response);
  }
//Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    let response;
    
    // Get the payload for the postback
    let payload = received_postback.payload;
  
    // Set the response based on the postback payload
    if (payload === 'yes') {
      response = { "text": "Thanks!" }
    } else if (payload === 'no') {
      response = { "text": "Oops, try sending another image." }
    }
    // Send the message to acknowledge the postback
    callSendApi(sender_psid, response);
  }
  
//Sends response messages via the Send API
function callSendApi(sender_psid, received_response) {
    // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": received_response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}

module.exports = {
    getHomePage: getHomePage, //key: value
    postWebhook: postWebhook,
    getWebhook: getWebhook
}