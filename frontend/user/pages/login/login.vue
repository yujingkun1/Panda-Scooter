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

      <view class="field">
        <text class="label">邮箱</text>
        <input
          v-model.trim="form.email"
          class="input"
          type="text"
          placeholder="请输入邮箱"
        />
      </view>

      <view v-if="mode !== 'forgot-password'" class="field">
        <text class="label">密码</text>
        <input
          v-model.trim="form.password"
          class="input"
          password
          type="text"
          placeholder="请输入密码"
        />
      </view>

      <view v-if="mode === 'forgot-password'" class="field">
        <text class="label">新密码</text>
        <input
          v-model.trim="form.newPassword"
          class="input"
          password
          type="text"
          placeholder="请输入新密码"
        />
      </view>

      <view v-if="mode !== 'login'" class="field">
        <text class="label">验证码</text>
        <view class="inline-field">
          <input
            v-model.trim="form.verificationCode"
            class="input inline-input"
            type="text"
            placeholder="请输入验证码"
          />
          <button class="code-btn" :disabled="countdown > 0 || isActionPending('sendCode')" @click="sendCode">
            {{ isActionPending('sendCode') ? '发送中...' : (countdown > 0 ? `${countdown}s` : '获取验证码') }}
          </button>
        </view>
      </view>

      <button class="submit-btn" :disabled="isActionPending('submit')" @click="submit">
        {{ isActionPending('submit') ? '提交中...' : submitText }}
      </button>

      <view class="footer-links">
        <text v-if="mode === 'login'" class="link" @click="switchMode('signup')">去注册</text>
        <text v-if="mode === 'login'" class="divider">|</text>
        <text v-if="mode === 'login'" class="link" @click="switchMode('forgot-password')">忘记密码</text>
        <text v-if="mode !== 'login'" class="link" @click="switchMode('login')">返回登录</text>
      </view>
    </view>
  </view>
</template>

<script>
import actionGuard from '@/mixins/actionGuard'
import {
  getVerificationCode,
  userLogin,
  userPassword,
  userSignin
} from '@/api/index'

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
  },
  'forgot-password': {
    title: '重置密码',
    subtitle: '验证邮箱后重置密码',
    submitText: '确认重置'
  }
}

const DEFAULT_FORM = () => ({
  email: '',
  password: '',
  verificationCode: '',
  newPassword: ''
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
        { mode: 'signup', label: '注册' },
        { mode: 'forgot-password', label: '重置密码' }
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
    redirectToLogin(email = this.form.email) {
      const encodedEmail = encodeURIComponent(email || '')
      uni.redirectTo({
        url: `/pages/login/login?mode=login&email=${encodedEmail}`
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

      if (this.mode === 'login' && !this.form.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        })
        return
      }

      if (this.mode === 'signup' && (!this.form.password || !this.form.verificationCode)) {
        uni.showToast({
          title: '请填写完整注册信息',
          icon: 'none'
        })
        return
      }

      if (this.mode === 'forgot-password' && (!this.form.verificationCode || !this.form.newPassword)) {
        uni.showToast({
          title: '请填写完整重置信息',
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
                url: '/pages/profile/profile'
              })
            }, 800)
            return
          }

          if (this.mode === 'signup') {
            const email = this.form.email
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
              this.redirectToLogin(email)
            }, 800)
            return
          }

          const email = this.form.email
          await userPassword({
            verificationCode: this.form.verificationCode,
            newPassword: this.form.newPassword
          })
          uni.hideLoading()
          uni.showToast({
            title: '密码已重置',
            icon: 'success'
          })
          setTimeout(() => {
            this.redirectToLogin(email)
          }, 800)
        } catch (error) {
          uni.hideLoading()
        }
      })
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
}

.inline-field {
  display: flex;
  gap: 16rpx;
}

.inline-input {
  flex: 1;
}

.code-btn {
  width: 220rpx;
  height: 88rpx;
  border: 1rpx solid #d4d4d1;
  background-color: transparent;
  color: #0b0e0d;
  font-size: 24rpx;
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

.link,
.divider {
  font-size: 24rpx;
  color: #737373;
}

.link {
  padding: 0 12rpx;
}
</style>
