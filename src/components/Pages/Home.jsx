import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  CalendarOutlined,
  FolderViewOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Grid, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Addmembers from '../Layouts/Addmembers';
import AssignTasks from '../Layouts/AssignTasks';
import ViewAssignedTasks from '../Layouts/ViewAssignedTasks';
import CompletedTasks from '../Layouts/CompletedTasks';
import ViewMembers from '../Layouts/ViewMembers';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const Home = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState("view-tasks");
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const screens = useBreakpoint();
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
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    navigate('/login');
  };

  const handleMenuClick = (e) => {
    setCurrentPage(e.key);
  };

  const renderContent = () => {
    switch (currentPage) {
      case "view-members":
        return <ViewMembers />;
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
          <h1 className="text-3xl font-semibold text-indigo-900">
            Welcome to Admin Dashboard
          </h1>
        );
    }
  };

  const menuItems = [
    {
      key: 'view-members',
      icon: <UserOutlined />,
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
    <div className="relative">
      <Layout style={{ minHeight: '100vh', filter: logoutModalVisible ? 'blur(5px)' : 'none' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          collapsedWidth={screens.xs ? 0 : 80}
          breakpoint="md"
          onBreakpoint={(broken) => {
            setCollapsed(broken);
          }}
          style={{ background: '#001529' }}
        >
          <div className="text-white text-xl text-center py-4 font-bold">
            PMS
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[currentPage]}
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
              paddingRight: 16,
              paddingLeft: 16,
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
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
              background: 'linear-gradient(to bottom right, #e0e7ff, #f3e8ff)',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
      />

      <Modal
        title="Confirm Logout"
        open={logoutModalVisible}
        onOk={confirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
        okText="Logout"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        centered
        styles={{
          mask: {
            backdropFilter: 'blur(3px)',
          },
        }}
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
    </div>
  );
};

export default Home;