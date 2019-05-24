var express = require('express');
var router = express.Router();
const https = require('https');  
const http = require('http');
const qs = require('querystring');  
const wxconfig = require('../config')
const url = require("url");

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


module.exports = router;
