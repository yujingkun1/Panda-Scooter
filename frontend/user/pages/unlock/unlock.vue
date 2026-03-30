<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <text class="title">编号开锁</text>
    </view>

    <!-- Input Display -->
    <view class="display-section">
      <view class="input-display">
        <text class="display-label">请输入车辆二维码编号</text>
        <view class="display-value">
          <text 
            v-for="(char, index) in displayChars" 
            :key="index" 
            class="char-box"
            :class="{ active: index === scooterCode.length }"
          >
            {{ char || '' }}
          </text>
          <text v-if="scooterCode.length < 10" class="cursor">|</text>
        </view>
      </view>
      
      <!-- Flashlight Toggle -->
      <view class="flashlight-section">
        <button class="flashlight-btn" @click="toggleFlashlight" :class="{ active: isFlashlightOn }">
          <text class="flashlight-icon">{{ isFlashlightOn ? '🔦' : '💡' }}</text>
          <text class="flashlight-text">{{ isFlashlightOn ? '关闭手电筒' : '打开手电筒' }}</text>
        </button>
      </view>
    </view>

    <!-- Number Keyboard -->
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
      
      <!-- Confirm Button -->
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
      isFlashlightOn: false,
      flashlightInitialized: false
    }
  },
  computed: {
    displayChars() {
      // 将编号转换为字符数组用于显示
      return this.scooterCode.split('')
    },
    canUnlock() {
      return this.scooterCode.length >= 4 && this.scooterCode.length <= this.maxLength
    }
  },
  onUnload() {
    // 页面卸载时关闭手电筒
    if (this.isFlashlightOn) {
      this.turnOffFlashlight()
    }
  },
  methods: {
    // 处理数字点击
    handleNumberClick(num) {
      if (this.scooterCode.length >= this.maxLength) {
        uni.showToast({
          title: '编号长度已达上限',
          icon: 'none'
        })
        return
      }
      this.scooterCode += num
      
      // 添加按键反馈
      uni.vibrateShort({
        success: () => {}
      })
    },

    // 删除数字
    deleteNumber() {
      if (this.scooterCode.length > 0) {
        this.scooterCode = this.scooterCode.slice(0, -1)
        
        // 添加按键反馈
        uni.vibrateShort({
          success: () => {}
        })
      }
    },

    // 切换手电筒状态
    toggleFlashlight() {
      if (this.isFlashlightOn) {
        this.turnOffFlashlight()
      } else {
        this.turnOnFlashlight()
      }
    },

    // 打开手电筒
    turnOnFlashlight() {
      // 申请摄像头权限
      uni.authorize({
        scope: 'scope.camera',
        success: () => {
          // 使用微信的闪光灯 API
          uni.setScreenBrightness({
            value: 1.0,
            success: () => {
              this.isFlashlightOn = true
              this.flashlightInitialized = true
              
              uni.showToast({
                title: '手电筒已打开',
                icon: 'success'
              })
            }
          })
        },
        fail: () => {
          // 用户拒绝授权，引导打开设置
          uni.showModal({
            title: '提示',
            content: '需要摄像头权限才能使用手电筒功能，是否前往设置？',
            success: (res) => {
              if (res.confirm) {
                uni.openSetting()
              }
            }
          })
        }
      })
    },

    // 关闭手电筒
    turnOffFlashlight() {
      // 恢复屏幕亮度
      uni.setScreenBrightness({
        value: 0.5,
        success: () => {
          this.isFlashlightOn = false
          
          uni.showToast({
            title: '手电筒已关闭',
            icon: 'none'
          })
        }
      })
    },

    // 确认开锁
    async confirmUnlock() {
      if (!this.canUnlock) {
        uni.showToast({
          title: '请输入有效的编号',
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({
          title: '正在开锁...'
        })

        // TODO: 调用开锁 API
        // const res = await unlockScooter(this.scooterCode)
        
        // 模拟开锁过程
        await new Promise(resolve => setTimeout(resolve, 2000))

        uni.hideLoading()
        
        // 开锁成功
        uni.showModal({
          title: '开锁成功',
          content: `单车编号 ${this.scooterCode} 已解锁，祝您骑行愉快！`,
          showCancel: false,
          success: () => {
            // 跳转到首页
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }
        })

        // 关闭手电筒
        if (this.isFlashlightOn) {
          this.turnOffFlashlight()
        }

      } catch (error) {
        uni.hideLoading()
        console.error('开锁失败:', error)
        
        uni.showModal({
          title: '开锁失败',
          content: '无法解锁该单车，请检查编号是否正确或联系工作人员',
          showCancel: false
        })
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

/* Header */
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

/* Display Section */
.display-section {
  padding: 64rpx 32rpx;
  background-color: #ffffff;
  margin: 32rpx;
  border-radius: 0;
  box-shadow: none;
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
}

.char-box {
  width: 64rpx;
  height: 96rpx;
  background-color: #fafaf8;
  border: 1rpx solid #d4d4d1;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: 300;
  color: #0b0e0d;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.char-box.active {
  border-color: #0b0e0d;
  background-color: #ffffff;
}

.cursor {
  font-size: 40rpx;
  color: #0b0e0d;
  animation: blink 3s infinite;
  font-weight: 300;
}

@keyframes blink {
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0;
  }
}

/* Flashlight Section */
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
  gap: 16rpx;
  font-size: 26rpx;
  font-weight: 300;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0 auto;
  display: flex;
  letter-spacing: 2rpx;
}

.flashlight-btn.active {
  background-color: #0b0e0d;
  color: #ffffff;
  border-color: #0b0e0d;
}

.flashlight-btn:hover {
  border-color: #0b0e0d;
}

.flashlight-icon {
  font-size: 32rpx;
  font-style: normal;
}

.flashlight-text {
  font-weight: 300;
  letter-spacing: 2rpx;
}

/* Keyboard Section */
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
  border-radius: 0;
  padding: 48rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  border: 1rpx solid #e5e5e2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  font-weight: 300;
}

/* Confirm Section */
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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  letter-spacing: 4rpx;
}

.unlock-btn:disabled {
  background-color: #d4d4d1;
  box-shadow: none;
}

.unlock-btn:hover:not(:disabled) {
  background-color: #222222;
  transform: translateY(-4rpx);
}

.unlock-text {
  font-weight: 300;
  letter-spacing: 4rpx;
}
</style>
