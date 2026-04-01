<template>
  <view class="page">
    <view class="header">
      <text class="title">故障上报</text>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="form-label">车辆编号 *</text>
        <view class="input-wrapper">
          <input
            class="input"
            v-model="scooterCode"
            placeholder="请输入或扫码获取车辆编号"
            :maxlength="10"
          />
          <button class="scan-btn" @click="scanScooterCode">
            <text class="scan-text">扫码</text>
          </button>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">故障原因 *</text>
        <textarea
          class="textarea"
          v-model="faultReason"
          placeholder="请描述故障情况，例如：刹车失灵、轮胎漏气等"
          :maxlength="200"
          :auto-height="true"
        />
        <text class="char-count">{{ faultReason.length }}/200</text>
      </view>

      <view class="form-item">
        <text class="form-label">上传照片</text>
        <view class="upload-section">
          <view v-for="(photo, index) in photos" :key="photo" class="photo-item">
            <image class="photo-image" :src="photo" mode="aspectFill" />
            <view class="photo-delete" @click="deletePhoto(index)">
              <text class="delete-icon">×</text>
            </view>
          </view>

          <view v-if="photos.length < maxPhotos" class="upload-btn" @click="chooseImage">
            <text class="upload-text">添加图片</text>
          </view>
        </view>
        <text class="upload-tip">开发阶段图片仅本地预览，不上传服务端</text>
      </view>

      <view class="submit-section">
        <button class="submit-btn" @click="submitReport">确认提交</button>
      </view>

      <view class="history-link" @click="navigateToHistory">
        <text class="link-text">查看历史上报记录 ›</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getScooterInfo, reportFault } from '@/api/index'

export default {
  data() {
    return {
      scooterCode: '',
      faultReason: '',
      photos: [],
      maxPhotos: 3
    }
  },
  methods: {
    scanScooterCode() {
      uni.scanCode({
        success: (res) => {
          this.scooterCode = this.extractScooterCode(res.result)
          uni.showToast({
            title: '扫码成功',
            icon: 'success'
          })
        },
        fail: () => {
          uni.showToast({
            title: '扫码失败，请重试',
            icon: 'none'
          })
        }
      })
    },
    extractScooterCode(rawCode) {
      const value = String(rawCode || '').trim()
      if (!value) {
        return ''
      }

      const segments = value.split('/')
      return segments[segments.length - 1] || value
    },
    chooseImage() {
      const remainingCount = this.maxPhotos - this.photos.length
      uni.chooseImage({
        count: remainingCount,
        sourceType: ['camera', 'album'],
        success: (res) => {
          this.photos = [...this.photos, ...res.tempFilePaths]
        },
        fail: () => {
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          })
        }
      })
    },
    deletePhoto(index) {
      this.photos.splice(index, 1)
    },
    async submitReport() {
      if (!this.scooterCode.trim()) {
        uni.showToast({
          title: '请输入车辆编号',
          icon: 'none'
        })
        return
      }

      if (!this.faultReason.trim()) {
        uni.showToast({
          title: '请填写故障原因',
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({
          title: '提交中...'
        })

        let scooterId = Number(this.scooterCode.trim())
        if (!Number.isFinite(scooterId)) {
          const scooterRes = await getScooterInfo(this.scooterCode.trim())
          scooterId = Number(scooterRes.data && scooterRes.data.id) || 0
        }

        await reportFault({
          scooterId,
          scooterCode: this.scooterCode.trim(),
          description: this.faultReason.trim(),
          image: ''
        })

        uni.hideLoading()
        uni.showModal({
          title: '提交成功',
          content: '感谢你的反馈，我们会尽快处理。',
          showCancel: false,
          success: () => {
            uni.navigateTo({
              url: '/pages/faults/faults'
            })
          }
        })
      } catch (error) {
        uni.hideLoading()
      }
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

.form-section {
  padding: 32rpx;
}

.form-item {
  margin-bottom: 32rpx;
  background-color: #ffffff;
  padding: 40rpx 32rpx;
  border: 1rpx solid #e5e5e2;
}

.form-label {
  font-size: 26rpx;
  color: #0b0e0d;
  font-weight: 400;
  display: block;
  margin-bottom: 24rpx;
  letter-spacing: 2rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.input {
  flex: 1;
  height: 88rpx;
  background-color: #fafaf8;
  border-radius: 0;
  padding: 0 28rpx;
  font-size: 28rpx;
  border: 1rpx solid #e5e5e2;
  color: #0b0e0d;
  font-weight: 400;
}

.scan-btn {
  background-color: transparent;
  color: #0b0e0d;
  border: 1rpx solid #d4d4d1;
  border-radius: 0;
  padding: 0 40rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  font-size: 26rpx;
  font-weight: 300;
  box-shadow: none;
  letter-spacing: 2rpx;
}

.textarea {
  width: 100%;
  min-height: 240rpx;
  background-color: #fafaf8;
  border-radius: 0;
  padding: 24rpx 28rpx;
  font-size: 28rpx;
  line-height: 1.8;
  border: 1rpx solid #e5e5e2;
  color: #0b0e0d;
  font-weight: 400;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #737373;
  margin-top: 12rpx;
  font-weight: 300;
}

.upload-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.photo-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  overflow: hidden;
  border: 1rpx solid #e5e5e2;
}

.photo-image {
  width: 100%;
  height: 100%;
}

.photo-delete {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 48rpx;
  height: 48rpx;
  background-color: rgba(11, 14, 13, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 300;
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  background-color: #fafaf8;
  border: 1rpx dashed #d4d4d1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-text {
  font-size: 24rpx;
  color: #737373;
  font-weight: 300;
  letter-spacing: 2rpx;
}

.upload-tip {
  display: block;
  font-size: 22rpx;
  color: #737373;
  margin-top: 16rpx;
  font-weight: 300;
}

.submit-section {
  margin-top: 64rpx;
}

.submit-btn {
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

.history-link {
  margin-top: 40rpx;
  padding: 40rpx 32rpx;
  text-align: center;
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
}

.link-text {
  font-size: 28rpx;
  color: #737373;
  font-weight: 300;
  letter-spacing: 2rpx;
}
</style>
