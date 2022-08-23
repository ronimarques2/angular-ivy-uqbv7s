import { Injectable, Query } from '@angular/core';
import SendBird from 'sendbird';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  sb: any;

  // https://dashboard.sendbird.com
  APP_ID = '24C5C147-5E42-43AF-8EE1-261D4C967D1B';

  init() {
    this.sb = new SendBird({ appId: this.APP_ID });
    SendBird.setLogLevel(SendBird.LogLevel.ERROR);
  }

  connect(userId: string, token: any, callback: any) {
    this.sb.connect(userId, token, (user: any, error: any) => {
      callback(user, error);
    });
  }

  isConnected() {
    return this.sb && this.sb.currentUser && this.sb.currentUser.userId;
  }

  getConnectedUser() {
    return this.sb && this.sb.currentUser ? this.sb.currentUser : null;
  }

  registerEventHandlers(UNIQUE_HANDLER_ID: string, callback: any) {
    var channelHandler = new this.sb.ChannelHandler();

    channelHandler.onMessageReceived = (channel, message) => {
      callback({
        event: 'onMessageReceived',
        data: {
          channel,
          message,
        },
      });
    };
    channelHandler.onMessageUpdated = function (channel, message) {};
    channelHandler.onMessageDeleted = function (channel, messageId) {};
    channelHandler.onMentionReceived = function (channel, message) {};
    channelHandler.onChannelChanged = function (channel) {};
    channelHandler.onChannelDeleted = function (channelUrl, channelType) {};
    channelHandler.onChannelFrozen = function (channel) {};
    channelHandler.onChannelUnfrozen = function (channel) {};
    channelHandler.onMetaDataCreated = function (channel, metaData) {};
    channelHandler.onMetaDataUpdated = function (channel, metaData) {};
    channelHandler.onMetaDataDeleted = function (channel, metaDataKeys) {};
    channelHandler.onMetaCountersCreated = function (channel, metaCounter) {};
    channelHandler.onMetaCountersUpdated = function (channel, metaCounter) {};
    channelHandler.onMetaCountersDeleted = function (
      channel,
      metaCounterKeys
    ) {};
    channelHandler.onChannelHidden = function (groupChannel) {};
    channelHandler.onUserReceivedInvitation = function (
      groupChannel,
      inviter,
      invitees
    ) {};
    channelHandler.onUserDeclinedInvitation = function (
      groupChannel,
      inviter,
      invitee
    ) {};
    channelHandler.onUserJoined = function (groupChannel, user) {};
    channelHandler.onUserLeft = function (groupChannel, user) {};
    channelHandler.onDeliveryReceiptUpdated = function (groupChannel) {};
    channelHandler.onReadReceiptUpdated = function (groupChannel) {};
    channelHandler.onTypingStatusUpdated = function (groupChannel) {};
    channelHandler.onUserEntered = function (openChannel, user) {};
    channelHandler.onUserExited = function (openChannel, user) {};
    channelHandler.onUserMuted = function (channel, user) {};
    channelHandler.onUserUnmuted = function (channel, user) {};
    channelHandler.onUserBanned = function (channel, user) {};
    channelHandler.onUserUnbanned = function (channel, user) {};
    channelHandler.onChannelMemberCountChanged = function (channels) {};
    channelHandler.onChannelParticipantCountChanged = function (channels) {};

    // Add this channel event handler to the `SendBird` instance.
    this.sb.addChannelHandler(UNIQUE_HANDLER_ID, channelHandler);
  }

  createGroupChannel(
    channelName: string,
    userIds: Array<string>,
    callback: any
  ) {
    const params = new this.sb.GroupChannelParams();
    params.addUserIds();
    params.addUserIds(userIds);
    params.name = channelName;
    this.sb.GroupChannel.createChannel(
      params,
      (groupChannel: SendBird.GroupChannel, error: SendBird.SendBirdError) => {
        callback(error, groupChannel);
      }
    );
  }

  getMyGroupChannels(callback: any) {
    const listQuery = this.sb.GroupChannel.createMyGroupChannelListQuery();
    listQuery.includeEmpty = true;
    listQuery.memberStateFilter = 'joined_only';
    listQuery.order = 'latest_last_message';
    listQuery.limit = 15; // The value of pagination limit could be set up to 100.
    if (listQuery.hasNext) {
      listQuery.next((groupChannels, error) => {
        callback(error, groupChannels);
      });
    }
  }

  getMessagesFromChannel(groupChannel: SendBird.GroupChannel, callback: any) {
    const listQuery = groupChannel.createPreviousMessageListQuery();
    listQuery.limit = 10;
    listQuery.includeMetaArray = true;
    listQuery.includeReaction = true;
    // Retrieving previous messages.
    listQuery.load((messages, error) => {
      callback(error, messages);
    });
  }

  sendMessage(
    channel: SendBird.GroupChannel | SendBird.OpenChannel,
    message: string,
    callback: any
  ) {
    const params = new this.sb.UserMessageParams();
    params.message = message;
    channel.sendUserMessage(params, (userMessage, error) => {
      callback(error, userMessage);
    });
  }
}
