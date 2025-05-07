import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserAddOutlined,
  CalendarOutlined,
  FundViewOutlined,
  LogoutOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  FolderViewOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import Addmembers from '../Layouts/Addmembers';

import AssignTasks from '../Layouts/AssignTasks';
import ViewAssignedTasks from '../Layouts/ViewAssignedTasks';
import CompletedTasks from '../Layouts/CompletedTasks';
import ViewMembers from '../Layouts/ViewMembers';


const { Header, Sider, Content } = Layout;

const Home = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState("view-tasks");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      localStorage.removeItem('token');
      localStorage.removeItem('id');
    }
  }, [navigate]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('id');
      navigate('/login');
    }
  };

  const handleMenuClick = (e) => {
    setCurrentPage(e.key);
  };

  const renderContent = () => {
    switch (currentPage) {
      case "view-members":
        return <ViewMembers/>;
      case "add-members":
        return <Addmembers />;
      case "assign-tasks":
        return <AssignTasks />;
      case "view-tasks":
        return <ViewAssignedTasks />;
      case "completed":
        return <CompletedTasks />;
      default:
        return (
          <h1 className="text-3xl font-semibold text-gray-700">
            Welcome to Admin Dashboard
          </h1>
        );
    }
  };

  const menuItems = [
    {
      key: 'view-members',
      icon: <UserOutlined/>,
      label: 'View-Members',
    },
    {
      key: 'add-members',
      icon: <UsergroupAddOutlined />,
      label: 'Add Members',
    },
    {
      key: 'assign-tasks',
      icon: <CalendarOutlined />,
      label: 'Assign Tasks',
    },
    {
      key: 'view-tasks',
      icon: <FolderViewOutlined />,
      label: 'View Assigned Tasks',
    },
    {
      key: 'completed',
      icon: <FileDoneOutlined />,
      label: 'Completed Tasks',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ background: '#001529' }}
      >
        <div className="text-white text-xl text-center py-4 font-bold">
          PMS
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['new']}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: 0,
            background: '#001529',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingRight: 24,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              color: '#fff',
            }}
          />
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            danger
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: '8px',
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
