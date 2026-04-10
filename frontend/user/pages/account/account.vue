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
      <view class="action-item" @click="goToForgotPassword">
        <text class="action-text">修改密码</text>
        <text class="action-arrow">›</text>
      </view>
      <view class="action-item" @click="logout">
        <text class="action-text logout-text">退出登录</text>
      </view>
    </view>

    <view class="delete-section">
      <text class="section-title">注销账号</text>
      <text class="section-desc">根据接口文档，注销账号需要密码和邮箱验证码。</text>

      <view class="field">
        <text class="field-label">登录密码</text>
        <input
          v-model.trim="deleteForm.password"
          class="input"
          password
          type="text"
          placeholder="请输入当前密码"
        />
      </view>

      <view class="field">
        <text class="field-label">邮箱验证码</text>
        <view class="code-row">
          <input
            v-model.trim="deleteForm.verificationCode"
            class="input code-input"
            type="text"
            placeholder="请输入验证码"
          />
          <button class="code-btn" :disabled="countdown > 0 || isActionPending('sendDeleteCode')" @click="sendDeleteCode">
            {{ isActionPending('sendDeleteCode') ? '发送中...' : (countdown > 0 ? `${countdown}s` : '获取验证码') }}
          </button>
        </view>
      </view>

      <button class="delete-btn" :disabled="isActionPending('deleteAccount')" @click="deleteAccount">
        {{ isActionPending('deleteAccount') ? '注销中...' : '确认注销' }}
      </button>
    </view>
  </view>
</template>

<script>
import actionGuard from '@/mixins/actionGuard'
import {
  getUserInfo,
  getVerificationCode,
  userDelete,
  userLogout
} from '@/api/index'
import { showUnhandledError } from '@/utils/error'

const DEFAULT_USER_INFO = {
  username: '游客用户',
  email: '未登录'
}

const DEFAULT_DELETE_FORM = () => ({
  password: '',
  verificationCode: ''
})

export default {
  mixins: [actionGuard],
  data() {
    return {
      userInfo: { ...DEFAULT_USER_INFO },
      deleteForm: DEFAULT_DELETE_FORM(),
      countdown: 0,
      timer: null
    }
  },
  onShow() {
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.redirectTo({
        url: '/pages/login/login?mode=login'
      })
      return
    }
    this.loadUserInfo()
  },
  onUnload() {
    this.clearTimer()
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
        const cached = uni.getStorageSync('userInfo')
        this.userInfo = {
          username: cached.username || DEFAULT_USER_INFO.username,
          email: cached.email || DEFAULT_USER_INFO.email
        }
      }
    },
    goToForgotPassword() {
      uni.navigateTo({
        url: `/pages/login/login?mode=forgot-password&email=${encodeURIComponent(this.userInfo.email)}`
      })
    },
    async sendDeleteCode() {
      if (!this.userInfo.email || this.userInfo.email === DEFAULT_USER_INFO.email) {
        uni.showToast({
          title: '当前账号没有可用邮箱',
          icon: 'none'
        })
        return
      }

      await this.withAction('sendDeleteCode', async () => {
        try {
          await getVerificationCode(this.userInfo.email)
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          })
          this.startCountdown()
        } catch (error) {
          showUnhandledError(error, '验证码发送失败，请稍后重试')
        }
      })
    },
    startCountdown() {
      this.clearTimer()
      this.countdown = 60
      this.timer = setInterval(() => {
        if (this.countdown <= 1) {
          this.clearTimer()
          this.countdown = 0
          return
        }
        this.countdown -= 1
      }, 1000)
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    async logout() {
      await this.withAction('logout', () => new Promise((resolve) => {
        uni.showModal({
          title: '退出登录',
          content: '确定要退出当前账号吗？',
          success: async (res) => {
            if (!res.confirm) {
              resolve()
              return
            }

            try {
              await userLogout()
            } catch (error) {
              showUnhandledError(error, '退出登录请求失败，已为你清除本地登录状态')
            }

            uni.removeStorageSync('token')
            uni.removeStorageSync('currentRide')
            uni.removeStorageSync('userInfo')
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index'
              })
            }, 800)
            resolve()
          },
          fail: resolve
        })
      }))
    },
    async deleteAccount() {
      if (!this.deleteForm.password || !this.deleteForm.verificationCode) {
        uni.showToast({
          title: '请填写密码和验证码',
          icon: 'none'
        })
        return
      }

      await this.withAction('deleteAccount', () => new Promise((resolve) => {
        uni.showModal({
          title: '账号注销',
          content: '账号注销后将退出当前登录状态，确认继续吗？',
          confirmColor: '#ff4d4f',
          success: async (res) => {
            if (!res.confirm) {
              resolve()
              return
            }

            try {
              uni.showLoading({
                title: '注销中...'
              })
              await userDelete({
                password: this.deleteForm.password,
                verificationCode: this.deleteForm.verificationCode
              })
              uni.hideLoading()
              uni.removeStorageSync('token')
              uni.removeStorageSync('currentRide')
              uni.removeStorageSync('userInfo')
              uni.showToast({
                title: '账号已注销',
                icon: 'success'
              })
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/index/index'
                })
              }, 800)
            } catch (error) {
              uni.hideLoading()
              showUnhandledError(error, '注销失败，请稍后重试')
            }
            resolve()
          },
          fail: resolve
        })
      }))
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

.info-section,
.action-section,
.delete-section {
  margin: 32rpx;
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
}

.info-item,
.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 32rpx;
  border-bottom: 1rpx solid #e5e5e2;
}

.info-item:last-child,
.action-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 26rpx;
  color: #737373;
}

.info-value {
  font-size: 26rpx;
  color: #0b0e0d;
}

.action-text {
  flex: 1;
  font-size: 28rpx;
  color: #0b0e0d;
}

.logout-text {
  color: #a67c00;
  text-align: center;
}

.action-arrow {
  font-size: 32rpx;
  color: #d4d4d1;
}

.delete-section {
  padding: 40rpx 32rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  color: #0b0e0d;
  margin-bottom: 12rpx;
}

.section-desc {
  display: block;
  font-size: 22rpx;
  line-height: 1.7;
  color: #737373;
  margin-bottom: 28rpx;
}

.field {
  margin-bottom: 24rpx;
  width: 100%;
}

.field-label {
  display: block;
  margin-bottom: 12rpx;
  font-size: 24rpx;
  color: #0b0e0d;
}

.input {
  width: 100%;
  height: 88rpx;
  border: 1rpx solid #e5e5e2;
  background-color: #fafaf8;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.code-row {
  display: flex;
  align-items: stretch;
  gap: 16rpx;
  min-width: 0;
}

.code-input {
  flex: 1;
  min-width: 0;
}

.code-btn {
  width: 220rpx;
  height: 88rpx;
  flex-shrink: 0;
  border: 1rpx solid #d4d4d1;
  background-color: transparent;
  color: #0b0e0d;
  font-size: 24rpx;
}

.delete-btn {
  margin-top: 16rpx;
  background-color: #8b0000;
  color: #ffffff;
  border: none;
  border-radius: 0;
  font-size: 30rpx;
  letter-spacing: 4rpx;
}

.delete-btn[disabled] {
  background-color: #c6a3a3;
}
</style>
