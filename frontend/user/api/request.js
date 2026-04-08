import { getApiBaseURL, getApiConfig } from './env'

const isAbsoluteUrl = (url) => /^https?:\/\//.test(url)

const serializeParams = (params = {}) => {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&')
}

const buildUrl = (url, params, baseURL) => {
  const normalizedUrl = isAbsoluteUrl(url)
    ? url
    : `${baseURL}${url.startsWith('/') ? url : `/${url}`}`
  const queryString = serializeParams(params)

  if (!queryString) {
    return normalizedUrl
  }

  return `${normalizedUrl}${normalizedUrl.includes('?') ? '&' : '?'}${queryString}`
}

const request = (options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      url,
      params,
      baseURL: customBaseURL,
      env,
      header = {},
      method = 'GET',
      ...rest
    } = options

    const resolvedBaseURL = customBaseURL || getApiBaseURL(env)

    if (!isAbsoluteUrl(url) && !resolvedBaseURL) {
      const apiConfig = getApiConfig(env)
      const message = `${apiConfig.label} API 地址未配置`
      uni.showToast({
        title: message,
        icon: 'none'
      })
      reject(new Error(message))
      return
    }

    const config = {
      url: buildUrl(url, params, resolvedBaseURL),
      method,
      timeout: 10000,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      ...rest
    }

    const token = uni.getStorageSync('token')
    if (token) {
      config.header.Authorization = `Bearer ${token}`
    }

    uni.request({
      ...config,
      success: (res) => {
        const { statusCode, data } = res

        if (statusCode >= 200 && statusCode < 300) {
          if (data && typeof data.code !== 'undefined' && data.code !== 0) {
            const message = data.msg || 'Request failed'
            uni.showToast({
              title: message,
              icon: 'none'
            })
            reject(new Error(message))
            return
          }

          resolve(data)
          return
        }

        const message = `Request failed: ${statusCode}`
        uni.showToast({
          title: message,
          icon: 'none'
        })
        reject(new Error(message))
      },
      fail: (err) => {
        uni.showToast({
          title: 'Network error',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export default request
