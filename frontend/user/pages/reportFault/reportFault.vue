<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <text class="title">故障上报</text>
    </view>

    <!-- Form Section -->
    <view class="form-section">
      <!-- Scooter Code Input -->
      <view class="form-item">
        <text class="form-label">单车编号 *</text>
        <view class="input-wrapper">
          <input 
            class="input" 
            v-model="scooterCode"
            placeholder="请输入或扫码获取单车编号"
            :maxlength="10"
          />
          <button class="scan-btn" @click="scanScooterCode">
            <text class="scan-icon">📷</text>
            <text class="scan-text">扫码</text>
          </button>
        </view>
      </view>

      <!-- Fault Reason Input -->
      <view class="form-item">
        <text class="form-label">故障原因 *</text>
        <textarea 
          class="textarea"
          v-model="faultReason"
          placeholder="请详细描述故障情况，如：刹车失灵、车胎漏气等"
          :maxlength="200"
          :auto-height="true"
        />
        <text class="char-count">{{ faultReason.length }}/200</text>
      </view>

      <!-- Photo Upload -->
      <view class="form-item">
        <text class="form-label">上传照片</text>
        <view class="upload-section">
          <view 
            v-for="(photo, index) in photos" 
            :key="index" 
            class="photo-item"
          >
            <image class="photo-image" :src="photo" mode="aspectFill" />
            <view class="photo-delete" @click="deletePhoto(index)">
              <text class="delete-icon">×</text>
            </view>
          </view>
          
          <view v-if="photos.length < 3" class="upload-btn" @click="takePhoto">
            <text class="upload-icon">📸</text>
            <text class="upload-text">拍照</text>
          </view>
        </view>
        <text class="upload-tip">最多可上传 3 张照片</text>
      </view>

      <!-- Submit Button -->
      <view class="submit-section">
        <button class="submit-btn" @click="submitReport">确认提交</button>
      </view>

      <!-- History Link -->
      <view class="history-link" @click="navigateToHistory">
        <text class="link-text">查看历史上报记录 ›</text>
      </view>
    </view>
  </view>
</template>

<script>
import { reportFault } from '@/api/index'

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
    // 扫码获取单车编号
    scanScooterCode() {
      uni.scanCode({
        success: (res) => {
          console.log('扫码结果:', res.result)
          this.scooterCode = res.result
          uni.showToast({
            title: '扫码成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('扫码失败:', err)
          uni.showToast({
            title: '扫码失败，请重试',
            icon: 'none'
          })
        }
      })
    },

    // 拍照上传
    takePhoto() {
      if (this.photos.length >= this.maxPhotos) {
        uni.showToast({
          title: '最多上传 3 张照片',
          icon: 'none'
        })
        return
      }

      // 申请摄像头权限并拍照
      uni.authorize({
        scope: 'scope.camera',
        success: () => {
          this.chooseImage()
        },
        fail: () => {
          // 用户拒绝授权，引导打开设置
          uni.showModal({
            title: '提示',
            content: '需要摄像头权限才能拍照，是否前往设置？',
            success: (res) => {
              if (res.confirm) {
                uni.openSetting()
              }
            }
          })
        }
      })
    },

    // 选择图片（拍照或从相册选择）
    chooseImage() {
      const remainingCount = this.maxPhotos - this.photos.length
      
      uni.chooseImage({
        count: remainingCount,
        sourceType: ['camera', 'album'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths
          // 将图片添加到数组
          this.photos = [...this.photos, ...tempFilePaths]
          
          // TODO: 这里可以上传图片到服务器
          // this.uploadImages(tempFilePaths)
        },
        fail: (err) => {
          console.error('选择图片失败:', err)
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          })
        }
      })
    },

    // 删除照片
    deletePhoto(index) {
      uni.showModal({
        title: '提示',
        content: '确定要删除这张照片吗？',
        success: (res) => {
          if (res.confirm) {
            this.photos.splice(index, 1)
          }
        }
      })
    },

    // 上传图片到服务器（可选）
    async uploadImages(filePaths) {
      // TODO: 实现图片上传逻辑
      // 可以使用 uni.uploadFile
      console.log('上传图片:', filePaths)
    },

    // 提交故障报告
    async submitReport() {
      // 验证必填项
      if (!this.scooterCode.trim()) {
        uni.showToast({
          title: '请输入单车编号',
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

        // 准备提交数据
        const reportData = {
          scooterCode: this.scooterCode.trim(),
          reason: this.faultReason.trim(),
          photoUrls: this.photos // TODO: 实际应该是上传后的图片 URL
        }

        // TODO: 调用 API 提交故障报告
        // const res = await reportFault(reportData)

        // 模拟提交成功
        await new Promise(resolve => setTimeout(resolve, 1500))

        uni.hideLoading()
        
        uni.showModal({
          title: '提交成功',
          content: '感谢您的反馈，我们会尽快处理！',
          showCancel: false,
          success: () => {
            // 跳转到故障记录页面
            uni.navigateTo({
              url: '/pages/faults/faults'
            })
          }
        })

      } catch (error) {
        uni.hideLoading()
        console.error('提交失败:', error)
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      }
    },

    // 跳转到故障记录页面
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

/* Form Section */
.form-section {
  padding: 32rpx;
}

.form-item {
  margin-bottom: 32rpx;
  background-color: #ffffff;
  border-radius: 0;
  padding: 40rpx 32rpx;
  box-shadow: none;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #0b0e0d;
  font-weight: 400;
}

.input:focus {
  background-color: #ffffff;
  border-color: #0b0e0d;
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
  gap: 12rpx;
  font-size: 26rpx;
  font-weight: 300;
  box-shadow: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 2rpx;
}

.scan-btn:hover {
  border-color: #0b0e0d;
  background-color: #0b0e0d;
  color: #ffffff;
}

.scan-icon {
  font-size: 32rpx;
  font-style: normal;
}

.scan-text {
  font-weight: 300;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #0b0e0d;
  font-weight: 400;
}

.textarea:focus {
  background-color: #ffffff;
  border-color: #0b0e0d;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #737373;
  margin-top: 12rpx;
  font-weight: 300;
}

/* Upload Section */
.upload-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.photo-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 0;
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
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.photo-delete:hover {
  background-color: rgba(11, 14, 13, 1);
}

.delete-icon {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 300;
  font-style: normal;
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  background-color: #fafaf8;
  border: 1rpx dashed #d4d4d1;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-btn:hover {
  background-color: #f5f5f3;
  border-color: #0b0e0d;
}

.upload-icon {
  font-size: 48rpx;
  color: #737373;
  font-style: normal;
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
  letter-spacing: 2rpx;
}

/* Submit Button */
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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 4rpx;
}

.submit-btn:hover {
  background-color: #222222;
  transform: translateY(-2rpx);
}

/* History Link */
.history-link {
  margin-top: 40rpx;
  padding: 40rpx 32rpx;
  text-align: center;
  background-color: #ffffff;
  border-radius: 0;
  box-shadow: none;
  border: 1rpx solid #e5e5e2;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.history-link:hover {
  border-color: #0b0e0d;
}

.link-text {
  font-size: 28rpx;
  color: #737373;
  font-weight: 300;
  letter-spacing: 2rpx;
}

.history-link:hover .link-text {
  color: #0b0e0d;
}
</style>
