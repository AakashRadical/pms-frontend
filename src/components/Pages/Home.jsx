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

  // Handle responsive sidebar collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true); // Collapse sidebar on mobile
      } else {
        setCollapsed(false); // Expand sidebar on larger screens
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          <h1 className="text-3xl font-semibold text-gray-700">
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ background: '#001529' }}
        className="sider-responsive"
      >
        <div className="text-white text-xl text-center py-4 font-bold logo">
          PMS
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['view-tasks']}
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
          className="header-responsive"
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
            className="toggle-button"
          />
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            danger
            onClick={handleLogout}
            className="logout-button"
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
          className="content-responsive"
        >
          {renderContent()}
        </Content>
      </Layout>

      <style jsx>{`
        /* Ensure layout takes full viewport height */
        .ant-layout {
          min-height: 100vh;
          overflow: hidden;
        }

        /* Responsive Sider */
        .sider-responsive {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 1000;
          transition: all 0.2s;
        }

        /* Logo text */
        .logo {
          font-size: ${collapsed ? '1rem' : '1.25rem'};
        }

        /* Responsive Header */
        .header-responsive {
          padding: 0 12px !important;
          height: 64px;
          line-height: 64px;
        }

        /* Toggle button */
        .toggle-button {
          font-size: 1rem !important;
          width: 48px !important;
          height: 48px !important;
        }

        /* Logout button */
        .logout-button {
          font-size: 0.875rem;
          padding: 0 12px;
        }

        /* Responsive Content */
        .content-responsive {
          margin: 16px 8px !important;
          padding: 16px !important;
          overflow-y: auto;
          max-height: calc(100vh - 64px - 32px); /* Header height + margins */
        }

        /* Media Queries */
        @media (max-width: 768px) {
          .sider-responsive {
            width: ${collapsed ? '80px' : '200px'} !important;
            max-width: ${collapsed ? '80px' : '200px'} !important;
            min-width: ${collapsed ? '80px' : '200px'} !important;
          }

          .ant-layout-sider-collapsed + .ant-layout .content-responsive {
            margin-left: 80px !important;
          }

          .header-responsive {
            padding: 0 8px !important;
          }

          .toggle-button {
            width: 40px !important;
            height: 40px !important;
            font-size: 0.875rem !important;
          }

          .logout-button {
            font-size: 0.75rem;
            padding: 0 8px;
          }

          .content-responsive {
            margin: 8px 4px !important;
            padding: 12px !important;
          }

          .logo {
            font-size: ${collapsed ? '0.875rem' : '1rem'};
          }

          /* Adjust content text */
          .content-responsive h1 {
            font-size: 1.5rem !important;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .sider-responsive {
            width: ${collapsed ? '80px' : '220px'} !important;
            max-width: ${collapsed ? '80px' : '220px'} !important;
            min-width: ${collapsed ? '80px' : '220px'} !important;
          }

          .content-responsive {
            margin: 16px 12px !important;
            padding: 20px !important;
          }

          .logout-button {
            font-size: 0.875rem;
          }
        }

        /* Ensure content is not hidden under fixed sider on mobile */
        @media (max-width: 768px) {
          .ant-layout-sider + .ant-layout {
            margin-left: ${collapsed ? '80px' : '200px'};
            transition: all 0.2s;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Home;