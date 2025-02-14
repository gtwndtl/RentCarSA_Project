import React, { useState, useEffect } from 'react';
import { Table, Typography, message, Button, Rate } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { GetRents, GetUsers, GetCars } from '../../services/https';
import { RentInterface } from '../../interfaces/IRent';
import { UserInterface } from '../../interfaces/IUser';
import { CarInterface } from '../../interfaces/ICar';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title } = Typography;

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
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // รับ ID จาก URL
  const [rents, setRents] = useState<RentInterface[]>([]);
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [cars, setCars] = useState<CarInterface[]>([]);

  useEffect(() => {
    if (id) {
      fetchUsers();
      fetchCars();
      fetchRentsByUserId(id); // ดึงข้อมูลของผู้ใช้เฉพาะคน
    }
  }, [id]);

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
      setCars(response);
    } catch (error) {
      message.error('Failed to fetch car data');
    }
  };

  const fetchRentsByUserId = async (userId: string) => {
    try {
      const response = await GetRents();
      const filteredRents = response.filter(rent => rent.user_id === Number(userId));
      setRents(filteredRents);
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
    return car ? `${car.license_plate}, ${car.province}` : 'Unknown';
  };

  const getCommentByUserId = (userID: number) => {
    const user = users.find(u => u.ID === userID);
    return user ? user.comment : null;
  };

  const getScoreByUserId = (userID: number) => {
    const user = users.find(u => u.ID === userID);
    return user ? user.score : null;
  };

  const columns = [
    {
      title: 'User Name',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (userID: number) => getUserName(userID),
    },
    {
      title: 'Car Details',
      dataIndex: 'car_id',
      key: 'car_id',
      render: (carID: number) => getCarDetails(carID),
    },
    {
      title: 'Start Date',
      dataIndex: 'start_rent',
      key: 'start_rent',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: 'End Date',
      dataIndex: 'end_rent',
      key: 'end_rent',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Comment',
      key: 'comment',
      render: (record: RentInterface) => {
        const comment = getCommentByUserId(record.user_id);
        return comment ? comment : '-';
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
      title: '',
      key: 'edit',
      render: (record: RentInterface) => (
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={() => navigate(`/review/${record.user_id}`)} 
        />
      ),
    },
  ];

  return (
    <div style={styles.container}>
      <Title level={1} style={styles.headerTitle}>Rental History</Title>
      <Table
        dataSource={rents}
        columns={columns}
        rowKey="ID"
        style={styles.table}
      />
    </div>
  );
};

export default HistoryPage;
