var Player = function() {
  this.setOptions();
  this.init();
  this.bindEvents();
};

Player.prototype.setOptions = function() {
  this.$streamerIDForm = $('.streamer-selection');
  this.$streamerIDInput = this.$streamerIDForm.find('input');
  this.$chat = $('.chat');
  this.$messages = this.$chat.find('.messages');
  this.currentPlayer = new YouNowPlayer();
  
  this.$streamerName = $('.streamer-name');
  this.$streamerLevel = $('.streamer-level');
  this.$streamerGifts = $('.streamer-gifts');
  this.$streamerLikes = $('.streamer-likes');
  this.$streamerFans = $('.streamer-fans');
  this.$streamerChatLevel = $('.streamer-chat-level');
  this.$streamerPartner = $('.streamer-chat-partner');
  
  this.streamerID = 'Drache_Offiziell';
  this.streamerOnline = false;
  this.intervalID = -1;
  this.streamerData = null;
};

Player.prototype.init = function() {
  this.$streamerIDInput.val(this.streamerID);
};

Player.prototype.bindEvents = function() {
  that = this;
  this.$streamerIDForm.on('submit', function(e) {
    e.preventDefault();
    that.streamerID = that.$streamerIDInput.val();
    that.connect();
  });
};

Player.prototype.connect = function() {
  $('body').removeClass('active-stream');
  this.$messages.html('');
  this.getStreamerData();
};

Player.prototype.reconnect = function() {
  this.currentPlayer = new YouNowPlayer();
  this.currentPlayer.connect(this.$streamerIDInput.val(), 1);
};

Player.prototype.getStreamerData = function() {
  that = this;
  this.currentPlayer.disconnect();
  console.log('Connecting to ' + this.streamerID);
  $.ajax({
    url: 'http://www.kaschperle.tk/NoViews4Drache/request/?username=' + this.streamerID,
    dataType: "json",
    success: function(json, b, c) {
      if(json['errorCode'] > 0) {
        that.streamerOnline = false;
        Materialize.toast(that.streamerID + ' ist gerade nicht zuhause. Fielleicht grad Seggsschreiben.', 4000);
      } else {
        that.streamerOnline = true;
        that.streamerData = json;
        that.userData = {
          'name': that.$streamerIDInput.val(),
          'id': json.userId,
          'level': Math.floor(json.userlevel),
          'likes': json.likes,
          'gifts': json.giftsValue,
          'chatLevel': json.minChatLevel,
          'age': json.age,
          'maxLikes': json.maxLikesInBroadcast,
          'fans': json.totalFans,
          'partner': json.partner,
          'info': json.broadcasterInfo,
          'streamURL': 'rtmp://' + json.media.host + json.media.app + '/' + json.media.stream
        };
        that.appendData();
        $('body').addClass('active-stream');
        that.currentPlayer.connect(that.streamerID, 0, that.streamerData, that);
      }
    },
    error: function() {
      Materialize.toast('Request konnte nicht versendet werden. Bitte versuch es noch einmal oder teste einen Mirror.', 4000);
    }
  });
};

Player.prototype.appendData = function() {
  this.$streamerName.text(this.userData.name);
  this.$streamerLevel.text(this.userData.level);
  this.$streamerGifts.text(this.userData.gifts);
  this.$streamerLikes.text(this.userData.likes);
  this.$streamerFans.text(this.userData.fans);
};

$(document).ready(function () {
  new Player();
});