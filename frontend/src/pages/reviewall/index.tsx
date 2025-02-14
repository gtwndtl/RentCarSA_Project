import React, { useState, useEffect } from 'react';
import { Table, Typography, message, Rate, Button, Modal, Form, Input, Popconfirm } from 'antd';
import { GetRents, GetUsers, GetCars, UpdateUsersById } from '../../services/https';
import { RentInterface } from '../../interfaces/IRent';
import { UserInterface } from '../../interfaces/IUser';
import { CarInterface } from '../../interfaces/ICar';
import { DeleteOutlined } from '@ant-design/icons'; // ใช้ไอคอน Delete
import './ReviewAll.css'; // ไฟล์ CSS สำหรับการปรับแต่งสี

const { Title, Text } = Typography;
const { TextArea } = Input;

const styles = {
  container: {
    width: '80%',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #003366',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: '36px',
    fontFamily: 'Kanit, sans-serif',
  },
  table: {
    marginTop: '20px',
  },
  commentCount: {
    marginBottom: '20px',
    fontSize: '16px',
    fontFamily: 'Kanit, sans-serif',
  },
  replyContainer: {
    backgroundColor: '#f0f0f0',
    padding: '5px 10px',
    borderRadius: '5px',
    marginTop: '5px',
    fontSize: '12px',
    color: '#666',
    display: 'inline-block',
  },
  replyLabel: {
    fontWeight: 'normal',
    marginRight: '5px',
  },
  replyText: {
    fontStyle: 'italic',
  },
};

const ReviewAll = ({ roles }) => {
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [cars, setCars] = useState<CarInterface[]>([]);
  const [rents, setRents] = useState<RentInterface[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const currentUserIdFromLocalStorage = localStorage.getItem('id'); // ดึง user ID ของผู้ใช้ที่ล็อกอินจาก localStorage

  useEffect(() => {
    fetchUsers();
    fetchCars();
    fetchRents();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await GetUsers();
      setUsers(response);
    } catch (error) {
      message.error('Failed to fetch user data');
    }
  };

  const fetchCars = async () => {
    try {
      const response = await GetCars();
      console.log(response); // ลองพิมพ์ข้อมูลของรถยนต์ที่ดึงมา
      setCars(response);
    } catch (error) {
      message.error('Failed to fetch car data');
    }
  };

  const fetchRents = async () => {
    try {
      const response = await GetRents();
      setRents(response);
    } catch (error) {
      message.error('Failed to fetch rent data');
    }
  };

  const getUserName = (userID: number) => {
    const user = users.find(u => u.ID === userID);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown';
  };

  const getCarDetails = (carID: number) => {
    const car = cars.find(c => c.ID === carID);
    return car ? (
      <>
        {car.models} <br /> {car.license_plate}, {car.province}
      </>
    ) : 'Unknown';
  };

  const getCommentByUserId = (userID: number) => {
    const user = users.find(u => u.ID === userID);
    return user ? user.comment : null;
  };

  const getScoreByUserId = (userID: number) => {
    const user = users.find(u => u.ID === userID);
    return user ? user.score : null;
  };

  const getReplyByUserId = (userID: number) => {
    const user = users.find(u => u.ID === userID);
    return user ? user.reply : null;
  };

  // Handle opening the reply modal
  const showReplyModal = (userID: number) => {
    setCurrentUserId(userID);
    setIsModalVisible(true);
    form.setFieldsValue({ reply: getReplyByUserId(userID) });
  };

  // Handle closing the reply modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Handle submitting the reply
  const handleReplySubmit = async (values: any) => {
    if (!currentUserId) return;

    try {
      await UpdateUsersById(currentUserId, { reply: values.reply });
      message.success('Reply added successfully');
      fetchUsers();
      handleCancel();
    } catch (error) {
      message.error('Failed to add reply');
    }
  };

  // Handle deleting comment, score, and reply
  const handleDeleteAll = async (userID: number) => {
    try {
      await UpdateUsersById(userID, { comment: '', score: 0, reply: '' });
      message.success('Deleted comment, score, and reply successfully');
      fetchUsers(); // Refresh user data
    } catch (error) {
      message.error('Failed to delete data');
    }
  };

  // นำข้อมูลของผู้ใช้ที่ล็อกอินอยู่ไปไว้ข้างบน
  const filteredData = rents
    .sort((a, b) => (a.user_id === Number(currentUserIdFromLocalStorage) ? -1 : 1))
    .filter(rent => {
      const comment = getCommentByUserId(rent.user_id);
      const score = getScoreByUserId(rent.user_id);
      return (comment && comment !== '-') || (score && score > 0);
    });

  const totalComments = filteredData.filter(rent => {
    const comment = getCommentByUserId(rent.user_id);
    return comment && comment !== '-';
  }).length;

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (userID: number) => getUserName(userID),
    },
    {
      title: 'Car Details',
      dataIndex: 'car_id',
      key: 'car_id',
      render: (carID: number) => getCarDetails(carID), // Updated to include car model
    },
    {
      title: 'Comment',
      key: 'comment',
      render: (record: RentInterface) => {
        const comment = getCommentByUserId(record.user_id);
        const reply = getReplyByUserId(record.user_id);
        return (
          <>
            <div>{comment ? comment : '-'}</div>
            {reply && (
              <div style={styles.replyContainer}>
                <span style={styles.replyLabel}>Reply:</span>
                <span style={styles.replyText}>{reply}</span>
              </div>
            )}
          </>
        );
      },
    },
    {
      title: 'Score',
      key: 'score',
      render: (record: RentInterface) => {
        const score = getScoreByUserId(record.user_id);
        return score !== null ? <Rate disabled defaultValue={score} allowHalf /> : '-';
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: RentInterface) => {
        return roles !== 1 ? (
          <Button type="primary" onClick={() => showReplyModal(record.user_id)}>
            Reply
          </Button>
        ) : roles === 1 ? (
          <Popconfirm
            title="Are you sure you want to delete the comment?"
            onConfirm={() => handleDeleteAll(record.user_id)} // Confirm ลบ
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" icon={<DeleteOutlined />} /> {/* ใช้ไอคอนถังขยะ */}
          </Popconfirm>
        ) : null;
      },
    },
  ];

  return (
    <div style={styles.container}>
      <Title level={1} style={styles.headerTitle}>Reviews</Title>
      <Text style={styles.commentCount}>Total Comments: {totalComments}</Text>
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="ID"
        rowClassName={(record) => (record.user_id === Number(currentUserIdFromLocalStorage) ? 'highlight-row' : '')} // เพิ่มคลาสให้แถวของผู้ใช้ที่ล็อกอิน
        style={styles.table}
      />
      <Modal
        title="Reply to Comment"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleReplySubmit}>
          <Form.Item
            name="reply"
            rules={[{ required: true, message: 'Please enter your reply' }]}
          >
            <TextArea rows={4} placeholder="Enter your reply..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewAll;
