require("dotenv").config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

let getHomePage = (req, res) => {
    return res.send("Xin chao");
};

let getWebhook = (req, res) => {

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if(mode&&token){
        if(mode === 'subscribe' && token === VERIFY_TOKEN){
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
        body.entry.forEach(function(entry) {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            let sender_psid = webhook_event.sender.id;
            consolde.log('Sender PSID: ' + sender_psid);
        })
        // Returns a '200 OK' response to all requests
        res.status(200).send("EVENT_RECEIVED");
        // Determine which webhooks were triggered and get sender PSIDs and locale, message content and more.
      } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
      }
}
//Handles messages events
function handleMessage(sender_psid, received_message){

}
//Handles messaging_postbacks events
function handleMessage(sender_psid, received_postback){
    
}
//Sends response messages via the Send API
function handleMessage(sender_psid, received_response){
    
}

module.exports = {
    getHomePage: getHomePage, //key: value
    postWebhook: postWebhook,
    getWebhook: getWebhook
}