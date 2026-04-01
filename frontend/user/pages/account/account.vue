<template>
  <view class="page">
    <view class="header">
      <text class="title">账号管理</text>
    </view>

    <view class="info-section">
      <view class="info-item">
        <text class="info-label">用户名</text>
        <text class="info-value">{{ userInfo.username }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">邮箱</text>
        <text class="info-value">{{ userInfo.email }}</text>
      </view>
    </view>

    <view class="action-section">
      <view class="action-item" @click="changePassword">
        <text class="action-text">修改密码</text>
        <text class="action-arrow">›</text>
      </view>
      <view class="action-item" @click="logout">
        <text class="action-text logout-text">退出登录</text>
      </view>
      <view class="action-item" @click="deleteAccount">
        <text class="action-text delete-text">账号注销</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInfo, userDelete, userLogout } from '@/api/index'

const DEFAULT_USER_INFO = {
  username: '游客用户',
  email: '未登录'
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
          email: data.email || DEFAULT_USER_INFO.email
        }
      } catch (error) {
        this.userInfo = { ...DEFAULT_USER_INFO }
      }
    },
    changePassword() {
      uni.showModal({
        title: '修改密码',
        content: '当前版本暂未提供独立修改密码页面。',
        showCancel: false
      })
    },
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出当前账号吗？',
        success: async (res) => {
          if (!res.confirm) {
            return
          }

          try {
            await userLogout()
            uni.removeStorageSync('token')
            uni.removeStorageSync('currentRide')
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index'
              })
            }, 1200)
          } catch (error) {
          }
        }
      })
    },
    deleteAccount() {
      uni.showModal({
        title: '账号注销',
        content: '开发阶段会调用 mock 注销接口，确定继续吗？',
        confirmText: '确认注销',
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (!res.confirm) {
            return
          }

          try {
            uni.showLoading({
              title: '注销中...'
            })
            await userDelete({
              password: '',
              verificationCode: ''
            })
            uni.hideLoading()
            uni.removeStorageSync('token')
            uni.removeStorageSync('currentRide')
            uni.showToast({
              title: '账号已注销',
              icon: 'success'
            })
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index'
              })
            }, 1200)
          } catch (error) {
            uni.hideLoading()
          }
        }
      })
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

.info-section {
  margin: 32rpx;
  background-color: #ffffff;
  border-radius: 0;
  box-shadow: none;
  border: 1rpx solid #e5e5e2;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 32rpx;
  border-bottom: 1rpx solid #e5e5e2;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 26rpx;
  color: #737373;
  font-weight: 300;
  letter-spacing: 2rpx;
}

.info-value {
  font-size: 26rpx;
  color: #0b0e0d;
  font-weight: 400;
  letter-spacing: 2rpx;
}

.action-section {
  margin: 32rpx;
  background-color: #ffffff;
  border-radius: 0;
  box-shadow: none;
  border: 1rpx solid #e5e5e2;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 32rpx;
  border-bottom: 1rpx solid #e5e5e2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.action-item:last-child {
  border-bottom: none;
}

.action-item:hover {
  background-color: #fafaf8;
}

.action-text {
  font-size: 28rpx;
  color: #0b0e0d;
  font-weight: 400;
  flex: 1;
  letter-spacing: 2rpx;
}

.logout-text {
  color: #a67c00;
  text-align: center;
}

.delete-text {
  color: #8b0000;
  text-align: center;
}

.action-arrow {
  font-size: 32rpx;
  color: #d4d4d1;
  font-weight: 300;
}
</style>
