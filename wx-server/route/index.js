var express = require('express');
var router = express.Router();
const http = require('https');  
const qs = require('querystring');  
const wxconfig = require('../config')

let access_token, activity_id;

// 创建动态消息id
router.post('/creatid',(req,res)=>{
    // 获取登录凭证
    // 根据登录凭证获取活动消息id
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
        
    });  
   
    req.on('error', function (e) {  
        console.log('获取登录凭证失败 ' + e.message);  
    });  

    req.end();

})


module.exports = router;
