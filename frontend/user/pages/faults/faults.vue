<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <text class="title">故障上报记录</text>
    </view>

    <!-- Filter Section -->
    <view class="filter-section">
      <view 
        class="filter-item" 
        :class="{ active: currentFilter === 'all' }"
        @click="changeFilter('all')"
      >
        <text class="filter-text">全部</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: currentFilter === 'pending' }"
        @click="changeFilter('pending')"
      >
        <text class="filter-text">处理中</text>
      </view>
      <view 
        class="filter-item" 
        :class="{ active: currentFilter === 'completed' }"
        @click="changeFilter('completed')"
      >
        <text class="filter-text">已完成</text>
      </view>
    </view>

    <!-- Fault List -->
    <view class="fault-list">
      <view v-if="filteredFaults.length > 0">
        <view v-for="(item, index) in filteredFaults" :key="index" class="fault-item">
          <view class="fault-header">
            <view class="scooter-info">
              <text class="scooter-icon">⚠️</text>
              <text class="scooter-code">编号 {{ item.scooterCode }}</text>
            </view>
            <view class="fault-status" :class="item.statusClass">
              <text class="status-text">{{ item.status }}</text>
            </view>
          </view>
          
          <view class="fault-body">
            <view class="info-row">
              <view class="info-label">上报时间</view>
              <view class="info-value">{{ item.reportTime }}</view>
            </view>
            
            <view class="info-row">
              <view class="info-label">故障原因</view>
              <view class="info-value fault-reason">{{ item.reason }}</view>
            </view>
            
            <view v-if="item.remark" class="info-row remark-row">
              <view class="info-label">处理备注</view>
              <view class="info-value remark">{{ item.remark }}</view>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="empty-faults">
        <text class="empty-text">暂无故障上报记录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getFaults } from '@/api/index'

export default {
  data() {
    return {
      faultsList: [],
      currentFilter: 'all',
      filters: {
        all: (item) => true,
        pending: (item) => item.status === '处理中',
        completed: (item) => item.status === '已完成'
      }
    }
  },
  computed: {
    filteredFaults() {
      if (this.currentFilter === 'all') {
        return this.faultsList
      }
      return this.faultsList.filter(this.filters[this.currentFilter])
    }
  },
  onLoad() {
    this.loadFaults()
  },
  methods: {
    async loadFaults() {
      try {
        const res = await getFaults()
        if (res.code === 0) {
          this.faultsList = res.data || []
        } else {
          this.loadMockFaults()
        }
      } catch (error) {
        console.error('加载故障记录失败:', error)
        // 使用模拟数据
        this.loadMockFaults()
      }
    },
    loadMockFaults() {
      // TODO: 调用真实 API 获取故障记录数据
      // 这里使用模拟数据
      this.faultsList = [
        {
          scooterCode: '8372',
          reportTime: '2024-01-15 14:30:25',
          reason: '刹车失灵，存在安全隐患',
          status: '已完成',
          statusClass: 'status-completed',
          remark: '已安排维修人员处理，车辆已回收'
        },
        {
          scooterCode: '5621',
          reportTime: '2024-01-14 10:20:15',
          reason: '电量显示异常，实际电量与显示不符',
          status: '处理中',
          statusClass: 'status-pending',
          remark: ''
        },
        {
          scooterCode: '9234',
          reportTime: '2024-01-13 16:45:30',
          reason: '车胎漏气，无法正常骑行',
          status: '已完成',
          statusClass: 'status-completed',
          remark: '轮胎已更换，车辆可正常使用'
        },
        {
          scooterCode: '7156',
          reportTime: '2024-01-12 09:15:00',
          reason: '无法开锁，扫码后无响应',
          status: '已完成',
          statusClass: 'status-completed',
          remark: '锁具模块故障，已修复'
        },
        {
          scooterCode: '3489',
          reportTime: '2024-01-10 18:30:45',
          reason: '脚踏板损坏，骑行困难',
          status: '处理中',
          statusClass: 'status-pending',
          remark: ''
        },
        {
          scooterCode: '6712',
          reportTime: '2024-01-08 13:20:10',
          reason: '车灯不亮，夜间骑行不安全',
          status: '已完成',
          statusClass: 'status-completed',
          remark: '车灯线路已检修，恢复正常'
        }
      ]
    },
    changeFilter(filter) {
      this.currentFilter = filter
    }
  }
}
</script>

<style>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fafaf8;
}

/* Header */
.header {
  padding: 48rpx 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e2;
}

.title {
  font-size: 36rpx;
  font-weight: 400;
  color: #0b0e0d;
  letter-spacing: 4rpx;
}

/* Filter Section */
.filter-section {
  display: flex;
  margin: 32rpx;
  background-color: #ffffff;
  border-radius: 0;
  padding: 20rpx;
  box-shadow: none;
  border: 1rpx solid #e5e5e2;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  border-radius: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.filter-item.active {
  background-color: #0b0e0d;
  color: #ffffff;
}

.filter-text {
  font-size: 24rpx;
  color: #737373;
  font-weight: 300;
  letter-spacing: 2rpx;
}

.filter-item.active .filter-text {
  color: #ffffff;
}

/* Fault List */
.fault-list {
  flex: 1;
  margin: 0 32rpx 32rpx;
}

.fault-item {
  background-color: #ffffff;
  border-radius: 0;
  margin-bottom: 20rpx;
  box-shadow: none;
  border: 1rpx solid #e5e5e2;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fault-item:hover {
  transform: translateY(-2rpx);
  border-color: #d4d4d1;
}

.fault-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #e5e5e2;
}

.scooter-info {
  display: flex;
  align-items: center;
}

.scooter-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  font-style: normal;
}

.scooter-code {
  font-size: 28rpx;
  font-weight: 400;
  color: #0b0e0d;
  letter-spacing: 2rpx;
}

.fault-status {
  padding: 10rpx 24rpx;
  border-radius: 0;
  font-size: 22rpx;
  font-weight: 300;
  border: 1rpx solid transparent;
  letter-spacing: 2rpx;
}

.status-pending {
  background-color: transparent;
  color: #a67c00;
  border-color: #d4d4d1;
}

.status-completed {
  background-color: transparent;
  color: #0b0e0d;
  border-color: #0b0e0d;
}

.fault-body {
  padding: 32rpx;
}

.info-row {
  margin-bottom: 28rpx;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 22rpx;
  color: #737373;
  display: block;
  margin-bottom: 12rpx;
  font-weight: 300;
  letter-spacing: 2rpx;
}

.info-value {
  font-size: 28rpx;
  color: #0b0e0d;
  line-height: 1.6;
  font-weight: 400;
  letter-spacing: 2rpx;
}

.fault-reason {
  font-weight: 400;
}

.remark-row {
  padding-top: 24rpx;
  border-top: 1rpx dashed #e5e5e2;
}

.remark {
  color: #737373;
  font-size: 24rpx;
  font-weight: 300;
}

.empty-faults {
  padding: 128rpx 32rpx;
  text-align: center;
}

.empty-text {
  font-size: 24rpx;
  color: #737373;
  font-weight: 300;
  letter-spacing: 2rpx;
}
</style>