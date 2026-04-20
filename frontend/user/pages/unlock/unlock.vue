<template>
  <view class="page">
    <camera
      v-if="cameraVisible"
      class="torch-camera"
      device-position="back"
      :flash="cameraFlash"
      @error="handleCameraError"
    ></camera>

    <view class="header">
      <text class="title">编号开锁</text>
    </view>

    <view class="display-section">
      <view class="input-display ui-pressable" hover-class="ui-pressable-hover" hover-stay-time="70" @click="focusCodeInput">
        <text class="display-label">请输入车辆二维码编号</text>
        <view class="display-value">
          <text class="prefix-tag">PDSC</text>
          <text
            v-for="(char, index) in displayChars"
            :key="index"
            class="char-slot"
            :class="{ active: index === scooterCode.length && scooterCode.length < maxLength }"
          >
            <text class="char-text">{{ char }}</text>
          </text>
        </view>
        <input
          class="native-code-input"
          :value="scooterCode"
          :focus="inputFocused"
          type="number"
          confirm-type="done"
          :maxlength="maxLength"
          :adjust-position="true"
          :cursor-spacing="24"
          @input="handleCodeInput"
          @blur="handleCodeBlur"
          @confirm="confirmUnlock"
        />
      </view>

      <view class="flashlight-section">
        <button
          class="flashlight-btn"
          hover-class="button-hover"
          hover-start-time="0"
          hover-stay-time="90"
          :class="{ active: isFlashlightOn }"
          :disabled="isFlashlightPending"
          @click="toggleFlashlight"
        >
          <text class="flashlight-text">
            {{ isFlashlightPending ? '处理中...' : (isFlashlightOn ? '关闭补光' : '打开补光') }}
          </text>
        </button>
      </view>
    </view>

    <view class="confirm-section native-confirm-section" :style="confirmSectionStyle">
      <button class="unlock-btn" hover-class="button-hover" hover-start-time="0" hover-stay-time="90" :disabled="!canUnlock || isActionPending('confirmUnlock')" @click="confirmUnlock">
        {{ isActionPending('confirmUnlock') ? '开锁中...' : '确认开锁' }}
      </button>
    </view>
  </view>
</template>

<script>
import actionGuard from '@/mixins/actionGuard'
import { getScooterInfo, unlockScooter } from '@/api/index'
import { showUnhandledError } from '@/utils/error'

const CURRENT_RIDE_STORAGE_KEY = 'currentRide'

export default {
  mixins: [actionGuard],
  data() {
    return {
      scooterCode: '',
      maxLength: 6,
      isFlashlightOn: false,
      isFlashlightPending: false,
      inputFocused: false,
      keyboardHeight: 0,
      keyboardHeightHandler: null,
      cameraVisible: false,
      cameraFlash: 'off'
    }
  },
  computed: {
    displayChars() {
      return Array.from({ length: this.maxLength }, (_, index) => this.scooterCode[index] || '')
    },
    canUnlock() {
      return /^\d{6}$/.test(this.scooterCode)
    },
    confirmSectionStyle() {
      return {
        bottom: `${this.keyboardHeight}px`
      }
    }
  },
  onLoad(options) {
    if (!uni.getStorageSync('token')) {
      uni.redirectTo({
        url: '/pages/login/login?mode=login'
      })
      return
    }

    if (options && options.code) {
      this.scooterCode = this.extractDigits(options.code)
    }

    this.registerKeyboardHeightListener()

    setTimeout(() => {
      this.inputFocused = true
    }, 0)
  },
  onHide() {
    this.forceReleaseFlashlight()
  },
  onUnload() {
    this.unregisterKeyboardHeightListener()
    this.forceReleaseFlashlight()
  },
  methods: {
    extractDigits(rawCode) {
      return String(rawCode || '').replace(/\D/g, '').slice(-6)
    },
    normalizeScooterCode(rawCode) {
      const digits = this.extractDigits(rawCode)
      return digits.length === 6 ? `PDSC${digits}` : ''
    },
    focusCodeInput() {
      this.inputFocused = false
      setTimeout(() => {
        this.inputFocused = true
      }, 0)
    },
    handleCodeInput(event) {
      this.scooterCode = this.extractDigits(event && event.detail ? event.detail.value : '')
    },
    handleCodeBlur() {
      this.inputFocused = false
      this.keyboardHeight = 0
    },
    registerKeyboardHeightListener() {
      if (typeof uni.onKeyboardHeightChange !== 'function' || this.keyboardHeightHandler) {
        return
      }

      this.keyboardHeightHandler = (res) => {
        this.keyboardHeight = Math.max(Number(res && res.height) || 0, 0)
      }
      uni.onKeyboardHeightChange(this.keyboardHeightHandler)
    },
    unregisterKeyboardHeightListener() {
      if (!this.keyboardHeightHandler || typeof uni.offKeyboardHeightChange !== 'function') {
        this.keyboardHeightHandler = null
        return
      }

      uni.offKeyboardHeightChange(this.keyboardHeightHandler)
      this.keyboardHeightHandler = null
    },
    async toggleFlashlight() {
      if (this.isFlashlightPending) {
        return
      }

      if (this.isFlashlightOn) {
        this.turnOffFlashlight()
        return
      }

      await this.turnOnFlashlight()
    },
    wait(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms)
      })
    },
    getSetting() {
      return new Promise((resolve, reject) => {
        uni.getSetting({
          success: resolve,
          fail: reject
        })
      })
    },
    authorizeCamera() {
      return new Promise((resolve, reject) => {
        uni.authorize({
          scope: 'scope.camera',
          success: resolve,
          fail: reject
        })
      })
    },
    showCameraPermissionModal() {
      return new Promise((resolve) => {
        uni.showModal({
          title: '需要相机权限',
          content: '打开补光需要相机权限，请授权后重试。',
          confirmText: '去设置',
          success: (res) => {
            resolve(!!(res && res.confirm))
          },
          fail: () => {
            resolve(false)
          }
        })
      })
    },
    openSetting() {
      return new Promise((resolve, reject) => {
        uni.openSetting({
          success: resolve,
          fail: reject
        })
      })
    },
    async ensureCameraPermission() {
      const setting = await this.getSetting()
      const authSetting = (setting && setting.authSetting) || {}

      if (authSetting['scope.camera'] === true) {
        return
      }

      if (authSetting['scope.camera'] === undefined) {
        try {
          await this.authorizeCamera()
          return
        } catch (error) {
          // Fall through to settings when the initial system authorization is denied.
        }
      }

      const confirmed = await this.showCameraPermissionModal()
      if (!confirmed) {
        throw new Error('camera-permission-cancelled')
      }

      const openSettingResult = await this.openSetting()
      const nextAuthSetting = (openSettingResult && openSettingResult.authSetting) || {}
      if (!nextAuthSetting['scope.camera']) {
        throw new Error('camera-permission-denied')
      }
    },
    async ensureCameraMounted() {
      if (!this.cameraVisible) {
        this.cameraVisible = true
        await this.$nextTick()
      }

      await this.wait(120)
    },
    async turnOnFlashlight() {
      this.isFlashlightPending = true
      try {
        await this.ensureCameraPermission()
        await this.ensureCameraMounted()
        this.cameraFlash = 'off'
        await this.wait(80)
        this.cameraFlash = 'torch'
        this.isFlashlightOn = true
      } catch (error) {
        this.turnOffFlashlight()
        if (!String(error && error.message || '').startsWith('camera-permission')) {
          uni.showToast({
            title: '补光开启失败',
            icon: 'none'
          })
        }
      } finally {
        this.isFlashlightPending = false
      }
    },
    turnOffFlashlight() {
      this.cameraFlash = 'off'
      this.isFlashlightOn = false
      setTimeout(() => {
        if (!this.isFlashlightOn) {
          this.cameraVisible = false
        }
      }, 80)
    },
    forceReleaseFlashlight() {
      this.cameraFlash = 'off'
      this.isFlashlightOn = false
      this.isFlashlightPending = false
      this.cameraVisible = false
    },
    handleCameraError() {
      this.isFlashlightPending = false
      this.turnOffFlashlight()
      uni.showToast({
        title: '补光开启失败',
        icon: 'none'
      })
    },
    async confirmUnlock() {
      if (!this.canUnlock) {
        uni.showToast({
          title: '请输入有效编号',
          icon: 'none'
        })
        return
      }

      await this.withAction('confirmUnlock', async () => {
        try {
          uni.showLoading({
            title: '开锁中...'
          })
          const normalizedCode = this.normalizeScooterCode(this.scooterCode)
          if (!normalizedCode) {
            uni.hideLoading()
            uni.showToast({
              title: '请输入 6 位编号',
              icon: 'none'
            })
            return
          }

          const scooterRes = await getScooterInfo(normalizedCode)
          const scooterInfo = scooterRes.data || {}
          const res = await unlockScooter(normalizedCode)
          uni.hideLoading()
          uni.setStorageSync(CURRENT_RIDE_STORAGE_KEY, {
            ...(res.data || {}),
            scooterCode: normalizedCode,
            scooterId: scooterInfo.id || (res.data && res.data.scooterId) || '',
            battery: Number(scooterInfo.battery || 0),
            rideStatus: scooterInfo.rideStatus || 1,
            faultStatus: scooterInfo.faultStatus || 0,
            currentLatitude: Number(scooterInfo.latitude || 0),
            currentLongitude: Number(scooterInfo.longitude || 0),
            routePoints: [],
            startTime: new Date().toISOString(),
            totalKilometer: 0,
            amount: 0,
            active: true
          })

          this.turnOffFlashlight()

          uni.navigateTo({
            url: '/pages/riding/riding'
          })
        } catch (error) {
          uni.hideLoading()
          showUnhandledError(error, '开锁失败，请稍后重试')
        }
      })
    }
  }
}
</script>

<style>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fafaf8;
}

.torch-camera {
  position: fixed;
  top: -200rpx;
  left: -200rpx;
  width: 1rpx;
  height: 1rpx;
  opacity: 0;
  pointer-events: none;
}

.header {
  padding: 48rpx 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e2;
}

.title {
  font-size: 36rpx;
  font-weight: 400;
  color: #0b0e0d;
  letter-spacing: 4rpx;
}

.display-section {
  padding: 64rpx 32rpx;
  background-color: #ffffff;
  margin: 32rpx;
  border: 1rpx solid #e5e5e2;
}

.input-display {
  margin-bottom: 48rpx;
  position: relative;
}

.display-label {
  display: block;
  font-size: 22rpx;
  color: #737373;
  margin-bottom: 40rpx;
  text-align: center;
  letter-spacing: 2rpx;
}

.display-value {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 16rpx;
  min-height: 80rpx;
  flex-wrap: wrap;
}

.prefix-tag {
  min-width: 132rpx;
  height: 72rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 10rpx;
  font-size: 26rpx;
  color: #0b0e0d;
  letter-spacing: 3rpx;
}

.char-slot {
  width: 64rpx;
  height: 72rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 10rpx;
  border-bottom: 2rpx solid #d4d4d1;
}

.char-text {
  font-size: 34rpx;
  font-weight: 300;
  color: #0b0e0d;
}

.char-slot.active {
  border-bottom-color: #0b0e0d;
}

.native-code-input {
  position: absolute;
  inset: 0;
  opacity: 0;
}

.flashlight-section {
  margin-top: 48rpx;
}

.flashlight-btn {
  background-color: transparent;
  color: #525252;
  border: 1rpx solid #d4d4d1;
  border-radius: 0;
  padding: 24rpx 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.flashlight-btn.active {
  background-color: #0b0e0d;
  color: #ffffff;
  border-color: #0b0e0d;
}

.flashlight-btn[disabled] {
  opacity: 0.7;
}

.flashlight-btn::after {
  border: none;
}

.flashlight-text {
  font-size: 26rpx;
  letter-spacing: 2rpx;
}

.confirm-section {
  margin-top: auto;
}

.native-confirm-section {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 0 32rpx 48rpx;
  background: linear-gradient(180deg, rgba(250, 250, 248, 0) 0%, #fafaf8 32%);
  transition: bottom 0.2s ease;
}

.unlock-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0b0e0d;
  color: #ffffff;
  border: none;
  border-radius: 0;
  padding: 36rpx 0;
  font-size: 32rpx;
  font-weight: 300;
  box-shadow: none;
  letter-spacing: 4rpx;
}

.unlock-btn:disabled {
  background-color: #d4d4d1;
}
</style>
