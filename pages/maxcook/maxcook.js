var util = require('../../utils/util.js');
var api = require('../../config/api.js');
//获取应用实例
const app = getApp();

Page({
  data: {
    categoryList: [],
    data: [],//文章列表数组
    catenameactive:0,//显示第一个
    curmenuId:0,//菜谱类目的id
    isCommend:"1",//0是不推荐   1是推荐
    page: 1,
    limit: 10
  },
  onLoad: function (options) {
    
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getCatalog();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  getCatalog: function () {
    //CatalogList
    let that = this;
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.MenuList).then(function (res) {
      that.setData({
        categoryList: res.data,
      });
      wx.hideLoading();
    });
  },
  //scroll-view 滚动到底部/右边时触发触发
  loadMore: function () {
    //根据请求状态flag请求数据
    if (this.data.moreflag) {
      this.getTopicList();
    }
  },
  getTopicList: function () {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.TopicList, {
      menuId: that.data.curmenuId,
      isCommend:that.data.isCommend,
      page: that.data.page,
      limit: that.data.limit
    })
      .then(function (res) {
        wx.hideLoading();
        if (res.data.pages > that.data.page) {
          that.setData({
            moreflag: true,
            page: that.data.page + 1,
          })
        }
        //接收数据，保证每次都拼接上
        var list = that.data.data.concat(res.data.list);
        that.setData({
          data: list,
        });
      });
  },
  catechange: function (event) {
    var index = event.currentTarget.dataset.index;
    this.setData({
      page:1,
      data: [],
      catenameactive: index
    });
    if (index == 0) {
      this.setData({
        curmenuId: 0,
        isCommend: "1",
      })
    } else {
      var menuId = event.currentTarget.dataset.menuid;
      this.setData({
        curmenuId: menuId,
        isCommend: null,
      })
    }
    this.getTopicList();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    this.getCatalog();
    this.getTopicList();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})