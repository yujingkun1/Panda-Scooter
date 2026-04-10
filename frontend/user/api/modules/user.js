import request from '../request'

const USER_API_IDS = {
  signin: '431491479',
  login: '417631385',
  logout: '417642987',
  delete: '431490993',
  verification: '431491550',
  password: '431491727'
}

export const userBill = (data) => {
  return request({
    url: '/user/bill',
    method: 'POST',
    data
  })
}

export const getUserBills = () => {
  return request({
    url: '/user/bills',
    method: 'GET'
  })
}

export const userSignin = (data) => {
  return request({
    url: '/user/signin',
    method: 'POST',
    params: {
      apifoxApiId: USER_API_IDS.signin
    },
    data
  })
}

export const userLogin = (data) => {
  return request({
    url: '/user/login',
    method: 'POST',
    params: {
      apifoxApiId: USER_API_IDS.login
    },
    data
  })
}

export const userLogout = () => {
  return request({
    url: '/user/logout',
    method: 'POST',
    params: {
      apifoxApiId: USER_API_IDS.logout
    }
  })
}

export const userDelete = (data) => {
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

export const userPassword = (data) => {
  return request({
    url: '/user/password',
    method: 'POST',
    params: {
      apifoxApiId: USER_API_IDS.password
    },
    data
  })
}

export const getUserWallet = () => {
  return request({
    url: '/user/wallet',
    method: 'GET'
  })
}

export const getUserInfo = () => {
  return request({
    url: '/user/info',
    method: 'GET'
  })
}

export const getRideHistory = () => {
  return request({
    url: '/ride-history',
    method: 'GET'
  })
}

export const payUnpaidOrder = (data) => {
  return request({
    url: '/unpaid-order',
    method: 'POST',
    data
  })
}
