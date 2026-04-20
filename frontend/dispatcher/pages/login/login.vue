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
        <input
          v-model.trim="form.password"
          class="input"
          password
          type="text"
          placeholder="请输入密码"
        />
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
          <button class="code-btn" hover-class="button-hover" hover-start-time="0" hover-stay-time="90" :disabled="countdown > 0" @click="sendCode">
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </button>
        </view>
      </view>

      <button class="submit-btn" hover-class="button-hover" hover-start-time="0" hover-stay-time="90" @click="submit">
        {{ submitText }}
      </button>

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

const MODE_META = {
  login: {
    title: '登录调度账号',
    subtitle: '进入调度控制台执行车辆调度',
    submitText: '立即登录'
  },
  signup: {
    title: '注册调度账号',
    subtitle: '使用邮箱创建新的调度员账户',
    submitText: '完成注册'
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

      try {
        await getVerificationCode(this.form.email)
        uni.showToast({
          title: '验证码已发送',
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
          title: '请填写完整注册信息',
          icon: 'none'
        })
        return
      }

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
          if (data.token) {
            uni.setStorageSync('dispatcherToken', data.token)
          }
          uni.setStorageSync('dispatcherUserInfo', {
            id: data.id || '',
            name: data.name || '调度员',
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

        const email = this.form.email
        await dispatcherSignin({
          name: this.form.name,
          email: this.form.email,
          password: this.form.password,
          verificationCode: this.form.verificationCode
        })
        uni.hideLoading()
        uni.showToast({
          title: '注册成功，请登录',
          icon: 'success'
        })
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
  padding: 0 12rpx;
}
</style>
