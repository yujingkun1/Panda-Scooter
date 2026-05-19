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
        <text class="label">姓名</text>
        <input
          v-model.trim="form.name"
          class="input"
          type="text"
          placeholder="请输入真实姓名"
        />
      </view>

      <view class="field">
        <text class="label">邮箱</text>
        <input
          v-model.trim="form.email"
          class="input"
          type="text"
          placeholder="请输入邮箱"
        />
      </view>

      <view class="field">
        <text class="label">密码</text>
        <view class="password-field">
          <input
            v-model.trim="form.password"
            class="input password-input"
            :password="!form.showPassword"
            type="text"
            placeholder="请输入密码"
          />
          <view
            class="password-toggle ui-pressable"
            hover-class="ui-pressable-hover"
            hover-stay-time="70"
            @click="togglePasswordVisibility"
          >
            <image
              class="password-toggle-icon"
              :src="form.showPassword ? '/static/eye-open.svg' : '/static/eye-closed.svg'"
              mode="aspectFit"
            ></image>
          </view>
        </view>
        <text
          v-if="mode === 'signup'"
          class="field-tip"
          :class="{ ok: isStrongPassword(form.password) }"
        >
          {{ getPasswordStatusText(form.password) }}
        </text>
      </view>

      <view v-if="mode === 'signup'" class="field">
        <text class="label">验证码</text>
        <view class="inline-field">
          <input
            v-model.trim="form.verificationCode"
            class="input inline-input"
            type="text"
            placeholder="请输入验证码"
          />
          <button
            class="code-btn"
            hover-class="button-hover"
            hover-start-time="0"
            hover-stay-time="90"
            :disabled="countdown > 0 || isSendingCode"
            @click="sendCode"
          >
            {{ isSendingCode ? '发送中...' : (countdown > 0 ? `${countdown}s` : '获取验证码') }}
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
        {{ isSubmitting ? '提交中...' : submitText }}
      </button>

      <view v-if="mode === 'signup'" class="agreement-row">
        <checkbox-group class="agreement-check" @change="togglePrivacyAgreement">
          <checkbox :checked="form.agreedPrivacy" value="privacy"></checkbox>
        </checkbox-group>
        <text class="agreement-text">我已阅读并同意</text>
        <text class="agreement-link" @click="openPrivacyPolicy">《隐私政策》</text>
      </view>

      <view class="footer-links">
        <view
          v-if="mode === 'login'"
          class="link-button ui-pressable-inline"
          hover-class="ui-pressable-inline-hover"
          hover-stay-time="70"
          @click="switchMode('signup')"
        >
          <text class="link">注册账号</text>
        </view>
        <view
          v-if="mode === 'login'"
          class="link-button ui-pressable-inline"
          hover-class="ui-pressable-inline-hover"
          hover-stay-time="70"
          @click="goResetPassword"
        >
          <text class="link">忘记密码</text>
        </view>
        <view
          v-if="mode !== 'login'"
          class="link-button ui-pressable-inline"
          hover-class="ui-pressable-inline-hover"
          hover-stay-time="70"
          @click="switchMode('login')"
        >
          <text class="link">返回登录</text>
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
import { normalizeDispatcherUserInfo } from '@/utils/dispatcherUser'

const MODE_META = {
  login: {
    title: '调度员登录',
    subtitle: '登录后可使用调度功能',
    submitText: '登录'
  },
  signup: {
    title: '注册调度员账号',
    subtitle: '使用邮箱验证码完成调度员注册',
    submitText: '注册'
  }
}

const DEFAULT_FORM = () => ({
  name: '',
  email: '',
  password: '',
  verificationCode: '',
  agreedPrivacy: false,
  showPassword: false
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
        { mode: 'login', label: '登录' },
        { mode: 'signup', label: '注册' }
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
    togglePasswordVisibility() {
      this.form.showPassword = !this.form.showPassword
    },
    openPrivacyPolicy() {
      uni.navigateTo({
        url: '/pages/privacy/privacy'
      })
    },
    togglePrivacyAgreement(event) {
      this.form.agreedPrivacy = Boolean(event && event.detail && Array.isArray(event.detail.value) && event.detail.value.length)
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
          title: '请先输入邮箱',
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
          title: '验证码已发送',
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
          title: '请输入邮箱',
          icon: 'none'
        })
        return
      }

      if (!this.form.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        })
        return
      }

      if (this.mode === 'signup' && (!this.form.name || !this.form.verificationCode)) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }

      if (this.mode === 'signup' && !this.isStrongPassword(this.form.password)) {
        uni.showToast({
          title: '密码至少 6 位，且必须包含字母和数字',
          icon: 'none'
        })
        return
      }

      if (this.mode === 'signup' && !this.form.agreedPrivacy) {
        uni.showToast({
          title: '请先勾选同意隐私政策',
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
          title: '提交中...'
        })

        if (this.mode === 'login') {
          const res = await dispatcherLogin({
            email: this.form.email,
            password: this.form.password
          })
          const data = res.data || {}
          const dispatcherUserInfo = normalizeDispatcherUserInfo(data, {
            email: this.form.email
          })
          if (data.token) {
            uni.setStorageSync('dispatcherToken', data.token)
          }
          uni.setStorageSync('dispatcherUserInfo', dispatcherUserInfo)
          uni.hideLoading()
          uni.showToast({
            title: '登录成功',
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
          title: '注册成功',
          icon: 'success'
        })
        this.switchMode('login')
        this.form.email = email
      } catch (error) {
        uni.hideLoading()
      } finally {
        this.isSubmitting = false
      }
    },
    isStrongPassword(password) {
      const value = String(password || '').trim()
      return value.length >= 6 && /[A-Za-z]/.test(value) && /\d/.test(value)
    },
    getPasswordStatusText(password) {
      return this.isStrongPassword(password)
        ? '密码格式已通过'
        : '密码至少 6 位，且必须同时包含字母和数字'
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

.password-field {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.password-input {
  flex: 1;
  min-width: 0;
}

.password-toggle {
  flex-shrink: 0;
  width: 88rpx;
  height: 88rpx;
  border-radius: 18rpx;
  border: 1rpx solid #d9d9d4;
  background-color: #f7f7f2;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.password-toggle-icon {
  width: 30rpx;
  height: 30rpx;
}

.field-tip {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #737373;
  line-height: 1.5;
}

.field-tip.ok {
  color: #1f8a57;
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

.agreement-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 24rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: #737373;
}

.agreement-check {
  display: flex;
  align-items: center;
}

.agreement-text {
  color: #737373;
}

.agreement-link {
  color: #0b0e0d;
  text-decoration: underline;
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
