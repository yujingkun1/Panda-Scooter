import request from '../request'

const IMAGE_MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp'
}

const DATA_URL_PATTERN = /^data:/i

const getImageMimeType = (filePath = '') => {
  const normalizedPath = String(filePath).split('?')[0].toLowerCase()
  const matchedSuffix = Object.keys(IMAGE_MIME_TYPES).find((suffix) => normalizedPath.endsWith(suffix))
  return matchedSuffix ? IMAGE_MIME_TYPES[matchedSuffix] : 'image/jpeg'
}

const readImageAsBase64 = (filePath) => {
  if (!filePath) {
    return Promise.resolve('')
  }

  if (DATA_URL_PATTERN.test(filePath)) {
    return Promise.resolve(filePath)
  }

  const fileSystemManager =
    typeof uni !== 'undefined' && typeof uni.getFileSystemManager === 'function'
      ? uni.getFileSystemManager()
      : null

  if (!fileSystemManager || typeof fileSystemManager.readFile !== 'function') {
    return Promise.resolve(filePath)
  }

  return new Promise((resolve, reject) => {
    fileSystemManager.readFile({
      filePath,
      encoding: 'base64',
      success: (res) => {
        resolve(`data:${getImageMimeType(filePath)};base64,${res.data || ''}`)
      },
      fail: reject
    })
  })
}

export const getFaults = () => {
  return request({
    url: '/faults',
    method: 'GET'
  })
}

export const reportFault = async (data = {}) => {
  const image = await readImageAsBase64(data.image)

  return request({
    url: '/fault',
    method: 'POST',
    data: {
      ...data,
      image
    }
  })
}
