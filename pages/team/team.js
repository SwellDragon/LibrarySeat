const app = getApp()
const db = wx.cloud.database()
const frienddb = db.collection('FriendMsg')
const userdb = db.collection('UserInfo')
const addfrienddb = db.collection('AddFriendMsg')
const _ = db.command
const TmplId = 'zskXwIP3LzMdHucIKIYWvjj88q2onMThnJXlM0fomUg';

Page({
  data: {
    open: false,
    inputShowed: false, // 输入框是否显示
    inputVal: '', // 搜索框输入的内容
    loadingMoreHidden: true,
    showActionSheet: false,
    phone: '',
    chachong: 0,//代表着没有添加这个好友
    stuid:""
  },
  go(e) {
    wx.navigateTo({
      url: '/pages/example/chatroom_example/room/room?id=' + e.currentTarget.dataset.id + '&name=' + '聊天室',
    })
  },
  Input(e) {
    this.data.phone = e.detail.value;
  },
  searchpeople(e) {
    //查找好友
    userdb.where(
      _.or([
        {
          user_name:e
      },{
        student_id:e
      }
      ])
    ).get().then((res)=>{
      console.log(e,res)
      this.setData({
        addpeopledetail: res.data
      })
    })
  },
  tostupage:function(e){
    console.log("搜索栏点击好友",e)
    let userdetail = JSON.stringify(e.currentTarget.dataset.detail)
    //跳转到好友详情页
    if (e.currentTarget.dataset.detail.student_id == app.globalData.stuid){ //本人
      wx.switchTab({
        url: '/pages/info/info?userdetail=' + userdetail,
      })
    }
    else{
      wx.navigateTo({
        url: '/pages/team/haoyoupage/haoyoupage?userdetail=' + userdetail,
      })
    }
    
  },
  toTeamPage:function(e){
    wx.navigateTo({
      url: '/pages/team/teampage/teampage',
    })
  },
  kindToggle: function (e) {
    this.setData({
      open: !this.data.open
    });
  },

  onLoad() {
    app.uploadavatar()
    this.getheight()
    this.setData({
      ifopen: 1,//app.globalData.ifopen
      stuid: app.globalData.stuid
    })
  },

  onShow: function (options) {
    //更新好友列表
    this.checkfriend()
    //获取好友申请
    this.checkpeopleadd();
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid,
        // peoplelist: app.globalData.friends
      })
    }
    
  },

checkfriend(){//获取好友列表
let _this = this
  console.log(this.data.stuid)
    frienddb.where({
      my_stuid: app.globalData.stuid
      // my_stuid: '2016210019'
    }).get().then(async (res)=>{
      console.log("好友列表",res)
      this.setData({
        peoplelist: res.data,
      })
      app.globalData.friends = res.data
      //获取用户头像
      for(let i = 0;i<res.data.length;i++){
        userdb.where({
          student_id: res.data[i].friend_stuid
        }).get().then((res)=>{
          console.log("获取头像",res)
          app.globalData.friends[i].avatarUrl = res.data[0].avatarUrl
          _this.setData({
            peoplelist: app.globalData.friends
          })
          // console.log(_this.data.peoplelist)
        })
      }
      
    })
  },
  //检查是否有请求添加好友的
  checkpeopleadd() {
    let _this = this
    addfrienddb.where({
      friend_stuid: app.globalData.stuid,
      state: 0
    }).get().then((res)=>{
      console.log("检查是否有添加好友",res)
      _this.setData({
        peoplecheck: res.data
      })
      let peoplecheckdata = res.data 
      //获取用户头像
      for (let i = 0; i < res.data.length; i++) {
        userdb.where({
          student_id: res.data[i].applicant_stuid
        }).get().then((res) => {
          console.log("获取头像", res)
          peoplecheckdata[i].avatarUrl = res.data[0].avatarUrl
          _this.setData({
            peoplecheck: peoplecheckdata
          })
          console.log(_this.data.peoplecheck)
        })
      }
      
    })
    
  },
  //跳转到聊天界面
  peoplepage(e) {
    console.log(e)
    // let haoyouinfo = JSON.stringify(e.currentTarget.dataset.info)
    let haoyouinfo = e.currentTarget.dataset.info
    console.log(haoyouinfo)
    let mystunum = parseInt(haoyouinfo.my_stuid, 10)
    let friendstunum = parseInt(haoyouinfo.friend_stuid, 10)
    let roomid = ""
    if(mystunum<friendstunum){
      roomid = haoyouinfo.my_stuid + haoyouinfo.friend_stuid
    }
    else{
      roomid = haoyouinfo.friend_stuid + haoyouinfo.my_stuid 
    }
    // console.log(mystunum < friendstunum)
    // console.log(roomid)
    wx.navigateTo({
      url: '/pages/team/room/room?id=' + roomid + '&name=' + haoyouinfo.friend_name + '&backgroundimage=' + "" + '&friend_id=' + haoyouinfo.friend_stuid 
    })
  },
//接受好友请求
  confirmpeopleadd(e) {
    let that = this;
    let _this = this
    // that.setData({
    //   peopleconfim: e.currentTarget.dataset.info,
    // })
    let detail = e.currentTarget.dataset.info
    console.log("接受添加好友",detail)
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: 'confirmpeopleadd',
        detail: detail
      }, success: res => {
        _this.checkpeopleadd()
        _this.checkfriend()
      },
    })
  },
//拒绝好友请求
  cancelpeopleadd(e) {
    let that = this;
    let _this = this
    // that.setData({
    //   peopleconfim: e.currentTarget.dataset.info,
    // })
    let detail = e.currentTarget.dataset.info
    console.log("拒绝添加好友",detail)
    wx.cloud.callFunction({
      name:'yunrouter',
      data:{
        $url:'rejectpeopleadd',
        detail:detail
      },success: res => {
        console.log("拒绝添加好友云函数后",res)
        _this.checkpeopleadd();
      },
    })
    
  },

  onPullDownRefresh: function () {
    this.onShow()
  },
  closeActionSheet: function () {
    this.setData({
      showActionSheet: false
    })
  },
  itemClick: function (e) {
    console.log(e)
    let index = e.detail.index + 1;
    this.closeActionSheet();
    wx.navigateTo({
      url: '/pages/team/room/room?id=chat' + index + '&name=' + '聊天室',
    })
  },
  getheight() {
    const that = this;
    setTimeout(() => {
      wx.getSystemInfo({
        success: function (res) {
          let winHeight = res.windowHeight
          let barHeight = winHeight - res.windowWidth / 750 * 204
          that.setData({
            winHeight: winHeight,
            indexBarHeight: barHeight,
            indexBarItemHeight: barHeight / 25,
            titleHeight: res.windowWidth / 750 * 132,
          })
        }
      })
    }, 50)

  },
  showInput() {
    this.setData({
      inputShowed: true
    })
  },
  clearInput() {
    this.setData({
      inputVal: "",
      inputShowed: false,
      searchResult: []
    })
    wx.hideKeyboard() //强行隐藏键盘
  },
  inputTyping(e) {
    this.setData({
      inputVal: e.detail.value
    }, () => {
      this.searchpeople(this.data.inputVal)
    })
  },
})
