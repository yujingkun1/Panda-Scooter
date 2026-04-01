import request from '../request'

export const unlockScooter = (code) => {
  return request({
    url: '/scooter/unlock',
    method: 'POST',
    params: { code }
  })
}

export const getScooterInfo = (code) => {
  return request({
    url: '/scooter',
    method: 'GET',
    params: { code }
  })
}

export const lockScooter = (data) => {
  return request({
    url: '/scooter/lock',
    method: 'POST',
    data
  })
}
