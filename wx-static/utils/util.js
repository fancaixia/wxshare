let defaultip = 'http://你的ip地址:3000'
const service = options => {
  wx.showNavigationBarLoading();
  options = {
    dataType: "json",
    ...options,
    method: "POST",
    header: {
      "token": wx.getStorageSync("token") || "",
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
  };

  const result = new Promise(function (resolve, reject) {
    //做一些异步操作
    const optionsData = {
      success: res => {
        // console.log(res, " :res")
          if (res.data.result == 1) {
            wx.hideNavigationBarLoading();
            resolve(res.data);
          } else {
            wx.hideNavigationBarLoading();
            reject(res);
          }

      },
      fail: error => {
        wx.hideNavigationBarLoading();
        reject(error);
      },
      ...options
    };

    wx.request(optionsData);

  });
  return result;
};


module.exports = {
  defaultip,
  service,
}
