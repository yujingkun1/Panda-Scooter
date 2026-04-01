<template>
  <view class="page">
    <view class="header">
      <text class="title">编号开锁</text>
    </view>

    <view class="display-section">
      <view class="input-display">
        <text class="display-label">请输入车辆二维码编号</text>
        <view class="display-value">
          <text
            v-for="(char, index) in displayChars"
            :key="index"
            class="char-box"
            :class="{ active: index === scooterCode.length && scooterCode.length < maxLength }"
          >
            {{ char }}
          </text>
        </view>
      </view>

      <view class="flashlight-section">
        <button class="flashlight-btn" @click="toggleFlashlight" :class="{ active: isFlashlightOn }">
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
        <button class="unlock-btn" @click="confirmUnlock" :disabled="!canUnlock">
          确认开锁
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { unlockScooter } from '@/api/index'

export default {
  data() {
    return {
      scooterCode: '',
      maxLength: 10,
      numberKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      isFlashlightOn: false
    }
  },
  computed: {
    displayChars() {
      return Array.from({ length: this.maxLength }, (_, index) => this.scooterCode[index] || '')
    },
    canUnlock() {
      return this.scooterCode.length >= 4 && this.scooterCode.length <= this.maxLength
    }
  },
  onUnload() {
    if (this.isFlashlightOn) {
      this.turnOffFlashlight()
    }
  },
  methods: {
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

      try {
        uni.showLoading({
          title: '正在开锁...'
        })

        const res = await unlockScooter(this.scooterCode)
        uni.hideLoading()
        uni.setStorageSync('currentRide', {
          ...(res.data || {}),
          scooterCode: this.scooterCode
        })

        if (this.isFlashlightOn) {
          this.turnOffFlashlight()
        }

        uni.showModal({
          title: '开锁成功',
          content: `车辆 ${this.scooterCode} 已解锁，祝你骑行愉快。`,
          showCancel: false,
          success: () => {
            uni.reLaunch({
              url: '/pages/index/index'
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
  font-size: 24rpx;
  color: #737373;
  display: block;
  margin-bottom: 40rpx;
  text-align: center;
  letter-spacing: 2rpx;
  font-weight: 300;
}

.display-value {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16rpx;
  min-height: 80rpx;
  flex-wrap: wrap;
}

.char-box {
  width: 64rpx;
  height: 96rpx;
  background-color: #fafaf8;
  border: 1rpx solid #d4d4d1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: 300;
  color: #0b0e0d;
}

.char-box.active {
  border-color: #0b0e0d;
  background-color: #ffffff;
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
  font-size: 26rpx;
  font-weight: 300;
  margin: 0 auto;
  letter-spacing: 2rpx;
}

.flashlight-btn.active {
  background-color: #0b0e0d;
  color: #ffffff;
  border-color: #0b0e0d;
}

.flashlight-text {
  font-weight: 300;
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
  border-color: #d4d4d1;
}

.key-text {
  font-size: 40rpx;
  font-weight: 300;
  color: #0b0e0d;
  letter-spacing: 2rpx;
}

.delete-key {
  background-color: #fafaf8;
  border-color: #e5e5e2;
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
