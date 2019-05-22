let utils = require('../../utils/util.js')
Page({

  data: {
    shareImage:'../../img/wx_bg.png'    //转发背景图片
  },

  onLoad: function (options) {
    // 显示转发按钮
    wx.showShareMenu({
      withShareTicket: true
    })

    // 获取消息 activityId
    // 更新  转发信息
    utils.service({
      url: `${utils.defaultip}/share/creatid`,
      data: {}
    }).then((res) => {
      // console.log(res, " :获取消息id成功")
      let activity_id = res.activity_id;
    
      wx.updateShareMenu({
        withShareTicket: true,
        isUpdatableMessage: true,
        activityId:activity_id, // 活动 ID
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
          console.log('更新消息成功', res)
        },
        fail: (err) => {
          console.log('更新消息失败', err)
        }

      });

    }).catch((err) => {
      console.log(err, " :获取消息id失败")
    })

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    // 设置转发属性
    return {
      title: `小游戏组团`,
      path: `/pages/live/index`,
      imageUrl: this.data.shareImage,
    }

  },

})