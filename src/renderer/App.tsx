import React, { useState } from 'react';
import { Layout, Table, Button, Input, Form, message } from 'antd';
import './App.css'
const { Header, Content, Footer } = Layout;

const TaskManager = () => {
  const [tasks, setTasks] = useState([{date: 'fdsfs', job: 'fsdfsd'},{date: 'fdsfs', job: 'fsdfsd'},{date: 'fdsfs', job: 'fsdfsd'},{date: 'fdsfs', job: 'fsdfsd'},{date: 'fdsfs', job: 'fsdfsd'},{date: 'fdsfs', job: 'fsdfsd'},{date: 'fdsfs', job: 'fsdfsd'},{date: 'fdsfs', job: 'fsdfsd'},{date: 'fdsfs', job: 'fsdfsd'},{date: 'fdsfs', job: 'fsdfsd'},{date: 'fdsfs', job: 'fsdfsd'},{date: 'fdsfs', job: 'fsdfsd'},{date: 'fdsfs', job: 'fsdfsd'},{date: 'fdsfs', job: 'fsdfsd'}]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const addTask = async () => {
    if (!inputValue.trim()) {
      message.warning('请输入内容');
      return;
    }

    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      const newTask = {
        key: tasks.length,
        date: new Date().toLocaleDateString(),
        job: inputValue,
      };

      setTasks([...tasks, newTask]);
      setInputValue('');
      message.success('事项已添加');
    } catch (error) {
      message.error('添加失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = (key) => {
    const newTasks = tasks.filter(task => task.key !== key);
    setTasks(newTasks);
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: '30%',
    },
    {
      title: '事项',
      dataIndex: 'job',
      key: 'job',
      width: '50%',
    },
    {
      title: '操作',
      key: 'action',
      width: '20%',
      render: (_, record) => (
        <Button type="link" onClick={() => deleteTask(record.key)}>删除</Button>
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
          <Form layout="inline" style={{ display: 'flex', justifyContent: 'center' }}>
            <Form.Item style={{ flexGrow: 1 }}>
              <Input
                placeholder="输入事项"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={addTask} loading={loading}>添加</Button>
            </Form.Item>
          </Form>
        </Footer>
      </Content>
    </Layout>
  );
};

export default TaskManager;
