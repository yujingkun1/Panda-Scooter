import request from '../request'

export const getMapData = (params) => {
  return request({
    url: '/map',
    method: 'GET',
    params
  })
}
