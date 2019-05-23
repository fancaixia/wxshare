### wxshare  微信小程序分享( 转发 )实例+可显示动态消息+canvas绘制海报

[github地址：https://github.com/fancaixia/wxshare](https://github.com/fancaixia/wxshare)  <br/><br/>
![https://github.com/fancaixia/wxshare/blob/master/img/001.jpg](https://github.com/fancaixia/wxshare/blob/master/img/001.jpg)

##### 案例思路
> 1. 本案例小程序版本 2.7.0  <br/><br/>
> 2. 服务端接口 createActivityId 创建被分享动态消息id （activity_id）  <br/><br/>
> 3. 客户端  wx.showShareMenu  显示转发按钮  <br/><br/>
> 4. 从服务端获取活动消息id （activityId）   <br/><br/>
> 5. wx.updateShareMenu 更新转发动态消息属性  <br/><br/>
> 6. onShareAppMessage 设置默认转发标题和背景 return {      <br/><br/>
>     title: `小游戏组团`, <br/>
>      path: `/pages/live/index`,  <br/>
>     imageUrl: this.data.shareImage   }

> 7. 分享时如若显示用户信息
>    用户授权
>    授权成功后 canvas绘制分享海报 将图片存储在内存中
>    用户点击分享 设置 imageUrl 为canvas 绘制图

* 绘制分享海报部分代码引用地址 [微信小程序前端生成图片用于分享朋友圈最终解决方案](https://www.jianshu.com/p/7d47e52de73c)*  <br/><br/>





##### 小程序端代码
```
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
```

##### node代码
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

#### 项目启动
- wx-static / utils/utils.js  修改IP地址
- wx-server / config.js   修改小程序appid和小程序密钥
- cnpm  install
- node app





