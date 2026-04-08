import request from '../request'

export const getSubscriptions = () => {
  return request({
    url: '/subscription',
    method: 'GET'
  })
}
