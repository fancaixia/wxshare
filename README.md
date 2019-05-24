### wxshare  微信小程序分享实例+可显示动态消息+canvas绘制分享海报

[github地址：https://github.com/fancaixia/wxshare](https://github.com/fancaixia/wxshare)  <br/><br/>
![https://github.com/fancaixia/wxshare/blob/master/img/001.jpg](https://github.com/fancaixia/wxshare/blob/master/img/001.jpg)
![https://github.com/fancaixia/wxshare/blob/master/img/002.jpg](https://github.com/fancaixia/wxshare/blob/master/img/002.jpg)

##### 案例思路
- 本案例小程序版本 2.7.0 
- 案例演示需在真机运行
- 本案例只演示如何使用，具体业务场景不考虑，用户首次授权后转发才可显示动态消息
> 1. 客户端  wx.showShareMenu  显示转发按钮  <br/>
> 2. 用户授权（授权后转发才可显示动态消息和用户信息）<br/>
>    授权成功后 canvas绘制分享海报 <br/>
> 3. 服务端接口 createActivityId 创建被分享动态消息id （activity_id）<br/>
> 4. 客户端从服务端获取活动消息id （activityId）<br/>
>    设置转发卡片动态消息 (wx.updateShareMenu)<br/>
>5. 服务端接口 setUpdatableMsg  修改被分享的动态消息<br/>
  wx-server/routes/index.js  中 setTimeout 修改状态改变时间<br/>
> 6. onShareAppMessage 设置默认转发标题和背景 return {  
>        title: `小游戏组团`,<br/>
>        path: `/pages/share/index`,  <br/>
>       imageUrl: this.data.shareImage     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; //canvas 绘制分享海报路径 <br/>
>    }


**绘制分享海报部分代码引用地址 [微信小程序前端生成图片用于分享朋友圈最终解决方案](https://www.jianshu.com/p/7d47e52de73c)*  <br/>





##### 小程序端代码片段
```
  onLoad: function (options) {
    // 显示转发按钮
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  
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

##### node代码片段
```
let access_token, activity_id;
 // 获取登录凭证
router.post('/creatid',(req,res)=>{
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

    var req = https.request(options, function (newres) {  

      newres.on('data', function (data) {  

            let newdata = JSON.parse(data.toString())
            access_token = newdata.access_token;
            // 使用登录凭证获取活动消息id  
            getActivityId(res,access_token)
            // 定时器模拟延时  更改动态消息
            setTimeout(()=>{
                //更改转发的动态消息
                updateMsg(res,access_token)
            },30000)
            
        });  
        
    });  
   
    req.on('error', function (e) {  
        console.log('获取登录凭证失败 ' + e.message);  
    });  

    req.end();

})

// 根据登录凭证获取活动消息id
function getActivityId(res,access_token){
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

    var _req = https.request(access_options, function (_res) {  
            
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
}
//更改转发的动态消息
function updateMsg(res,access_token){

    if(activity_id){
        var update_data = {  
            access_token,
            activity_id,
            target_state:1,
            template_info: {
                parameter_list: [{
                  name: 'path',
                  value: 'pages/share/index'
                }, {
                  name: 'version_type',
                  value: 'develop'
                }]
              },
        } 
        var update_content = JSON.stringify(update_data); 
        let uri = url.parse('https://api.weixin.qq.com/cgi-bin/message/wxopen/updatablemsg/send?access_token='+access_token)
        var update_options = {
            method: "POST",
            hostname: uri.hostname,  
            port: '',  
            path: uri.path,  
            headers: {
                "Content-Type": "application/json", 
                "Content-Length": update_content.length
            }, 
        };  
    
        var _req = https.request(update_options, function (_res) {  
            _res.on('data', function (_data) {  
                  
                  let reault_data = JSON.parse(_data.toString())
                  let errcode = reault_data.errcode;
            });  
              
          }); 
          
          _req.on('error', function (e) {  
            console.log('更改动态消息失败 ' + e);  
          });  
          _req.write(update_content);
          _req.end();
    }
    
}

```

#### 项目启动
- wx-static / utils/utils.js  修改IP地址
- wx-server / config.js   修改小程序appid和小程序密钥
- cnpm  install
- node app




