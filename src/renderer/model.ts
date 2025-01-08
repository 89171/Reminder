import axios from 'axios';

async function createChatMessage({
  token,
  bot_id,
  user_id,
  content
}:any) {
  const url = 'https://api.coze.cn/v3/chat';
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(url, {
        bot_id,
        user_id,
        additional_messages: [
        {
          content,
          "content_type": "text",
          "role": "user"
        },
      ],
      auto_save_history: true,
    }, { headers });
    return response.data;
  } catch (error) {
    console.error('Error creating chat message:', error);
    return null;
  }
}

async function fetchChatStatus(conversationId: string, chatId: string, token: string) {
  const url = `https://api.coze.cn/v3/chat/retrieve?conversation_id=${conversationId}&chat_id=${chatId}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.get(url, { headers });
    console.log('vvvvvvvvvvv2', response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching chat status:', error);
    return null;
  }
}

async function fetchChatDetails(conversationId: string, chatId: string, token: string, cb: any, errorcb: any) {
  const url = `https://api.coze.cn/v3/chat/message/list?conversation_id=${conversationId}&chat_id=${chatId}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.get(url, { headers });
    cb?.(response.data)
  } catch (error) {
    console.log(error);
    return errorcb?.(error)
  }
}

async function getAnswer({
  token,
  bot_id,
  user_id,
  content,
  cb,
  errorcb
} : any) {
  const createResponse = await createChatMessage({
    token,
    bot_id,
    user_id,
    content
  });

  if (!createResponse) {
    console.error('Failed to create chat message.');
    return;
  }
  console.log('vvvvvvvvvvv1', createResponse)
  const conversationId = createResponse.data.conversation_id;
  const chatId = createResponse.data.id;

  let attempts = 0;
  const maxAttempts = 5;
  const interval = 1000; // 1 second
    const intervalId = setInterval(async () => {
      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
        return;
      }

      const statusResponse = await fetchChatStatus(conversationId, chatId, token);
      if (statusResponse && statusResponse.data.status === 'completed') {
        clearInterval(intervalId);
        await fetchChatDetails(conversationId, chatId, token, cb, errorcb);
      }

      attempts += 1;
    }, interval);
}
export { getAnswer }
// main().catch(console.error);
