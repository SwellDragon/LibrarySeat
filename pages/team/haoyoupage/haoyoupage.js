const app = getApp()
const db = wx.cloud.database()
const addfrienddb = db.collection('AddFriendMsg')
// pages/about/about.js
Page({

  data: {
    imgList:[],
    backgroundimage:'',
    is_friend:0
  },
  onLoad: function (options) {
    // this.setData({
    //   ifopen: app.globalData.ifopen
    // })
    let userdetail = JSON.parse(options.userdetail);
    this.setData({
      userdetail: userdetail
    })
    console.log(this.data.userdetail)
    //判断是否有该好友，本地判断
    var userstuid = this.data.userdetail.student_id
    for (var i = 0; i < app.globalData.friends.length; i++) {
      var fid = app.globalData.friends[i].friend_stuid;
      if (fid === userstuid) {
        this.setData({
          is_friend: 1
        })
      }
    }
  },

  addpeople(e) {
    let that = this
    let _this = this
    let now = new Date()
    if (_this.data.is_friend === 0) {//如果没有添加该好友
    //检查是否发出了好友请求
      addfrienddb.where({
        applicant_stuid: app.globalData.stuid,
        friend_stuid: _this.data.userdetail.student_id,
        state: 0
      }).get().then((res)=>{
        console.log("检查是否发出过好友请求", res)
        if(res.data.length==0){ //未发出过
        //发出申请
          addfrienddb.add({
            data: {
              applicant_name: app.globalData.name,
              applicant_stuid: app.globalData.stuid,
              friend_name: _this.data.userdetail.user_name,
              friend_stuid: _this.data.userdetail.student_id,
              send_time: now,
              state: 0
            }
          }).then((res) => {
            console.log("申请好友", res)
            wx.showToast({
              title: '发送申请成功',
              icon: 'none',
              duration: 1000,
              // mask: true
            })
          })
        }else{
          wx.showToast({
            title: '你已经发出过申请了',
            icon: 'none',
            duration: 1000,
            // mask: true
          })
        }
      })
    }
    else {
      wx.showModal({
        title: '温馨提示',
        content: '您已添加成功该好友，无须重复添加'
      })
    }
  },

  
  chat(){
      let that = this;
      let _this = this;
      if(!this.data.backgroundimage1){
        // //就证明没有更换图片
        // that.setData({
        //   //这个id就唯一标识这个好友
        //   chatid: that.data.haoyouinfo.friend_stuid,
        //   chatname: that.data.haoyouinfo.friend_name,
        //   // backgroundimage:that.data.haoyouinfo.backgroundimage
        // })
      }
      else{
        // that.setData({
        //   //这个id就唯一标识这个好友
        //   chatid: that.data.haoyouinfo.id,
        //   chatname: that.data.haoyouinfo.userInfo.nickName,
        //   backgroundimage:that.data.backgroundimage1
        // })
      }
    let mystunum = parseInt(app.globalData.stuid, 10)
    let friendstunum = parseInt(_this.data.userdetail.student_id, 10)
    let roomid = ""
    if (mystunum < friendstunum) {
      roomid = app.globalData.stuid + _this.data.userdetail.student_id
    }
    else {
      roomid = _this.data.userdetail.student_id + app.globalData.stuid 
    }
    // console.log(mystunum < friendstunum)
    // console.log(roomid)
    wx.redirectTo({
      url: '/pages/team/room/room?id=' + roomid + '&name=' + _this.data.userdetail.user_name + '&backgroundimage=' + "",
    })
  },
  deletefriend(){
    let _this = this;
    console.log("点击删除好友")
    wx.showModal({
      title: '提示',
      content: '是否删除该好友',
      // confirmText:'是',
      // cancelText:'否',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          let detail = new Object()
          detail.my_stuid = app.globalData.stuid
          detail.friend_stuid = _this.data.userdetail.student_id
          console.log("删除detail",detail)
          //删除好友
          wx.cloud.callFunction({
            name:'yunrouter',
            data:{
              $url:'deletefriend',
              detail: detail
            },success(res){
              console.log("删除好友",res)
              if(res.result.is_ok){
                wx.showToast({
                  title: '删除好友成功',
                  icon: 'none',
                  duration: 1000,
                })
                setTimeout(function () {
                  wx.switchTab({
                    url: '/pages/team/team'
                  })
                }, 1200)
                
              }
              else{
                wx.showToast({
                  title: res.result.msg,
                  icon: 'none',
                  duration: 1000,
                })
              }
              }
          })

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  chooseimgae(){
    this.setData({
      imgList: [],
    })
      wx.chooseImage({
        count: 1, //默认9
        sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], //从相册选择
        success: (res) => {
  
          wx.showLoading({
            title: '上传中',
          })
          console.log(res)
          for (var i = 0; i < res.tempFilePaths.length; i++) {
            const filePath = res.tempFilePaths[i]
            const cloudPath = `好友聊天背景` + `/${new Date().getTime()} ` + filePath.match(/\.[^.]+?$/)[0]
            wx.cloud.uploadFile({
              cloudPath,
              filePath,
              success: res => {
                console.log('[上传文件] 成功：', res)
                console.log(res)
                this.setData({
                  imgList: this.data.imgList.concat(res.fileID)
                })
                wx.cloud.callFunction({
                  name: 'yunrouter',
                  data: {
                    $url: 'upadatebackground', //云函数路由参数
                    pic: this.data.imgList[0],
                    haoyouopenid:this.data.haoyouinfo._openid
                  },
                  success: res => {
                    console.log(res)
                    //至空
                    this.setData({
                      backgroundimage1:this.data.imgList[0],
                    })
                  },
                  fail(e) {
                    console.log(e)
                  }
                });
              },
              fail: e => {
                console.error('[上传文件] 失败：', e)
                wx.showToast({
                  icon: 'none',
                  title: '上传失败',
                })
              },
              complete: () => {
                wx.hideToast()
                wx.hideLoading()
              }
            })
  
          }
  
        },
        fail: e => {
          console.error(e)
        }
      })
    
  },
})