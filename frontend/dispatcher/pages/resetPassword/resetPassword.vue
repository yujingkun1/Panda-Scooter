<template>
  <view class="page">
    <view class="hero">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title">Reset Password</text>
      <text class="subtitle">Verify your email and set a new dispatcher password</text>
    </view>

    <view class="card">
      <view class="field">
        <text class="label">Email</text>
        <input
          v-model.trim="form.email"
          class="input"
          type="text"
          placeholder="Enter your email"
        />
      </view>

      <view class="field">
        <text class="label">Verification Code</text>
        <view class="inline-field">
          <input
            v-model.trim="form.verificationCode"
            class="input inline-input"
            type="text"
            placeholder="Enter the code"
          />
          <button
            class="code-btn"
            hover-class="button-hover"
            hover-start-time="0"
            hover-stay-time="90"
            :disabled="countdown > 0 || isSendingCode"
            @click="sendCode"
          >
            {{ isSendingCode ? 'Sending...' : (countdown > 0 ? `${countdown}s` : 'Get Code') }}
          </button>
        </view>
      </view>

      <view class="field">
        <text class="label">New Password</text>
        <input
          v-model.trim="form.newPassword"
          class="input"
          password
          type="text"
          placeholder="Enter a new password"
        />
      </view>

      <button
        class="submit-btn"
        hover-class="button-hover"
        hover-start-time="0"
        hover-stay-time="90"
        :disabled="isSubmitting"
        @click="submit"
      >
        {{ isSubmitting ? 'Submitting...' : 'Reset Password' }}
      </button>

      <view class="footer-links">
        <view
          class="link-button ui-pressable-inline"
          hover-class="ui-pressable-inline-hover"
          hover-stay-time="70"
          @click="goLogin"
        >
          <text class="link">Back To Login</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { dispatcherPassword, getVerificationCode } from '@/api/index'

const DEFAULT_FORM = () => ({
  email: '',
  verificationCode: '',
  newPassword: ''
})

const clearDispatcherSession = () => {
  uni.removeStorageSync('dispatcherToken')
  uni.removeStorageSync('dispatcherUserInfo')
  uni.removeStorageSync('dispatcherCurrentTask')
}

export default {
  data() {
    return {
      form: DEFAULT_FORM(),
      countdown: 0,
      timer: null,
      isSendingCode: false,
      isSubmitting: false
    }
  },
  onLoad(options) {
    this.resetPageState()

    if (options && options.email) {
      this.form.email = decodeURIComponent(options.email)
    }
  },
  onUnload() {
    this.clearTimer()
  },
  methods: {
    resetPageState() {
      this.form = DEFAULT_FORM()
      this.clearTimer()
      this.countdown = 0
      this.isSendingCode = false
      this.isSubmitting = false
    },
    goLogin() {
      uni.reLaunch({
        url: '/pages/login/login?mode=login'
      })
    },
    async sendCode() {
      if (!this.form.email) {
        uni.showToast({
          title: 'Enter email first',
          icon: 'none'
        })
        return
      }

      if (this.isSendingCode) {
        return
      }

      this.isSendingCode = true
      try {
        await getVerificationCode(this.form.email)
        uni.showToast({
          title: 'Code sent',
          icon: 'success'
        })
        this.startCountdown()
      } catch (error) {
      } finally {
        this.isSendingCode = false
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
    async submit() {
      if (!this.form.email) {
        uni.showToast({
          title: 'Enter email',
          icon: 'none'
        })
        return
      }

      if (!this.form.verificationCode || !this.form.newPassword) {
        uni.showToast({
          title: 'Complete all fields',
          icon: 'none'
        })
        return
      }

      if (this.isSubmitting) {
        return
      }

      this.isSubmitting = true

      try {
        uni.showLoading({
          title: 'Submitting...'
        })
        await dispatcherPassword({
          verificationCode: this.form.verificationCode,
          newPassword: this.form.newPassword
        })
        uni.hideLoading()
        clearDispatcherSession()
        uni.showToast({
          title: 'Password reset',
          icon: 'success'
        })
        setTimeout(() => {
          this.goLogin()
        }, 800)
      } catch (error) {
        uni.hideLoading()
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fafaf8 0%, #f0efe8 100%);
  padding: 48rpx 32rpx 64rpx;
}

.hero {
  padding: 32rpx 16rpx 48rpx;
  text-align: center;
}

.logo {
  width: 96rpx;
  height: 96rpx;
  margin-bottom: 24rpx;
}

.title {
  display: block;
  font-size: 44rpx;
  color: #0b0e0d;
  font-weight: 500;
  letter-spacing: 4rpx;
}

.subtitle {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #737373;
}

.card {
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
  padding: 40rpx 32rpx;
}

.field {
  margin-bottom: 28rpx;
  width: 100%;
}

.label {
  display: block;
  margin-bottom: 16rpx;
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
  color: #0b0e0d;
  box-sizing: border-box;
}

.inline-field {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 0;
}

.inline-input {
  flex: 1;
  min-width: 0;
}

.code-btn {
  width: 220rpx;
  height: 88rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 88rpx;
  text-align: center;
  border: 1rpx solid #d4d4d1;
  background-color: transparent;
  color: #0b0e0d;
  font-size: 24rpx;
}

.code-btn::after {
  border: none;
}

.code-btn[disabled] {
  color: #999999;
  border-color: #e5e5e2;
}

.submit-btn {
  margin-top: 16rpx;
  background-color: #0b0e0d;
  color: #ffffff;
  border: none;
  border-radius: 0;
  font-size: 30rpx;
  font-weight: 400;
  letter-spacing: 4rpx;
}

.submit-btn[disabled] {
  background-color: #d4d4d1;
}

.footer-links {
  margin-top: 32rpx;
  text-align: center;
}

.link-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.link {
  font-size: 24rpx;
  color: #737373;
}
</style>
