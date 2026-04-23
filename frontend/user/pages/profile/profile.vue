<template>
  <view class="page">
    <view class="header">
      <image class="avatar" src="/static/avatar.png" mode="aspectFit"></image>
      <view class="user-info">
        <text class="username">{{ userInfo.username }}</text>
        <text class="email">{{ userInfo.email }}</text>
      </view>
      <view class="account-manage ui-pressable" hover-class="ui-pressable-hover" hover-stay-time="70" @click="openAccount">
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

    <view v-if="!hasToken" class="guest-card">
      <text class="guest-title">当前为游客模式</text>
      <text class="guest-desc">登录后可同步个人资料、账单和骑行记录。</text>
      <button class="login-btn" hover-class="button-hover" hover-start-time="0" hover-stay-time="90" @click="goLogin('login')">去登录</button>
    </view>

    <view class="menu-section">
      <view class="menu-item ui-pressable" hover-class="ui-pressable-hover" hover-stay-time="70" @click="navigateTo('wallet')">
        <text class="menu-text">我的钱包</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item ui-pressable" hover-class="ui-pressable-hover" hover-stay-time="70" @click="navigateTo('history')">
        <text class="menu-text">历史行程</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item ui-pressable" hover-class="ui-pressable-hover" hover-stay-time="70" @click="navigateTo('faults')">
        <text class="menu-text">故障上报记录</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInfo } from '@/api/index'
import { isUnauthorizedError } from '@/utils/auth'
import { showUnhandledError } from '@/utils/error'

const DEFAULT_USER_INFO = {
  username: '游客用户',
  email: '未登录',
  totalKilometer: '0.00',
  totalTime: '0.00'
}

export default {
  data() {
    return {
      hasToken: false,
      userInfo: { ...DEFAULT_USER_INFO }
    }
  },
  onShow() {
    this.hasToken = Boolean(uni.getStorageSync('token'))
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo() {
      if (!this.hasToken) {
        this.userInfo = { ...DEFAULT_USER_INFO }
        return
      }

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
        if (isUnauthorizedError(error)) {
          this.hasToken = false
          this.userInfo = { ...DEFAULT_USER_INFO }
          return
        }

        const cached = uni.getStorageSync('userInfo')
        this.userInfo = {
          username: cached.username || DEFAULT_USER_INFO.username,
          email: cached.email || DEFAULT_USER_INFO.email,
          totalKilometer: DEFAULT_USER_INFO.totalKilometer,
          totalTime: DEFAULT_USER_INFO.totalTime
        }
        showUnhandledError(error, '加载个人信息失败，已展示本地缓存')
      }
    },
    openAccount() {
      if (!this.hasToken) {
        this.goLogin('login')
        return
      }

      uni.navigateTo({
        url: '/pages/account/account'
      })
    },
    goLogin(mode) {
      uni.navigateTo({
        url: `/pages/login/login?mode=${mode}`
      })
    },
    navigateTo(page) {
      if (!this.hasToken) {
        this.goLogin('login')
        return
      }

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
  display: block;
  font-size: 32rpx;
  font-weight: 400;
  color: #0b0e0d;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}

.email {
  display: block;
  font-size: 24rpx;
  color: #737373;
  font-weight: 300;
}

.account-manage {
  padding: 16rpx 32rpx;
  border: 1rpx solid #d4d4d1;
}

.manage-text {
  font-size: 24rpx;
  color: #525252;
  font-weight: 300;
  letter-spacing: 2rpx;
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

.guest-card {
  margin: 0 32rpx 32rpx;
  padding: 40rpx 32rpx;
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
}

.guest-title {
  display: block;
  font-size: 30rpx;
  color: #0b0e0d;
  margin-bottom: 12rpx;
}

.guest-desc {
  display: block;
  font-size: 24rpx;
  line-height: 1.7;
  color: #737373;
  margin-bottom: 28rpx;
}

.login-btn {
  background-color: #0b0e0d;
  color: #ffffff;
  border: none;
  border-radius: 0;
  font-size: 28rpx;
  letter-spacing: 4rpx;
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
}

.menu-item:last-child {
  border-bottom: none;
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
}
</style>
