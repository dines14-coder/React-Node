import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { Dashboard, Edit, Assignment, AttachMoney, People, SwapHoriz, Campaign, Category } from '@mui/icons-material';
import { DashboardOutlined, EditOutlined, AssignmentOutlined, AttachMoneyOutlined, PeopleOutlined, SwapHorizOutlined } from '@mui/icons-material';
import { influencerLogo, smallInfluencerLogo } from '../assets/images';

function Sidebar({ activeMenu, setActiveMenu, user, isCollapsed, toggleSidebar }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
    { id: 'onboarding', label: 'Onboarding Forms', icon: <EditOutlined /> },
    { id: 'existing', label: user?.role === 'onboarder' ? 'Assigned Influencers' : 'Influencers Assign', icon: <PeopleOutlined /> },
    { id: 'barter', label: 'Barter List', icon: <SwapHorizOutlined /> },
    { id: 'negotiation', label: 'Negotiation Cost', icon: <AttachMoneyOutlined /> },
    { id: 'marketing', label: 'Marketing', icon: <Campaign /> },
    { id: 'masters', label: 'Masters', icon: <Category /> }
  ].filter(item => {
    if (item.id === 'existing' && user?.role === 'super_admin') {
      return false;
    }
    return true;
  });

  return (
    <Box
      sx={{
        width: isCollapsed ? 70 : 210,
        height: '100vh',
        bgcolor: 'white',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        transition: 'width 0.3s ease',
        borderRight: '1px solid #e1e5e9'
      }}
    >
      <Box sx={{ py: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
        {isCollapsed ? (
          <Box
            component="img"
            src={smallInfluencerLogo}
            alt="Logo"
            sx={{ height: 40, width: 40, borderRadius: '50%' }}
          />
        ) : (
          <Box
            component="img"
            src={influencerLogo}
            alt="Logo"
            sx={{ height: 80 }}
          />
        )}
      </Box>

      <List sx={{ p: 0, px: 1 }}>
        {menuItems.map(item => (
          <ListItem key={item.id} disablePadding sx={{ my: 0.5 }}>
            <Tooltip title={isCollapsed ? item.label : ''} placement="right" arrow>
              <ListItemButton
                selected={activeMenu === item.id}
                onClick={() => setActiveMenu(item.id)}
                sx={{
                  color: '#666',
                  minHeight: '40px',
                  maxHeight: '40px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  my: 0.5,
                  px: 1.5,
                  '&:hover': {
                    bgcolor: '#f0f7ff',
                    color: '#333'
                  },
                  '&.Mui-selected': {
                    bgcolor: '#5386e4',
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiListItemIcon-root': {
                      color: 'white'
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '13px', fontWeight: 500 }} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default Sidebar;
