<template>
  <view class="page">
    <view class="hero">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title">{{ pageTitle }}</text>
      <text class="subtitle">{{ pageSubtitle }}</text>
    </view>

    <view class="card">
      <view class="tabs">
        <view
          v-for="item in tabs"
          :key="item.mode"
          class="tab ui-pressable"
          :class="{ active: mode === item.mode }"
          hover-class="ui-pressable-hover"
          hover-stay-time="70"
          @click="switchMode(item.mode)"
        >
          <text class="tab-text">{{ item.label }}</text>
        </view>
      </view>

      <view v-if="mode === 'signup'" class="field">
        <text class="label">Name</text>
        <input
          v-model.trim="form.name"
          class="input"
          type="text"
          placeholder="Enter your real name"
        />
      </view>

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
        <text class="label">Password</text>
        <input
          v-model.trim="form.password"
          class="input"
          password
          type="text"
          placeholder="Enter your password"
        />
      </view>

      <view v-if="mode === 'signup'" class="field">
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

      <button
        class="submit-btn"
        hover-class="button-hover"
        hover-start-time="0"
        hover-stay-time="90"
        :disabled="isSubmitting"
        @click="submit"
      >
        {{ isSubmitting ? 'Submitting...' : submitText }}
      </button>

      <view class="footer-links">
        <view
          v-if="mode === 'login'"
          class="link-button ui-pressable-inline"
          hover-class="ui-pressable-inline-hover"
          hover-stay-time="70"
          @click="switchMode('signup')"
        >
          <text class="link">Create Account</text>
        </view>
        <view
          v-if="mode === 'login'"
          class="link-button ui-pressable-inline"
          hover-class="ui-pressable-inline-hover"
          hover-stay-time="70"
          @click="goResetPassword"
        >
          <text class="link">Forgot Password</text>
        </view>
        <view
          v-if="mode !== 'login'"
          class="link-button ui-pressable-inline"
          hover-class="ui-pressable-inline-hover"
          hover-stay-time="70"
          @click="switchMode('login')"
        >
          <text class="link">Back To Login</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  dispatcherLogin,
  dispatcherSignin,
  getVerificationCode
} from '@/api/index'

const MODE_META = {
  login: {
    title: 'Dispatcher Login',
    subtitle: 'Sign in to manage scooter dispatch tasks',
    submitText: 'Sign In'
  },
  signup: {
    title: 'Create Dispatcher Account',
    subtitle: 'Register a new dispatcher account with email verification',
    submitText: 'Register'
  }
}

const DEFAULT_FORM = () => ({
  name: '',
  email: '',
  password: '',
  verificationCode: ''
})

export default {
  data() {
    return {
      mode: 'login',
      form: DEFAULT_FORM(),
      countdown: 0,
      timer: null,
      isSendingCode: false,
      isSubmitting: false,
      tabs: [
        { mode: 'login', label: 'Login' },
        { mode: 'signup', label: 'Sign Up' }
      ]
    }
  },
  computed: {
    pageTitle() {
      return MODE_META[this.mode].title
    },
    pageSubtitle() {
      return MODE_META[this.mode].subtitle
    },
    submitText() {
      return MODE_META[this.mode].submitText
    }
  },
  onLoad(options) {
    if (options && MODE_META[options.mode]) {
      this.mode = options.mode
    }
    if (options && options.email) {
      this.form.email = decodeURIComponent(options.email)
    }
  },
  onUnload() {
    this.clearTimer()
  },
  methods: {
    switchMode(nextMode) {
      this.mode = nextMode
      this.form = {
        ...DEFAULT_FORM(),
        email: this.form.email
      }
      this.clearTimer()
      this.countdown = 0
      this.isSendingCode = false
      this.isSubmitting = false
    },
    goResetPassword() {
      const email = encodeURIComponent(this.form.email || '')
      uni.navigateTo({
        url: `/pages/resetPassword/resetPassword${email ? `?email=${email}` : ''}`
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

      if (!this.form.password) {
        uni.showToast({
          title: 'Enter password',
          icon: 'none'
        })
        return
      }

      if (this.mode === 'signup' && (!this.form.name || !this.form.verificationCode)) {
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

        if (this.mode === 'login') {
          const res = await dispatcherLogin({
            email: this.form.email,
            password: this.form.password
          })
          const data = res.data || {}
          if (data.token) {
            uni.setStorageSync('dispatcherToken', data.token)
          }
          uni.setStorageSync('dispatcherUserInfo', {
            id: data.id || '',
            name: data.name || 'Dispatcher',
            email: data.email || this.form.email
          })
          uni.hideLoading()
          uni.showToast({
            title: 'Login success',
            icon: 'success'
          })
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }, 800)
          return
        }

        const email = this.form.email
        await dispatcherSignin({
          name: this.form.name,
          email: this.form.email,
          password: this.form.password,
          verificationCode: this.form.verificationCode
        })
        uni.hideLoading()
        uni.showToast({
          title: 'Registered',
          icon: 'success'
        })
        this.switchMode('login')
        this.form.email = email
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

.tabs {
  display: flex;
  margin-bottom: 32rpx;
  background: #fafaf8;
  border: 1rpx solid #e5e5e2;
}

.tab {
  flex: 1;
  padding: 24rpx 0;
  text-align: center;
}

.tab.active {
  background-color: #0b0e0d;
}

.tab-text {
  font-size: 24rpx;
  color: #737373;
}

.tab.active .tab-text {
  color: #ffffff;
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
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16rpx;
}

.link-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.link {
  font-size: 24rpx;
  color: #737373;
  padding: 0 12rpx;
}
</style>
