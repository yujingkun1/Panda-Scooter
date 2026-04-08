export const API_ENV_STORAGE_KEY = 'dispatcherApiEnv'
export const DEFAULT_API_ENV = 'mock'

export const API_ENVS = Object.freeze({
  mock: {
    key: 'mock',
    label: 'Mock开发环境',
    baseURL: 'http://127.0.0.1:4523/m1/7776188-7522280-7128400'
  },
  test: {
    key: 'test',
    label: '前后端联调测试环境',
    baseURL: ''
  },
  prod: {
    key: 'prod',
    label: '生产环境',
    baseURL: ''
  }
})

const hasStorage = () => typeof uni !== 'undefined' && typeof uni.getStorageSync === 'function'

const isValidApiEnv = (env) => Boolean(API_ENVS[env])

const normalizeApiEnv = (env) => (isValidApiEnv(env) ? env : DEFAULT_API_ENV)

export const getApiEnvOptions = () => {
  return Object.values(API_ENVS).map((item) => ({
    ...item,
    configured: Boolean(item.baseURL)
  }))
}

export const getCurrentApiEnv = () => {
  if (!hasStorage()) {
    return DEFAULT_API_ENV
  }

  return normalizeApiEnv(uni.getStorageSync(API_ENV_STORAGE_KEY))
}

export const getApiConfig = (env = getCurrentApiEnv()) => {
  return API_ENVS[normalizeApiEnv(env)]
}

export const getApiBaseURL = (env = getCurrentApiEnv()) => {
  return getApiConfig(env).baseURL
}

export const setApiEnv = (env) => {
  const normalizedEnv = normalizeApiEnv(env)

  if (hasStorage()) {
    uni.setStorageSync(API_ENV_STORAGE_KEY, normalizedEnv)
  }

  return getApiConfig(normalizedEnv)
}
