<template>
  <view class="page">
    <view class="header">
      <text class="title">账号管理</text>
    </view>

    <view class="info-section">
      <view class="info-item">
        <text class="info-label">姓名</text>
        <text class="info-value">{{ userInfo.name || '--' }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">邮箱</text>
        <text class="info-value">{{ userInfo.email || '未登录' }}</text>
      </view>
    </view>

    <view class="action-section">
      <view class="action-item" @click="navigateToResetPassword">
        <text class="action-text">修改密码</text>
      </view>
      <view class="action-item" @click="logout">
        <text class="action-text logout-text">退出登录</text>
      </view>
    </view>

    <view class="delete-section">
      <text class="section-title">注销账号</text>
      <text class="section-desc">注销前请先输入当前密码和邮箱验证码。</text>

      <view class="field">
        <text class="field-label">当前密码</text>
        <view class="password-field">
          <input
            v-model.trim="deleteForm.password"
            class="input password-input"
            :password="!deleteForm.showPassword"
            type="text"
            placeholder="请输入当前密码"
          />
          <view
            class="password-toggle ui-pressable"
            hover-class="ui-pressable-hover"
            hover-stay-time="70"
            @click="togglePasswordVisibility"
          >
            <image
              class="password-toggle-icon"
              :src="deleteForm.showPassword ? '/static/eye-open.svg' : '/static/eye-closed.svg'"
              mode="aspectFit"
            ></image>
          </view>
        </view>
      </view>

      <view class="field">
        <text class="field-label">验证码</text>
        <view class="code-row">
          <input
            v-model.trim="deleteForm.verificationCode"
            class="input code-input"
            type="text"
            placeholder="请输入验证码"
          />
          <button class="code-btn" :disabled="countdown > 0 || isSendingDeleteCode" @click="sendDeleteCode">
            {{ isSendingDeleteCode ? '发送中...' : (countdown > 0 ? `${countdown}s` : '获取验证码') }}
          </button>
        </view>
      </view>

      <button class="delete-btn" :disabled="isDeleting" @click="deleteAccount">
        {{ isDeleting ? '注销中...' : '确认注销' }}
      </button>
    </view>
  </view>
</template>

<script>
import {
  dispatcherDelete,
  dispatcherLogout,
  getDispatcherInfo,
  getVerificationCode
} from '@/api/index'
import { clearDispatcherSession, isUnauthorizedError } from '@/utils/auth'
import { normalizeDispatcherUserInfo } from '@/utils/dispatcherUser'

const DEFAULT_USER_INFO = {
  name: '',
  email: ''
}

const DEFAULT_DELETE_FORM = () => ({
  password: '',
  verificationCode: '',
  showPassword: false
})

export default {
  data() {
    return {
      userInfo: { ...DEFAULT_USER_INFO },
      deleteForm: DEFAULT_DELETE_FORM(),
      countdown: 0,
      timer: null,
      isSendingDeleteCode: false,
      isDeleting: false
    }
  },
  onShow() {
    const token = uni.getStorageSync('dispatcherToken')
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
      const cached = uni.getStorageSync('dispatcherUserInfo') || {}
      try {
        const res = await getDispatcherInfo()
        const data = res.data || {}
        this.userInfo = {
          ...DEFAULT_USER_INFO,
          ...normalizeDispatcherUserInfo(data, cached)
        }
        uni.setStorageSync('dispatcherUserInfo', this.userInfo)
      } catch (error) {
        this.userInfo = { ...DEFAULT_USER_INFO }

        if (isUnauthorizedError(error)) {
          uni.redirectTo({
            url: '/pages/login/login?mode=login'
          })
          return
        }

        this.userInfo = {
          ...DEFAULT_USER_INFO,
          ...normalizeDispatcherUserInfo(cached)
        }
      }
    },
    navigateToResetPassword() {
      const email = encodeURIComponent(this.userInfo.email || '')
      uni.navigateTo({
        url: `/pages/resetPassword/resetPassword${email ? `?email=${email}` : ''}`
      })
    },
    async sendDeleteCode() {
      if (!this.userInfo.email) {
        uni.showToast({
          title: '当前账号暂无可用邮箱',
          icon: 'none'
        })
        return
      }

      if (this.isSendingDeleteCode) {
        return
      }

      this.isSendingDeleteCode = true
      try {
        await getVerificationCode(this.userInfo.email)
        uni.showToast({
          title: '验证码已发送',
          icon: 'success'
        })
        this.startCountdown()
      } catch (error) {
      } finally {
        this.isSendingDeleteCode = false
      }
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
    togglePasswordVisibility() {
      this.deleteForm.showPassword = !this.deleteForm.showPassword
    },
    async logout() {
      uni.showModal({
        title: '退出登录',
        content: '确认退出当前调度员账号吗？',
        success: async (res) => {
          if (!res.confirm) {
            return
          }

          try {
            await dispatcherLogout()
          } catch (error) {
          }

          clearDispatcherSession()
          uni.showToast({
            title: '已退出登录',
            icon: 'success'
          })
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/login?mode=login'
            })
          }, 800)
        }
      })
    },
    async deleteAccount() {
      if (!this.deleteForm.password || !this.deleteForm.verificationCode) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }

      if (this.isDeleting) {
        return
      }

      uni.showModal({
        title: '注销账号',
        content: '注销后将删除当前账号并退出登录，确认继续吗？',
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (!res.confirm) {
            return
          }

          this.isDeleting = true
          try {
            uni.showLoading({
              title: '注销中...'
            })
            await dispatcherDelete({
              password: this.deleteForm.password,
              verificationCode: this.deleteForm.verificationCode
            })
            uni.hideLoading()
            clearDispatcherSession()
            uni.showToast({
              title: '账号已注销',
              icon: 'success'
            })
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/login/login?mode=login'
              })
            }, 800)
          } catch (error) {
            uni.hideLoading()
          } finally {
            this.isDeleting = false
          }
        }
      })
    }
  }
}
</script>

<style>
.page { display: flex; flex-direction: column; min-height: 100vh; background-color: #fafaf8; }
.header { padding: 48rpx 32rpx; background-color: #ffffff; border-bottom: 1rpx solid #e5e5e2; }
.title { font-size: 36rpx; color: #0b0e0d; letter-spacing: 4rpx; }
.info-section, .action-section, .delete-section { margin: 32rpx; background-color: #ffffff; border: 1rpx solid #e5e5e2; }
.info-item, .action-item { display: flex; justify-content: space-between; align-items: center; padding: 40rpx 32rpx; border-bottom: 1rpx solid #e5e5e2; }
.info-item:last-child, .action-item:last-child { border-bottom: none; }
.info-label { font-size: 26rpx; color: #737373; }
.info-value { font-size: 26rpx; color: #0b0e0d; }
.action-text { flex: 1; font-size: 28rpx; color: #0b0e0d; text-align: center; }
.logout-text { color: #a67c00; }
.delete-section { padding: 40rpx 32rpx; }
.section-title { display: block; font-size: 30rpx; color: #0b0e0d; margin-bottom: 12rpx; }
.section-desc { display: block; font-size: 22rpx; line-height: 1.7; color: #737373; margin-bottom: 28rpx; }
.field { margin-bottom: 24rpx; }
.field-label { display: block; margin-bottom: 12rpx; font-size: 24rpx; color: #0b0e0d; }
.input { width: 100%; height: 88rpx; border: 1rpx solid #e5e5e2; background-color: #fafaf8; padding: 0 24rpx; font-size: 28rpx; box-sizing: border-box; }
.password-field { display: flex; align-items: center; gap: 16rpx; }
.password-input { flex: 1; min-width: 0; }
.password-toggle { flex-shrink: 0; width: 88rpx; height: 88rpx; border-radius: 18rpx; border: 1rpx solid #d9d9d4; background-color: #f7f7f2; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
.password-toggle-icon { width: 30rpx; height: 30rpx; }
.code-row { display: flex; gap: 16rpx; min-width: 0; }
.code-input { flex: 1; min-width: 0; }
.code-btn { width: 220rpx; height: 88rpx; border: 1rpx solid #d4d4d1; background-color: transparent; color: #0b0e0d; font-size: 24rpx; flex-shrink: 0; }
.code-btn[disabled] { color: #999999; border-color: #e5e5e2; }
.delete-btn { margin-top: 16rpx; background-color: #8b0000; color: #ffffff; border: none; border-radius: 0; font-size: 30rpx; letter-spacing: 4rpx; }
.delete-btn[disabled] { opacity: 0.7; }
</style>
