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
          class="tab"
          :class="{ active: mode === item.mode }"
          @click="switchMode(item.mode)"
        >
          <text class="tab-text">{{ item.label }}</text>
        </view>
      </view>

      <view v-if="mode === 'signup'" class="field">
        <text class="label">Name</text>
        <input v-model.trim="form.name" class="input" type="text" placeholder="Enter real name" />
      </view>

      <view class="field">
        <text class="label">Email</text>
        <input v-model.trim="form.email" class="input" type="text" placeholder="Enter email" />
      </view>

      <view v-if="mode !== 'forgot-password'" class="field">
        <text class="label">Password</text>
        <input v-model.trim="form.password" class="input" password type="text" placeholder="Enter password" />
      </view>

      <view v-if="mode === 'forgot-password'" class="field">
        <text class="label">New Password</text>
        <input v-model.trim="form.newPassword" class="input" password type="text" placeholder="Enter new password" />
      </view>

      <view v-if="mode !== 'login'" class="field">
        <text class="label">Verification Code</text>
        <view class="inline-field">
          <input v-model.trim="form.verificationCode" class="input inline-input" type="text" placeholder="Enter code" />
          <button class="code-btn" :disabled="countdown > 0" @click="sendCode">
            {{ countdown > 0 ? `${countdown}s` : 'Get Code' }}
          </button>
        </view>
      </view>

      <button class="submit-btn" @click="submit">{{ submitText }}</button>

      <view class="footer-links">
        <text v-if="mode === 'login'" class="link" @click="switchMode('signup')">Create Account</text>
        <text v-if="mode === 'login'" class="divider">|</text>
        <text v-if="mode === 'login'" class="link" @click="switchMode('forgot-password')">Reset Password</text>
        <text v-if="mode !== 'login'" class="link" @click="switchMode('login')">Back to Login</text>
      </view>
    </view>
  </view>
</template>

<script>
import {
  dispatcherLogin,
  dispatcherPassword,
  dispatcherSignin,
  getVerificationCode
} from '@/api/index'

const MODE_META = {
  login: {
    title: 'Dispatcher Sign In',
    subtitle: 'Access the dispatch console',
    submitText: 'Sign In'
  },
  signup: {
    title: 'Create Dispatcher Account',
    subtitle: 'Register a new dispatcher identity',
    submitText: 'Register'
  },
  'forgot-password': {
    title: 'Reset Password',
    subtitle: 'Reset account password by email code',
    submitText: 'Confirm Reset'
  }
}

const DEFAULT_FORM = () => ({
  name: '',
  email: '',
  password: '',
  verificationCode: '',
  newPassword: ''
})

export default {
  data() {
    return {
      mode: 'login',
      form: DEFAULT_FORM(),
      countdown: 0,
      timer: null,
      tabs: [
        { mode: 'login', label: 'Login' },
        { mode: 'signup', label: 'Signup' },
        { mode: 'forgot-password', label: 'Reset' }
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
      this.form.email = options.email
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
    },
    async sendCode() {
      if (!this.form.email) {
        uni.showToast({
          title: 'Enter email first',
          icon: 'none'
        })
        return
      }

      try {
        await getVerificationCode(this.form.email)
        uni.showToast({
          title: 'Code sent',
          icon: 'success'
        })
        this.startCountdown()
      } catch (error) {
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
          title: 'Email is required',
          icon: 'none'
        })
        return
      }

      if (this.mode === 'login' && !this.form.password) {
        uni.showToast({
          title: 'Password is required',
          icon: 'none'
        })
        return
      }

      if (this.mode === 'signup' && (!this.form.name || !this.form.password || !this.form.verificationCode)) {
        uni.showToast({
          title: 'Complete the signup form',
          icon: 'none'
        })
        return
      }

      if (this.mode === 'forgot-password' && (!this.form.verificationCode || !this.form.newPassword)) {
        uni.showToast({
          title: 'Complete the reset form',
          icon: 'none'
        })
        return
      }

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
            title: 'Signed in',
            icon: 'success'
          })
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/profile/profile'
            })
          }, 800)
          return
        }

        if (this.mode === 'signup') {
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
          return
        }

        await dispatcherPassword({
          verificationCode: this.form.verificationCode,
          newPassword: this.form.newPassword
        })
        uni.hideLoading()
        uni.showToast({
          title: 'Password updated',
          icon: 'success'
        })
        const email = this.form.email
        this.switchMode('login')
        this.form.email = email
      } catch (error) {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style>
.page { min-height: 100vh; background: linear-gradient(180deg, #fafaf8 0%, #f0efe8 100%); padding: 48rpx 32rpx 64rpx; }
.hero { padding: 32rpx 16rpx 48rpx; text-align: center; }
.logo { width: 96rpx; height: 96rpx; margin-bottom: 24rpx; }
.title { display: block; font-size: 44rpx; color: #0b0e0d; font-weight: 500; letter-spacing: 4rpx; }
.subtitle { display: block; margin-top: 16rpx; font-size: 24rpx; color: #737373; }
.card { background-color: #ffffff; border: 1rpx solid #e5e5e2; padding: 40rpx 32rpx; }
.tabs { display: flex; margin-bottom: 32rpx; background: #fafaf8; border: 1rpx solid #e5e5e2; }
.tab { flex: 1; padding: 24rpx 0; text-align: center; }
.tab.active { background-color: #0b0e0d; }
.tab-text { font-size: 24rpx; color: #737373; }
.tab.active .tab-text { color: #ffffff; }
.field { margin-bottom: 28rpx; }
.label { display: block; margin-bottom: 16rpx; font-size: 24rpx; color: #0b0e0d; }
.input { width: 100%; height: 88rpx; border: 1rpx solid #e5e5e2; background-color: #fafaf8; padding: 0 24rpx; font-size: 28rpx; color: #0b0e0d; }
.inline-field { display: flex; gap: 16rpx; }
.inline-input { flex: 1; }
.code-btn { width: 220rpx; height: 88rpx; border: 1rpx solid #d4d4d1; background-color: transparent; color: #0b0e0d; font-size: 24rpx; }
.submit-btn { margin-top: 16rpx; background-color: #0b0e0d; color: #ffffff; border: none; border-radius: 0; font-size: 30rpx; letter-spacing: 4rpx; }
.footer-links { margin-top: 32rpx; text-align: center; }
.link, .divider { font-size: 24rpx; color: #737373; }
.link { padding: 0 12rpx; }
</style>
