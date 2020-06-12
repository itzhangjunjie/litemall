// pages/group/creategroup/creategroup.js
let timine
var app = getApp();
const util = require('../../utils/util.js');
const api = require('../../config/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:[],
    dataform:{
      type:'',
      nickname:'',
      avatarurl:'',
      xiaoquDetail: '',
      remark:'',
      storename:'',
      brief:'',
      discount:'',
      username: '',
      userid: '',
      longitude: '',
      latitude: '',
      province: '',
      city: '',
      county: '',
      addressDetail: '',
      tel: '',
      status: '0',//0：申请 1：使用中 -1：禁用
      deleted: false,
    },
    type: '1',//1是社区门店  2是社区团长
    typeStr: '社区门店'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserInfo();
    if (options.type){
      var typeStr = '';
      if (options.type==1){
        typeStr = '社区门店'
      }else{
        typeStr = '社区团长'
      }
      let type = 'dataform.type';
      this.setData({
        [type]: options.type,
        type:options.type,
        typeStr: typeStr
      })
    }
    wx.setNavigationBarTitle({
      title: '申请'+this.data.typeStr,
    })
   
  },
  getUserInfo(){
    if (app.globalData.hasLogin) {
      let userInfo = wx.getStorageSync('userInfo');
      let nickname = 'dataform.nickname';
      let avatarurl = 'dataform.avatarurl';
      this.setData({
        [nickname]: userInfo.nickName,
        [avatarurl]: userInfo.avatarUrl
      });
    }
  },
  getCity: function (latitude, longitude) {
    var that = this;
    var url = "https://api.map.baidu.com/reverse_geocoding/v3/";
    var params = {
      ak: app.globalData.baidukey,
      output: "json",
      location: latitude + "," + longitude
    }
    wx.request({
      url: url,
      data: params,
      success: function (res) {
        let province = res.data.result.addressComponent.province;
        let city = res.data.result.addressComponent.city;
        let district = res.data.result.addressComponent.district;
        let provincestr = 'dataform.province';
        let citystr = 'dataform.city';
        let countystr = 'dataform.county';
        var addr = new Array();
        addr.push(res.data.result.addressComponent.province);
        addr.push(res.data.result.addressComponent.city);
        addr.push(res.data.result.addressComponent.district);
        that.setData({
          address: addr,
          [provincestr]: province,
          [citystr]: city,
          [countystr]: district
        })
      },
    })
  },
  onShow:function(e){
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        that.getCity(res.latitude, res.longitude);
        console.log(res)
        let latitude = 'dataform.latitude';
        let longitude = 'dataform.longitude';
        that.setData({
          [latitude]: res.latitude,
          [longitude]: res.longitude
        })
      },
      fail: res => {
        wx.showToast({
          title: '获取定位失败',
        })
      }
    })
  },
  chooseAddress(e){
    console.log(e.detail)
    this.setData({
      province_code: e.detail.code[0],
      city_code: e.detail.code[1],
      area_code: e.detail.code[2],
      address: e.detail.value
    })
  },
  handleInputChange: function (e) {
    // 取出定义的变量名
    let targetData = e.currentTarget.dataset.modal;
    // 取出定义的变量名
    let currentValue = e.detail.value;
    // 将 input 值赋值给 定义的变量名，this.name 可以直接取到在 data 中定义的 name 值，其效果跟 this[变量名] 是对等的，这是 js 基础
    this.setData({
      [targetData]: currentValue
    })
  },
  chooseArea(e){
    console.log(e)
    wx.chooseLocation({
      success: (res) => {
        console.log(res)
        let xiaoquDetail = 'dataform.xiaoquDetail';
        this.setData({
          [xiaoquDetail]: res.address,
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
    })
  }, 
  submit(e){
    console.log(this.data.dataform);
    if (!this.data.dataform.username){
      wx.showToast({
        icon: 'none',
        title: '请填写真实姓名',
      })
      return
    }
    if (!this.data.dataform.tel) {
      wx.showToast({
        icon: 'none',
        title: '请填写手机号',
      })
      return
    }
    if(wx.getStorageSync('userInfo')){
      let userInfo = wx.getStorageSync('userInfo');
      let userid = 'dataform.userid'
      this.setData({
        [userid]:userInfo.userid
      })
    }
    util.request(api.ApplyCreate, this.data.dataform, 'POST').then(function (res) {
      if (res.errno === 0) {
        console.log(res);
        wx.showToast({
          title: '申请成功',
          icon: 'success',
          duration: 2000
        });
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index',
          })
        }, 2000);
      }else{
        wx.showToast({
          title: res.errmsg,
          icon:'none'
        })
      }
    });
  },
  bindPhoneNumber: function (e) {
    if (e.detail.errMsg !== "getPhoneNumber:ok") {
      // 拒绝授权
      return;
    }
    if (!app.globalData.hasLogin) {
      wx.showToast({
        title: '绑定失败：请先登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    var that = this;
    util.request(api.AuthBindPhone, {
      iv: e.detail.iv,
      encryptedData: e.detail.encryptedData
    }, 'POST').then(function (res) {
      if (res.errno === 0) {
        let tel = 'dataform.tel';
        that.setData({
          [tel]:res.data.phone
        })
        wx.showToast({
          title: '获取手机号成功',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },
})