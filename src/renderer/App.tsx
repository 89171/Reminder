import { useEffect, useState } from 'react';
import { Layout, Table, Button, Input, Form, message } from 'antd';
import './App.css'
import { createAndPollMessage } from './model';
const { Header, Content, Footer } = Layout;
const token = 'pat_9r3gsyMy8m9ZmJw6wzSM7piZleyfvMCsbOEP1rEAwaVq0UzaIoD8Lhvif0EIDkB1'
const bot_id = '7455502134595862568'
const user_id = '999999'

const TaskManager = (props: any) => {
  const { getData, saveData } = props
  const [tasks, setTasks] = useState([] as any);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    console.log(values);
    const content = values.message.trim()
    if (!content) {
      message.warning('请输入内容');
      return;
    }

    setLoading(true);
    createAndPollMessage({
      token,
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
    })
    .then(answer => {
      console.log('Answer:', answer)
      if(answer.length > 0 && answer[0].date) {
        const newData = [...tasks, ...answer]
        saveData?.(newData)?.then?.((data) => {
          setTasks(data);
        });
        form.resetFields();
        message.success('事项已添加');
      }else{
        message.error('添加失败，请输入一个完整的待办信息');
      }
      setLoading(false);
    })
    .catch(error => {
      setLoading(false);
      message.error('添加失败，请重试:' + error.message);
      console.error('Failed to retrieve answer:', error)
    });
    // try {
    //   // 模拟API调用
    //   const successCallback = (res: any) => {
    //     console.log(res);
    //     const { data } = res as any;
    //     const answerData = (data || []).find((item: any) => item?.type === 'answer')
    //     console.log(answerData.content)
    //     let contentString = answerData.content || '';
    //     // 去掉换行符
    //     contentString = contentString.replace(/\n/g, '');
    //     // 将单引号替换为双引号
    //     contentString = contentString.replace(/'/g, '"');
    //     // 给键名加上双引号
    //     contentString = contentString.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

    //     const answers = contentString && JSON.parse(contentString)
    //     const answerList = (answers || []).filter(item => item.date && item.job)
    //     if(answerList.length > 0) {
    //       setTasks([...tasks, ...answerList]);
    //       form.resetFields();
    //       message.success('事项已添加');
    //     }else{
    //       message.error('添加失败，请输入一个完整的待办信息');
    //     }
    //     setLoading(false);
    //   }
    //   const errorCallBack = (error: any) => {
    //     setLoading(false);
    //     message.error('添加失败，请重试:' + error.message);
    //   }
    //   getAnswer({
    //     token,
    //     bot_id,
    //     user_id,
    //     content,
    //     cb: successCallback,
    //     errorcb: errorCallBack
    //   }).catch((err) => {
    //     message.error('添加失败，请重试:' + err.message);
    //   })
    // } catch (error) {
    //   message.error('添加失败，请重试');
    // }
  };
  useEffect(() => {
    console.log('9999999999999-', typeof getData)
    getData?.()?.then?.(data=>{
      console.log('999999990', JSON.stringify(data));
      setTasks(data || []);
    });
  },[])
  const deleteTask = (id) => {
    const newTasks = tasks.filter(task => task.id !== id);
    saveData(newTasks).then((data) => {
      setTasks(data);
    })
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'dateDesc',
      key: 'dateDesc',
    },
    {
      title: '事项',
      dataIndex: 'job',
      key: 'job',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => {
          deleteTask(record.id)
        }}>删除</Button>
      ),
    },
  ];

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ backgroundColor: '#eaeaea', color: '#000', height: '40px',lineHeight: '40px',textAlign: 'center' }}>
        Reminder
      </Header>
      <Content style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flexGrow: 1, overflowY: 'auto', background: '#fff', padding: '20px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Table
            columns={columns}
            dataSource={tasks}
            pagination={false}
            rowKey="key"
          />
        </div>
        <Footer style={{ padding: '10px 10px', background: '#fff', borderTop: '1px solid #e8e8e8' }}>
          <Form form={form} onFinish={onFinish} layout="inline" style={{ display: 'flex', justifyContent: 'center' }}>
            <Form.Item name="message" style={{ flexGrow: 1 }}>
              <Input
                placeholder="输入事项"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary"  htmlType="submit" loading={loading}>添加</Button>
            </Form.Item>
          </Form>
        </Footer>
      </Content>
    </Layout>
  );
};

export default TaskManager;
