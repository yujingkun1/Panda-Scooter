import request from '../request'

export const getFaults = () => {
  return request({
    url: '/faults',
    method: 'GET'
  })
}

export const reportFault = (data) => {
  return request({
    url: '/fault',
    method: 'POST',
    data
  })
}
