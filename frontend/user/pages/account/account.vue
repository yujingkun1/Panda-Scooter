<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <text class="title">账号管理</text>
    </view>

    <!-- Account Info -->
    <view class="info-section">
      <view class="info-item">
        <text class="info-label">用户名</text>
        <text class="info-value">{{ userInfo.username }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">邮箱</text>
        <text class="info-value">{{ userInfo.email }}</text>
      </view>
    </view>

    <!-- Action Buttons -->
    <view class="action-section">
      <view class="action-item" @click="changePassword">
        <text class="action-text">修改密码</text>
        <text class="action-arrow">›</text>
      </view>
      <view class="action-item" @click="logout">
        <text class="action-text logout-text">退出登录</text>
      </view>
      <view class="action-item" @click="deleteAccount">
        <text class="action-text delete-text">账号注销</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        username: '用户名',
        email: 'user@example.com'
      }
    }
  },
  onLoad() {
    this.getUserInfo();
  },
  methods: {
    getUserInfo() {
      uni.getStorage({
        key: 'userInfo',
        success: (res) => {
          if (res.data) {
            this.userInfo = res.data;
          }
        }
      });
    },
    changePassword() {
      uni.showModal({
        title: '修改密码',
        content: '此功能暂未开放',
        showCancel: false
      });
    },
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorage({
              key: 'token',
              success: () => {
                uni.showToast({
                  title: '已退出登录',
                  icon: 'success'
                });
                setTimeout(() => {
                  uni.reLaunch({
                    url: '/pages/index/index'
                  });
                }, 1500);
              }
            });
          }
        }
      });
    },
    deleteAccount() {
      uni.showModal({
        title: '账号注销',
        content: '注销账号后，您的所有数据将被永久删除，且无法恢复。确定要注销账号吗？',
        confirmText: '确定注销',
        confirmColor: '#ff4d4f',
        success: (res) => {
          if (res.confirm) {
            uni.showModal({
              title: '再次确认',
              content: '账号注销后无法恢复，请再次确认是否注销',
              confirmText: '确定',
              confirmColor: '#ff4d4f',
              success: (confirmRes) => {
                if (confirmRes.confirm) {
                  this.performDeleteAccount();
                }
              }
            });
          }
        }
      });
    },
    performDeleteAccount() {
      uni.showLoading({
        title: '注销中...'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        uni.removeStorage({
          key: 'token',
          complete: () => {
            uni.showToast({
              title: '账号已注销',
              icon: 'success'
            });
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index'
              });
            }, 1500);
          }
        });
      }, 1000);
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

/* Info Section */
.info-section {
  margin: 32rpx;
  background-color: #ffffff;
  border-radius: 0;
  box-shadow: none;
  border: 1rpx solid #e5e5e2;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 32rpx;
  border-bottom: 1rpx solid #e5e5e2;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 26rpx;
  color: #737373;
  font-weight: 300;
  letter-spacing: 2rpx;
}

.info-value {
  font-size: 26rpx;
  color: #0b0e0d;
  font-weight: 400;
  letter-spacing: 2rpx;
}

/* Action Section */
.action-section {
  margin: 32rpx;
  background-color: #ffffff;
  border-radius: 0;
  box-shadow: none;
  border: 1rpx solid #e5e5e2;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 32rpx;
  border-bottom: 1rpx solid #e5e5e2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.action-item:last-child {
  border-bottom: none;
}

.action-item:hover {
  background-color: #fafaf8;
}

.action-text {
  font-size: 28rpx;
  color: #0b0e0d;
  font-weight: 400;
  flex: 1;
  letter-spacing: 2rpx;
}

.logout-text {
  color: #a67c00;
  text-align: center;
  font-weight: 400;
}

.delete-text {
  color: #8b0000;
  text-align: center;
  font-weight: 400;
}

.action-arrow {
  font-size: 32rpx;
  color: #d4d4d1;
  font-weight: 300;
}
</style>
