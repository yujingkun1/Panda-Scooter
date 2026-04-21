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
            :placeholder="labels.codePlaceholder"
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
          {{ isActionPending('submitReport') ? labels.submitLoading : labels.submit }}
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
import { getScooterInfo, reportFault } from '@/api/index'
import { showUnhandledError } from '@/utils/error'

const LABELS = {
  title: '\u6545\u969c\u4e0a\u62a5',
  guestTitle: '\u767b\u5f55\u540e\u53ef\u63d0\u4ea4\u6545\u969c\u4e0a\u62a5',
  goLogin: '\u53bb\u767b\u5f55',
  scooterCodeLabel: '\u8f66\u8f86\u7f16\u53f7 *',
  codePlaceholder: '000001',
  scan: '\u626b\u7801',
  codeTip: '\u4ec5\u9700\u8f93\u5165\u540e 6 \u4f4d\u7f16\u53f7',
  reasonLabel: '\u6545\u969c\u539f\u56e0 *',
  reasonPlaceholder: '\u8bf7\u63cf\u8ff0\u6545\u969c\u60c5\u51b5\uff0c\u4f8b\u5982\uff1a\u5239\u8f66\u5931\u7075\uff0c\u8f6e\u80ce\u6f0f\u6c14\uff0c\u628a\u624b\u635f\u574f\u7b49',
  photoLabel: '\u4e0a\u4f20\u7167\u7247',
  addPhoto: '\u6dfb\u52a0\u56fe\u7247',
  uploadTip: '\u53ef\u4e0a\u4f20 1 \u5f20\u73b0\u573a\u56fe\u7247',
  submitLoading: '\u63d0\u4ea4\u4e2d...',
  submit: '\u786e\u8ba4\u63d0\u4ea4',
  history: '\u67e5\u770b\u5386\u53f2\u4e0a\u62a5\u8bb0\u5f55',
  scanSuccess: '\u626b\u7801\u6210\u529f',
  scanFailed: '\u626b\u7801\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5',
  enter6Digits: '\u8bf7\u8f93\u5165 6 \u4f4d\u7f16\u53f7',
  enterDescription: '\u8bf7\u586b\u5199\u6545\u969c\u539f\u56e0',
  modalTitle: '\u63d0\u4ea4\u6210\u529f',
  modalContent: '\u611f\u8c22\u4f60\u7684\u53cd\u9988\uff0c\u6211\u4eec\u4f1a\u5c3d\u5feb\u5904\u7406\u3002',
  submitError: '\u63d0\u4ea4\u6545\u969c\u4e0a\u62a5\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5'
}

export default {
  mixins: [actionGuard],
  data() {
    return {
      labels: LABELS,
      hasToken: false,
      scooterCode: '',
      maxLength: 6,
      faultReason: '',
      photos: [],
      maxPhotos: 1
    }
  },
  onLoad(options) {
    if (options && options.code) {
      this.scooterCode = this.extractDigits(options.code)
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
            scooterCode: normalizedCode,
            description: this.faultReason.trim(),
            image: this.photos[0] || ''
          })

          uni.hideLoading()
          uni.showModal({
            title: this.labels.modalTitle,
            content: this.labels.modalContent,
            showCancel: false,
            success: () => {
              uni.navigateTo({
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
