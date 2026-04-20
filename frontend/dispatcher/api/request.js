import { getApiBaseURL, getApiConfig } from './env'

const isAbsoluteUrl = (url) => /^https?:\/\//.test(url)

const isSuccessCode = (code) => ['0', '200'].includes(String(code))

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

const resolveErrorMessage = (payload, fallback) => {
  if (payload && typeof payload.msg === 'string' && payload.msg.trim()) {
    return payload.msg.trim()
  }
  if (typeof fallback === 'string' && fallback.trim()) {
    return fallback.trim()
  }
  return '\u8bf7\u6c42\u5931\u8d25'
}

const showRequestError = (message) => {
  if (typeof uni.hideLoading === 'function') {
    uni.hideLoading()
  }

  setTimeout(() => {
    uni.showToast({
      title: message,
      icon: 'none'
    })
  }, 50)
}

const rejectWithMessage = (reject, message, extra = {}) => {
  showRequestError(message)
  const error = new Error(message)
  Object.assign(error, { handled: true }, extra)
  reject(error)
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
      const message = `${apiConfig.label} API \u5730\u5740\u672a\u914d\u7f6e`
      rejectWithMessage(reject, message)
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

    const token = uni.getStorageSync('dispatcherToken')
    if (token) {
      config.header.Authorization = `Bearer ${token}`
    }

    uni.request({
      ...config,
      success: (res) => {
        const { statusCode, data } = res

        if (statusCode < 200 || statusCode >= 300) {
          const message = resolveErrorMessage(data, `\u8bf7\u6c42\u5931\u8d25: ${statusCode}`)
          rejectWithMessage(reject, message, { statusCode, data })
          return
        }

        if (data && typeof data.code !== 'undefined' && !isSuccessCode(data.code)) {
          const message = resolveErrorMessage(data)
          rejectWithMessage(reject, message, { statusCode, data, code: data.code })
          return
        }

        resolve(data)
      },
      fail: (err) => {
        const message = resolveErrorMessage(null, err && err.errMsg ? err.errMsg : '\u7f51\u7edc\u5f02\u5e38')
        rejectWithMessage(reject, message, { cause: err })
      }
    })
  })
}

export default request
