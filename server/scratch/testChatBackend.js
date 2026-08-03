const API_BASE = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('🚀 Starting integration tests for Wisdom AI Chat Backend...');

  const user1Email = `test_chat_user_1_${Date.now()}@wisdom.com`;
  const user2Email = `test_chat_user_2_${Date.now()}@wisdom.com`;
  const password = 'password123';

  let token1, token2;
  let userId1, userId2;
  let conversationId;

  // 1. Helper to register/login users
  const getAuthToken = async (email, name) => {
    try {
      const registerRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await registerRes.json();
      if (data.success) {
        return { token: data.data.token, userId: data.data._id };
      }

      // If already registered, login
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const loginData = await loginRes.json();
      return { token: loginData.data.token, userId: loginData.data._id };
    } catch (err) {
      console.error(`Failed to auth user ${name}:`, err.message);
      process.exit(1);
    }
  };

  console.log('\n🔑 Registering / Logging in test users...');
  const user1 = await getAuthToken(user1Email, 'Test User One');
  token1 = user1.token;
  userId1 = user1.userId;
  console.log(`✅ User 1 Authenticated (ID: ${userId1})`);

  const user2 = await getAuthToken(user2Email, 'Test User Two');
  token2 = user2.token;
  userId2 = user2.userId;
  console.log(`✅ User 2 Authenticated (ID: ${userId2})`);

  // 2. POST /api/chat/new
  console.log('\n🧪 Testing POST /api/chat/new...');
  const createRes = await fetch(`${API_BASE}/chat/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token1}`
    }
  });
  const createData = await createRes.json();
  if (createRes.status === 201 && createData.success && createData.data) {
    console.log('✅ POST /api/chat/new passed!');
    conversationId = createData.data._id;
    console.log(`   Created Conversation ID: ${conversationId}`);
    if (createData.data.title !== 'New Conversation') {
      console.error('❌ Failed: Expected title to be "New Conversation"');
      process.exit(1);
    }
    if (!Array.isArray(createData.data.messages) || createData.data.messages.length !== 0) {
      console.error('❌ Failed: Expected messages to be an empty array');
      process.exit(1);
    }
  } else {
    console.error('❌ POST /api/chat/new failed:', createRes.status, createData);
    process.exit(1);
  }

  // 3. GET /api/chat (list conversations)
  console.log('\n🧪 Testing GET /api/chat...');
  const listRes = await fetch(`${API_BASE}/chat`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token1}` }
  });
  const listData = await listRes.json();
  if (listRes.status === 200 && listData.success && Array.isArray(listData.data)) {
    const found = listData.data.some(c => c._id === conversationId);
    if (found) {
      console.log('✅ GET /api/chat passed! Found created conversation in user\'s conversations.');
    } else {
      console.error('❌ GET /api/chat failed: Created conversation not in list');
      process.exit(1);
    }
  } else {
    console.error('❌ GET /api/chat failed:', listRes.status, listData);
    process.exit(1);
  }

  // 4. GET /api/chat/:conversationId
  console.log('\n🧪 Testing GET /api/chat/:conversationId...');
  const getRes = await fetch(`${API_BASE}/chat/${conversationId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token1}` }
  });
  const getData = await getRes.json();
  if (getRes.status === 200 && getData.success && getData.data._id === conversationId) {
    console.log('✅ GET /api/chat/:conversationId passed!');
  } else {
    console.error('❌ GET /api/chat/:conversationId failed:', getRes.status, getData);
    process.exit(1);
  }

  // 5. Security check: User 2 should NOT access User 1's conversation
  console.log('\n🧪 Testing security: User 2 fetching User 1\'s conversation...');
  const secGetRes = await fetch(`${API_BASE}/chat/${conversationId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token2}` }
  });
  const secGetData = await secGetRes.json();
  if (secGetRes.status === 403 && !secGetData.success) {
    console.log('✅ Security constraint passed! User 2 received 403 Forbidden.');
  } else {
    console.error('❌ Security constraint failed: User 2 accessed User 1\'s conversation.', secGetRes.status, secGetData);
    process.exit(1);
  }

  // 6. POST /api/chat/:conversationId/message (send message and check reply)
  console.log('\n🧪 Testing POST /api/chat/:conversationId/message...');
  const msgContent = 'How do I find peace and mindfulness?';
  const msgRes = await fetch(`${API_BASE}/chat/${conversationId}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token1}`
    },
    body: JSON.stringify({ content: msgContent })
  });
  const msgData = await msgRes.json();
  if (msgRes.status === 200 && msgData.success) {
    const messages = msgData.data.messages;
    if (messages.length === 2) {
      const userMsg = messages[0];
      const assistantMsg = messages[1];

      if (userMsg.role === 'user' && userMsg.content === msgContent && userMsg.createdAt) {
        console.log('✅ User message correctly saved!');
      } else {
        console.error('❌ Failed: User message structure incorrect', userMsg);
        process.exit(1);
      }

      if (assistantMsg.role === 'assistant' && assistantMsg.content) {
        console.log(`✅ Assistant reply correctly saved: "${assistantMsg.content}"`);
      } else {
        console.error('❌ Failed: Assistant reply was incorrect or empty', assistantMsg);
        process.exit(1);
      }

      console.log('✅ POST /api/chat/:conversationId/message passed!');
    } else {
      console.error('❌ Failed: Expected exactly 2 messages in conversation, got', messages.length);
      process.exit(1);
    }
  } else {
    console.error('❌ POST /api/chat/:conversationId/message failed:', msgRes.status, msgData);
    process.exit(1);
  }

  // 7. Security check: User 2 should NOT post message to User 1's conversation
  console.log('\n🧪 Testing security: User 2 sending message to User 1\'s conversation...');
  const secMsgRes = await fetch(`${API_BASE}/chat/${conversationId}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token2}`
    },
    body: JSON.stringify({ content: 'Hack query' })
  });
  const secMsgData = await secMsgRes.json();
  if (secMsgRes.status === 403 && !secMsgData.success) {
    console.log('✅ Security constraint passed! User 2 post message returned 403 Forbidden.');
  } else {
    console.error('❌ Security constraint failed: User 2 posted message to User 1\'s conversation.', secMsgRes.status, secMsgData);
    process.exit(1);
  }

  // 8. Security check: User 2 should NOT delete User 1's conversation
  console.log('\n🧪 Testing security: User 2 deleting User 1\'s conversation...');
  const secDelRes = await fetch(`${API_BASE}/chat/${conversationId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token2}` }
  });
  const secDelData = await secDelRes.json();
  if (secDelRes.status === 403 && !secDelData.success) {
    console.log('✅ Security constraint passed! User 2 delete returned 403 Forbidden.');
  } else {
    console.error('❌ Security constraint failed: User 2 deleted User 1\'s conversation.', secDelRes.status, secDelData);
    process.exit(1);
  }

  // 9. DELETE /api/chat/:conversationId
  console.log('\n🧪 Testing DELETE /api/chat/:conversationId...');
  const delRes = await fetch(`${API_BASE}/chat/${conversationId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token1}` }
  });
  const delData = await delRes.json();
  if (delRes.status === 200 && delData.success) {
    console.log('✅ DELETE /api/chat/:conversationId passed!');
  } else {
    console.error('❌ DELETE /api/chat/:conversationId failed:', delRes.status, delData);
    process.exit(1);
  }

  // 10. Verify deletion
  console.log('\n🧪 Verifying deletion (GET /api/chat/:conversationId should return 404)...');
  const getDeletedRes = await fetch(`${API_BASE}/chat/${conversationId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token1}` }
  });
  const getDeletedData = await getDeletedRes.json();
  if (getDeletedRes.status === 404) {
    console.log('✅ Deletion verified successfully! Returned 404 Not Found.');
  } else {
    console.error('❌ Deletion verification failed: Expected 404, got', getDeletedRes.status, getDeletedData);
    process.exit(1);
  }

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Chat backend architecture is fully verified.');
}

runTests();
