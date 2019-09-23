# Copyright (C) 2019 OM SANTOSHKUMAR MASNE. All Rights Reserved.
# Licensed under the GNU Affero General Public License v3.0 only (AGPL-3.0-only) license.
# See License.txt in the project root for license information.

# The channel class used to create and maintain channels.
# It is used to create new messages and delete a specific message.
class Channel:
    # Creates new channel.
    def __init__(self, name):
        self.name = name
        self.msgs = []
        self.msg_count = 0

        # Limit for maximum number of messages.
        self.LIMIT = 100

    # Creates new message and adds it to the msg list.
    def newMsg(self,message,sender,time):
        msg_id = self.msg_count + 1
        msgData = {"message":message, "sender":sender, "time":time, "id":msg_id}
        self.msg_count = self.msg_count + 1
        self.msgs.append(msgData)

        # Checks if the maximum messages limit is croosed.
        if len(self.msgs) > self.LIMIT:
            del(self.msgs[0])

    # Deletes a specific message.
    def delMsg(self,message_ids):
        for msg in self.msgs:
            if str(msg['id']) in message_ids:

                # delete the message.
                msg['message'] = ''

                message_ids.remove(str(msg['id']))
