<template>
  <view class="page">
    <view class="header">
      <image class="avatar" src="/static/avatar.png" mode="aspectFit"></image>
      <view class="user-info">
        <text class="username">{{ userInfo.name }}</text>
        <text class="email">{{ userInfo.email }}</text>
      </view>
      <view class="account-manage" @click="openAccount">
        <text class="manage-text">账号管理</text>
      </view>
    </view>

    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-value">{{ userInfo.areaName }}</text>
        <text class="stat-label">负责辖区</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ userInfo.todayDispatchedNum }}</text>
        <text class="stat-label">今日调度数量</text>
      </view>
    </view>

    <view v-if="!hasToken" class="guest-card">
      <text class="guest-title">当前为访客模式</text>
      <text class="guest-desc">登录后可查看收入、调度任务和调度历史。</text>
      <button class="login-btn" @click="goLogin('login')">去登录</button>
    </view>

    <view class="menu-section">
      <view class="menu-item" @click="showComingSoon('我的收入')">
        <text class="menu-text">我的收入</text>
      </view>
      <view class="menu-item" @click="showComingSoon('调度任务')">
        <text class="menu-text">调度任务</text>
      </view>
      <view class="menu-item" @click="navigateTo('history')">
        <text class="menu-text">调度历史</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getDispatcherInfo } from '@/api/index'

const DEFAULT_USER_INFO = {
  name: '访客调度员',
  email: '未登录',
  areaName: '未分配辖区',
  todayDispatchedNum: '0'
}

export default {
  data() {
    return {
      hasToken: false,
      userInfo: { ...DEFAULT_USER_INFO }
    }
  },
  onShow() {
    this.hasToken = Boolean(uni.getStorageSync('dispatcherToken'))
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo() {
      if (!this.hasToken) {
        this.userInfo = { ...DEFAULT_USER_INFO }
        return
      }

      try {
        const res = await getDispatcherInfo()
        const data = res.data || {}
        this.userInfo = {
          name: data.name || DEFAULT_USER_INFO.name,
          email: data.email || DEFAULT_USER_INFO.email,
          areaName: data.areaName || DEFAULT_USER_INFO.areaName,
          todayDispatchedNum: String(data.todayDispatchedNum || '0')
        }
        uni.setStorageSync('dispatcherUserInfo', this.userInfo)
      } catch (error) {
        const cached = uni.getStorageSync('dispatcherUserInfo') || {}
        this.userInfo = {
          ...DEFAULT_USER_INFO,
          ...cached
        }
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
    showComingSoon(title) {
      if (!this.hasToken) {
        this.goLogin('login')
        return
      }

      uni.showToast({
        title: `${title}接口开发中`,
        icon: 'none'
      })
    }
  }
}
</script>

<style>
.page { display: flex; flex-direction: column; min-height: 100vh; background-color: #fafaf8; }
.header { display: flex; align-items: center; padding: 48rpx 32rpx; background-color: #ffffff; border-bottom: 1rpx solid #e5e5e2; }
.avatar { width: 100rpx; height: 100rpx; margin-right: 32rpx; }
.user-info { flex: 1; }
.username { display: block; font-size: 32rpx; color: #0b0e0d; margin-bottom: 12rpx; letter-spacing: 2rpx; }
.email { display: block; font-size: 24rpx; color: #737373; }
.account-manage { padding: 16rpx 32rpx; border: 1rpx solid #d4d4d1; }
.manage-text { font-size: 24rpx; color: #525252; letter-spacing: 2rpx; }
.stats-section { display: flex; margin: 32rpx; background-color: #ffffff; border: 1rpx solid #e5e5e2; }
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 48rpx 0; }
.stat-value { font-size: 34rpx; color: #0b0e0d; margin-bottom: 16rpx; text-align: center; padding: 0 24rpx; }
.stat-label { font-size: 22rpx; color: #737373; letter-spacing: 2rpx; }
.stat-divider { width: 1rpx; background-color: #e5e5e2; margin: 16rpx 0; }
.guest-card { margin: 0 32rpx 32rpx; padding: 40rpx 32rpx; background-color: #ffffff; border: 1rpx solid #e5e5e2; }
.guest-title { display: block; font-size: 30rpx; color: #0b0e0d; margin-bottom: 12rpx; }
.guest-desc { display: block; font-size: 24rpx; line-height: 1.7; color: #737373; margin-bottom: 28rpx; }
.login-btn { background-color: #0b0e0d; color: #ffffff; border: none; border-radius: 0; font-size: 28rpx; letter-spacing: 4rpx; }
.menu-section { background-color: #ffffff; border: 1rpx solid #e5e5e2; margin: 0 32rpx 32rpx; }
.menu-item { display: flex; align-items: center; padding: 40rpx 32rpx; border-bottom: 1rpx solid #e5e5e2; }
.menu-item:last-child { border-bottom: none; }
.menu-text { flex: 1; font-size: 28rpx; color: #0b0e0d; letter-spacing: 2rpx; }
</style>
