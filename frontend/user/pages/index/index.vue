<template>
  <view class="page">
    <!-- Header -->
    <view class="header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <image class="avatar" src="/static/avatar.png" mode="aspectFit" @click="navigateToProfile"></image>
    </view>

    <!-- Map Area -->
    <view class="map-container">
      <map 
        class="map" 
        id="map"
        :latitude="latitude" 
        :longitude="longitude"
        :scale="scale"
        :markers="markers"
        :polygons="polygons"
        :show-location="true"
        @regionchange="onRegionChange"
      ></map>
    </view>

    <!-- Scan Unlock Button -->
    <view class="unlock-section">
      <button class="unlock-btn" @click="scanUnlock">
        <text class="unlock-btn-text">扫码开锁</text>
      </button>
    </view>

    <!-- Function Area -->
    <view class="function-area">
      <view class="function-item" @click="navigateTo('parking')">
        <text class="function-text">搜停车点</text>
      </view>
      <text class="function-divider">|</text>
      <view class="function-item" @click="navigateTo('fault')">
        <text class="function-text">故障上报</text>
      </view>
      <text class="function-divider">|</text>
      <view class="function-item" @click="navigateTo('unlock')">
        <text class="function-text">编号开锁</text>
      </view>
      <text class="function-divider">|</text>
      <view class="function-item" @click="navigateTo('notice')">
        <text class="function-text">骑行须知</text>
      </view>
    </view>

    <!-- Subscription Area -->
    <view class="subscription-area">
      <view class="subscription-header">
        <text class="subscription-title">优惠购卡</text>
        <text class="subscription-more">查看更多</text>
      </view>
      <view class="subscription-list">
        <view v-for="(pkg, index) in subscriptionPackages" :key="index" class="subscription-item">
          <view class="subscription-info">
            <text class="subscription-name">{{pkg.title}}</text>
            <text class="subscription-desc">{{pkg.description}}</text>
            <text class="subscription-price">¥{{pkg.price}}</text>
          </view>
          <button class="subscription-btn">立即购买</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // Map data
      latitude: 39.9042,
      longitude: 116.4074,
      scale: 16,
      markers: [],
      polygons: [],
      
      // Mock data for subscriptions
      subscriptionPackages: [
        { id: 1, title: '月卡', description: '30天无限骑行', price: 29.9 },
        { id: 2, title: '季卡', description: '90天无限骑行', price: 79.9 },
        { id: 3, title: '年卡', description: '365天无限骑行', price: 299.9 }
      ]
    };
  },
  onLoad() {
    this.getLocationPermission();
  },
  methods: {
    getLocationPermission() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          console.log('Location permission granted:', res);
          this.latitude = res.latitude;
          this.longitude = res.longitude;
          this.loadMockMapData();
        },
        fail: (err) => {
          console.log('Location permission denied:', err);
          uni.showToast({
            title: '需要位置权限才能使用地图功能',
            icon: 'none'
          });
        }
      });
    },
    loadMockMapData() {
      this.markers = [
        {
          id: 1,
          latitude: this.latitude + 0.001,
          longitude: this.longitude + 0.001,
          iconPath: '/static/scooter.svg',
          width: 30,
          height: 30,
          callout: {
            content: '85%',
            color: '#333',
            fontSize: 12,
            borderRadius: 5,
            bgColor: 'rgba(255,255,255,0.8)',
            padding: 5
          }
        },
        {
          id: 2,
          latitude: this.latitude - 0.001,
          longitude: this.longitude - 0.001,
          iconPath: '/static/scooter.svg',
          width: 30,
          height: 30,
          callout: {
            content: '60%',
            color: '#333',
            fontSize: 12,
            borderRadius: 5,
            bgColor: 'rgba(255,255,255,0.8)',
            padding: 5
          }
        }
      ];
      
      this.polygons = [
        {
          points: [
            {
              latitude: this.latitude + 0.002,
              longitude: this.longitude + 0.002
            },
            {
              latitude: this.latitude + 0.002,
              longitude: this.longitude - 0.002
            },
            {
              latitude: this.latitude - 0.002,
              longitude: this.longitude - 0.002
            },
            {
              latitude: this.latitude - 0.002,
              longitude: this.longitude + 0.002
            }
          ],
          fillColor: 'rgba(255, 0, 0, 0.3)',
          strokeColor: 'rgba(255, 0, 0, 0.6)',
          strokeWidth: 2
        }
      ];
    },
    onRegionChange(e) {
      console.log('Map region changed:', e);
    },
    scanUnlock() {
      uni.scanCode({
        success: (res) => {
          console.log('Scan result:', res);
          // Here you would call the unlock API with the scanned code
          uni.showToast({
            title: '扫码成功，正在开锁...',
            icon: 'success'
          });
        },
        fail: (err) => {
          console.log('Scan failed:', err);
          uni.showToast({
            title: '扫码失败，请重试',
            icon: 'none'
          });
        }
      });
    },
    navigateTo(page) {
      if (page === 'fault') {
        uni.navigateTo({
          url: '/pages/reportFault/reportFault'
        });
      } else if (page === 'parking') {
        uni.showToast({
          title: '停车点功能暂未开放',
          icon: 'none'
        });
      } else if (page === 'unlock') {
        uni.navigateTo({
          url: '/pages/unlock/unlock'
        });
      } else if (page === 'notice') {
        uni.showToast({
          title: '骑行须知功能暂未开放',
          icon: 'none'
        });
      } else {
        uni.showToast({
          title: `跳转到${page}页面`,
          icon: 'none'
        });
      }
    },

    navigateToProfile() {
      uni.navigateTo({
        url: '/pages/profile/profile'
      });
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
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e5e5e2;
}

.logo {
  width: 80rpx;
  height: 80rpx;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar:hover {
  opacity: 0.7;
}

/* Map Area */
.map-container {
  width: 100%;
  height: 520rpx;
  background-color: #ffffff;
  position: relative;
  overflow: hidden;
  border-bottom: 1rpx solid #e5e5e2;
}

.map {
  width: 100%;
  height: 100%;
}

/* Unlock Section */
.unlock-section {
  padding-top: 32rpx;
  background-color: #ffffff;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.unlock-btn {
  width: 85%;
  height: 96rpx;
  background-color: #0b0e0d;
  color: #ffffff;
  border-radius: 5;
  font-size: 32rpx;
  font-weight: 300;
  border: none;
  box-shadow: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 4rpx;
}

.unlock-btn:hover {
  background-color: #222222;
  transform: translateY(-2rpx);
}

.unlock-btn-text {
  color: #ffffff;
}

/* Function Area */
.function-area {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24rpx 0;
  background-color: #ffffff;
  margin: 0;
}

.function-item {
  display: flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.function-item:hover {
  color: #0b0e0d;
}

.function-text {
  font-size: 26rpx;
  color: #525252;
  font-weight: 300;
  letter-spacing: 2rpx;
}

.function-divider {
  font-size: 20rpx;
  color: #e5e5e2;
  margin: 0 16rpx;
}

/* Subscription Area */
.subscription-area {
  background-color: #ffffff;
  margin: 0;
  padding: 64rpx 32rpx;
  flex: 1;
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #e5e5e2;
}

.subscription-title {
  font-size: 30rpx;
  font-weight: 400;
  color: #0b0e0d;
  letter-spacing: 4rpx;
}

.subscription-more {
  font-size: 24rpx;
  color: #737373;
  font-weight: 300;
  letter-spacing: 2rpx;
}

.subscription-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.subscription-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border: 1rpx solid #e5e5e2;
  border-radius: 0;
  background-color: #fafaf8;
  box-shadow: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.subscription-item:hover {
  transform: translateY(-4rpx);
  border-color: #d4d4d1;
  background-color: #ffffff;
}

.subscription-info {
  flex: 1;
}

.subscription-name {
  font-size: 28rpx;
  font-weight: 400;
  color: #0b0e0d;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}

.subscription-desc {
  font-size: 22rpx;
  color: #737373;
  margin-bottom: 16rpx;
  line-height: 1.6;
  font-weight: 300;
}

.subscription-price {
  font-size: 32rpx;
  font-weight: 400;
  color: #0b0e0d;
  letter-spacing: 2rpx;
}

.subscription-btn {
  background-color: transparent;
  color: #0b0e0d;
  border: 1rpx solid #d4d4d1;
  padding: 20rpx 48rpx;
  border-radius: 0;
  font-size: 24rpx;
  font-weight: 300;
  box-shadow: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 2rpx;
}

.subscription-btn:hover {
  background-color: #0b0e0d;
  color: #ffffff;
  border-color: #0b0e0d;
  transform: translateY(-2rpx);
}
</style>