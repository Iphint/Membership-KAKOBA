/* eslint-disable import/namespace */
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Configure notification handler with custom settings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    // Priority for Android
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  // Only works on physical devices
  if (!Device.isDevice) {
    console.warn("Push notifications only work on a physical device");
    return null;
  }

  // Configure Android notification channel (required for Android 8.0+)
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "default",
        showBadge: true,
        enableVibrate: true,
        enableLights: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      // Create a high priority channel for important notifications
      await Notifications.setNotificationChannelAsync("important", {
        name: "Important Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: "#FF0000",
        sound: "default",
        showBadge: true,
        enableVibrate: true,
        enableLights: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      console.log("✅ Android notification channels created");
    } catch (error) {
      console.error("❌ Error creating notification channel:", error);
    }
  }

  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
        },
      });
      finalStatus = status;
    }

    // Check if permission was granted
    if (finalStatus !== "granted") {
      console.warn("❌ Permission not granted for push notifications");
      return null;
    }

    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    if (!projectId) {
      console.warn("⚠️ No project ID found. Using legacy token method.");
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      })
    ).data;

    console.log("✅ Expo Push Token:", token);
  } catch (error) {
    console.error("❌ Error getting push token:", error);
    return null;
  }

  return token;
}

// Function to send local notification for testing
export async function sendTestNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification 🔔",
        body: "This is a test notification with image!",
        data: {
          screen: "home",
          imageUrl: "https://via.placeholder.com/400x200/4A90E2/FFFFFF?text=Test+Image",
        },
        sound: "default",
        // Android specific
        android: {
          channelId: "default",
          color: "#4A90E2",
          priority: Notifications.AndroidNotificationPriority.HIGH,
          // Large image for Android
          largeIcon: "https://via.placeholder.com/128/4A90E2/FFFFFF?text=Icon",
          // Big picture style
          style: {
            type: Notifications.AndroidNotificationStyle.BIGPICTURE,
            picture: "https://via.placeholder.com/400x200/4A90E2/FFFFFF?text=Big+Picture",
          },
        },
      },
      trigger: { seconds: 2 },
    });
    console.log("✅ Test notification scheduled");
  } catch (error) {
    console.error("❌ Error scheduling notification:", error);
  }
}

// Function to schedule notification with custom image
export async function scheduleNotificationWithImage(title, body, imageUrl, delay = 2) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: {
          imageUrl: imageUrl,
        },
        sound: "default",
        badge: 1,
        // iOS specific
        attachments: imageUrl
          ? [
              {
                url: imageUrl,
              },
            ]
          : undefined,
        // Android specific
        android: {
          channelId: "default",
          color: "#4A90E2",
          priority: Notifications.AndroidNotificationPriority.HIGH,
          style: imageUrl
            ? {
                type: Notifications.AndroidNotificationStyle.BIGPICTURE,
                picture: imageUrl,
              }
            : undefined,
        },
      },
      trigger: { seconds: delay },
    });
    console.log("✅ Notification with image scheduled");
    return true;
  } catch (error) {
    console.error("❌ Error scheduling notification:", error);
    return false;
  }
}

// Function to cancel all notifications
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("✅ All notifications cancelled");
  } catch (error) {
    console.error("❌ Error cancelling notifications:", error);
  }
}

// Function to get badge count
export async function getBadgeCount() {
  try {
    const count = await Notifications.getBadgeCountAsync();
    return count;
  } catch (error) {
    console.error("❌ Error getting badge count:", error);
    return 0;
  }
}

// Function to set badge count
export async function setBadgeCount(count) {
  try {
    await Notifications.setBadgeCountAsync(count);
    console.log(`✅ Badge count set to ${count}`);
  } catch (error) {
    console.error("❌ Error setting badge count:", error);
  }
}