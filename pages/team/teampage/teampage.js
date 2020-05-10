// pages/team/teampage/teampage.js
const app = getApp()
const db = wx.cloud.database()
const frienddb = db.collection('FriendMsg')
const userdb = db.collection('UserInfo')
const teamdb = db.collection('TeamMsg')
const orderdb = db.collection('OrderMsg')
const _ = db.command
Page({
  /**
   * 页面的初始数据
   */
  data: {
    stuid:"",
    have_team: true,
    team_id: "",
    team_name: "",
    is_owner: false,
    hiddenmodal: true,
    team_name_input: "",
  },
  creatTeam(e) {
    let _this = this
    console.log("点击创建队伍")
    wx.showModal({
      title: '提示',
      content: '是否要创建属于自己的队伍',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.cloud.callFunction({ //创建新队伍
            name: 'yunrouter',
            data: {
              $url: 'creatTeam',
              stuid: app.globalData.stuid
            },
            success: res => {
              console.log(res)
              if (res.result.is_ok) { //创建队伍成功
                app.globalData.team_id = res.result.team_id
                _this.setData({
                  have_team: true,
                  team_id: res.result.team_id,
                  team_name: res.result.team_id,
                  is_owner: true
                })
                _this.get_team_member()
              } else {
                wx.showModal({
                  title: '提示',
                  content: '创建队伍失败',
                  showCancel: false,
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
  toinvitepage(e) {
    console.log("点击邀请好友")
    wx.navigateTo({
      // url: '/pages/team/teaminvite/teaminvite?team_id=' + this.data.team_id,
      url: '/pages/team/teaminvite/teaminvite'
    })
  },
  async getTeam_id() {
    await userdb.where({
      student_id: app.globalData.stuid
    }).get().then(async(res) => {
      app.globalData.team_id = res.data[0].team_id
      console.log(app.globalData.team_id)
    })
  },
  changeteam_name(e) {
    console.log("点击修改队伍名")
    this.setData({ //故意不清楚之前输入框的东西
      hiddenmodal: false
    })
  },
  team_name_inputer(e) {
    console.log(e.detail.value)
    this.setData({
      team_name_input: e.detail.value
    })
  },
  confirm(e) {
    let _this = this
    console.log("用户点击确定", this.data.team_name_input, this.data.team_id)
    if (_this.data.team_name_input==""){
      wx.showToast({
        title: '输入队伍名为空',
        icon: 'none',
        duration: 1000,
      })
    }else{
      //修改队伍名
      wx.cloud.callFunction({
        name: "yunrouter",
        data: {
          $url: "change_team_name",
          team_id: _this.data.team_id,
          new_team_name: _this.data.team_name_input
        },
        success(res) {
          console.log(res)
          if (res.result.is_ok) {
            wx.showToast({
              title: '修改队伍名成功',
              icon: 'none',
              duration: 1000,
            })
            _this.setData({
              hiddenmodal: true,
              team_name: _this.data.team_name_input,
              team_name_input: ""
            })
          } else {
            wx.showModal({
              title: '修改队伍名失败',
              content: res.result.msg,
              showCancel: false,
              success(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }
        }
      })
    }
    
  },
  cancel(e) {
    console.log("用户点击取消")
    this.setData({
      hiddenmodal: true
    })
  },
  deletepeople(e){
    let _this = this
    console.log("删除成员",e)
    wx.showModal({
      title: '提示',
      content: '确定要将' + e.currentTarget.dataset.info.user_name + '同学从队伍中踢出吗',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.cloud.callFunction({
            name:"yunrouter",
            data:{
              $url:"delete_team_member",
              team_id:_this.data.team_id,
              member_stuid: e.currentTarget.dataset.info.student_id
            },success(res) {
              console.log(res)
              if (res.result.is_ok) {
                wx.showToast({
                  title: '成功删除成员',
                  icon: 'none',
                  duration: 1000,
                })
                //更新队伍成员列表
                _this.get_team_member()
              } else {
                wx.showModal({
                  title: '删除成员失败',
                  content: res.result.msg,
                  showCancel: false,
                  success(res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
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

  tostupage: function (e) {
    console.log("队伍列表点击好友", e)
    let userdetail = JSON.stringify(e.currentTarget.dataset.detail)
    //跳转到好友详情页
    if (e.currentTarget.dataset.detail.student_id == app.globalData.stuid) { //本人
      // wx.switchTab({
      //   url: '/pages/info/info?userdetail=' + userdetail,
      // })
    }
    else {
      wx.navigateTo({
        url: '/pages/team/haoyoupage/haoyoupage?userdetail=' + userdetail,
      })
    }

  },
  tochatroom(e){
    wx.navigateTo({
      url: '/pages/team/room/room?id=' + this.data.team_id + '&name=' + this.data.team_name + '&backgroundimage=' + "" + '&friend_id='
    })
  },
  get_team_member(){
    let _this = this
    //查询队伍中人员
    userdb.where({
      team_id: app.globalData.team_id
    }).get().then((res) => {
      _this.setData({
        peoplelist: res.data
      })
    })
  },
  quit_team(e){
    let _this = this
    console.log("退出队伍")
    wx.showModal({
      title: '警告',
      content: '是否确定要退出当前队伍',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          userdb.where({
            student_id:app.globalData.stuid,
            team_id:_this.data.team_id
          }).update({
            data:{
              team_id:""
            }
          }).then((res)=>{
            console.log(res)
            if (res.stats.updated == 1) {
              console.log("退出队伍成功", res)
              wx.showModal({
                title: '提示',
                content: '退出队伍成功',
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                    app.globalData.team_id = ""
                    setTimeout(function () {
                      wx.switchTab({
                        url: '/pages/team/team'
                      })
                    }, 1200)
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            }
            else if (res.stats.updated == 0) {
              console.log("用户与队伍ID不匹配", res)
              wx.showModal({
                title: '提示',
                content: '用户与队伍ID不匹配',
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            }
            else {
              console.log("退出队伍异常，疑似出现多个匹配账号，请联系管理员", res)
              wx.showModal({
                title: '警告',
                content: '退出队伍异常，疑似出现多个匹配账号，请联系管理员',
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  disband_team(e){
    let _this = this
    console.log("解散队伍")
    wx.showModal({
      title: '提示',
      content: '是否要解散当前队伍，此操作不可逆',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.cloud.callFunction({
            name: "yunrouter",
            data: {
              $url: "disband_team",
              team_id: _this.data.team_id,
              stuid: app.globalData.stuid
            }, success(res) {
              console.log("解散队伍云函数返回", res)
              if (res.result.is_ok) {
                wx.showModal({
                  title: '提示',
                  content: '解散队伍成功',
                  showCancel: false,
                  success(res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                      app.globalData.team_id = ""
                      setTimeout(function () {
                        wx.switchTab({
                          url: '/pages/team/team'
                        })
                      }, 1200)
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              } else {
                wx.showModal({
                  title: '提示',
                  content: res.result.msg,
                  showCancel: false,
                  success(res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let _this = this
    // app.globalData.stuid = '2016210019'
    this.setData({
      stuid: app.globalData.stuid
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let _this = this
    userdb.where({ //查询当前是否加入了队伍
      student_id: app.globalData.stuid
    }).get().then((res) => {
      app.globalData.team_id = res.data[0].team_id
      console.log(app.globalData.team_id)
      if (app.globalData.team_id == "") { //当前没有队伍
        console.log("当前没有队伍")
        this.setData({
          have_team: false
        })
      } else {
        console.log("当前有队伍")
        // let team_id = app.globalData.team_id
        // let tmp = team_id.split('_')
        let tmp = app.globalData.team_id.split('_')
        if (tmp[1] == app.globalData.stuid) {
          console.log("是创建者")
          _this.setData({
            is_owner: true
          })
        }
        teamdb.where({ //查询队伍名称
          team_id: app.globalData.team_id
        }).get().then((res) => {
          console.log("查询当前team_id对应的队伍名称", res)

          _this.setData({
            team_id: res.data[0].team_id,
            team_name: res.data[0].team_name
          })
        })
        //查询队伍中人员
        this.get_team_member()
      }
    })
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})