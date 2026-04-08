import request from '../request'

const LOCK_URL = 'https://m1.apifoxmock.com/m1/7776188-7522280-7128400/scooter/lock'

export const unlockScooter = (code) => {
  return request({
    url: '/scooter/unlock',
    method: 'POST',
    params: {
      apifoxApiId: '431533355'
    },
    data: {
      code
    }
  })
}

export const lockScooter = (data) => {
  return request({
    url: LOCK_URL,
    method: 'POST',
    params: {
      apifoxApiId: '431532462'
    },
    data
  })
}

export const getScooterInfo = (code) => {
  return request({
    url: '/scooter/info',
    method: 'GET',
    params: {
      code
    }
  })
}
