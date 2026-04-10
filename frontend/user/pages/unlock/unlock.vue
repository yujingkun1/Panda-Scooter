<template>
  <view class="page">
    <view class="header">
      <text class="title">编号开锁</text>
    </view>

    <view class="display-section">
      <view class="input-display">
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
      </view>

      <view class="flashlight-section">
        <button class="flashlight-btn" :class="{ active: isFlashlightOn }" @click="toggleFlashlight">
          <text class="flashlight-text">{{ isFlashlightOn ? '关闭补光' : '打开补光' }}</text>
        </button>
      </view>
    </view>

    <view class="keyboard-section">
      <view class="number-keyboard">
        <view
          v-for="num in numberKeys"
          :key="num"
          class="key-item"
          @click="handleNumberClick(num)"
        >
          <text class="key-text">{{ num }}</text>
        </view>
        <view class="key-item delete-key" @click="deleteNumber">
          <text class="key-text">⌫</text>
        </view>
      </view>

      <view class="confirm-section">
        <button class="unlock-btn" :disabled="!canUnlock || isActionPending('confirmUnlock')" @click="confirmUnlock">
          {{ isActionPending('confirmUnlock') ? '开锁中...' : '确认开锁' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import actionGuard from '@/mixins/actionGuard'
import { getScooterInfo, unlockScooter } from '@/api/index'

const CURRENT_RIDE_STORAGE_KEY = 'currentRide'

export default {
  mixins: [actionGuard],
  data() {
    return {
      scooterCode: '',
      maxLength: 6,
      numberKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      isFlashlightOn: false
    }
  },
  computed: {
    displayChars() {
      return Array.from({ length: this.maxLength }, (_, index) => this.scooterCode[index] || '')
    },
    canUnlock() {
      return /^\d{6}$/.test(this.scooterCode)
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
  },
  onUnload() {
    if (this.isFlashlightOn) {
      this.turnOffFlashlight()
    }
  },
  methods: {
    extractDigits(rawCode) {
      return String(rawCode || '').replace(/\D/g, '').slice(-6)
    },
    normalizeScooterCode(rawCode) {
      const digits = this.extractDigits(rawCode)
      return digits.length === 6 ? `PDSC${digits}` : ''
    },
    handleNumberClick(num) {
      if (this.scooterCode.length >= this.maxLength) {
        uni.showToast({
          title: '编号长度已达上限',
          icon: 'none'
        })
        return
      }

      this.scooterCode += num
      uni.vibrateShort()
    },
    deleteNumber() {
      if (!this.scooterCode.length) {
        return
      }

      this.scooterCode = this.scooterCode.slice(0, -1)
      uni.vibrateShort()
    },
    toggleFlashlight() {
      if (this.isFlashlightOn) {
        this.turnOffFlashlight()
      } else {
        this.turnOnFlashlight()
      }
    },
    turnOnFlashlight() {
      uni.setScreenBrightness({
        value: 1,
        success: () => {
          this.isFlashlightOn = true
        }
      })
    },
    turnOffFlashlight() {
      uni.setScreenBrightness({
        value: 0.5,
        success: () => {
          this.isFlashlightOn = false
        }
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
            title: '正在开锁...'
          })
          const normalizedCode = this.normalizeScooterCode(this.scooterCode)
          if (!normalizedCode) {
            uni.hideLoading()
            uni.showToast({
              title: '请输入6位编号',
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

          if (this.isFlashlightOn) {
            this.turnOffFlashlight()
          }

          uni.navigateTo({
            url: '/pages/riding/riding'
          })
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
  display: flex;
  flex-direction: column;
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

.flashlight-text {
  font-size: 26rpx;
  letter-spacing: 2rpx;
}

.keyboard-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 32rpx 48rpx;
}

.number-keyboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.key-item {
  background-color: #ffffff;
  padding: 48rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #e5e5e2;
}

.key-item:active {
  background-color: #fafaf8;
  transform: scale(0.98);
}

.key-text {
  font-size: 40rpx;
  font-weight: 300;
  color: #0b0e0d;
}

.delete-key {
  background-color: #fafaf8;
}

.delete-key .key-text {
  color: #737373;
}

.confirm-section {
  margin-top: auto;
}

.unlock-btn {
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
