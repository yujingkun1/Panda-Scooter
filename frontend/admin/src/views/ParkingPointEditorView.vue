<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MapLayerToggleBar from '@/components/MapLayerToggleBar.vue'
import PointMapPicker from '@/components/PointMapPicker.vue'
import { addParkingPoint, editParkingPoint, getParkingPointList } from '@/api'
import {
  ALL_MAP_LAYERS,
  MAP_LAYER_NO_PARKING,
  MAP_LAYER_PARKING_POINT,
  MAP_LAYER_SCOOTER,
  MAP_LAYER_ZONE
} from '@/utils/adminMapVisuals'
import { useUiStore } from '@/stores/ui'
import { getEditorCache, removeEditorCache } from '@/utils/editorCache'
import { fetchAdminMapLayers } from '@/utils/adminMapLayers'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

const CACHE_SCOPE = 'parking-point'
const pointId = computed(() => Number(route.params.id))
const editing = computed(() => route.name === 'parking-point-edit')
const saving = ref(false)
const loading = ref(false)
const points = ref([])
const zones = ref([])
const noParkingZones = ref([])
const scooters = ref([])
const allParkingPoints = ref([])
const visibleTypes = ref([MAP_LAYER_PARKING_POINT])
const form = ref({
  id: '',
  name: '',
  latitude: '',
  longtitude: '',
  status: 1,
  createTime: ''
})

const pageTitle = computed(() => (editing.value ? '编辑停车点' : '新增停车点'))

const resolveLongitude = (item = {}) => item.longtitude ?? item.longitude ?? ''

const pointModel = computed({
  get() {
    return {
      latitude: form.value.latitude,
      longtitude: resolveLongitude(form.value)
    }
  },
  set(value) {
    form.value.latitude = value?.latitude ?? ''
    form.value.longtitude = resolveLongitude(value)
  }
})

const coordinateText = computed(() => {
  const longitude = Number(resolveLongitude(form.value))
  const latitude = Number(form.value.latitude)

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return '--'
  }

  return `${longitude.toFixed(6)}, ${latitude.toFixed(6)}`
})

const parkingPointsForMap = computed(() => {
  if (!editing.value) {
    return allParkingPoints.value
  }

  return allParkingPoints.value.filter((item) => String(item.id) !== String(form.value.id || ''))
})

const applyRecord = (item) => {
  form.value = {
    id: item.id,
    name: item.name || '',
    latitude: item.latitude ?? '',
    longtitude: resolveLongitude(item),
    status: Number(item.status ?? 1),
    createTime: item.create_time || item.createTime || ''
  }
}

const fetchPoints = async () => {
  try {
    const response = await getParkingPointList({
      page: 1,
      pageSize: 500
    })
    points.value = response.data?.areaList || []
  } catch (error) {
    points.value = []
  }
}

const fetchMapLayers = async () => {
  try {
    const layers = await fetchAdminMapLayers({
      force: true
    })
    zones.value = layers.zones || []
    noParkingZones.value = layers.noParkingZones || []
    scooters.value = layers.scooters || []
    allParkingPoints.value = layers.parkingPoints || []
  } catch (error) {
    zones.value = []
    noParkingZones.value = []
    scooters.value = []
    allParkingPoints.value = []
  }
}

const hydrateEditData = () => {
  if (!editing.value || !Number.isFinite(pointId.value)) {
    return true
  }

  const cachedItem = getEditorCache(CACHE_SCOPE, pointId.value)
  if (cachedItem) {
    applyRecord(cachedItem)
    return true
  }

  const listItem = points.value.find((item) => Number(item.id) === pointId.value)
  if (listItem) {
    applyRecord(listItem)
    return true
  }

  return false
}

const goBack = () => {
  router.push({ name: 'parking-points' })
}

const submit = async () => {
  if (!form.value.name.trim()) {
    uiStore.pushToast({
      message: '请输入停车点名称',
      tone: 'warning'
    })
    return
  }

  const latitude = Number(form.value.latitude)
  const longtitude = Number(form.value.longtitude)

  if (!Number.isFinite(latitude) || !Number.isFinite(longtitude)) {
    uiStore.pushToast({
      message: '请先在地图上选择有效停车点位置',
      tone: 'warning'
    })
    return
  }

  saving.value = true

  try {
    const payload = {
      name: form.value.name.trim(),
      latitude,
      longtitude,
      status: Number(form.value.status ?? 1)
    }

    if (editing.value) {
      await editParkingPoint({
        ...payload,
        id: Number(form.value.id || pointId.value),
        createTime: form.value.createTime || undefined
      })
      removeEditorCache(CACHE_SCOPE, pointId.value)
    } else {
      await addParkingPoint(payload)
    }

    uiStore.pushToast({
      message: editing.value ? '停车点已更新' : '停车点已创建',
      tone: 'success'
    })

    router.push({ name: 'parking-points' })
  } catch (error) {
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true
  visibleTypes.value = ALL_MAP_LAYERS.filter((item) => item === MAP_LAYER_PARKING_POINT)
  await Promise.all([fetchPoints(), fetchMapLayers()])

  if (!hydrateEditData()) {
    uiStore.pushToast({
      message: '未获取到停车点数据，请从列表重新进入',
      tone: 'warning'
    })
    router.replace({ name: 'parking-points' })
  }

  loading.value = false
})
</script>

<template>
  <div class="section-grid">
    <section class="page-surface editor-page">
      <div class="editor-header">
        <div>
          <h2 class="panel-title">{{ pageTitle }}</h2>
          <p class="panel-description">停车点选点地图已叠加片区、禁停区、车辆和停车点，方便参考布局。</p>
        </div>
        <div class="button-row">
          <button type="button" class="button-secondary" @click="goBack">返回列表</button>
          <button type="button" class="button-primary" :disabled="saving || loading" @click="submit">
            {{ saving ? '保存中...' : editing ? '保存停车点' : '创建停车点' }}
          </button>
        </div>
      </div>

      <div class="editor-grid">
        <aside class="page-surface editor-panel">
          <div class="form-grid">
            <label class="form-field span-12">
              <span class="field-label">名称</span>
              <input v-model.trim="form.name" class="field-input" type="text" placeholder="例如：地铁口停车点" />
            </label>

            <label class="form-field span-12">
              <span class="field-label">状态</span>
              <select v-model="form.status" class="field-select">
                <option :value="1">启用</option>
                <option :value="0">停用</option>
              </select>
            </label>
          </div>

          <div class="summary-grid">
            <div class="summary-item">
              <span>当前坐标</span>
              <strong>{{ coordinateText }}</strong>
            </div>
          </div>
        </aside>

        <section class="page-surface map-panel">
          <PointMapPicker
            v-model="pointModel"
            :zones="zones"
            :no-parking-zones="noParkingZones"
            :scooters="scooters"
            :parking-points="parkingPointsForMap"
            :active-parking-point-id="form.id"
            :visible-types="visibleTypes"
            :readonly="false"
            :height="560"
          />

          <MapLayerToggleBar v-model="visibleTypes" :self-layer="MAP_LAYER_PARKING_POINT" />
        </section>
      </div>
    </section>
  </div>
</template>

<style scoped>
.editor-page,
.editor-panel,
.map-panel {
  padding: 24px;
}

.editor-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.editor-grid {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.summary-grid {
  display: grid;
  gap: 12px;
  margin-top: 20px;
}

.summary-item {
  border: 1px solid var(--line-soft);
  background: var(--bg-subtle);
  padding: 16px 18px;
}

.summary-item span {
  display: block;
  color: var(--text-subtle);
  font-size: 13px;
  letter-spacing: 0.08em;
}

.summary-item strong {
  display: block;
  margin-top: 8px;
  font-size: 18px;
  font-weight: 400;
}

.map-panel {
  display: grid;
  gap: 12px;
}

@media (max-width: 1080px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .editor-page,
  .editor-panel,
  .map-panel {
    padding: 20px;
  }

  .editor-header {
    flex-direction: column;
  }
}
</style>
