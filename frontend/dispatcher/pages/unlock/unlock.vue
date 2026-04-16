<template>
  <view class="page">
    <view class="header">
      <text class="title">开锁调度</text>
    </view>

    <view class="form-card">
      <text class="card-title">手动输入车辆编号</text>
      <text class="card-desc">可从首页扫码带入车号，也可在这里手动输入车辆编号后执行开锁调度。</text>

      <view class="field">
        <text class="field-label">车辆编号</text>
        <input v-model.trim="scooterCode" class="input" type="text" maxlength="20" placeholder="例如：PDSC000001" />
      </view>

      <button class="submit-btn" hover-class="button-hover" hover-start-time="0" hover-stay-time="90" :disabled="!canSubmit" @click="confirmUnlock">
        确认开锁调度
      </button>
    </view>
  </view>
</template>

<script>
import { unlockScooter } from '@/api/index'

export default {
  data() {
    return {
      scooterCode: ''
    }
  },
  computed: {
    canSubmit() {
      return Boolean(this.scooterCode.trim())
    }
  },
  onLoad(options) {
    if (options && options.code) {
      this.scooterCode = decodeURIComponent(options.code)
    }
  },
  onShow() {
    if (!uni.getStorageSync('dispatcherToken')) {
      uni.redirectTo({
        url: '/pages/login/login?mode=login'
      })
    }
  },
  methods: {
    async confirmUnlock() {
      if (!this.canSubmit) {
        uni.showToast({
          title: '请输入车辆编号',
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({
          title: '开锁中...'
        })
        const code = this.scooterCode.trim()
        const res = await unlockScooter(code)
        uni.hideLoading()
        uni.setStorageSync('dispatcherCurrentTask', {
          ...(res.data || {}),
          scooterCode: code,
          taskType: 'unlock'
        })
        uni.showModal({
          title: '开锁调度成功',
          content: `车辆 ${code} 已进入调度流程。`,
          showCancel: false,
          success: () => {
            uni.navigateBack({
              delta: 1
            })
          }
        })
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
  background-color: #fafaf8;
}

.header {
  padding: 48rpx 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e2;
}

.title {
  font-size: 36rpx;
  color: #0b0e0d;
  letter-spacing: 4rpx;
}

.form-card {
  margin: 32rpx;
  padding: 48rpx 32rpx;
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
}

.card-title {
  display: block;
  margin-bottom: 12rpx;
  font-size: 32rpx;
  color: #0b0e0d;
}

.card-desc {
  display: block;
  margin-bottom: 36rpx;
  font-size: 24rpx;
  color: #737373;
  line-height: 1.7;
}

.field {
  margin-bottom: 32rpx;
}

.field-label {
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

.submit-btn {
  background-color: #0b0e0d;
  color: #ffffff;
  border: none;
  border-radius: 0;
  font-size: 30rpx;
  letter-spacing: 4rpx;
}

.submit-btn:disabled {
  background-color: #d4d4d1;
}
</style>
