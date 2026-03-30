const baseURL = 'http://localhost:8080'

const request = (options) => {
  return new Promise((resolve, reject) => {
    // 合并基础配置
    const config = {
      baseURL,
      timeout: 10000,
      header: {
        'Content-Type': 'application/json'
      },
      ...options
    }

    // 添加 token
    const token = uni.getStorageSync('token')
    if (token) {
      config.header.Authorization = `Bearer ${token}`
    }

    // 发起请求
    uni.request({
      ...config,
      success: (res) => {
        // uni-app 的 statusCode 在 res.statusCode
        if (res.statusCode === 200) {
          const data = res.data
          if (data.code !== 0) {
            uni.showToast({
              title: data.msg || '请求失败',
              icon: 'none'
            })
            reject(new Error(data.msg || '请求失败'))
          } else {
            resolve(data)
          }
        } else {
          uni.showToast({
            title: `请求失败：${res.statusCode}`,
            icon: 'none'
          })
          reject(new Error(`HTTP Error: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export default request