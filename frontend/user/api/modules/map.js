import request from '../request'

// 地图接口
export const getMapData = (params) => {
  return request({
    url: '/map',
    method: 'GET',
    params
  })
}