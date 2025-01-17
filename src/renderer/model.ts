const axios = require('axios');

async function createAndPollMessage({ token, ...params}) {
  const createMessageUrl = 'https://api.coze.cn/v3/chat';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    // Step 1: 创建消息
    const createResponse = await axios.post(createMessageUrl, params, { headers });
    const { id: chat_id, conversation_id } = createResponse.data.data;
    console.log('createResponse.data.data', createResponse.data.data)
    // Step 2: 定义轮询函数
    const pollMessageStatus = async () => {
      const pollUrl = `https://api.coze.cn/v3/chat/retrieve?conversation_id=${conversation_id}&chat_id=${chat_id}`;
      for (let attempt = 0; attempt < 6; attempt++) {
        const pollResponse = await axios.get(pollUrl, { headers });
        console.log('pollResponse.data.data', pollResponse.data.data)
        const status = pollResponse.data.data.status;

        if (status === 'completed') {
          // Step 3: 调用详情接口
          const detailUrl = `https://api.coze.cn/v3/chat/message/list?conversation_id=${conversation_id}&chat_id=${chat_id}`;
          const detailResponse = await axios.get(detailUrl, { headers });

        console.log('detailResponse.data.data', detailResponse.data.data)
          // 返回 type 为 'answer' 的元素
          const answer = detailResponse.data.data.find(item => item.type === 'answer');
          if (answer) {
            // 格式化 content 为数组
            let contentArray;
            try {
              // 处理 content 字段
              let contentString = answer.content.replace(/\n/g, '').replace(/'/g, '"');
              contentString = contentString.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
              contentArray = JSON.parse(contentString);
              contentArray.length && (contentArray[0].id = chat_id)
            } catch (error) {
              console.error('Error parsing content:', error);
              throw error;
            }
            return contentArray;
          }
        }
        // 等待 1 秒再进行下一次轮询
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };

    return await pollMessageStatus();
  } catch (error) {
    console.error('Error:', error);
    throw error
  }
}

export { createAndPollMessage }
