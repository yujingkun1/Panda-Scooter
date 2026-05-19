<template>
  <view class="page">
    <view class="hero">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title">隐私政策</text>
      <text class="subtitle">本页用于说明我们如何收集、使用和保护您的信息</text>
    </view>

    <view class="card">
      <view class="section">
        <text class="section-title">一、我们会收集的信息</text>
        <text class="section-text">在您注册、登录、使用骑行和支付相关功能时，可能会收集邮箱、昵称、设备信息、位置信息以及必要的业务操作记录。</text>
      </view>
      <view class="section">
        <text class="section-title">二、信息的使用方式</text>
        <text class="section-text">这些信息仅用于账号登录、身份验证、车辆调度、骑行服务、故障处理与账单展示等与业务直接相关的用途。</text>
      </view>
      <view class="section">
        <text class="section-title">三、信息保护</text>
        <text class="section-text">我们会采取合理的安全措施保护您的信息，未经您的授权，不会向无关第三方提供您的个人信息，法律法规另有规定的除外。</text>
      </view>
      <view class="section">
        <text class="section-title">四、您的权利</text>
        <text class="section-text">您可以通过账号管理页面查看、修改或删除部分个人信息，也可以联系平台处理与隐私有关的请求。</text>
      </view>
      <view class="section">
        <text class="section-title">五、联系我们</text>
        <text class="section-text">如您对隐私政策有任何疑问，可通过平台客服或项目指定联系方式咨询。</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {}
</script>

<style>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fafaf8 0%, #f0efe8 100%);
  padding: 48rpx 32rpx 64rpx;
}

.hero {
  padding: 32rpx 16rpx 40rpx;
  text-align: center;
}

.logo {
  width: 96rpx;
  height: 96rpx;
  margin-bottom: 24rpx;
}

.title {
  display: block;
  font-size: 44rpx;
  color: #0b0e0d;
  font-weight: 500;
  letter-spacing: 4rpx;
}

.subtitle {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #737373;
  line-height: 1.6;
}

.card {
  background-color: #ffffff;
  border: 1rpx solid #e5e5e2;
  padding: 32rpx;
}

.section + .section {
  margin-top: 28rpx;
}

.section-title {
  display: block;
  margin-bottom: 12rpx;
  font-size: 28rpx;
  color: #0b0e0d;
  font-weight: 500;
}

.section-text {
  display: block;
  font-size: 24rpx;
  color: #525252;
  line-height: 1.8;
}
</style>
