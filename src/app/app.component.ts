import { Component, OnInit, VERSION } from '@angular/core';
import { ChatService } from './services/chat.services';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  name = 'Angular ' + VERSION.major;

  connected = false;

  startConversationResult: string;

  conversations: Array<SendBird.GroupChannel> | null;
  listConversationsResult: string | null;

  selectedChannel: SendBird.GroupChannel | null;

  messages: Array<
    SendBird.UserMessage | SendBird.FileMessage | SendBird.AdminMessage
  > | null;

  textMessage: any;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.init();
  }

  connect() {
    this.chatService.connect('sendbird', null, (error: any, user: any) => {
      if (!error) {
        // We are connected to Sendbird servers!
        this.registerEventHandlers();
        this.getMyConversations();
        this.connected = true;
      }
    });
  }

  registerEventHandlers() {
    this.chatService.registerEventHandlers(
      '123',
      (data: { event: string; data: any }) => {
        console.log('New event: ' + data.event, data.data);
        if (this.selectedChannel) {
          if (data.event == 'onMessageReceived' && this.messages) {
            if (data.data.channel.url == this.selectedChannel.url) {
              this.messages.push(data.data.message);
            }
          }
        }
      }
    );
  }

  startConversation() {
    let channelName = 'android-tutorial';
    let userIds = ['myTestUserId'];
    this.chatService.createGroupChannel(
      channelName,
      userIds,
      (error: SendBird.SendBirdError, groupChannel: SendBird.GroupChannel) => {
        if (error) {
          this.startConversationResult = 'Error creating the conversation';
        } else {
          this.startConversationResult = 'Conversation created';
          this.getMyConversations();
        }
      }
    );
  }

  getMyConversations() {
    this.chatService.getMyGroupChannels(
      (
        error: SendBird.SendBirdError,
        groupChannels: Array<SendBird.GroupChannel>
      ) => {
        if (error) {
          this.listConversationsResult = 'Unable to get your conversations';
        } else {
          this.conversations = groupChannels;
        }
      }
    );
  }

  getMessages(channel: SendBird.GroupChannel) {
    this.selectedChannel = channel;
    this.chatService.getMessagesFromChannel(
      channel,
      (
        error: SendBird.SendBirdError,
        messages: Array<
          SendBird.UserMessage | SendBird.FileMessage | SendBird.AdminMessage
        >
      ) => {
        if (!error) {
          this.messages = messages;
        }
      }
    );
  }

  updateTextMessage(event: any) {
    const value = event.target.value;
    if (!value || !this.selectedChannel) {
      return;
    }
    this.textMessage = value;
  }

  sendMessage() {
    this.chatService.sendMessage(
      this.selectedChannel,
      this.textMessage,
      (error: SendBird.SendBirdError, userMessage: SendBird.UserMessage) => {
        this.getMessages(this.selectedChannel);
      }
    );
  }
}
