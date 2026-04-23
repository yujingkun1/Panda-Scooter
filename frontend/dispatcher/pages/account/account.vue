<template>
  <view class="page">
    <view class="header">
      <text class="title">Account</text>
    </view>

    <view class="info-section">
      <view class="info-item">
        <text class="info-label">Name</text>
        <text class="info-value">{{ userInfo.name }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">Email</text>
        <text class="info-value">{{ userInfo.email }}</text>
      </view>
    </view>

    <view class="action-section">
      <view class="action-item" @click="navigateToResetPassword">
        <text class="action-text">Change Password</text>
      </view>
      <view class="action-item" @click="logout">
        <text class="action-text logout-text">Log Out</text>
      </view>
    </view>

    <view class="delete-section">
      <text class="section-title">Delete Account</text>
      <text class="section-desc">Enter the current password and the email verification code before deleting this account.</text>

      <view class="field">
        <text class="field-label">Current Password</text>
        <input
          v-model.trim="deleteForm.password"
          class="input"
          password
          type="text"
          placeholder="Enter current password"
        />
      </view>

      <view class="field">
        <text class="field-label">Verification Code</text>
        <view class="code-row">
          <input
            v-model.trim="deleteForm.verificationCode"
            class="input code-input"
            type="text"
            placeholder="Enter verification code"
          />
          <button class="code-btn" :disabled="countdown > 0 || isSendingDeleteCode" @click="sendDeleteCode">
            {{ isSendingDeleteCode ? 'Sending...' : (countdown > 0 ? `${countdown}s` : 'Get Code') }}
          </button>
        </view>
      </view>

      <button class="delete-btn" :disabled="isDeleting" @click="deleteAccount">
        {{ isDeleting ? 'Deleting...' : 'Delete Account' }}
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

const DEFAULT_USER_INFO = {
  name: 'Guest Dispatcher',
  email: 'Not Logged In'
}

const DEFAULT_DELETE_FORM = () => ({
  password: '',
  verificationCode: ''
})

const clearDispatcherSession = () => {
  uni.removeStorageSync('dispatcherToken')
  uni.removeStorageSync('dispatcherUserInfo')
  uni.removeStorageSync('dispatcherCurrentTask')
}

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
      try {
        const res = await getDispatcherInfo()
        const data = res.data || {}
        this.userInfo = {
          name: data.name || DEFAULT_USER_INFO.name,
          email: data.email || DEFAULT_USER_INFO.email
        }
      } catch (error) {
        const cached = uni.getStorageSync('dispatcherUserInfo') || {}
        this.userInfo = {
          ...DEFAULT_USER_INFO,
          ...cached
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
      if (!this.userInfo.email || this.userInfo.email === DEFAULT_USER_INFO.email) {
        uni.showToast({
          title: 'No email available',
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
          title: 'Code sent',
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
    async logout() {
      uni.showModal({
        title: 'Log Out',
        content: 'Do you want to log out of this dispatcher account?',
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
            title: 'Logged out',
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
          title: 'Complete all fields',
          icon: 'none'
        })
        return
      }

      if (this.isDeleting) {
        return
      }

      uni.showModal({
        title: 'Delete Account',
        content: 'This will remove the account and sign you out. Continue?',
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (!res.confirm) {
            return
          }

          this.isDeleting = true
          try {
            uni.showLoading({
              title: 'Deleting...'
            })
            await dispatcherDelete({
              password: this.deleteForm.password,
              verificationCode: this.deleteForm.verificationCode
            })
            uni.hideLoading()
            clearDispatcherSession()
            uni.showToast({
              title: 'Account deleted',
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
.code-row { display: flex; gap: 16rpx; min-width: 0; }
.code-input { flex: 1; min-width: 0; }
.code-btn { width: 220rpx; height: 88rpx; border: 1rpx solid #d4d4d1; background-color: transparent; color: #0b0e0d; font-size: 24rpx; flex-shrink: 0; }
.code-btn[disabled] { color: #999999; border-color: #e5e5e2; }
.delete-btn { margin-top: 16rpx; background-color: #8b0000; color: #ffffff; border: none; border-radius: 0; font-size: 30rpx; letter-spacing: 4rpx; }
.delete-btn[disabled] { opacity: 0.7; }
</style>
