var YouNowPlayer = function () {
    this.language = this.config["language"]["de_DE"];
    this.disconnected();
    var self = this;
    setInterval(function () {
        self.tick();
    }, 1000);
};
YouNowPlayer.prototype.connect = function (streamerID, mode, data, parent) {
    this.parent = parent;
    this.disconnect();
    var self = this;
  console.log(data);
    this.connected(data);
};
YouNowPlayer.prototype.disconnect = function () {
    if (this.pusher != null)
        this.pusher.disconnect();
    this.disconnected();
    playerOnline = false;
};
YouNowPlayer.prototype.disconnected = function () {
    this.isConnected = false;
};
YouNowPlayer.prototype.streamerData = {};
YouNowPlayer.prototype.connected = function (streamerData) {
    this.streamerData = streamerData;
    
    var d = new Date();
    this.timeStart = d.getTime();
    this.duration = this.streamerData.length;

    this.isConnected = true;
    this.tick();
    try {
    var temp = this.streamerData.media.stream;
    } catch(e){
        currentPlayer.disconnect();
        console.log("Error Stream not rly online yet, trying to reconnect");
        clearInterval(intervalID);
        checkIfOnline();
        return;
    }

    flowplayer("streamView", "https://releases.flowplayer.org/swf/flowplayer-3.2.18.swf", {
        clip: {
            url: this.streamerData.media.stream,
            live: true,
            scaling: 'fit',
            provider: 'rtmp'
        },
        plugins: {
            rtmp: {
                url: "flowplayer.rtmp-3.2.13.swf",
                netConnectionUrl: 'rtmp://' + this.streamerData.media.host + this.streamerData.media.app
            },
            controls: {
                all: false,
                play: false,
                scrubber: false,
                mute: true,
                volume: true,
                fullscreen: true
            }
        },
        canvas: {
            backgroundGradient: 'none'
        }
    });
    this.pusher = new Pusher('d5b7447226fc2cd78dbb', {cluster: "younow"});
    this.channel = this.pusher.subscribe("public-channel_" + this.streamerData.userId);
    var self = this;
    this.channel.bind('onLikes', function (data) {
        self.streamerData.likes = data.message.likes;
        self.streamerData.viewers = data.message.viewers;
    });
    this.channel.bind('onViewers', function (data) {
        self.streamerData.likes = data.message.likes;
        self.streamerData.viewers = data.message.viewers;
    });
    this.channel.bind('onChat', function (data) {
        for (i = 0; i < data.message.comments.length; i++)
            self.addChatMessage(data.message.comments[i]);
    });
};
YouNowPlayer.prototype.addChatMessage = function (message) {
    var wasBottom = false;
    var scrolledTop = $('.messages').scrollTop();
    var scrollCheck = $('.messages')[0].scrollHeight - $('.messages').outerHeight() - 100;
    if (scrolledTop > scrollCheck)
        wasBottom = true;
    if ($('.messages').children().length > this.config.maxMessages - 1)
        $('.messages').children()[0].remove();
    $('.messages').append('<div class="chatmessage"><div class="message-head"><a target="_blank" href="https://www.younow.com/' + message.profileUrlString + '"><div class="chip"><strong>' + message.name + '</strong> (' + message.userLevel + ')</div></a></div><div class="message-body">' + message.comment + '</</div>');
    if (wasBottom) {
        console.log('was bottom');
        console.log(scrolledTop, $('.messages')[0].scrollHeight);
        $('.messages').scrollTop($('.messages')[0].scrollHeight);
    }
};
YouNowPlayer.prototype.updateInfo = function () {
    var socialMedia = "";
    if (this.streamerData.user["facebookId"] != null)
        socialMedia += "<a href=\"https://www.facebook.com/" + this.streamerData.user.facebookId + "\"><img src=\"" + this.config.icons.facebook + "\"></a>";
    if (this.streamerData.user["facebookUrl"] != null)
        socialMedia += "<a href=\"" + this.streamerData.user.facebookUrl + "\"><img src=\"" + this.config.icons.facebook + "\"></a>";
    if (this.streamerData.user["twitterHandle"] != null)
        socialMedia += "<a href=\"https://www.twitter.com/" + this.streamerData.user.twitterHandle + "\"><img src=\"" + this.config.icons.twitter + "\"></a>";
    if (this.streamerData.user["youTubeUserName"] != null)
        socialMedia += "<a href=\"https://www.youtube.com/" + this.streamerData.user.youTubeUserName + "\"><img src=\"" + this.config.icons.youtube + "\"></a>";
    $('#streamerInfo').html("<img style=\"float:left;\" height=\"28\" src=\"https://cdn2.younow.com/php/api/channel/getImage/?channelId=" + this.streamerData['userId'] + "\" />" + this.streamerData.country + " | <strong>" + this.streamerData.username + "</strong>  (" + this.streamerData.user.userLevel + " | " + (Math.round((this.streamerData.userlevel % 1) * 100)) + "% " + this.language["to"] + " " + (this.streamerData.user.userLevel + 1) + ") " + this.language["in"] + " #" +this.streamerData.tags + "<br /><div style=\"float:left;\">" + socialMedia + "</div><div style=\"float:left;\"><img style=\"float:left;\" height=\"16\" src=\"" + this.config.icons.coins + "\"><span style=\"margin-top:3px;float:left;\">" + this.streamerData.coins + "</span></div> <div style=\"margin-top:3px; float:left;\">" + "&nbsp&nbsp&nbsp"+  "<strong>" + this.language["chatlvl"] +": "+ this.streamerData.minChatLevel + "</strong></span></div> ");
    //$('#streamerInfo').html("<img style=\"float:left;\" height=\"28\" src=\"https://cdn2.younow.com/php/api/channel/getImage/?channelId=" + this.streamerData['userId'] + "\" />" + this.streamerData.country + " | <strong>" + this.streamerData.username + "</strong>  (" + this.streamerData.user.userLevel + " | " + (Math.round((this.streamerData.userlevel % 1) * 100)) + "% " + this.language["to"] + " " + (this.streamerData.user.userLevel + 1) + ") " + this.language["in"] + " #deutsch" + "<br /><div style=\"float:left;\">" + socialMedia + "</div><div style=\"float:left;\"><img style=\"float:left;\" height=\"16\" src=\"" + this.config.icons.coins + "\"><span style=\"margin-top:3px;float:left;\">" + this.streamerData.coins + "</span></div> <div style=\"margin-left:5px; float:left;\"><img style=\"float:left;\" height=\"16\" src=\"" + this.config.icons.bars + "\"><span style=\"margin-top:3px;float:left;\">" + this.streamerData.barsEarned + "</span></div> ");

    $('#top').html(this.streamerData.viewers + " " + this.language["viewers"]);
    var hours = Math.floor(this.duration / (60 * 60));
    var minutes = Math.floor(this.duration / (60)) % 60;
    var seconds = this.duration % 60;
    var time = "";
    if (hours > 0) time += hours + ":";
    if (minutes > 9) time += minutes + ":";
    else time += "0" + minutes + ":";
    if (seconds > 9) time += seconds;
    else time += "0" + seconds;
    $('#streamBar').html("<div class=\"left\"><div class=\"item\"><img src=\"" + this.config.icons.likes + "\" />" + this.streamerData.likes + "</div><div class=\"item\"><img src=\"" + this.config.icons.shares + "\" />" + this.streamerData.shares + "</div></div></div><div class=\"right\"><div class=\"item\"><img src=\"" + this.config.icons.time + "\" />" + time + "</div><div class=\"item\"><img src=\"" + this.config.icons.views + "\" />" + this.streamerData.viewers + "</div></div>");
}
YouNowPlayer.prototype.failed = function (error, title) {
    this.disconnected();
};
YouNowPlayer.prototype.tick = function () {
    if (this.isConnected) {
        var d = new Date();
        this.duration = this.streamerData.length + Math.floor((d.getTime() - this.timeStart) / 1000);
        console.log("Update Info");
        this.updateInfo();
    }
};
YouNowPlayer.prototype.isConnected = false;
YouNowPlayer.prototype.config = {
    maxMessages: 200,
    icons: {
        "disconnected": "icons/disconnect.png",
        "connected": "icons/connect.png",
        "youtube": "icons/yt.png",
        "facebook": "icons/facebook.png",
        "twitter": "icons/twitter.png",
        "googleplus": "icons/gplus.png",
        "bars": "icons/icon_bar_sm.png",
        "coins": "icons/menu_user_coins1.png",
        "views": "icons/eye-icon.png",
        "time": "icons/clock.png",
        "likes": "icons/thumbs_up.png",
        "shares": "icons/megaphone.png"
    },
    language: {
        "de_DE": {
            "disconnected": "Nicht verbunden",
            "connecting": "Verbinden...",
            "connected": "Verbunden",
            "connect": "Verbinden",
            "streamer": "Streamer:",
            "to": "bis",
            "in": "in",
            "chat": "Chat",
            "users": "Benutzer",
            "viewers": "Zuschauer",
            "moderators": "Moderator(en)",
            "shares": "Teilung(en)",
            "likes": "Like(s)",
            "chatlvl": "Chat-Level"
        }
    }
};