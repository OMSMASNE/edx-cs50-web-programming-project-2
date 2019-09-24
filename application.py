# Copyright (C) 2019 OM SANTOSHKUMAR MASNE. All Rights Reserved.
# Licensed under the GNU Affero General Public License v3.0 only (AGPL-3.0-only) license.
# See License.txt in the project root for license information.

import os
import datetime
import requests

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, socketio
from flask_socketio import join_room, leave_room

from channels import Channel

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

#Stores the names of currently logged in users.
users = []

#Stores the objects of class Channel.
channels = []

# Stores the channel's name and that channel's creator's name.
channels_info = {}

#Used for the channels_list function.
#Stores the names of the channels
channels_list_to_send = []


# This is the route to main chat interface (homepage).
# It renders the chat applicaion interface.
@app.route("/")
def index():
    return render_template("index.html")


# Listens to calls for channels list.
# It emits the channels list to the caller.
@socketio.on("channels_list")
def channels_list():
    del channels_list_to_send[:]

    for channel in channels:
        channels_list_to_send.append(channel.name)

    emit("send_channel_list", {"channels_list": channels_list_to_send}, broadcast = False)


# Listens to calls for channel's information.
# It emits the name of channel's creator to the caller.
@socketio.on("request_channel_info")
def channels_info_to_send(data):
    for_channel = str(data["for_channel"])
    channel_creator = channels_info[for_channel]
    emit("sent_channel_info_creator", {"channel_creator": channel_creator}, braodcast = False)


# Listens for calls for users list.
# It emits the users list to the caller.
@socketio.on("users_list")
def users_list():
    print("\n\n\n\n\n\nUSERS:" + str(users) + "\n\n")
    emit("send_users_list", {"users_list": users}, broadcast = False)


# Listens for requests to create new users.
# A new user is created if the requested username is not already occupied.
# If the new user cannot be created, then, the caller is returned an error message.
# If the new  user is created, then, the fuction adds the new user to the users list.
# It also emits the new user list to every user if a new user is created.
@socketio.on("create_user")
def create_user(data):
    username = str(data["username"])
    if username not in users:
        users.append(username)
        print("\n\n\n\nThe new user is: ")
        print(username)
    else:
        print("\n\n\n\n\nNO USER CREATED!")
        print("USERNAME: " + username + " ALREADY EXISTS!" + "\n")
        reason = "USERNAME ALREADY EXISTS!"
        emit("cannot_register", {"reason": reason}, broadcast = False)

    emit("send_users_list", {"users_list": users}, broadcast = True)


# Listens to calls for user logout.
# This function removes the requested user from the users list if it is present there.
# If the user is removed, then, the new users list is emitted to every user.
@socketio.on("user_logout")
def user_logout(data):
    username = str(data["username"])
    if username in users:
        users.remove(username)
        print("\n\n\n\nThe removed user is: ")
        print(username)
    else:
        print("\n\n\n\nRemoved no user.")
    emit("send_users_list", {"users_list": users}, broadcast = True)


# Listens for requests to create a new channel.
# It checks if a channel with the same name is already available.
# If the channel name is already occupied, then, the caller is returned an error message and new channel is not created.
# If a new channel is created, then, the "new channel created" message is emitted to every user.
@socketio.on("create_channel")
def new_channel(new_channel):
    #Obtain the channel's name.
    channel_name = str(new_channel["channel_name"])

    if channel_name not in channels_info:
        #Obtain the channel's information.
        creator_username = str(new_channel["creator_name"])
        channels_info[channel_name] = creator_username

        #Creates new channel object and adds that object to channels list.
        channel_data = Channel(channel_name)
        channels.append(channel_data)

        emit("channel_created",  broadcast = True)
    else:
        reason = "Channel not created!\n\nChannel name already exists.\nTry a different name please."
        emit("channel_not_created", {"reason": reason}, broadcast = False)


# Listen for calls for new messages.
# It creates a new message using the sender information, sent message.
# It creates a time stamp and adds the new message to the requested channel.
# Once the new message is added, then, a message for "new message added" is emitted to all users of that channel.
@socketio.on("new_message")
def new_msg(data):
    new_message = str(data["message"])
    sender = str(data["sender"])
    for_channel = str(data["for_channel"])
    time = '{:%H:%M:%S}'.format(datetime.datetime.now())

    for channel in channels:
        if channel.name  == for_channel:
            channel.newMsg(new_message, sender, time)

    emit("new_msg_done", broadcast = False, room = for_channel)


# Listens for requests for message list.
# It returns the messages of a requested channel.
@socketio.on("msg_list")
def msg_list(data):
    msg_list_data = []
    msg_list_status = True
    channel_found = False
    for_channel = str(data["for_channel"])

    for channel in channels:
        if channel.name == for_channel:
            msg_list_data = channel.msgs
            msg_list_status = True
            channel_found = True
            break

    if not channel_found:
        msg_list_status = False

    emit("sent_msg_list", { "msg_list": msg_list_data, "msg_list_status": msg_list_status}, broadcast = False)


# Listens for requests for removal of messages.
# This function removes the requested messages from the requested channel.
# On removal of the messages, a message for "refresh message list" is emitted to all users of that channel.
@socketio.on("msg_removal")
def msg_removal(data):
    for_channel = str(data["for_channel"])
    msg_removal_list = data["msg_removal_list"]

    for channel in channels:
         if channel.name == for_channel:
            channel.delMsg(msg_removal_list)

    emit("refresh_msg_list", broadcast = False, room = for_channel)


# Listens for requests for joining a channel.
# This fuction adds the user to the desired channel.
@socketio.on('join')
def on_join(data):
    room = str(data["channel"])
    join_room(room)


# Listens for requests for leaving a channel.
# This fuctions removes the user from the desired channel.
@socketio.on('leave')
def on_leave(data):
    room = str(data["channel"])
    leave_room(room)
