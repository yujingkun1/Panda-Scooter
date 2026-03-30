import request from '../request'

// 账单接口
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

// 账号接口
export const userSignin = (data) => {
  return request({
    url: '/user/signin',
    method: 'POST',
    data
  })
}

export const userLogin = (data) => {
  return request({
    url: '/user/login',
    method: 'POST',
    data
  })
}

export const userLogout = () => {
  return request({
    url: '/user/logout',
    method: 'POST'
  })
}

export const userDelete = (data) => {
  return request({
    url: '/user/delete',
    method: 'DELETE',
    data
  })
}

export const getVerificationCode = (email) => {
  return request({
    url: '/user/verification',
    method: 'GET',
    params: { email }
  })
}

export const userPassword = (data) => {
  return request({
    url: '/user/password',
    method: 'POST',
    data
  })
}

// 钱包接口
export const getUserWallet = () => {
  return request({
    url: '/user/wallet',
    method: 'GET'
  })
}

// 个人信息接口
export const getUserInfo = () => {
  return request({
    url: '/user/info',
    method: 'GET'
  })
}

// 历史行程接口
export const getRideHistory = () => {
  return request({
    url: '/ride-history',
    method: 'GET'
  })
}