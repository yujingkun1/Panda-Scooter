/*
 Navicat Premium Dump SQL

 Source Server         : 本机MySQL
 Source Server Type    : MySQL
 Source Server Version : 80042 (8.0.42)
 Source Host           : localhost:3306
 Source Schema         : bike_system

 Target Server Type    : MySQL
 Target Server Version : 80042 (8.0.42)
 File Encoding         : 65001

 Date: 24/03/2026 20:40:09
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for area
-- ----------------------------
DROP TABLE IF EXISTS `area`;
CREATE TABLE `area`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '区域名称',
  `polygon` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '多边形范围坐标',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '运营片区表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of area
-- ----------------------------

-- ----------------------------
-- Table structure for dispatch_record
-- ----------------------------
DROP TABLE IF EXISTS `dispatch_record`;
CREATE TABLE `dispatch_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dispatcher_id` bigint NOT NULL COMMENT '调度员ID',
  `scooter_id` bigint NOT NULL COMMENT '单车ID',
  `end_time` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_dispatcher`(`dispatcher_id` ASC) USING BTREE,
  INDEX `idx_scooter`(`scooter_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dispatch_record
-- ----------------------------

-- ----------------------------
-- Table structure for dispatcher
-- ----------------------------
DROP TABLE IF EXISTS `dispatcher`;
CREATE TABLE `dispatcher`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '姓名',
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
  `email` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '邮箱',
  `area_id` bigint NULL DEFAULT NULL COMMENT '所属区域ID',
  `status` tinyint NULL DEFAULT 0 COMMENT '调度员状态：0-审核中，1-已通过，2-未通过',
  `create_time` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_area_id`(`area_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '调度员信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dispatcher
-- ----------------------------

-- ----------------------------
-- Table structure for fault_report
-- ----------------------------
DROP TABLE IF EXISTS `fault_report`;
CREATE TABLE `fault_report`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `scooter_id` bigint NOT NULL COMMENT '车辆ID',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '故障描述',
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '图片链接',
  `status` tinyint NULL DEFAULT 0 COMMENT '处理状态：0-未处理，1-已处理',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '故障上报表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of fault_report
-- ----------------------------

-- ----------------------------
-- Table structure for no_parking_area
-- ----------------------------
DROP TABLE IF EXISTS `no_parking_area`;
CREATE TABLE `no_parking_area`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '禁停区名称',
  `polygon` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '禁停多边形范围坐标',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '禁停区表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of no_parking_area
-- ----------------------------

-- ----------------------------
-- Table structure for package_order
-- ----------------------------
DROP TABLE IF EXISTS `package_order`;
CREATE TABLE `package_order`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `package_id` bigint NOT NULL COMMENT '套餐ID',
  `price` decimal(10, 2) NOT NULL COMMENT '购买价格',
  `order_status` tinyint NULL DEFAULT 0 COMMENT '订单状态：0-待支付，1-已结束',
  `pay_status` tinyint NULL DEFAULT 0 COMMENT '支付状态：0-未付，1-已付',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '套餐购买订单表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of package_order
-- ----------------------------

-- ----------------------------
-- Table structure for parking_point
-- ----------------------------
DROP TABLE IF EXISTS `parking_point`;
CREATE TABLE `parking_point`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '停放点名称',
  `latitude` decimal(10, 6) NOT NULL COMMENT '中心纬度',
  `longitude` decimal(10, 6) NOT NULL COMMENT '中心经度',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态：0禁用 1启用',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of parking_point
-- ----------------------------

-- ----------------------------
-- Table structure for pricing_rule
-- ----------------------------
DROP TABLE IF EXISTS `pricing_rule`;
CREATE TABLE `pricing_rule`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `price_per_min` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '每分钟单价',
  `base_price` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '起步价',
  `billing_interval` int NULL DEFAULT 30 COMMENT '计费间隔（分钟）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '计费规则表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of pricing_rule
-- ----------------------------

-- ----------------------------
-- Table structure for rental_order
-- ----------------------------
DROP TABLE IF EXISTS `rental_order`;
CREATE TABLE `rental_order`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `scooter_id` bigint NOT NULL COMMENT '车辆ID',
  `start_time` datetime NULL DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `total_time` int NULL DEFAULT 0 COMMENT '骑行总时长（单位：分钟）',
  `order_status` tinyint NULL DEFAULT 0 COMMENT '订单状态：0-骑行中，1-待支付，2-已结束',
  `pay_status` tinyint NULL DEFAULT 0 COMMENT '支付状态：0-未支付，1-已支付',
  `amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '金额',
  `total_kilometer` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '总里程',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_scooter_id`(`scooter_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '骑行租赁订单表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rental_order
-- ----------------------------

-- ----------------------------
-- Table structure for scooter
-- ----------------------------
DROP TABLE IF EXISTS `scooter`;
CREATE TABLE `scooter`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '车辆编码',
  `battery` int NULL DEFAULT 100 COMMENT '电量',
  `latitude` decimal(10, 6) NULL DEFAULT NULL COMMENT '纬度',
  `longitude` decimal(10, 6) NULL DEFAULT NULL COMMENT '经度',
  `ride_status` tinyint NULL DEFAULT 0 COMMENT '骑行状态：0空闲 1使用中',
  `fault_status` tinyint NULL DEFAULT 0 COMMENT '故障状态：0正常 1故障',
  `create_time` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '滑板车信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of scooter
-- ----------------------------

-- ----------------------------
-- Table structure for subscription_package
-- ----------------------------
DROP TABLE IF EXISTS `subscription_package`;
CREATE TABLE `subscription_package`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '套餐标题',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '套餐描述',
  `price` decimal(10, 2) NOT NULL COMMENT '价格',
  `type` tinyint NULL DEFAULT 1 COMMENT '类型：1-月卡，2-季卡，3-年卡',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '订阅套餐表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of subscription_package
-- ----------------------------

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
  `email` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '电子邮箱',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------

-- ----------------------------
-- Table structure for user_bill
-- ----------------------------
DROP TABLE IF EXISTS `user_bill`;
CREATE TABLE `user_bill`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `type` tinyint NOT NULL COMMENT '流水类型：1-骑行消费，2-充值，3-退款，4-购买套餐',
  `amount` decimal(10, 2) NOT NULL COMMENT '变动金额（正数为进账，负数为支出）',
  `balance_after` decimal(10, 2) NOT NULL COMMENT '变动后账户余额（用于对账）',
  `order_id` bigint NULL DEFAULT NULL COMMENT '业务订单ID',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '流水备注（如：骑行订单1002扣费）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_order_id`(`order_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户账单流水表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_bill
-- ----------------------------

-- ----------------------------
-- Table structure for user_subscription
-- ----------------------------
DROP TABLE IF EXISTS `user_subscription`;
CREATE TABLE `user_subscription`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `package_id` bigint NOT NULL COMMENT '套餐ID',
  `start_time` datetime NULL DEFAULT NULL COMMENT '生效开始时间',
  `end_time` datetime NULL DEFAULT NULL COMMENT '生效结束时间',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态：1-有效，0-过期',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户订阅关系表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_subscription
-- ----------------------------

-- ----------------------------
-- Table structure for user_wallet
-- ----------------------------
DROP TABLE IF EXISTS `user_wallet`;
CREATE TABLE `user_wallet`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `balance` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '余额',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户钱包表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_wallet
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
