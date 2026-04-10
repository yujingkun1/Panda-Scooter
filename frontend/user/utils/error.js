export const showUnhandledError = (error, message) => {
  if (!message || (error && error.handled)) {
    return
  }

  uni.showToast({
    title: message,
    icon: 'none'
  })
}
