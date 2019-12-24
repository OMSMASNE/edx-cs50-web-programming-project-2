/*
    Copyright (C) 2019 OM SANTOSHKUMAR MASNE. All Rights Reserved.
    Licensed under the GNU Affero General Public License v3.0 only (AGPL-3.0-only) license.
    See License.txt in the project root for license information.
*/

var username;
var current_channel = '';

// A list for keeping records of the currently selected messages.
var selection_list = [];

// A variable for keeping count of new messages.
var count_msg = 0;
// A variable for keeping count of test channels.
var count_test_channels = 0;

var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

document.addEventListener("DOMContentLoaded", manage);

// The main function used for startup.
function manage()
{
    // Add some space between the Chat window and the Footer.
    var screen_height = screen.height;
    if(screen_height < 800)
    {
        document.getElementById("space-maker").innerHTML = "<br><br><br><br><br>";
    }

    // A variable for keeping track of the new channel's name.
    var new_channel_name;

    // Used to login the user.
    login();
    console.log("The after login username : " + username);

    // Gets the name of the channel that was used in previous session.
    current_channel = localStorage.getItem('current_channel');

    // Switches to the current channel.
    select_custom_channel(current_channel);

    // Gets a list of all the channels available on the server.
    channel_list();

    // Gets a list of all the users registered on the server.
    users_list();

    document.getElementById("new_channel").onclick = () => {
        document.getElementById('modal_user_response').placeholder = "CHANNEL'S NAME HERE";
        document.getElementById("modal_title_text").innerHTML = "Enter your channel's name:";
        document.getElementById('modal_user_response').value = '';

        document.getElementById('modal_submit').onclick = () => {
            if(document.getElementById("modal_user_response").value.length > 0)
            {
                new_channel_name = document.getElementById('modal_user_response').value;
                document.getElementById('modal_user_response').value = '';
                create_channel();
            }
            else
            {
                document.getElementById('modal_user_response').value = '';
                alert("Please enter a channel name!");
                $('#mymodal').modal('hide')
                setTimeout(new_channel_modal, 800);
            }
        }
        new_channel_modal();
    }

    function create_channel()
    {
        console.log("Creator name:" + username + ", channel name:" + new_channel_name);
        socket.emit('create_channel', {'creator_name': username, 'channel_name': new_channel_name});
        channel_list();
    }


    socket.on('channel_created', channel_list);

    socket.on('channel_not_created', data => {
        alert(data.reason);
    });

    socket.on('user_created', users_list);

    socket.on('cannot_register', data => {
        console.log("CANNOT REGISTER!")
        username = null;
        localStorage.removeItem('username');
        alert(data.reason);
        setTimeout(login, 500);
    });

    socket.on('new_msg_done', msg_list);

    // Invokes the msg_list function if a message list refresh signal is recieved.
    socket.on('refresh_msg_list', msg_list);

    // Invokes the delete_msg function.
    document.querySelector('#delete_msg_btn').onclick = delete_msg;

    // Used to check and submit the message.
    document.querySelector('#user_msg_send').onsubmit = () => {
        var message = document.querySelector('#user_msg').value;

        if (current_channel === '' || current_channel == 'null')
        {
            alert('Select a channel first!');
            return false;
        }
        if(message.length > 0)
        {
            document.querySelector('#user_msg').value = '';
            socket.emit('new_message', {'message':message, 'sender':username, 'for_channel':current_channel});
            return false;
        }
        else
        {
            alert('Message cannot be blank!');
            return false;
        }
    }

    // Invokes the logout function.
    document.querySelector('#logout').onclick = logout;
}


// Gets a list of all the users registered on the server.
function users_list()
{
    socket.emit("users_list");

    socket.on("send_users_list", (data) => {
        document.querySelector('#server_users').innerHTML = '';

        for (var i = 0; i < (data.users_list.length); i++)
        {
            const button = document.createElement('button');
            button.innerHTML = data.users_list[i];

            if (data.users_list[i] == username)
            {
                button.setAttribute('class', 'btn btn-outline-success active user-btns');
            }
            else
            {
                button.setAttribute('class', 'btn btn-outline-primary active user-btns');
            }

            button.setAttribute('style', 'margin-top:5px; pointer-events:none;')
            document.querySelector('#server_users').append(button);
        }
    });
}

// Gets a list of all the channels available on the server.
function channel_list()
{
    socket.emit("channels_list");

    socket.on("send_channel_list" , (data) => {

        if(data.channels_list.length < 1)
        {
            return false;
        }

        document.querySelector('#channels').innerHTML = '';

        for (var i = 0; i < (data.channels_list.length); i++) 
        {
            const button = document.createElement('button');
            button.innerHTML = data.channels_list[i];
            button.setAttribute('class', 'btn btn-outline-primary');

            button.addEventListener("click", select_channel);

            button.setAttribute('style', 'margin-top:5px;')

            document.querySelector('#channels').append(button);
        } 
    });
}

// Gets a list of all the messages on a channel.
function msg_list()
{
    if(current_channel == 'null')
    {
        return false;
    }

    socket.emit("msg_list", { 'for_channel':current_channel });

    socket.on("sent_msg_list", (data) => {

        if(!data.msg_list_status)
        {
            console.log("MSG LIST REJECTED!");
            return false;
        }

        document.querySelector('#msgs').innerHTML = '';

        for(var i = 0; i < (data.msg_list.length); i++)
        {
            const sender = data.msg_list[i].sender;
            const msg_id = data.msg_list[i].id;

            const msg_time_stamp = data.msg_list[i].time;

            // Checks if the message is empty.
            // Empty message means that the message is deleted from the server.
            if(data.msg_list[i].message === '')
            {
                // Continue to the next item in the loop.
                continue;
            }

            const li = document.createElement('li');

            const msg_metadata = "@Sender : " + sender + " -- @Time : " + msg_time_stamp;

            let metadata_element = "<span class = 'msg_metadata'>" + msg_metadata + "</span>";
            li.innerHTML = data.msg_list[i].message + "<br>" + metadata_element;

            if(sender === username)
            {
                li.setAttribute('class', 'sent_msg sent_msg_unselected');
                li.setAttribute('data-msg_owner', '1');
            }
            else
            {
                li.setAttribute('class', 'recieved_msg sent_msg_unselected');
                li.setAttribute('data-msg_owner', '0');
            }
            li.addEventListener('click', select_msg);
            li.setAttribute('data-msg_id', msg_id);
            li.setAttribute('data-selected', '0');
            document.querySelector('#msgs').append(li);
        }

        // Scrolls to the last message.
        document.querySelector('#msgs_style').scrollTop = document.querySelector('#msgs').scrollHeight;
    });
}

// Sends a request for removal of selected message(s).
function delete_msg()
{
    let msg_removal_list = selection_list;
    selection_list = [];
    console.log('MSG removal list:' + msg_removal_list);

    socket.emit("msg_removal", {'msg_removal_list':msg_removal_list, 'for_channel':current_channel });

    msg_list();
}

// Selects a message.
function select_msg(event)
{
    selected_msg = event.target;
    selected_msg_id = selected_msg.dataset.msg_id;
    selection_status = selected_msg.dataset.selected;

    console.log('SELECTED MSG ID: ' + selected_msg_id);

    if(selected_msg.dataset.msg_owner == '1')
    {
        if(selection_status === '1')
        {
            selected_msg.setAttribute('data-selected', 0);
            selected_msg.setAttribute('class', 'sent_msg sent_msg_unselected');

            // Gets the index of unselected message (id) and removes it from the selection list.
            let position = selection_list.indexOf(selected_msg_id);
            selection_list.splice(position, 1);
        }
        else
        {
            selected_msg.setAttribute('data-selected', 1);
            selected_msg.setAttribute('class', 'sent_msg sent_msg_selected');

            // Adds the selected message (id) to the selection list.
            selection_list.push(selected_msg_id);
        }
    }

    //Prints the selection_list.
    console.log("Currently selected MSGs:" + selection_list);
}

// Selects a channel.
function select_channel(event)
{
    current_channel = event.target.innerHTML;

    // Clears the selection list.
    selection_list = [];

    // Leaves the old channel.
    old_channel = localStorage.getItem('current_channel');
    if(!(old_channel === '' || old_channel == 'null'))
    {
        socket.emit('leave', {'channel':old_channel});
    }
    // Joins the new channel.
    socket.emit('join', {'channel':current_channel});

    if(current_channel == 'null')
    {
        return false;
    }

    socket.emit("request_channel_info", { 'for_channel':current_channel});

    console.log("Current channel : " + current_channel);
    msg_list();

    socket.on("sent_channel_info_creator", (data) => {
        var channel_info = "Channel's creator: " + data.channel_creator;
        document.getElementById('channel_info').innerHTML= channel_info;
    });

    //Sets the current channel in the local storage.
    localStorage.setItem('current_channel', current_channel);
}

// Selects a custom channel.
// The channel's name is given as a parameter to the function.
function select_custom_channel(channel_name)
{
    // Clears the selection list.
    selection_list = [];

    // Leaves the old channel.
    old_channel = localStorage.getItem('current_channel');
    if(!(old_channel === '' || old_channel == 'null'))
    {
        socket.emit('leave', {'channel':old_channel});
    }
    // Joins the new channel.
    socket.emit('join', {'channel':channel_name});

    if(current_channel == 'null')
    {
        return false;
    }

    socket.emit("request_channel_info", {'for_channel':channel_name});
    current_channel = channel_name;

    console.log("Current channel : " + current_channel);
    msg_list();

    socket.on("sent_channel_info_creator", (data) => {
        var channel_info = "Channel's creator: " + data.channel_creator;
        document.getElementById('channel_info').innerHTML= channel_info;
    });

    //Sets the current channel in the local storage.
    localStorage.setItem('current_channel', current_channel);
}

// Used to login a user.
function login()
{
    console.log("LOGGING IN THE USER!");

    //Setup the user
    if(!localStorage.getItem('username'))
    {
        document.getElementById('modal_user_response').placeholder = "YOUR NAME HERE";
        document.getElementsByClassName("modal_title").innerHTML = "Enter your name:";
        show_modal();
        console.log("MODAL for user login");
        document.getElementById("modal_submit").addEventListener("click", check_username);
    }
    else
    {
        username = localStorage.getItem('username');
        console.log("The login username : " + username);
        document.getElementById('username').innerHTML = username;
    }
}

// Used to logout a user.
function logout()
{
    localStorage.setItem('username', '');

    // Clears the message window.
    document.getElementById('msgs').innerHTML = '';

    // Sends the logout information.
    socket.emit('user_logout', {'username':username});

    alert('LOGGED OUT SUCCESSFULLY.\n\nLOGIN AGAIN TO USE APP.');
    setTimeout(login, 500);
}

function show_modal()
{
    $('#myModal').modal({backdrop:'static', keyboard: false, focus: false})
    document.querySelector('#modal_close_btn').style.display = "none";

    $('#myModal').modal('show')

    $('#myModal').on('shown.bs.modal', function () {
        $('#modal_user_response').trigger('focus')
    })
}

function new_channel_modal()
{
    $('#myModal').modal({backdrop:true, keyboard: true, focus: false})
    document.querySelector('#modal_close_btn').style.display = "initial";

    $('#myModal').modal('show')

    $('#myModal').on('shown.bs.modal', function () {
        $('#modal_user_response').trigger('focus')
    })
}

// Checks if the entered username is valid.
function check_username() 
{
    if(document.getElementById("modal_user_response").value.length > 0)
    {
        username = document.getElementById('modal_user_response').value;
        document.getElementById('modal_user_response').value = '';
        document.getElementById('username').innerHTML = username;
        localStorage.setItem('username', username);

        //Sends the user's name to server.
        socket.emit('create_user', {'username':username});

        document.getElementById("modal_submit").removeEventListener("click", check_username);
    }
    else
    {
        alert("Please enter an username!");
        $('#myModal').modal('hide')
        setTimeout(show_modal, 800);
    }
}
