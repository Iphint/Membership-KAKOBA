const axios = require("axios");

exports.sendPushNotifications = async (pushTokens, title, body) => {
  try {
    const messages = pushTokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data: { type: "event" },
    }));

    const response = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      messages,
      {
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Push notifications sent:", response.data);
  } catch (error) {
    console.error("Error sending push notifications:", error.message);
  }
};
