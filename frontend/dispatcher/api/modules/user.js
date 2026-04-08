import request from '../request'

const USER_API_IDS = {
  signin: '431525072',
  login: '417608702',
  logout: '431523613',
  delete: '431525046',
  verification: '431525082',
  password: '431525408',
  info: '431534226'
}

export const dispatcherSignin = (data) => {
  return request({
    url: '/user/signin',
    method: 'POST',
    params: {
      apifoxApiId: USER_API_IDS.signin
    },
    data
  })
}

export const dispatcherLogin = (data) => {
  return request({
    url: '/user/login',
    method: 'POST',
    params: {
      apifoxApiId: USER_API_IDS.login
    },
    data
  })
}

export const dispatcherLogout = () => {
  return request({
    url: '/user/logout',
    method: 'POST',
    params: {
      apifoxApiId: USER_API_IDS.logout
    }
  })
}

export const dispatcherDelete = (data) => {
  return request({
    url: '/user/delete',
    method: 'DELETE',
    params: {
      apifoxApiId: USER_API_IDS.delete
    },
    data
  })
}

export const getVerificationCode = (email) => {
  return request({
    url: '/user/verification',
    method: 'GET',
    params: {
      email,
      apifoxApiId: USER_API_IDS.verification
    }
  })
}

export const dispatcherPassword = (data) => {
  return request({
    url: '/user/password',
    method: 'POST',
    params: {
      apifoxApiId: USER_API_IDS.password
    },
    data
  })
}

export const getDispatcherInfo = () => {
  return request({
    url: '/user/info',
    method: 'GET',
    params: {
      apifoxApiId: USER_API_IDS.info
    }
  })
}

export const getDispatchHistory = () => {
  return request({
    url: '/user/dispatch-history',
    method: 'GET'
  })
}
