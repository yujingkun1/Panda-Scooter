<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <image class="avatar" src="/static/avatar.png" mode="aspectFit"></image>
      <view class="user-info">
        <text class="username">用户名</text>
        <text class="email">user@example.com</text>
      </view>
      <view class="account-manage" @click="accountManage">
        <text class="manage-text">账号管理</text>
      </view>
    </view>

    <!-- Stats Section -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-value">123.45</text>
        <text class="stat-label">总里程(km)</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">8.5</text>
        <text class="stat-label">骑行时长(h)</text>
      </view>
    </view>

    <!-- Menu Section -->
    <view class="menu-section">
      <view class="menu-item" @click="navigateTo('wallet')">
        <text class="menu-text">我的钱包</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="navigateTo('history')">
        <text class="menu-text">历史行程</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="navigateTo('faults')">
        <text class="menu-text">故障上报记录</text>
        <text class="menu-arrow">›</text>
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
        email: 'user@example.com',
        totalKilometer: '123.45',
        totalTime: '8.5'
      }
    }
  },
  onLoad() {
    this.getUserInfo();
  },
  methods: {
    getUserInfo() {
      // 这里可以调用API获取用户信息
      console.log('获取用户信息');
    },
    accountManage() {
      uni.navigateTo({
        url: '/pages/account/account'
      });
    },
    navigateTo(page) {
      if (page === 'wallet') {
        uni.navigateTo({
          url: '/pages/wallet/wallet'
        });
      } else if (page === 'history') {
        uni.navigateTo({
          url: '/pages/history/history'
        });
      } else if (page === 'faults') {
        uni.navigateTo({
          url: '/pages/faults/faults'
        });
      } else {
        uni.showToast({
          title: `跳转到${page}页面`,
          icon: 'none'
        });
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
  display: flex;
  align-items: center;
  padding: 48rpx 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e2;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 0;
  margin-right: 32rpx;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 32rpx;
  font-weight: 400;
  color: #0b0e0d;
  margin-bottom: 12rpx;
  display: block;
  letter-spacing: 2rpx;
}

.email {
  font-size: 24rpx;
  color: #737373;
  display: block;
  font-weight: 300;
}

.account-manage {
  padding: 16rpx 32rpx;
  border: 1rpx solid #d4d4d1;
  border-radius: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.account-manage:hover {
  border-color: #0b0e0d;
  background-color: #0b0e0d;
}

.manage-text {
  font-size: 24rpx;
  color: #525252;
  font-weight: 300;
  letter-spacing: 2rpx;
}

.account-manage:hover .manage-text {
  color: #ffffff;
}

/* Stats Section */
.stats-section {
  display: flex;
  margin: 32rpx;
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 300;
  color: #0b0e0d;
  margin-bottom: 16rpx;
  letter-spacing: 2rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #737373;
  font-weight: 300;
  letter-spacing: 2rpx;
}

.stat-divider {
  width: 1rpx;
  background-color: #e5e5e2;
  margin: 16rpx 0;
}

/* Menu Section */
.menu-section {
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
  margin: 0 32rpx 32rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 40rpx 32rpx;
  border-bottom: 1rpx solid #e5e5e2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background-color: #fafaf8;
}

.menu-icon {
  font-size: 32rpx;
  margin-right: 24rpx;
  font-style: normal;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #0b0e0d;
  font-weight: 400;
  letter-spacing: 2rpx;
}

.menu-arrow {
  font-size: 32rpx;
  color: #d4d4d1;
  font-weight: 300;
}
</style>
