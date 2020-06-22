var util = require('../../utils/util.js');
var api = require('../../config/api.js');
//获取应用实例
const app = getApp();

Page({
  data: {
    categoryList: [],
    currentCategory: {},
    currentSubCategoryList: {},
    scrollLeft: 0,
    scrollTop: 0,
    goodsCount: 0,
    scrollHeight: 0,
    scollHeight:500,
    cover: false,
    data:[],//商品列表数组
    curcatelogid:'',//当前分类目录的id
    curcategoryid:'',//当前分类id
    catenameactive:100,//当前索引值
    cartGoods:[],//购物车商品列表
    productList:[],//某个商品的标签列表
    moreflag:false,//更多商品
    hasLogin: false,
    isHot:false,
    page: 1,
    limit: 10
  },
  onLoad: function(options) {
    if (app.globalData.catalogid){
      this.setData({
        curcatelogid: app.globalData.catalogid
      })
    }
    this.getCatalog();
    app.globalData.isfresh = false;
    //购物车信息
    if (app.globalData.hasLogin) {
      this.getCartList();
    }
    this.setData({
      hasLogin: app.globalData.hasLogin
    });
  },
  getCartList: function () {
    let that = this;
    util.request(api.CartGoodsList).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          cartGoods: res.data.cartList
        });
      }
    });
  },
  cutNumber: function (event) {
    let that = this;
    let itemIndex = event.target.dataset.itemIndex;
    let cartItem = this.data.cartGoods[itemIndex];
    var productIds = [];
    productIds.push(cartItem.productId);
    if (cartItem.number - 1 == 0){
      util.request(api.CartDelete, {
        productIds: productIds
      }, 'POST').then(function (res) {
        if (res.errno === 0) {
          that.getCartList();

        }
      });
    }
    let number = (cartItem.number - 1 > 1) ? cartItem.number - 1 : 1;
    cartItem.number = number;
    this.setData({
      cartGoods: this.data.cartGoods
    });
    this.updateCart(cartItem.productId, cartItem.goodsId, number, cartItem.id);
  },
  addNumber: function (event) {
    let itemIndex = event.target.dataset.itemIndex;
    let cartItem = this.data.cartGoods[itemIndex];
    let number = cartItem.number + 1;
    cartItem.number = number;
    this.setData({
      cartGoods: this.data.cartGoods
    });
    this.updateCart(cartItem.productId, cartItem.goodsId, number, cartItem.id);
  },
  updateCart: function (productId, goodsId, number, id) {
    let that = this;
    util.request(api.CartUpdate, {
      productId: productId,
      goodsId: goodsId,
      number: number,
      id: id
    }, 'POST').then(function (res) {

    });
  },
  togoodsItem:function(e){
    wx.navigateTo({
      url: '/pages/goods/goods?id='+e.target.dataset.id,
    })
  },
  addcart: function (e) {//第一次添加购物车
    // if (!app.globalData.hasLogin) {
    //   wx.navigateTo({
    //     url: "/pages/auth/login/login"
    //   });
    // }
    let that = this;
    var id = e.currentTarget.dataset.id;
    util.request(api.GoodsDetailProject,{id:id}).then(function (res) {
      if (res.errno === 0) {
        console.log(res.data.productList);
        that.setData({
          productList: res.data.productList
        });
        if (res.data.productList && res.data.productList.length == 1 && res.data.productList[0].specifications[0] == '标准'){
          //添加到购物车
          util.request(api.CartAdd, {
            goodsId: res.data.productList[0].goodsId,
            number: 1,
            productId: res.data.productList[0].id
          }, "POST")
            .then(function (res) {
              let _res = res;
              if (_res.errno == 0) {
                that.getCartList();
              } else {
                util.showErrorToast(_res.errmsg);
              }
            });
        }
      }
    });
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    this.getCatalog();
    wx.hideNavigationBarLoading(); //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  getCatalog: function() {
    //CatalogList
    let that = this;
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.CatalogList).then(function(res) {
      that.setData({
        categoryList: res.data.categoryList,
        currentCategory: res.data.currentCategory,
        currentSubCategoryList: res.data.currentSubCategory,
        curcategoryid: res.data.currentSubCategory.length > 0 ? res.data.currentSubCategory[0].id:''
      });
      if (app.globalData.catalogid) {
        res.data.categoryList.forEach(function (value, index, arrSelf) {
          if (value.id = that.data.curcatelogid) {
            that.setData({
              currentCategory: value
            });
          }
        })
      }
      wx.hideLoading();
      that.getCurrentCategory(that.data.currentCategory.id);
    });
    util.request(api.GoodsCount).then(function(res) {
      that.setData({
        goodsCount: res.data
      });
    });

  },
  //scroll-view 滚动到底部/右边时触发触发
  loadMore:function() {
    //根据请求状态flag请求数据
    if (this.data.moreflag) {
      this.getGoodsList();
    }
  },
  getGoodsList: function () {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    });
    util.request(api.GoodsList, {
      isHot: this.data.isHot,
      type :this.data.cateType,
      categoryId: that.data.curcategoryid,
      page: that.data.page,
      limit: that.data.limit
    })
      .then(function (res) {
        wx.hideLoading();
        if(res.data.pages> that.data.page){
          that.setData({
            moreflag: true,
            page: that.data.page+1,
          })
        }
        //接收数据，保证每次都拼接上
        var list = that.data.data.concat(res.data.list);
        that.setData({
          data: list,
        });
      });
  },
  getCurrentCategory: function(id) {
    let that = this;
    util.request(api.CatalogCurrent, {
        id: id
      })
      .then(function(res) {
        that.setData({
          catenameactive:100,
          scrollLeft:0,
          page:1,
          data:[],
          currentCategory: res.data.currentCategory,
          currentSubCategoryList: res.data.currentSubCategory,
          curcategoryid: res.data.currentCategory.id ,
          cateType: 1,
          isHot:false,
        });
        that.getGoodsList();
      });
  },
  catechange:function(e){
    var cateid = e.currentTarget.dataset.cateid;
    var index = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;
    //type:1.全部， 2.推荐    没有值或其他则为筛选某个分类
    if(type){
      this.setData({
        cateType : parseInt(type)
      });
      if(type ==1){
        this.setData({
          isHot: false
        })
      }else if(type == 2){
        this.setData({
          isHot: true
        })
      }
      // this.data.cateType = 1;
    }else{
      this.setData({
        cateType : 0,
        isHot:false
      })
    }
    if(index == 100){
      cateid = app.globalData.catalogid;
    }
    this.setData({
      catenameactive:index,
      data:[],
      curcategoryid: cateid
    });
    this.getGoodsList();
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
    if(app.globalData.isfresh){
      app.globalData.isfresh = false;
      this.onLoad();
    }
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  switchCate: function(event) {
    var that = this;
    var currentTarget = event.currentTarget;
    if (this.data.currentCategory.id == event.currentTarget.dataset.id) {
      return false;
    }
    app.globalData.catalogid = event.currentTarget.dataset.id;
    this.getCurrentCategory(event.currentTarget.dataset.id);
  }
});