import request from '../request'

// 故障接口
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