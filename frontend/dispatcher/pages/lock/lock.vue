<template>
  <view class="page">
    <view class="header">
      <text class="title">关锁投放</text>
    </view>

    <view class="form-card">
      <text class="card-title">手动提交投放信息</text>
      <text class="card-desc">填写车辆编号、电量和投放位置，完成关锁投放。</text>

      <view class="field">
        <text class="field-label">车辆编号</text>
        <input v-model.trim="form.code" class="input" type="text" maxlength="20" placeholder="例如：SC0001" />
      </view>

      <view class="field">
        <text class="field-label">当前电量(%)</text>
        <input v-model.trim="form.battery" class="input" type="number" placeholder="请输入电量" />
      </view>

      <view class="field">
        <view class="field-header">
          <text class="field-label">投放纬度</text>
          <text class="field-action" @click="fillCurrentLocation">获取当前位置</text>
        </view>
        <input v-model.trim="form.latitude" class="input" type="digit" placeholder="请输入纬度" />
      </view>

      <view class="field">
        <text class="field-label">投放经度</text>
        <input v-model.trim="form.longitude" class="input" type="digit" placeholder="请输入经度" />
      </view>

      <button class="submit-btn" @click="confirmLock">确认关锁投放</button>
    </view>
  </view>
</template>

<script>
import { lockScooter } from '@/api/index'

const DEFAULT_FORM = () => ({
  code: '',
  battery: '',
  latitude: '',
  longitude: ''
})

export default {
  data() {
    return {
      form: DEFAULT_FORM()
    }
  },
  onShow() {
    if (!uni.getStorageSync('dispatcherToken')) {
      uni.redirectTo({
        url: '/pages/login/login?mode=login'
      })
    }
  },
  onLoad(options) {
    if (options && options.code) {
      this.form.code = decodeURIComponent(options.code)
    }
    if (options && typeof options.battery !== 'undefined') {
      this.form.battery = String(options.battery)
    }
    if (options && typeof options.latitude !== 'undefined') {
      this.form.latitude = String(options.latitude)
    }
    if (options && typeof options.longitude !== 'undefined') {
      this.form.longitude = String(options.longitude)
    }
  },
  methods: {
    fillCurrentLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.form.latitude = String(res.latitude)
          this.form.longitude = String(res.longitude)
          uni.showToast({
            title: '已填入当前位置',
            icon: 'success'
          })
        },
        fail: () => {
          uni.showToast({
            title: '获取位置失败',
            icon: 'none'
          })
        }
      })
    },
    async confirmLock() {
      const payload = {
        code: this.form.code.trim(),
        battery: Number(this.form.battery),
        latitude: Number(this.form.latitude),
        longitude: Number(this.form.longitude)
      }

      if (!payload.code) {
        uni.showToast({
          title: '请输入车辆编号',
          icon: 'none'
        })
        return
      }

      if (!Number.isFinite(payload.battery) || !Number.isFinite(payload.latitude) || !Number.isFinite(payload.longitude)) {
        uni.showToast({
          title: '请填写完整投放信息',
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({
          title: '提交中...'
        })
        await lockScooter(payload)
        uni.hideLoading()
        uni.setStorageSync('dispatcherCurrentTask', {
          ...payload,
          taskType: 'lock'
        })
        uni.showModal({
          title: '关锁投放成功',
          content: `车辆 ${payload.code} 已完成投放。`,
          showCancel: false,
          success: () => {
            this.form = DEFAULT_FORM()
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
.page { min-height: 100vh; background-color: #fafaf8; }
.header { padding: 48rpx 32rpx; background-color: #ffffff; border-bottom: 1rpx solid #e5e5e2; }
.title { font-size: 36rpx; color: #0b0e0d; letter-spacing: 4rpx; }
.form-card { margin: 32rpx; padding: 48rpx 32rpx; background-color: #ffffff; border: 1rpx solid #e5e5e2; }
.card-title { display: block; margin-bottom: 12rpx; font-size: 32rpx; color: #0b0e0d; }
.card-desc { display: block; margin-bottom: 36rpx; font-size: 24rpx; color: #737373; line-height: 1.7; }
.field { margin-bottom: 28rpx; }
.field-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.field-label { font-size: 24rpx; color: #0b0e0d; }
.field-action { font-size: 22rpx; color: #737373; }
.input { width: 100%; height: 88rpx; border: 1rpx solid #e5e5e2; background-color: #fafaf8; padding: 0 24rpx; font-size: 28rpx; color: #0b0e0d; }
.submit-btn { background-color: #0b0e0d; color: #ffffff; border: none; border-radius: 0; font-size: 30rpx; letter-spacing: 4rpx; }
</style>
