export const useNotifications = () => {
  const permission = useState<NotificationPermission>('notification-permission', () => 'default')
  const isSupported = useState('notification-supported', () => false)

  // Check if notifications are supported
  const checkSupport = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      isSupported.value = true
      permission.value = Notification.permission
    }
  }

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      console.warn('Notifications not supported')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result
      return result === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  // Check if we have permission
  const hasPermission = () => {
    return permission.value === 'granted'
  }

  // Send a notification
  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!hasPermission()) {
      console.warn('Notification permission not granted')
      return null
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000)

      return notification
    } catch (error) {
      console.error('Error sending notification:', error)
      return null
    }
  }

  // Send game starting notification
  const sendGameNotification = (
    homeTeam: { name: string; abbrev: string },
    awayTeam: { name: string; abbrev: string },
    gameId: number
  ) => {
    const notification = sendNotification(
      '🏒 Game Starting Soon!',
      {
        body: `${awayTeam.abbrev} @ ${homeTeam.abbrev} is about to begin!`,
        tag: `game-${gameId}`,
        requireInteraction: true,
        data: { gameId }
      }
    )

    if (notification) {
      notification.onclick = () => {
        window.focus()
        window.location.href = `/game/${gameId}`
        notification.close()
      }
    }

    return notification
  }

  return {
    permission,
    isSupported,
    checkSupport,
    requestPermission,
    hasPermission,
    sendNotification,
    sendGameNotification
  }
}
