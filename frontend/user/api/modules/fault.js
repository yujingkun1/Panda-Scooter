import request from '../request'

const JSON_PART_CONTENT_TYPE = 'application/json'
const IMAGE_CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp'
}

const normalizeFaultData = (data = {}) => ({
  scooterId: data.scooterId,
  description: data.description || ''
})

const showRequestError = (message) => {
  if (typeof uni.hideLoading === 'function') {
    uni.hideLoading()
  }

  setTimeout(() => {
    uni.showToast({
      title: message,
      icon: 'none'
    })
  }, 50)
}

const createHandledError = (message, extra = {}) => {
  const error = new Error(message)
  Object.assign(error, { handled: true }, extra)
  return error
}

const createMultipartBoundary = () => {
  return `----PandaScooterBoundary${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
}

const encodeUtf8 = (value = '') => {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value)
  }

  const encoded = unescape(encodeURIComponent(value))
  const bytes = new Uint8Array(encoded.length)

  for (let index = 0; index < encoded.length; index += 1) {
    bytes[index] = encoded.charCodeAt(index)
  }

  return bytes
}

const toUint8Array = (value) => {
  if (value instanceof Uint8Array) {
    return value
  }

  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value)
  }

  return encodeUtf8(String(value || ''))
}

const mergeBuffers = (chunks = []) => {
  const normalizedChunks = chunks.map((chunk) => toUint8Array(chunk))
  const totalLength = normalizedChunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
  const merged = new Uint8Array(totalLength)
  let offset = 0

  normalizedChunks.forEach((chunk) => {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  })

  return merged.buffer
}

const buildJsonPartBuffer = (name, value, boundary) => {
  return mergeBuffers([
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="${name}"\r\n`,
    `Content-Type: ${JSON_PART_CONTENT_TYPE}\r\n`,
    '\r\n',
    JSON.stringify(value),
    '\r\n'
  ])
}

const resolveFileName = (filePath = '') => {
  const sanitizedPath = String(filePath).split('?')[0]
  const segments = sanitizedPath.split(/[\\/]/)
  return segments[segments.length - 1] || `fault-image-${Date.now()}.jpg`
}

const resolveImageContentType = (filePath = '') => {
  const normalizedPath = String(filePath).toLowerCase().split('?')[0]
  const extensionIndex = normalizedPath.lastIndexOf('.')
  if (extensionIndex < 0) {
    return 'application/octet-stream'
  }

  const extension = normalizedPath.slice(extensionIndex)
  return IMAGE_CONTENT_TYPES[extension] || 'application/octet-stream'
}

const buildFilePartBuffer = (name, filePath, fileBuffer, boundary) => {
  return mergeBuffers([
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="${name}"; filename="${resolveFileName(filePath)}"\r\n`,
    `Content-Type: ${resolveImageContentType(filePath)}\r\n`,
    '\r\n',
    fileBuffer,
    '\r\n'
  ])
}

const readFileByFileSystemManager = (filePath) => {
  if (typeof uni.getFileSystemManager !== 'function') {
    return null
  }

  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath,
      success: (res) => {
        resolve(res.data)
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

const readFileByFetch = async (filePath) => {
  if (typeof fetch !== 'function') {
    return null
  }

  const response = await fetch(filePath)
  if (!response.ok) {
    throw new Error(`read-file-failed:${response.status}`)
  }

  return response.arrayBuffer()
}

const readLocalFileAsArrayBuffer = async (filePath) => {
  if (!filePath) {
    return null
  }

  try {
    const fileBuffer = await readFileByFileSystemManager(filePath)
    if (fileBuffer) {
      return fileBuffer
    }
  } catch (error) {
  }

  try {
    const fileBuffer = await readFileByFetch(filePath)
    if (fileBuffer) {
      return fileBuffer
    }
  } catch (error) {
  }

  const message = '无法读取图片文件'
  showRequestError(message)
  throw createHandledError(message)
}

const buildMultipartBody = async (data = {}, boundary) => {
  // The backend binds scooterId/description via @RequestPart, so each text part must be JSON.
  const payload = normalizeFaultData(data)
  const chunks = Object.keys(payload)
    .filter((key) => payload[key] !== undefined && payload[key] !== null)
    .map((key) => buildJsonPartBuffer(key, payload[key], boundary))

  if (data.image) {
    const fileBuffer = await readLocalFileAsArrayBuffer(data.image)
    chunks.push(buildFilePartBuffer('image', data.image, fileBuffer, boundary))
  }

  chunks.push(`--${boundary}--\r\n`)
  return mergeBuffers(chunks)
}

const uploadFault = async (data = {}) => {
  const boundary = createMultipartBoundary()
  const requestBody = await buildMultipartBody(data, boundary)

  return request({
    url: '/fault',
    method: 'POST',
    header: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    data: requestBody
  })
}

export const getFaults = () => {
  return request({
    url: '/faults',
    method: 'GET'
  })
}

export const reportFault = (data = {}) => {
  return uploadFault(data)
}
