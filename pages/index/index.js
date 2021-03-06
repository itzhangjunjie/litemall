const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../utils/user.js');

//获取应用实例
const app = getApp();

Page({
  data: {
    newGoods: [],
    hotGoods: [],
    topics: [],
    brands: [],
    groupons: [],
    floorGoods: [],
    banner: [],
    channel: [],
    coupon: [],
    goodsCount: 20,
    latitude:'', 
    longitude:'',
    xzmdflag:false,//开启定位
    address:'',//定位后的地址，河南省郑州市中原区
    timer: '',//定时器名字
    page:1,//頁數
    storename:'',//搜索框
    limit: 10,
    countDownNum: '60',//倒计时初始值
    countDownNumStr:'00:00:00',//显示倒计时
    moreflag:false,
    storeInfo:null,
    currentmd:{},
    currentStoreId:0,//当前门店id
    mdlist: []
  },
  getCity: function (latitude, longitude) {
    var that = this;
    var url = "https://api.map.baidu.com/reverse_geocoding/v3/";
    var params = {
      ak: app.globalData.baidukey,
      output: "json",
      location: latitude + "," + longitude
    };
    wx.request({
      url: url,
      data: params,
      success: function (res) {
        var addr = [];
        addr.push(res.data.result.addressComponent.province);
        addr.push(res.data.result.addressComponent.city);
        addr.push(res.data.result.addressComponent.district);
        that.setData({
          address: addr
        })
      },
    })
  },
  //scroll-view 滚动到底部/右边时触发触发
  loadMore:function() {
    //根据请求状态flag请求数据
    if (this.data.moreflag) {
      this.getApplyList();
    }
  },
  searchmd:function(e){//搜索門店
    var searchstr = e.detail.value;
    this.setData({
      mdlist:[],
      storename:searchstr
    });
    this.getApplyList();
  },
  getInitStoreList:function(){//获取初始化门店信息
    if(this.data.isshowflag){
      return;
    }
    var that = this;
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.ApplyList,{
      latitude:that.data.latitude, 
      longitude:that.data.longitude,
      distance_um:'10',
      storename:this.data.storename,
      page:1,
      limit:1
    },'GET').then(function (res) {
      wx.hideLoading();
      that.setData({
        isshowflag:true,
        currentmd:res.data.list[0]
      });
      wx.setStorageSync('storeId',res.data.list[0].id);
      that.getIndexData();
    });
  },
  getApplyList:function(){//获取门店列表
    var that = this;
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.ApplyList,{
      latitude:that.data.latitude, 
      longitude:that.data.longitude,
      distance_um:'10',
      storename:this.data.storename,
      page:this.data.page,
      limit:this.data.limit
    },'GET').then(function (res) {
      wx.hideLoading();
      if(res.data.pages> that.data.page){
        that.setData({
          moreflag: true,
          page: that.data.page+1,
        })
      }
      //接收数据，保证每次都拼接上
      var list = that.data.mdlist.concat(res.data.list);
      that.setData({
        mdlist: list,
      });
    });
  },
  gomd: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        console.log(res);
       // that.getCity(res.latitude, res.longitude);
        that.setData({
          latitude:res.latitude, 
          longitude:res.longitude,
          mdlist:[],
          storename:'',
        });
        that.getApplyList();
      },
      fail: res => {
        wx.showToast({
          title: '获取定位失败',
        })
      }
    })
    this.setData({
      xzmdflag: true,
    });
  },
  jrmd: function (e) {
    var currentmd = e.currentTarget.dataset.obj;
    this.setData({
      xzmdflag: false,
      currentmd:currentmd,
      currentStoreId:e.currentTarget.dataset.storeid
    });
    wx.setStorageSync('storeId', e.currentTarget.dataset.storeid);
    this.getIndexData();
  },
  goh5: function (e) {
    wx.navigateTo({
      url: '/pages/creategroup/creategroup',
    });
    return;
    var content = e.currentTarget.dataset.content;
    content = 'http://www.baidu.com';
    if (content && (content.indexOf('http://') >= 0 || content.indexOf('https://') >= 0)) {
      wx.navigateTo({
        url: '/pages/web-view/web-view?url=' + content
      })
    } else {

    }
  },
  gocate: function (e) {//跳转至分类列表
    app.globalData.catalogid = e.currentTarget.dataset.catalogid;
    app.globalData.isfresh = true;
    wx.switchTab({
      url: '/pages/catalog/catalog',
    })
  },
  onShareAppMessage: function() {
    return {
      title: 'litemall小程序商场',
      desc: '开源微信小程序商城',
      path: '/pages/index/index'
    }
  },

  onPullDownRefresh() {
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    this.getIndexData();
    wx.hideNavigationBarLoading(); //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  getIndexData: function() {
    let that = this;
    console.log(wx.getStorageSync('storeInfo'));
    let params = {
      // storeId: this.data.currentStoreId
    };
    util.request(api.GoodsCount,params).then(function(res) {
      that.setData({
        goodsCount: res.data
      });
    });
    util.request(api.IndexUrl,params).then(function(res) {
      if (res.errno === 0) {
        var old = new Date(util.newDateStr().replace(/\-/g, "/")).getTime();
        var now = new Date().getTime();
        var time = (old - now) / 1000;
        that.setData({
          countDownNum: time,//倒计时长
          newGoods: res.data.newGoodsList,
          // hotGoods: res.data.hotGoodsList,
          // topics: res.data.topicList,
          // brands: res.data.brandList,
          floorGoods: res.data.floorGoodsList,
          banner: res.data.banner,
          groupons: res.data.grouponList,
          channel: res.data.channel,
          coupon: res.data.couponList
        });
        that.countDown();
      }
    });
  },
  onLoad: function(options) {

    // 页面初始化 options为页面跳转所带来的参数
    if (options.scene) {
      //这个scene的值存在则证明首页的开启来源于朋友圈分享的图,同时可以通过获取到的goodId的值跳转导航到对应的详情页
      var scene = decodeURIComponent(options.scene);
      console.log("scene:" + scene);

      let info_arr = [];
      info_arr = scene.split(',');
      let _type = info_arr[0];
      let id = info_arr[1];

      if (_type == 'goods') {
        wx.navigateTo({
          url: '../goods/goods?id=' + id
        });
      } else if (_type == 'groupon') {
        wx.navigateTo({
          url: '../goods/goods?grouponId=' + id
        });
      } else {
        wx.navigateTo({
          url: '../index/index'
        });
      }
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.grouponId) {
      //这个pageId的值存在则证明首页的开启来源于用户点击来首页,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../goods/goods?grouponId=' + options.grouponId
      });
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.goodId) {
      //这个goodId的值存在则证明首页的开启来源于分享,同时可以通过获取到的goodId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../goods/goods?id=' + options.goodId
      });
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.orderId) {
      //这个orderId的值存在则证明首页的开启来源于订单模版通知,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../ucenter/orderDetail/orderDetail?id=' + options.orderId
      });
    }
    this.setData({
      latitude:'31.365872955322266', 
      longitude:'121.40377960205078',
      mdlist:[],
      isshowflag:false,
      storename:'',
    });
    this.getInitStoreList();
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
    if(wx.getStorageSync('storeInfo')){
      this.setData({
        storeInfo:wx.getStorageSync('storeInfo')
      });
      if(this.data.isshowflag){
        this.getIndexData();
      }
    }
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  getCoupon(e) {
    let couponId = e.currentTarget.dataset.index;
    util.request(api.CouponReceive, {
      couponId: couponId
    }, 'POST').then(res => {
      if (res.errno === 0;) {
        wx.showToast({
          title: "领取成功"
        })
      }
      else{
        util.showErrorToast(res.errmsg);
      }
    })
  },
  countDown: function () {
    let that = this;
    let countDownNum = that.data.countDownNum;//获取倒计时初始值
    //如果将定时器设置在外面，那么用户就看不到countDownNum的数值动态变化，所以要把定时器存进data里面
    that.setData({
      timer: setInterval(function () {//这里把setInterval赋值给变量名为timer的变量
        //每隔一秒countDownNum就减一，实现同步
        countDownNum--;
        //然后把countDownNum存进data，好让用户知道时间在倒计着
        that.setData({
          countDownNum: countDownNum,
          countDownNumStr: util.dateformat(countDownNum)
        });
        //在倒计时还未到0时，这中间可以做其他的事情，按项目需求来
        if (countDownNum == 0) {
          //这里特别要注意，计时器是始终一直在走的，如果你的时间为0，那么就要关掉定时器！不然相当耗性能
          //因为timer是存在data里面的，所以在关掉时，也要在data里取出后再关闭
          clearInterval(that.data.timer);
          //关闭定时器之后，可作其他处理codes go here
        }
      }, 1000)
    })
  }
});