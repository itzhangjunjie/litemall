var api = require('../config/api.js');
var app = getApp();
// 时间格式化输出，如1天天23时时12分分12秒秒12 。每10ms都会调用一次
function dateformat(micro_second) {
  var day = parseInt(Math.floor(micro_second / 86400));
  var time = parseInt(Math.floor((micro_second - (day * 86400)) / 3600));
  var min = parseInt(Math.floor((micro_second - (time * 3600 + day * 86400)) / 60));
  var sinTime = time * 3600 + min * 60 + day * 86400;
  var sinTimeb;
  var sin1 = parseInt((micro_second - sinTime));
  var thisTime = "";
  if (day > 0) thisTime = thisTime + addEge(day) + "天";
  thisTime = thisTime +addEge(time) + "<span class='mhclass'>:</span>" + addEge(min) + "<span class='mhclass'>:</span>" + addEge(sin1);
  micro_second <= 0 ? thisTime = "00:00:00" : thisTime;
  return thisTime;
}

function addEge(a) {
  return  '<span class="blackclass">' +(a < 10 ? a = "0" + a : a = a)+'</span>'
}

function newDateStr() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = 23;
  var minute = 59;
  var second = 59;
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}


function formatTime(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n
}

/**
 * 封封微信的的request
 */
function request(url, data = {}, method = "GET") {
  if(data.storeId){

  }else if(wx.getStorageSync("storeInfo")){
    data.storeId = 0
  }else if(wx.getStorageSync("storeId")){
    data.storeId = wx.getStorageSync("storeId")
  }
  return new Promise(function(resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'X-Litemall-Token': wx.getStorageSync('token')
      },
      success: function(res) {

        if (res.statusCode == 200) {

          if (res.data.errno == 501) {
            // 清除登录相关内容
            try {
              wx.removeStorageSync('userInfo');
              wx.removeStorageSync('storeInfo');
              wx.removeStorageSync('storeId');
              wx.removeStorageSync('token');
            } catch (e) {
              // Do something when catch error
            }
            // 切换到登录页面
            wx.navigateTo({
              url: '/pages/auth/login/login'
            });
          } else {
            resolve(res.data);
          }
        } else {
          reject(res.errMsg);
        }

      },
      fail: function(err) {
        reject(err)
      }
    })
  });
}

function redirect(url) {

  //判断页面是否需要登录
  if (false) {
    wx.redirectTo({
      url: '/pages/auth/login/login'
    });
    return false;
  } else {
    wx.redirectTo({
      url: url
    });
  }
}

function showErrorToast(msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}

module.exports = {
  formatTime,
  dateformat,
  newDateStr,
  request,
  redirect,
  showErrorToast
};