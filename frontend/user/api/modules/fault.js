import request from '../request'
import { getApiBaseURL, getApiConfig } from '../env'

const isSuccessCode = (code) => ['0', '200'].includes(String(code))

const resolveErrorMessage = (payload, fallback) => {
  if (payload && typeof payload.msg === 'string' && payload.msg.trim()) {
    return payload.msg.trim()
  }
  if (typeof fallback === 'string' && fallback.trim()) {
    return fallback.trim()
  }
  return '请求失败'
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

const buildUrl = (url, baseURL) => {
  return `${baseURL}${url.startsWith('/') ? url : `/${url}`}`
}

const getAuthHeader = () => {
  const token = uni.getStorageSync('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const parseUploadResponse = (rawData) => {
  if (typeof rawData !== 'string') {
    return rawData
  }

  try {
    return JSON.parse(rawData)
  } catch (error) {
    return rawData
  }
}

const normalizeFaultPayload = (data = {}) => ({
  scooterId: data.scooterId,
  description: data.description || ''
})

const createHandledError = (message, extra = {}) => {
  const error = new Error(message)
  Object.assign(error, { handled: true }, extra)
  return error
}

const resolveFaultUrl = () => {
  const baseURL = getApiBaseURL()
  if (!baseURL) {
    const apiConfig = getApiConfig()
    throw createHandledError(`${apiConfig.label} API 地址未配置`)
  }
  return buildUrl('/fault', baseURL)
}

const requestFaultWithoutImage = (data) => {
  return request({
    url: '/fault',
    method: 'POST',
    header: {
      'Content-Type': 'multipart/form-data'
    },
    data: normalizeFaultPayload(data)
  })
}

const uploadFaultWithImage = (data) => {
  const url = resolveFaultUrl()
  const formData = normalizeFaultPayload(data)

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url,
      filePath: data.image,
      name: 'image',
      formData,
      header: {
        ...getAuthHeader()
      },
      success: (res) => {
        const payload = parseUploadResponse(res.data)

        if (res.statusCode < 200 || res.statusCode >= 300) {
          const message = resolveErrorMessage(payload, `请求失败: ${res.statusCode}`)
          showRequestError(message)
          reject(createHandledError(message, { statusCode: res.statusCode, data: payload }))
          return
        }

        if (payload && typeof payload.code !== 'undefined' && !isSuccessCode(payload.code)) {
          const message = resolveErrorMessage(payload)
          showRequestError(message)
          reject(createHandledError(message, { statusCode: res.statusCode, data: payload, code: payload.code }))
          return
        }

        resolve(payload)
      },
      fail: (err) => {
        const message = resolveErrorMessage(null, err && err.errMsg ? err.errMsg : '网络异常')
        showRequestError(message)
        reject(createHandledError(message, { cause: err }))
      }
    })
  })
}

export const getFaults = () => {
  return request({
    url: '/faults',
    method: 'GET'
  })
}

export const reportFault = (data = {}) => {
  if (data.image) {
    return uploadFaultWithImage(data)
  }

  return requestFaultWithoutImage(data)
}
