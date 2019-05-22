### wxshare  微信小程序转发动态消息实例

![https://github.com/fancaixia/wxshare/blob/master/img/001.jpg](https://github.com/fancaixia/wxshare/blob/master/img/001.jpg)


##### 小程序端代码
```
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
  
onShareAppMessage: function () {
    // 设置转发属性
    return {
      title: `小游戏组团`,
      path: `/pages/live/index`,
      imageUrl: this.data.shareImage,
    }

  },

```

##### node
```
    // 获取登录凭证
    // 根据登录凭证获取活动消息 activity_id
    var data = {  
        appid: wxconfig.appid,  
        secret: wxconfig.secret,
        grant_type:'client_credential'
    } 
    var content = qs.stringify(data);  
    var options = {  
        hostname: 'api.weixin.qq.com',  
        port: '',  
        path: '/cgi-bin/token?' + content,  
        method: 'GET' ,
        header: {
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        }, 
    };  

    var req = http.request(options, function (newres) {  

      newres.on('data', function (data) {  

            let newdata = JSON.parse(data.toString())
            access_token = newdata.access_token;
            
                var access_data = {  
                    access_token,  
                } 
                var access_content = qs.stringify(access_data);  
                var access_options = {
                    hostname: 'api.weixin.qq.com',  
                    port: '',  
                    path: '/cgi-bin/message/wxopen/activityid/create?' + access_content,  
                    method: 'GET' ,
                    header: {
                        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                    }, 
                };  
            
                var _req = http.request(access_options, function (_res) {  
            
                  _res.on('data', function (_data) {  

                        let reault_data = JSON.parse(_data.toString())
                        activity_id = reault_data.activity_id;
                        res.send({result:1,msg:'ok',activity_id,}).end();
                        
                    });  
                    
                });  

                _req.on('error', function (e) {  
                  console.log('获取动态消息id 失败 ' + e.message);  
                });  
            
                _req.end();
            
        });  

```



