<template>
  <view class="page">
    <view class="header">
      <image class="avatar" src="/static/avatar.png" mode="aspectFit"></image>
      <view class="user-info">
        <text class="username">{{ userInfo.username }}</text>
        <text class="email">{{ userInfo.email }}</text>
      </view>
      <view class="account-manage" @click="accountManage">
        <text class="manage-text">账号管理</text>
      </view>
    </view>

    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-value">{{ userInfo.totalKilometer }}</text>
        <text class="stat-label">累计里程(km)</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ userInfo.totalTime }}</text>
        <text class="stat-label">骑行时长(h)</text>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-item" @click="navigateTo('wallet')">
        <text class="menu-text">我的钱包</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="navigateTo('history')">
        <text class="menu-text">历史行程</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="navigateTo('faults')">
        <text class="menu-text">故障上报记录</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInfo } from '@/api/index'

const DEFAULT_USER_INFO = {
  username: '游客用户',
  email: '未登录',
  totalKilometer: '0.00',
  totalTime: '0.00'
}

export default {
  data() {
    return {
      userInfo: { ...DEFAULT_USER_INFO }
    }
  },
  onShow() {
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo() {
      try {
        const res = await getUserInfo()
        const data = res.data || {}
        this.userInfo = {
          username: data.username || DEFAULT_USER_INFO.username,
          email: data.email || DEFAULT_USER_INFO.email,
          totalKilometer: this.formatNumber(data.totalKilometer),
          totalTime: this.formatNumber(data.totalTime)
        }
      } catch (error) {
        this.userInfo = { ...DEFAULT_USER_INFO }
      }
    },
    accountManage() {
      uni.navigateTo({
        url: '/pages/account/account'
      })
    },
    navigateTo(page) {
      uni.navigateTo({
        url: `/pages/${page}/${page}`
      })
    },
    formatNumber(value) {
      const number = Number(value || 0)
      return Number.isFinite(number) ? number.toFixed(2) : '0.00'
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

.header {
  display: flex;
  align-items: center;
  padding: 48rpx 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e2;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 0;
  margin-right: 32rpx;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 32rpx;
  font-weight: 400;
  color: #0b0e0d;
  margin-bottom: 12rpx;
  display: block;
  letter-spacing: 2rpx;
}

.email {
  font-size: 24rpx;
  color: #737373;
  display: block;
  font-weight: 300;
}

.account-manage {
  padding: 16rpx 32rpx;
  border: 1rpx solid #d4d4d1;
  border-radius: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.account-manage:hover {
  border-color: #0b0e0d;
  background-color: #0b0e0d;
}

.manage-text {
  font-size: 24rpx;
  color: #525252;
  font-weight: 300;
  letter-spacing: 2rpx;
}

.account-manage:hover .manage-text {
  color: #ffffff;
}

.stats-section {
  display: flex;
  margin: 32rpx;
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 300;
  color: #0b0e0d;
  margin-bottom: 16rpx;
  letter-spacing: 2rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #737373;
  font-weight: 300;
  letter-spacing: 2rpx;
}

.stat-divider {
  width: 1rpx;
  background-color: #e5e5e2;
  margin: 16rpx 0;
}

.menu-section {
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
  margin: 0 32rpx 32rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 40rpx 32rpx;
  border-bottom: 1rpx solid #e5e5e2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background-color: #fafaf8;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #0b0e0d;
  font-weight: 400;
  letter-spacing: 2rpx;
}

.menu-arrow {
  font-size: 32rpx;
  color: #d4d4d1;
  font-weight: 300;
}
</style>
