<template>
  <view class="page">
    <view class="header">
      <text class="title">Lock Placement</text>
    </view>

    <view class="form-card">
      <text class="card-title">Submit placement details manually</text>
      <text class="card-desc">Fill scooter code, battery and placement coordinates to complete the lock placement task.</text>

      <view class="field">
        <text class="field-label">Scooter Code</text>
        <input v-model.trim="form.code" class="input" type="text" maxlength="20" placeholder="Example: SC0001" />
      </view>

      <view class="field">
        <text class="field-label">Battery (%)</text>
        <input v-model.trim="form.battery" class="input" type="number" placeholder="Enter battery" />
      </view>

      <view class="field">
        <view class="field-header">
          <text class="field-label">Latitude</text>
          <text class="field-action" @click="fillCurrentLocation">Use current location</text>
        </view>
        <input v-model.trim="form.latitude" class="input" type="digit" placeholder="Enter latitude" />
      </view>

      <view class="field">
        <text class="field-label">Longitude</text>
        <input v-model.trim="form.longitude" class="input" type="digit" placeholder="Enter longitude" />
      </view>

      <button class="submit-btn" @click="confirmLock">Submit Lock Placement</button>
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
  onLoad(options) {
    if (options && options.code) {
      this.form.code = options.code
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
            title: 'Location applied',
            icon: 'success'
          })
        },
        fail: () => {
          uni.showToast({
            title: 'Location failed',
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
          title: 'Enter scooter code',
          icon: 'none'
        })
        return
      }

      if (!Number.isFinite(payload.battery) || !Number.isFinite(payload.latitude) || !Number.isFinite(payload.longitude)) {
        uni.showToast({
          title: 'Complete all fields',
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({
          title: 'Submitting...'
        })
        await lockScooter(payload)
        uni.hideLoading()
        uni.setStorageSync('dispatcherCurrentTask', {
          ...payload,
          taskType: 'lock'
        })
        uni.showModal({
          title: 'Lock placement saved',
          content: `Scooter ${payload.code} has been placed successfully.`,
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
