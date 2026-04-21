<template>
  <view class="page">
    <view class="header">
      <text class="title">{{ labels.title }}</text>
    </view>

    <view v-if="!hasToken" class="guest-card">
      <text class="guest-title">{{ labels.guestTitle }}</text>
      <button
        class="login-btn"
        hover-class="button-hover"
        hover-start-time="0"
        hover-stay-time="90"
        @click="goLogin"
      >
        {{ labels.goLogin }}
      </button>
    </view>

    <view v-else class="form-section">
      <view class="form-item">
        <text class="form-label">{{ labels.scooterCodeLabel }}</text>
        <view class="input-wrapper">
          <view class="code-prefix">PDSC</view>
          <input
            :value="scooterCode"
            class="input code-input"
            type="number"
            :maxlength="maxLength"
            confirm-type="done"
            @input="handleCodeInput"
          />
          <button
            class="scan-btn"
            hover-class="button-hover"
            hover-start-time="0"
            hover-stay-time="90"
            @click="scanScooterCode"
          >
            {{ labels.scan }}
          </button>
        </view>
        <text class="input-tip">{{ labels.codeTip }}</text>
      </view>

      <view class="form-item">
        <text class="form-label">{{ labels.reasonLabel }}</text>
        <textarea
          v-model="faultReason"
          class="textarea"
          :placeholder="labels.reasonPlaceholder"
          :maxlength="200"
          :auto-height="true"
        />
        <text class="char-count">{{ faultReason.length }}/200</text>
      </view>

      <view class="form-item">
        <text class="form-label">{{ labels.photoLabel }}</text>
        <view class="upload-section">
          <view v-for="(photo, index) in photos" :key="photo" class="photo-item">
            <image class="photo-image" :src="photo" mode="aspectFill" />
            <view
              class="photo-delete ui-pressable"
              hover-class="ui-pressable-hover"
              hover-stay-time="70"
              @click="deletePhoto(index)"
            >
              <text class="delete-icon">x</text>
            </view>
          </view>
          <view
            v-if="photos.length < maxPhotos"
            class="upload-btn ui-pressable"
            hover-class="ui-pressable-hover"
            hover-stay-time="70"
            @click="chooseImage"
          >
            <text class="upload-text">{{ labels.addPhoto }}</text>
          </view>
        </view>
        <text class="upload-tip">{{ labels.uploadTip }}</text>
      </view>

      <view class="submit-section">
        <button
          class="submit-btn"
          hover-class="button-hover"
          hover-start-time="0"
          hover-stay-time="90"
          :disabled="isActionPending('submitReport')"
          @click="submitReport"
        >
          {{ isActionPending('submitReport') ? labels.submitLoading : (rideMode ? labels.submitAndFinish : labels.submit) }}
        </button>
      </view>

      <view
        class="history-link ui-pressable"
        hover-class="ui-pressable-hover"
        hover-stay-time="70"
        @click="navigateToHistory"
      >
        <text class="link-text">{{ labels.history }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import actionGuard from '@/mixins/actionGuard'
import { getScooterInfo, lockScooter, reportFault } from '@/api/index'
import { showUnhandledError } from '@/utils/error'

const CURRENT_RIDE_STORAGE_KEY = 'currentRide'
const BATTERY_COST_PER_KILOMETER = 4

const LABELS = {
  title: '故障上报',
  guestTitle: '登录后可提交故障上报',
  goLogin: '去登录',
  scooterCodeLabel: '车辆编号 *',
  scan: '扫码',
  codeTip: '仅需输入后 6 位编号，扫码后也只会回填后 6 位',
  reasonLabel: '故障原因 *',
  reasonPlaceholder: '请描述故障情况，例如：刹车失灵，轮胎漏气，把手损坏等',
  photoLabel: '上传照片',
  addPhoto: '添加图片',
  uploadTip: '可上传 1 张现场图片',
  submitLoading: '提交中...',
  submit: '确认提交',
  submitAndFinish: '上报故障',
  history: '查看历史上报记录',
  scanSuccess: '扫码成功',
  scanFailed: '扫码失败，请重试',
  enter6Digits: '请输入 6 位编号',
  enterDescription: '请填写故障原因',
  modalTitle: '提交成功',
  modalContent: '感谢你的反馈，我们会尽快处理。',
  rideSuccess: '故障上报成功，本次骑行免费',
  submitError: '提交故障上报失败，请稍后重试',
  rideLockError: '故障已上报，但自动锁车失败，请重试结束骑行'
}

export default {
  mixins: [actionGuard],
  data() {
    return {
      labels: LABELS,
      hasToken: false,
      rideMode: false,
      scooterCode: '',
      maxLength: 6,
      faultReason: '',
      photos: [],
      maxPhotos: 1
    }
  },
  onLoad(options) {
    const currentRide = uni.getStorageSync(CURRENT_RIDE_STORAGE_KEY) || {}
    this.rideMode = options && options.rideMode === '1' && Boolean(currentRide && currentRide.orderId)

    if (options && options.code) {
      this.scooterCode = this.extractDigits(options.code)
    }

    if (this.rideMode && currentRide.scooterCode) {
      this.scooterCode = this.extractDigits(currentRide.scooterCode)
    }
  },
  onShow() {
    this.hasToken = Boolean(uni.getStorageSync('token'))
  },
  methods: {
    goLogin() {
      uni.navigateTo({
        url: '/pages/login/login?mode=login'
      })
    },
    extractDigits(rawCode) {
      return String(rawCode || '').replace(/\D/g, '').slice(-6)
    },
    extractScooterCode(rawCode) {
      const value = String(rawCode || '').trim()
      if (!value) {
        return ''
      }

      const matchedCode = value.match(/PDSC\d+/i)
      if (matchedCode && matchedCode[0]) {
        return matchedCode[0].toUpperCase()
      }

      if (value.includes('code=')) {
        const query = value.split('?')[1] || ''
        const params = {}
        query.split('&').forEach((item) => {
          const [key, val] = item.split('=')
          if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(val || '')
          }
        })
        return params.code || value
      }

      const segments = value.split('/')
      return segments[segments.length - 1] || value
    },
    normalizeScooterCode(rawCode) {
      const digits = this.extractDigits(rawCode)
      return digits.length === 6 ? `PDSC${digits}` : ''
    },
    getCurrentRide() {
      return uni.getStorageSync(CURRENT_RIDE_STORAGE_KEY) || {}
    },
    getLocation() {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: 'gcj02',
          success: resolve,
          fail: reject
        })
      })
    },
    getRideBattery(ride) {
      const current = Number(ride.battery || 0) - Number(ride.totalKilometer || 0) * BATTERY_COST_PER_KILOMETER
      return Math.max(0, current)
    },
    async settleRideForFault(fallbackScooterId = 0) {
      const ride = this.getCurrentRide()
      if (!ride || !ride.orderId) {
        throw new Error('missing-current-ride')
      }

      let location = null
      try {
        location = await this.getLocation()
      } catch (error) {
      }

      const payload = {
        orderId: Number(ride.orderId),
        startTime: ride.startTime || new Date().toISOString(),
        endTime: new Date().toISOString(),
        amount: 0,
        totalKilometer: Number(Number(ride.totalKilometer || 0).toFixed(2)),
        code: Number(ride.scooterId || fallbackScooterId),
        battery: Number(this.getRideBattery(ride).toFixed(0)),
        latitude: Number((location && location.latitude) || ride.currentLatitude || 0),
        longitude: Number((location && location.longitude) || ride.currentLongitude || 0)
      }

      await lockScooter(payload)
      uni.removeStorageSync(CURRENT_RIDE_STORAGE_KEY)
    },
    handleCodeInput(event) {
      this.scooterCode = this.extractDigits(event && event.detail ? event.detail.value : '')
    },
    scanScooterCode() {
      uni.scanCode({
        success: (res) => {
          const code = this.extractScooterCode(res.result)
          this.scooterCode = this.extractDigits(code)
          uni.showToast({
            title: this.labels.scanSuccess,
            icon: 'success'
          })
        },
        fail: () => {
          uni.showToast({
            title: this.labels.scanFailed,
            icon: 'none'
          })
        }
      })
    },
    chooseImage() {
      const remainingCount = this.maxPhotos - this.photos.length
      uni.chooseImage({
        count: remainingCount,
        sourceType: ['camera', 'album'],
        success: (res) => {
          this.photos = [...this.photos, ...res.tempFilePaths]
        }
      })
    },
    deletePhoto(index) {
      this.photos.splice(index, 1)
    },
    async submitReport() {
      const normalizedCode = this.normalizeScooterCode(this.scooterCode)

      if (!normalizedCode) {
        uni.showToast({
          title: this.labels.enter6Digits,
          icon: 'none'
        })
        return
      }

      if (!this.faultReason.trim()) {
        uni.showToast({
          title: this.labels.enterDescription,
          icon: 'none'
        })
        return
      }

      await this.withAction('submitReport', async () => {
        try {
          uni.showLoading({
            title: 'Submitting...'
          })

          const scooterRes = await getScooterInfo(normalizedCode)
          const scooterId = Number(scooterRes.data && scooterRes.data.id) || 0

          await reportFault({
            scooterId,
            description: this.faultReason.trim(),
            image: this.photos[0] || ''
          })

          if (this.rideMode) {
            try {
              await this.settleRideForFault(scooterId)
            } catch (error) {
              uni.hideLoading()
              showUnhandledError(error, this.labels.rideLockError)
              return
            }

            uni.hideLoading()
            uni.showToast({
              title: this.labels.rideSuccess,
              icon: 'success'
            })
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index'
              })
            }, 600)
            return
          }

          uni.hideLoading()
          uni.showModal({
            title: this.labels.modalTitle,
            content: this.labels.modalContent,
            showCancel: false,
            success: () => {
              uni.redirectTo({
                url: '/pages/faults/faults'
              })
            }
          })
        } catch (error) {
          uni.hideLoading()
          showUnhandledError(error, this.labels.submitError)
        }
      })
    },
    navigateToHistory() {
      uni.navigateTo({
        url: '/pages/faults/faults'
      })
    }
  }
}
</script>

<style>
.page { min-height: 100vh; background-color: #fafaf8; }
.header { padding: 48rpx 32rpx; background-color: #fff; border-bottom: 1rpx solid #e5e5e2; }
.title { font-size: 36rpx; color: #0b0e0d; letter-spacing: 4rpx; }
.guest-card { margin: 32rpx; padding: 40rpx 32rpx; background: #fff; border: 1rpx solid #e5e5e2; }
.guest-title { display: block; margin-bottom: 24rpx; font-size: 28rpx; color: #0b0e0d; line-height: 1.6; }
.login-btn { background-color: #0b0e0d; color: #fff; border: none; border-radius: 0; }
.form-section { padding: 32rpx; }
.form-item { margin-bottom: 32rpx; background-color: #fff; padding: 40rpx 32rpx; border: 1rpx solid #e5e5e2; }
.form-label { display: block; margin-bottom: 24rpx; font-size: 26rpx; color: #0b0e0d; }
.input-wrapper { display: flex; align-items: center; gap: 20rpx; min-width: 0; }
.code-prefix { width: 140rpx; height: 88rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background-color: #f0efe8; border: 1rpx solid #e5e5e2; font-size: 28rpx; color: #0b0e0d; letter-spacing: 3rpx; }
.input { flex: 1; min-width: 0; height: 88rpx; background-color: #fafaf8; border: 1rpx solid #e5e5e2; padding: 0 28rpx; font-size: 28rpx; box-sizing: border-box; }
.code-input { letter-spacing: 8rpx; }
.scan-btn { height: 88rpx; flex-shrink: 0; padding: 0 40rpx; background-color: transparent; border: 1rpx solid #d4d4d1; border-radius: 0; color: #0b0e0d; }
.scan-btn::after { border: none; }
.input-tip { display: block; margin-top: 16rpx; font-size: 22rpx; color: #737373; line-height: 1.6; }
.textarea { width: 100%; min-height: 240rpx; background-color: #fafaf8; border: 1rpx solid #e5e5e2; padding: 24rpx 28rpx; font-size: 28rpx; box-sizing: border-box; }
.char-count { display: block; text-align: right; margin-top: 12rpx; font-size: 22rpx; color: #737373; }
.upload-section { display: flex; flex-wrap: wrap; gap: 20rpx; }
.photo-item { position: relative; width: 200rpx; height: 200rpx; border: 1rpx solid #e5e5e2; overflow: hidden; }
.photo-image { width: 100%; height: 100%; }
.photo-delete { position: absolute; top: 8rpx; right: 8rpx; width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center; background-color: rgba(11, 14, 13, 0.8); }
.delete-icon { color: #fff; font-size: 28rpx; }
.upload-btn { width: 200rpx; height: 200rpx; display: flex; align-items: center; justify-content: center; background-color: #fafaf8; border: 1rpx dashed #d4d4d1; }
.upload-text { font-size: 24rpx; color: #737373; }
.upload-tip { display: block; margin-top: 16rpx; font-size: 22rpx; color: #737373; line-height: 1.6; }
.submit-section { margin-top: 64rpx; }
.submit-btn { background-color: #0b0e0d; color: #fff; border: none; border-radius: 0; font-size: 32rpx; letter-spacing: 4rpx; }
.submit-btn[disabled] { background-color: #d4d4d1; }
.history-link { margin-top: 40rpx; padding: 40rpx 32rpx; text-align: center; background-color: #fff; border: 1rpx solid #e5e5e2; }
.link-text { font-size: 28rpx; color: #737373; }
</style>
