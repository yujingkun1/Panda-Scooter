<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import PaginationBar from '@/components/PaginationBar.vue'
import {
  addDispatcher,
  deleteDispatcher,
  editDispatcher,
  getDispatcherList,
  getZoneList
} from '@/api'
import { useUiStore } from '@/stores/ui'
import { formatDateTime } from '@/utils/format'

const uiStore = useUiStore()

const UNASSIGNED_FILTER = '__UNASSIGNED__'
const FULL_FETCH_PAGE_SIZE = 200
const MAX_FETCH_PAGES = 200

const createDefaultFilters = () => ({
  keyword: '',
  areaId: '',
  page: 1,
  pageSize: 10
})

const createDefaultForm = () => ({
  id: '',
  name: '',
  email: '',
  password: '',
  areaId: ''
})

const filters = ref(createDefaultFilters())
const dispatchers = ref([])
const rawAllDispatchers = ref([])
const filteredDispatchers = ref([])
const areas = ref([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const editing = ref(false)
const form = ref(createDefaultForm())

const normalizePositiveId = (value) => {
  const num = Number(value)
  return Number.isFinite(num) && num > 0 ? num : null
}

const isAssignedAreaId = (value) => {
  return normalizePositiveId(value) !== null
}

const areaMap = computed(() => {
  return areas.value.reduce((result, item) => {
    const areaId = normalizePositiveId(item.id)
    if (areaId) {
      result[areaId] = item.name
    }
    return result
  }, {})
})

const totalDispatcherCount = computed(() => rawAllDispatchers.value.length)

const assignedDispatcherCount = computed(() => {
  return rawAllDispatchers.value.filter((item) => isAssignedAreaId(item.areaId)).length
})

const unassignedDispatcherCount = computed(() => {
  return Math.max(totalDispatcherCount.value - assignedDispatcherCount.value, 0)
})

const getAreaDisplayText = (item) => {
  const areaId = normalizePositiveId(item.areaId)

  if (!areaId) {
    return '未分配'
  }

  return areaMap.value[areaId] || `片区 ${areaId}`
}

const fetchAllItems = async (requester, listKey) => {
  let page = 1
  let apiTotal = null
  const merged = []

  while (page <= MAX_FETCH_PAGES) {
    const response = await requester({
      page,
      pageSize: FULL_FETCH_PAGE_SIZE
    })

    const data = response.data || {}
    const list = Array.isArray(data[listKey]) ? data[listKey] : []
    const totalFromApi = Number(data.total)

    if (Number.isFinite(totalFromApi) && totalFromApi >= 0) {
      apiTotal = totalFromApi
    }

    merged.push(...list)

    if (!list.length) {
      break
    }

    if (apiTotal !== null && merged.length >= apiTotal) {
      break
    }

    if (list.length < FULL_FETCH_PAGE_SIZE) {
      break
    }

    page += 1
  }

  return merged
}

const fetchAreas = async () => {
  try {
    areas.value = await fetchAllItems(getZoneList, 'areaList')
  } catch (error) {
    areas.value = []
  }
}

const fetchDispatchersData = async () => {
  try {
    rawAllDispatchers.value = await fetchAllItems(getDispatcherList, 'dispatcherList')
  } catch (error) {
    rawAllDispatchers.value = []
  }
}

const syncPagedDispatchers = () => {
  const pageSize = Number(filters.value.pageSize) > 0 ? Number(filters.value.pageSize) : 10
  const maxPage = Math.max(1, Math.ceil(filteredDispatchers.value.length / pageSize))
  const normalizedPage = Number(filters.value.page) > 0 ? Number(filters.value.page) : 1
  const currentPage = Math.min(normalizedPage, maxPage)

  if (currentPage !== normalizedPage) {
    filters.value.page = currentPage
    return
  }

  const start = (currentPage - 1) * pageSize
  dispatchers.value = filteredDispatchers.value.slice(start, start + pageSize)
  total.value = filteredDispatchers.value.length
}

const applyLocalFilters = () => {
  const keyword = filters.value.keyword.trim().toLowerCase()
  const selectedAreaId = filters.value.areaId

  let next = rawAllDispatchers.value.slice()

  if (keyword) {
    next = next.filter((item) => {
      const name = String(item.name || '').toLowerCase()
      const email = String(item.email || '').toLowerCase()
      return name.includes(keyword) || email.includes(keyword)
    })
  }

  if (selectedAreaId === UNASSIGNED_FILTER) {
    next = next.filter((item) => !isAssignedAreaId(item.areaId))
  } else if (selectedAreaId) {
    const areaId = normalizePositiveId(selectedAreaId)

    if (!areaId) {
      next = []
    } else {
      next = next.filter((item) => normalizePositiveId(item.areaId) === areaId)
    }
  }

  filteredDispatchers.value = next
  syncPagedDispatchers()
}

const fetchAllData = async () => {
  loading.value = true

  try {
    await Promise.all([fetchAreas(), fetchDispatchersData()])
    applyLocalFilters()
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editing.value = false
  form.value = createDefaultForm()
  modalOpen.value = true
}

const openEdit = (item) => {
  editing.value = true
  form.value = {
    id: item.id,
    name: item.name || '',
    email: item.email || '',
    password: '',
    areaId: isAssignedAreaId(item.areaId) ? String(normalizePositiveId(item.areaId)) : ''
  }
  modalOpen.value = true
}

const submit = async () => {
  if (!form.value.name.trim()) {
    uiStore.pushToast({
      message: '请输入调度员姓名',
      tone: 'warning'
    })
    return
  }

  if (!form.value.email.trim()) {
    uiStore.pushToast({
      message: '请输入调度员邮箱',
      tone: 'warning'
    })
    return
  }

  const password = form.value.password.trim()

  if (!editing.value && !password) {
    uiStore.pushToast({
      message: '请输入登录密码',
      tone: 'warning'
    })
    return
  }

  saving.value = true

  try {
    const normalizedAreaId = form.value.areaId ? Number(form.value.areaId) : null
    const payload = {
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      areaId: normalizedAreaId ?? undefined
    }

    if (password) {
      payload.password = password
    }

    if (editing.value) {
      await editDispatcher({
        ...payload,
        id: Number(form.value.id),
        areaId: normalizedAreaId
      })
    } else {
      await addDispatcher(payload)
    }

    uiStore.pushToast({
      message: editing.value ? '调度员已更新' : '调度员已新增',
      tone: 'success'
    })

    modalOpen.value = false
    await fetchAllData()
  } catch (error) {
  } finally {
    saving.value = false
  }
}

const removeItem = async (item) => {
  const confirmed = await uiStore.confirmAction({
    title: '删除调度员',
    message: `确认删除调度员“${item.name}”吗？`,
    confirmText: '删除',
    tone: 'danger'
  })

  if (!confirmed) {
    return
  }

  try {
    await deleteDispatcher({
      dispatcherId: item.id,
      name: item.name,
      email: item.email
    })

    uiStore.pushToast({
      message: '调度员已删除',
      tone: 'success'
    })

    await fetchAllData()
  } catch (error) {
  }
}

const applyFilters = () => {
  filters.value.page = 1
  applyLocalFilters()
}

watch(
  () => [filters.value.page, filters.value.pageSize],
  () => {
    syncPagedDispatchers()
  }
)

watch(
  () => [filters.value.keyword, filters.value.areaId],
  () => {
    if (filters.value.page !== 1) {
      filters.value.page = 1
      return
    }

    applyLocalFilters()
  }
)

onMounted(async () => {
  await fetchAllData()
})
</script>

<template>
  <div class="section-grid">
    <section class="metric-grid">
      <article class="card-surface stat-mini">
        <span>调度员数</span>
        <strong>{{ totalDispatcherCount }}</strong>
      </article>
      <article class="card-surface stat-mini">
        <span>已分配片区的调度员数</span>
        <strong>{{ assignedDispatcherCount }}</strong>
      </article>
      <article class="card-surface stat-mini">
        <span>未分配片区的调度员数</span>
        <strong>{{ unassignedDispatcherCount }}</strong>
      </article>
    </section>

    <section class="page-surface page-panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">调度员列表</h2>
        </div>
        <div class="button-row">
          <button type="button" class="button-primary" @click="openCreate">新增调度员</button>
        </div>
      </div>

      <div class="toolbar">
        <label class="form-field toolbar-grow">
          <span class="field-label">关键字</span>
          <input
            v-model.trim="filters.keyword"
            class="field-input"
            type="text"
            placeholder="搜索姓名或邮箱"
            @keydown.enter.prevent="applyFilters"
          />
        </label>

        <label class="form-field toolbar-grow">
          <span class="field-label">片区</span>
          <select v-model="filters.areaId" class="field-select">
            <option value="">全部片区</option>
            <option :value="UNASSIGNED_FILTER">未分配</option>
            <option v-for="item in areas" :key="item.id" :value="String(item.id)">{{ item.name }}</option>
          </select>
        </label>
      </div>

      <div class="responsive-table">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>姓名</th>
              <th>邮箱</th>
              <th>所属片区</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody v-if="dispatchers.length">
            <tr v-for="item in dispatchers" :key="item.id">
              <td>#{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.email || '--' }}</td>
              <td>{{ getAreaDisplayText(item) }}</td>
              <td>{{ formatDateTime(item.createTime) }}</td>
              <td>
                <div class="inline-actions">
                  <button type="button" class="button-secondary" @click="openEdit(item)">编辑</button>
                  <button type="button" class="button-danger" @click="removeItem(item)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!dispatchers.length && !loading" class="empty-state">暂无调度员数据。</div>
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

    <BaseModal
      v-model="modalOpen"
      :title="editing ? '编辑调度员' : '新增调度员'"
      width="760px"
    >
      <div class="form-grid">
        <label class="form-field span-6">
          <span class="field-label">姓名</span>
          <input v-model.trim="form.name" class="field-input" type="text" placeholder="请输入姓名" />
        </label>

        <label class="form-field span-6">
          <span class="field-label">邮箱</span>
          <input v-model.trim="form.email" class="field-input" type="email" placeholder="dispatcher@example.com" />
        </label>

        <label class="form-field span-6">
          <span class="field-label">登录密码{{ editing ? '（可留空）' : '' }}</span>
          <input
            v-model="form.password"
            class="field-input"
            type="password"
            :placeholder="editing ? '留空则不修改密码' : '请输入登录密码'"
          />
        </label>

        <label class="form-field span-6">
          <span class="field-label">所属片区</span>
          <select v-model="form.areaId" class="field-select">
            <option value="">暂不分配</option>
            <option v-for="item in areas" :key="item.id" :value="String(item.id)">{{ item.name }}</option>
          </select>
        </label>
      </div>

      <template #footer>
        <div class="button-row">
          <button type="button" class="button-secondary" @click="modalOpen = false">取消</button>
          <button type="button" class="button-primary" :disabled="saving" @click="submit">
            {{ saving ? '保存中...' : editing ? '保存修改' : '创建调度员' }}
          </button>
        </div>
      </template>
    </BaseModal>
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
