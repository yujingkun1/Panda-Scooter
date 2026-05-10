<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PaginationBar from '@/components/PaginationBar.vue'
import { deleteParkingPoint, getParkingPointList } from '@/api'
import { useUiStore } from '@/stores/ui'
import { formatBinaryStatus, formatDateTime } from '@/utils/format'
import { setEditorCache } from '@/utils/editorCache'

const router = useRouter()
const uiStore = useUiStore()
const CACHE_SCOPE = 'parking-point'

const filters = ref({
  keyword: '',
  page: 1,
  pageSize: 10
})

const points = ref([])
const total = ref(0)
const loading = ref(false)

const enabledCount = computed(() => points.value.filter((item) => Number(item.status) === 1).length)
const disabledCount = computed(() => points.value.filter((item) => Number(item.status) === 0).length)

const formatPointText = (item) => {
  const longitude = Number(item.longtitude ?? item.longitude)
  const latitude = Number(item.latitude)

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return '--'
  }

  return `${longitude.toFixed(6)}, ${latitude.toFixed(6)}`
}

const fetchPoints = async () => {
  loading.value = true

  try {
    const response = await getParkingPointList({
      page: filters.value.page,
      pageSize: filters.value.pageSize,
      keyword: filters.value.keyword || undefined
    })

    const data = response.data || {}
    const list = Array.isArray(data.areaList) ? data.areaList : []

    points.value = list
    total.value = Number(data.total ?? list.length)
  } catch (error) {
    points.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const openEdit = (item) => {
  setEditorCache(CACHE_SCOPE, item)
  router.push({ name: 'parking-point-edit', params: { id: item.id } })
}

const removeItem = async (item) => {
  const confirmed = await uiStore.confirmAction({
    title: '删除停车点',
    message: `确认删除停车点“${item.name}”吗？`,
    confirmText: '删除',
    tone: 'danger'
  })

  if (!confirmed) {
    return
  }

  try {
    await deleteParkingPoint({
      ParkingPointId: item.id,
      name: item.name
    })

    uiStore.pushToast({
      message: '停车点已删除',
      tone: 'success'
    })

    await fetchPoints()
  } catch (error) {
  }
}

const applyFilters = async () => {
  filters.value.page = 1
  await fetchPoints()
}

watch(
  () => [filters.value.page, filters.value.pageSize],
  () => {
    fetchPoints()
  }
)

watch(
  () => [filters.value.keyword],
  () => {
    if (filters.value.page !== 1) {
      filters.value.page = 1
      return
    }

    fetchPoints()
  }
)
onMounted(fetchPoints)
</script>

<template>
  <div class="section-grid">
    <section class="metric-grid">
<!--      <article class="card-surface stat-mini">-->
<!--        <span>当前页停车点数</span>-->
<!--        <strong>{{ points.length }}</strong>-->
<!--      </article>-->
      <article class="card-surface stat-mini">
        <span>总停车点数</span>
        <strong>{{ total }}</strong>
      </article>
      <article class="card-surface stat-mini">
        <span>启用停车点</span>
        <strong>{{ enabledCount }}</strong>
      </article>
      <article class="card-surface stat-mini">
        <span>停用停车点</span>
        <strong>{{ disabledCount }}</strong>
      </article>
    </section>

    <section class="page-surface page-panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">停车点列表</h2>
        </div>
        <div class="button-row">
          <button type="button" class="button-primary" @click="router.push({ name: 'parking-point-create' })">
            新增停车点
          </button>
        </div>
      </div>

      <div class="toolbar">
        <label class="form-field toolbar-grow">
          <span class="field-label">关键字</span>
          <input
            v-model.trim="filters.keyword"
            class="field-input"
            type="text"
            placeholder="搜索停车点名称"
            @keydown.enter.prevent="applyFilters"
          />
        </label>
        </div>

      <div class="responsive-table">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>坐标</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody v-if="points.length">
            <tr v-for="item in points" :key="item.id">
              <td>#{{ item.id }}</td>
              <td>{{ item.name || '--' }}</td>
              <td>{{ formatPointText(item) }}</td>
              <td>
                <span class="status-pill" :class="formatBinaryStatus(item.status).tone">
                  {{ formatBinaryStatus(item.status).text }}
                </span>
              </td>
              <td>{{ formatDateTime(item.create_time || item.createTime) }}</td>
              <td>
                <div class="inline-actions">
                  <button type="button" class="button-secondary" @click="openEdit(item)">编辑</button>
                  <button type="button" class="button-danger" @click="removeItem(item)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!points.length && !loading" class="empty-state">暂无停车点数据。</div>
      </div>

      <PaginationBar
        :page="filters.page"
        :page-size="filters.pageSize"
        :total="total"
        :loading="loading"
        @update:page="filters.page = $event"
        @update:page-size="
          filters.pageSize = $event;
          filters.page = 1;
        "
      />
    </section>
  </div>
</template>

<style scoped>
.page-panel {
  padding: 28px;
}

.stat-mini {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
}

.stat-mini span {
  color: #737373;
  font-size: 13px;
  letter-spacing: 0.08em;
}

.stat-mini strong {
  font-size: 32px;
  font-weight: 400;
}

@media (max-width: 720px) {
  .page-panel {
    padding: 20px;
  }
}
</style>
