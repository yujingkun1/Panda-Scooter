import request from '../request'

export const getMapData = (params) => {
  return request({
    url: '/map',
    method: 'GET',
    params: {
      ...params,
      apifoxApiId: '431523493'
    }
  })
}
