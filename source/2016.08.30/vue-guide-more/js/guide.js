var lib = {
    urlParams: function(url) {
        var urlParamsList = {};
        var params = url.search.replace(/^\?/, "").split('&'); //分开成各个不同的对像，去掉'&'
        for (var i = 0; i < params.length; i++) {
            var param = params[i];
            var temp = param.split("=");
            urlParamsList[temp[0]] = decodeURI(temp[1]);
        }
        return urlParamsList;
    }
};

window.onload = function() {

    var attachFastClick = Origami.fastclick;
    attachFastClick(document.body);

    var windowLocation = window.location,
        selfUserID = lib.urlParams(windowLocation)['userID'],
        selfSessionID = lib.urlParams(windowLocation)['sessionID'],
        selfSessionToken = lib.urlParams(windowLocation)['sessionToken'],
        selfPeerID = lib.urlParams(windowLocation)['peerID'];

    var app = new Vue({
        el: '#app',
        data: {
            anchorInfo: [],
            livingInfo: [],
            showAdd: [],
            getAnchorInfoUrl: "http://a.impingo.me/activity/getAnchorInfo",
            getLiveStatusUrl: "http://a.impingo.me/activity/getLiveStatus",
            queryVoteStatusUrl: "http://a.impingo.me/activity/queryVoteStatus",
            singerVoteUrl: "http://a.impingo.me/activity/singerVote",
            anchorUserID: '',
            todayHadVote: false,
            setIntervalGetLiveStatus: null,
            setIntervalGetAnchorInfo: null,
            intervalDuration: 60 * 1000,
        },
        ready: function() {
            this.getAnchorInfo();
            this.getLiveStatus();
            this.queryVoteStatus();
            this.initSetTimeout();
        },
        computed: {
            anchorAllInfo: function() {
                var anchorAllInfoList = [];
                for (var i = 0; i < this.anchorInfo.length; i++) {
                    for (var j = 0; j < this.livingInfo.length; j++) {
                        if (this.anchorInfo[i]['userID'] == this.livingInfo[j]['createUserID'] || (this.anchorInfo[i]['userID'] != this.livingInfo[j]['createUserID'] && j == this.livingInfo.length - 1)) {
                            var userImg = 'http://a.impingo.me/static/activity/singer/resource/' + this.anchorInfo[i]['userID'] + '.jpg';

                            console.log(this.livingInfo[j].roomID)

                            anchorAllInfoList[i] = {
                                userID: this.anchorInfo[i]['userID'],
                                anchorName: this.anchorInfo[i]['anchorName'],
                                supportCnt: this.anchorInfo[i]['supportCnt'],
                                state: this.livingInfo[j]['state'],
                                roomID: this.livingInfo[j]['roomID'],
                                userImg: userImg,
                                showAdd: this.showAdd[i]
                            }
                            break;
                        }
                    }
                }
                return anchorAllInfoList;
            }
        },
        methods: {
            getAnchorInfo: function() {
                this.$http.jsonp(this.getAnchorInfoUrl)
                    .then(function(res) {
                        console.log(res);
                        var rtnData = res.data;
                        if (rtnData.rtn == 0) {

                            this.$set('anchorInfo', rtnData.data);
                        }
                    })
                    .catch(function(res) {
                        console.info('网络失败');
                    });
            },
            getLiveStatus: function() {
                this.$http.jsonp(this.getLiveStatusUrl)
                    .then(function(res) {
                        var that = this;
                        var rtnData = res.data;
                        if (rtnData.rtn == 0) {
                            this.$set('livingInfo', rtnData.data);

                        }
                    })
                    .catch(function(res) {
                        console.info('网络失败');
                    });
            },
            queryVoteStatus: function() {
                this.$http.jsonp(this.queryVoteStatusUrl + '?userID=' + selfUserID)
                    .then(function(res) {
                        var rtnData = res.data;
                        if (rtnData.rtn == 0) {
                            this.todayHadVote = false;
                        } else if (rtnData.rtn == 1) {
                            this.todayHadVote = true;
                            this.anchorUserID = rtnData.data.anchorUserID;
                        }
                    })
                    .catch(function(res) {
                        console.info('网络失败');
                    });
            },
            initSetTimeout: function() {
                var that = this;
                setIntervalGetAnchorInfo = setInterval(function() {
                    that.getAnchorInfo();
                }, that.intervalDuration);
                setIntervalGetLiveStatus = setInterval(function() {
                    that.getLiveStatus();
                }, that.intervalDuration);
            },
            singerVote: function(anchor, index) {
                var getUserID = selfUserID,
                    getTargetUserID = anchor.userID;

                if (this.todayHadVote) {
                    console.info('每日仅支持一次！');
                    return;
                }

                this.$http.jsonp(this.singerVoteUrl + '?userID=' + getUserID + '&targetUserID=' + getTargetUserID + '&sessionID=' + selfSessionID + '&sessionToken=' + selfSessionToken + '&peerID=' + selfPeerID)
                    .then(function(res) {
                        var rtnData = res.data,
                            that = this;
                        if (rtnData.rtn == 0) {
                            // console.info(rtnData.msg);
                            this.anchorInfo[index].supportCnt++;
                            this.showAdd[index] = true;

                            this.anchorUserID = getTargetUserID;
                            this.todayHadVote = true;

                            clearInterval(setIntervalGetAnchorInfo);

                            // 点击投票，动画（2秒）以后，重新拉取直播状态以及直播信息
                            setTimeout(function() {
                                that.getAnchorInfo();
                                that.getLiveStatus();
                                that.showAdd[index] = false;

                                setIntervalGetAnchorInfo = setInterval(function() {
                                    that.getAnchorInfo();
                                }, that.intervalDuration);
                            }, 2000);

                        } else if (rtnData.rtn == 2 || rtnData.rtn == 3 || rtnData.rtn == 1) {
                            console.info(rtnData.msg);
                        }
                    })
                    .catch(function(res) {
                        console.info('网络失败');
                        console.info(res);
                    });
            },
            jumpProfile: function(userID) {
                console.log(userID);
                if (window.pingo_js) {
                    window.pingo_js.jumpPage('profile://' + userID);
                }
            },
            jumpVideo: function(anchor) {
                var curUserID = anchor.userID;
                window.location.href = 'http://api.impingo.me/static/singer/preselection-live.html?userID=' + curUserID; // 视频地址
                return;
            },
            jumpLive: function(anchor) {
                window.location.href = 'http://api.impingo.me/miniSite/livePage?liveID=' + anchor.roomID;
            }
        },
        filters: {
            getVoteStatus: function(val, anchor) {
                if (anchor.userID == this.anchorUserID) {
                    // 可支持
                    return true;
                } else {
                    // 不可支持
                    return false;
                }
            },
        },
    });
}
