const baseURL = '';

const userId = localStorage.getItem('userId');

const socket = io('http://localhost:3000', {
    extraHeaders: {
        'X-user-Id': userId
    }
});

socket.on('roomJoined', (message) => {

    const messageList = document.getElementById('messages');
    const listItem = document.createElement('li');
    listItem.textContent = message;
    messageList.appendChild(listItem);
});


document.getElementById('uploadButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const fileData = {
                buffer: reader.result,
                originalname: file.name,
                mimetype: 'application/octet-stream'
            };
            socket.emit('uploadFile', fileData);
            console.log('file uploaded')
        };
        reader.readAsArrayBuffer(file);
        fileInput.value = '';
    } else {
        alert('Please select a file to upload.');
    }

});


socket.on('fileUploaded', (data) => {
    const fileUrl = data.fileUrl;
    const linkElement = document.createElement('a');
    linkElement.textContent = fileUrl;
    linkElement.href = fileUrl;
    linkElement.target = '_blank';


    const listItem = document.createElement('li');

    listItem.appendChild(linkElement);

    const messageList = document.getElementById('messages');
    messageList.appendChild(listItem);;

});


async function displayMessage(groupId) {
    try {
        const response = await axios.get(`${baseURL}/messages/${groupId}/messages`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const messages = response.data.messages;
        console.log(response.data)
        const messagesList = document.getElementById('messages');
        messagesList.innerHTML = '';
        messages.forEach(message => {
            const listItem = document.createElement('li');
            listItem.classList = "list-group-item list-group-item-action rounded"
            listItem.textContent = `${message.username}: ${message.message}`;
            messagesList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}






document.getElementById('sendMessageButton').addEventListener('click', sendMessage);


async function displayGroups() {
    try {
        const response = await axios.get(baseURL + '/groups', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const groups = response.data.groups;

        const groupsList = document.getElementById('groups');
        groupsList.innerHTML = '';

        groups.forEach(group => {
            const listItem = document.createElement('li');
            listItem.classList = "list-group-item list-group-item-action rounded"
            listItem.textContent = group.name;
            listItem.addEventListener('click', () => {
                currentGroupId = group.id;

                localStorage.setItem('currentGroup', currentGroupId);
                displayGroupInfo(currentGroupId);
                displayMessage(currentGroupId);

            });
            groupsList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching groups:', error);
    }
}

async function displayGroupInfo(groupId) {
    try {
        const response = await axios.get(baseURL + `/groups/${groupId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const { name, members } = response.data.group;

        document.getElementById('groupName').textContent = name;

        const groupMembersList = document.getElementById('groupMembers');
        groupMembersList.innerHTML = '';

        members.forEach(member => {
            const listItem = document.createElement('li');
            listItem.classList = "members"
            listItem.textContent = member.name;
            groupMembersList.appendChild(listItem);
        });



        joinRoom(groupId);


    } catch (error) {
        console.error('Error fetching group info:', error);
    }
}



async function addMember(groupId, email) {
    try {
        await axios.put(`${baseURL}/groups/${groupId}/add-member`, { email }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        alert('User added to the group successfully.');

        displayGroupInfo(localStorage.getItem('currentGroup'));
        document.getElementById('emailInput').value = '';
    } catch (error) {
        console.error('Error adding member to group:', error);
        alert('Error adding member to group. Please try again later/check your email.');
    }
}

async function promoteAdmin(groupId, email) {
    try {
        await axios.put(`${baseURL}/groups/${groupId}/promote-admin`, { email }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        alert('User promoted to admin in the group successfully.');
        document.getElementById('emailInput').value = '';
    } catch (error) {
        console.error('Error promoting member to admin:', error);
        alert('Error promoting member to admin. Please try again later/check your email.');
    }
}

async function removeMember(groupId, email) {
    try {
        await axios.delete(`${baseURL}/groups/${groupId}/remove-member/${email}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        alert(`${email} removed from the group successfully.`);
        document.getElementById('emailInput').value = '';
        displayGroupInfo(groupId)
    } catch (error) {
        console.error('Error removing member from group:', error);
        alert('Error removing member from group. Please try again later/check your email.');
    }
}

document.getElementById('addMemberButton').addEventListener('click', () => {
    const email = document.getElementById('emailInput').value.trim();
    let groupId = localStorage.getItem('currentGroup')

    addMember(groupId, email);
});

document.getElementById('promoteAdminButton').addEventListener('click', () => {
    const email = document.getElementById('emailInput').value.trim();
    let groupId = localStorage.getItem('currentGroup')

    promoteAdmin(groupId, email);
});

document.getElementById('removeMemberButton').addEventListener('click', () => {
    const email = document.getElementById('emailInput').value.trim();
    let groupId = localStorage.getItem('currentGroup')
    removeMember(groupId, email);
});


async function leaveGroup() {

    let groupId = localStorage.getItem('currentGroup')
    try {
        await axios.delete(baseURL + `/groups/${groupId}/leave`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        leaveRoom(groupId);


        window.location.href = 'chat.html';
    } catch (error) {
        console.error('Error leaving group:', error);
    }
}


function joinRoom(groupId) {
    console.log(groupId)
    socket.emit('joinRoom', groupId);

}


function leaveRoom(groupId) {
    socket.emit('leaveRoom', groupId);
}


socket.on('roomLeft', (message) => {

    const messageList = document.getElementById('messages');
    const listItem = document.createElement('li');
    listItem.textContent = message;
    messageList.appendChild(listItem);
});


async function sendMessage() {



    try {
        const message = document.getElementById('messageInput').value.trim();
        if (!message) {
            alert('Please enter a message');
            return;
        }
        let groupId = localStorage.getItem('currentGroup')
        let userId = localStorage.getItem('userId')


        sendMessageToRoom(groupId, message, userId);


        document.getElementById('messageInput').value = '';
    } catch (error) {
        console.error('Error sending message:', error);
    }
}


function sendMessageToRoom(groupId, message, userId) {
    socket.emit('messageToRoom', { room: groupId, message, userId });
}


socket.on('message', (data) => {

    console.log('Received message:', data);
    let groupId = localStorage.getItem('currentGroup')
    displayMessage(groupId)

});


document.getElementById('leaveGroupButton').addEventListener('click', leaveGroup);


window.addEventListener('DOMContentLoaded', async () => {
    const groupId = localStorage.getItem('currentGroup');
    displayGroupInfo(groupId)
    displayGroups();

    displayMessage(groupId);
});