require('dotenv').config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
let stringSession;

if (process.env.STRING_SESSION) {
    stringSession = new StringSession(process.env.STRING_SESSION); // Load saved session
} else {
    stringSession = new StringSession(""); // Create a new session for the first run
}

const sourceChannelIds = [2002042008n,1812009563n,1547253689n,1812009563n,1708182542n];
const finalChannelId = process.env.FINAL_CHANNEL; // Replace with actual channel ID

(async () => {
    console.log("Loading...");
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text("Please enter your phone number: "),
        password: async () => await input.text("Please enter your password: "),
        phoneCode: async () => await input.text("Please enter the code you received: "),
        onError: (err) => console.log(err),
    });

    if (!process.env.STRING_SESSION) {
        // Save the session string if it's the first run
        const savedSession = client.session.save();
        console.log("Your session string:", savedSession);
        // Update your .env file with this session string for future use
    }

    console.log("You should now be connected.");

      // * Get all id of all channels in your client
  const dialogs = await client.getDialogs();
  dialogs.forEach((dialog) => {
    if (dialog.isChannel) {
      console.log(dialog.title);
      console.log(dialog.id);
    }
  });

  client.addEventHandler(async (event) => {
    try {
      // console.log(event)
        // Check if the event is a message and has a channelId
        // if (event.message && event.message.peerId && event.message.peerId.channelId) {
          if (event.className === "UpdateNewChannelMessage") {
            const channelId = event.message.peerId.channelId.value;
            console.log(channelId)
            // const msg = event.message.message;
            // Check if the message is from the source channel
            if (sourceChannelId.includes(channelId)) {
                let msg = event.message.message;
                console.log(event)
                console.log(`Forwarding message: ${msg}`);
                // Forward the message to the final channel
                await client.sendMessage(finalChannelId, { message: msg });
            }
            // If the message is not from the source channel, do nothing
        }
    } catch (error) {
        // Log any errors
        console.error(`Failed to forward message: ${error}`);
    }
});


    console.log("Bot is running...");
})();
