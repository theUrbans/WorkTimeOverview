export function sendNotification(
  title: string,
  body: string,
  icon?: string,
): void {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(title, { body, icon });
    return;
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body, icon });
      }
    });
  }
}

export function getNotificationPermission(): Promise<NotificationPermission> {
  return Notification.requestPermission();
}
