const AUTH_ERROR_MESSAGES = [
  '\u672a\u767b\u5f55',
  '\u767b\u5f55\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55'
]

export const clearUserSession = () => {
  uni.removeStorageSync('token')
  uni.removeStorageSync('currentRide')
  uni.removeStorageSync('userInfo')
}

export const isAuthErrorMessage = (message = '') => {
  const normalizedMessage = String(message || '').trim()
  return AUTH_ERROR_MESSAGES.includes(normalizedMessage)
}

export const isUnauthorizedError = (error) => {
  return Boolean(error && error.unauthorized)
}
