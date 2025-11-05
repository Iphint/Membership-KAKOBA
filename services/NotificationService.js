const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendPushNotifications } = require("../utils/sendPushNotification");

exports.notifyAllUsers = async (title, message) => {
  try {
    const usersWithToken = await prisma.user.findMany({
      where: {
        expoPushToken: { not: null },
      },
      select: {
        expoPushToken: true,
      },
    });

    const pushTokens = usersWithToken.map((u) => u.expoPushToken);

    if (pushTokens.length > 0) {
      await sendPushNotifications(pushTokens, title, message);
      console.log(`Notifikasi dikirim ke ${pushTokens.length} user`);
    } else {
      console.log("ℹTidak ada user dengan expoPushToken");
    }
  } catch (error) {
    console.error("Gagal mengirim notifikasi ke user:", error);
  }
};
