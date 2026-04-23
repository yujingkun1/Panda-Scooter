import request from '../request'

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
    url: '/scooter/lock',
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
