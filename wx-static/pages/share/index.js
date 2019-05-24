let app = getApp();
let utils = require('../../utils/util.js')
Page({

  data: {
    userInfo: {},       //用户信息
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    beginDraw: false,   //绘制图片
    isDraw: false,
    canvasW: 300,
    canvasH: 300,
    imageUrl:'../../img/wx_bg.png'    //绘制完成后的图片   
  },

  onShow: function (options) {
    // 显示转发按钮
    wx.showShareMenu({
      withShareTicket: true
    })
    // 获取用户是否授权
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }

    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
    // 设置转发属性
    return {
      title: `小游戏组团`,
      path: `/pages/share/index`,
      imageUrl: this.data.imageUrl,
    }

  },

   // 设置转发动态消息
   setShareMsg(){
     utils.service({
       url: `http://${utils.defaultip}:3000/share/creatid`,
       data: {}
     }).then((res) => {
       // console.log(res, " :获取消息id成功")
       let activity_id = res.activity_id;

       wx.updateShareMenu({
         withShareTicket: true,
         isUpdatableMessage: true,
         activityId: activity_id, // 活动消息 ID
         targetState: 0,
         templateInfo: {
           parameterList: [{
             name: 'member_count',
             value: '1'
           }, {
             name: 'room_limit',
             value: '3'
           }]
         },
         success: (res) => {
           // console.log('更新消息成功', res)
         },
         fail: (err) => {
           // console.log('更新消息失败', err)
         }

       });

     }).catch((err) => {
       console.log(err, " :获取消息id失败")
     })

   },

  // 获取用户授权
  getUserInfo: function (e) {
    // 判断是否授权成功  授权成功 则绘制转发背景图
    if (e.detail.userInfo){
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
          userInfo: e.detail.userInfo,
          hasUserInfo: true
        })

        this.beginDraw = true
        this.draw(({ tempFilePath }) => {
          this.setData({
            imageUrl: tempFilePath
          })
        })
       // 设置转发动态消息
      this.setShareMsg();
    }
    
  },

  getImageInfo(url) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: url,
        success: resolve,
        fail: reject,
      })
    })
  },
  canvasToTempFilePath(option, context) {
    return new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        ...option,
        success: resolve,
        fail: reject,
      }, context)
    })
  },
  saveImageToPhotosAlbum(option) {
    return new Promise((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        ...option,
        success: resolve,
        fail: reject,
      })
    })
  },
 
  //绘制图片
  draw(callback) {

    wx.showLoading()
    const { userInfo, canvasW, canvasH } = this.data
    const { avatarUrl, nickName } = userInfo
    const avatarPromise = this.getImageInfo(avatarUrl)

    Promise.all([avatarPromise]).then(([avatar, background]) => {

        const ctx = wx.createCanvasContext('share', this)
        // 绘制背景
        ctx.drawImage(
          '../../img/wx_bg.png',
          0,
          0,
          canvasW,
          canvasH,
        )

        // 绘制头像
        const radius = 45 * 1
        const y = 120 * 2

        ctx.save() // 对当前区域保存
        ctx.beginPath() // 开始新的区域
        ctx.arc(canvasW / 2, y / 2, radius, 0, 2 * Math.PI);
        ctx.clip();  // 从画布上裁剪出这个圆形
        ctx.drawImage(
          avatar.path,
          canvasW / 2 - radius,
          y / 2 - radius,
          radius * 2,
          radius * 2,
        ) // 把图片填充进裁剪的圆形
        ctx.restore() // 恢复

        ctx.setTextAlign('center')
        ctx.setFillStyle('#fff')
        ctx.setFontSize(20)
        ctx.save()
        ctx.beginPath();
        ctx.fillText(
          nickName,
          canvasW / 2,
          y / 2 + 75 * 1,
        )

        ctx.stroke();
        ctx.draw(false, () => {
          this.canvasToTempFilePath({
            canvasId: 'share',
          }, this).then(callback)
        })

        wx.hideLoading()
        this.setData({ isDraw: true })
      })
      .catch(() => {
        this.setData({ beginDraw: false })
        wx.hideLoading()
      })
  }

  

})
