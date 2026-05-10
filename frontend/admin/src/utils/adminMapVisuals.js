export const MAP_LAYER_ZONE = 'zone'
export const MAP_LAYER_NO_PARKING = 'noParkingZone'
export const MAP_LAYER_PARKING_POINT = 'parkingPoint'
export const MAP_LAYER_SCOOTER = 'scooter'

export const ALL_MAP_LAYERS = [
  MAP_LAYER_ZONE,
  MAP_LAYER_NO_PARKING,
  MAP_LAYER_PARKING_POINT,
  MAP_LAYER_SCOOTER
]

export const MAP_ICON_PATHS = {
  scooter: '/map-icons/scooter.svg',
  parkingPoint: '/map-icons/parking.svg',
  parkingPointActive: '/map-icons/parking-active.svg',
  noParkingZone: '/map-icons/no-parking.svg'
}

export const MAP_ICON_SIZE = {
  scooter: {
    width: 30,
    height: 30,
    activeWidth: 36,
    activeHeight: 36
  },
  parkingPoint: {
    width: 24,
    height: 24,
    activeWidth: 30,
    activeHeight: 30
  },
  noParkingZone: {
    width: 24,
    height: 24,
    activeWidth: 30,
    activeHeight: 30
  }
}

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const buildImageTag = (src, width, height, alt) => {
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="display:block;width:${width}px;height:${height}px;" />`
}

export const buildIconMarkerContent = ({ src, width, height, badgeColor = '' }) => {
  const badge = badgeColor
    ? `<span style="position:absolute;top:0;right:0;width:10px;height:10px;border-radius:999px;background:${escapeHtml(
        badgeColor
      )};border:2px solid #ffffff;box-sizing:border-box;"></span>`
    : ''

  return `<div style="position:relative;width:${width}px;height:${height}px;">${buildImageTag(
    src,
    width,
    height,
    'icon'
  )}${badge}</div>`
}

export const isLayerVisible = (visibleTypes, type) => {
  if (!Array.isArray(visibleTypes)) {
    return true
  }

  if (visibleTypes.length === 0) {
    return false
  }

  return visibleTypes.includes(type)
}
