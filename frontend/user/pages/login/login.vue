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
        <input
          v-model.trim="form.password"
          class="input"
          password
          type="text"
          placeholder="请输入密码"
        />
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
            :disabled="countdown > 0 || isActionPending('sendCode')"
            @click="sendCode"
          >
            {{ isActionPending('sendCode') ? '发送中...' : (countdown > 0 ? `${countdown}s` : '获取验证码') }}
          </button>
        </view>
      </view>

      <button
        class="submit-btn"
        hover-class="button-hover"
        hover-start-time="0"
        hover-stay-time="90"
        :disabled="isActionPending('submit')"
        @click="submit"
      >
        {{ isActionPending('submit') ? '提交中...' : submitText }}
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
          <text class="link">去注册</text>
        </view>
        <text v-if="mode === 'login'" class="divider">|</text>
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
import actionGuard from '@/mixins/actionGuard'
import {
  getVerificationCode,
  userLogin,
  userSignin
} from '@/api/index'
import { showUnhandledError } from '@/utils/error'

const MODE_META = {
  login: {
    title: '登录账号',
    subtitle: '继续使用你的骑行服务',
    submitText: '立即登录'
  },
  signup: {
    title: '注册账号',
    subtitle: '使用邮箱快速创建新账号',
    submitText: '完成注册'
  }
}

const DEFAULT_FORM = () => ({
  email: '',
  password: '',
  verificationCode: '',
  agreedPrivacy: false
})

export default {
  mixins: [actionGuard],
  data() {
    return {
      mode: 'login',
      form: DEFAULT_FORM(),
      countdown: 0,
      timer: null,
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
  },
  onUnload() {
    this.clearTimer()
  },
  methods: {
    redirectToLogin() {
      uni.redirectTo({
        url: '/pages/login/login?mode=login'
      })
    },
    switchMode(nextMode) {
      this.mode = nextMode
      this.form = {
        ...DEFAULT_FORM(),
        email: this.form.email
      }
      this.clearTimer()
      this.countdown = 0
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
      uni.navigateTo({
        url: '/pages/resetPassword/resetPassword'
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

      await this.withAction('sendCode', async () => {
        try {
          await getVerificationCode(this.form.email)
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

      if (this.mode === 'signup' && !this.form.verificationCode) {
        uni.showToast({
          title: '请输入验证码',
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

      await this.withAction('submit', async () => {
        try {
          uni.showLoading({
            title: '提交中...'
          })

          if (this.mode === 'login') {
            const res = await userLogin({
              email: this.form.email,
              password: this.form.password
            })
            const data = res.data || {}
            if (data.token) {
              uni.setStorageSync('token', data.token)
            }
            uni.setStorageSync('userInfo', {
              id: data.id || '',
              username: data.username || '用户',
              email: data.email || this.form.email
            })
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

          await userSignin({
            email: this.form.email,
            password: this.form.password,
            verificationCode: this.form.verificationCode
          })
          uni.hideLoading()
          uni.showToast({
            title: '注册成功，请登录',
            icon: 'success'
          })
          setTimeout(() => {
            this.redirectToLogin()
          }, 800)
        } catch (error) {
          uni.hideLoading()
          showUnhandledError(error, '提交失败，请稍后重试')
        }
      })
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
  text-align: center;
}

.link-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.link,
.divider {
  font-size: 24rpx;
  color: #737373;
}

.link {
  padding: 0 12rpx;
}
</style>
