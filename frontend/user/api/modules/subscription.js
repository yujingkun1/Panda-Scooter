import request from '../request'

// 套餐接口
export const getSubscriptions = () => {
  return request({
    url: '/subscription',
    method: 'GET'
  })
}