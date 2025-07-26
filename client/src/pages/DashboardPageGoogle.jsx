import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  IconButton,
  Fab,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  CameraAlt as CameraAltIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PageContainer, BottomNavigation } from '../components';

const DashboardPageGoogle = () => {
  const navigate = useNavigate();

  // Mock data - Google Pay style
  const stats = {
    thisWeek: '$234.56',
    thisMonth: '$891.34',
    receipts: 12,
  };

  const recentActivity = [
    {
      id: 1,
      merchant: 'Starbucks',
      amount: '$15.47',
      date: 'Today',
      category: 'Coffee',
      color: '#00704A',
    },
    {
      id: 2,
      merchant: 'Target',
      amount: '$89.23',
      date: 'Yesterday',
      category: 'Retail',
      color: '#CC0000',
    },
    {
      id: 3,
      merchant: 'Uber',
      amount: '$23.45',
      date: '2 days ago',
      category: 'Transportation',
      color: '#000000',
    },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      pb: 10 
    }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: 100,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Raseed
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small">
              <NotificationsIcon />
            </IconButton>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <PersonIcon sx={{ fontSize: 20 }} />
            </Avatar>
          </Box>
        </Box>
      </Box>

      <PageContainer>
        <Box sx={{ pt: 3 }}>
          {/* Greeting & Stats */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
              Good morning
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's your spending overview
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Stack spacing={3} sx={{ mb: 4 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      This week
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 400, mb: 2 }}>
                      {stats.thisWeek}
                    </Typography>
                    <Chip 
                      label="+12% from last week" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                      sx={{ borderRadius: '8px' }}
                    />
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: 'success.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrendingUpIcon sx={{ color: 'success.main', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Card 
                elevation={0} 
                sx={{ 
                  flex: 1, 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: '16px' 
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    This month
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 500 }}>
                    {stats.thisMonth}
                  </Typography>
                </CardContent>
              </Card>

              <Card 
                elevation={0} 
                sx={{ 
                  flex: 1, 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: '16px' 
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Receipts
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 500 }}>
                    {stats.receipts}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Stack>

          {/* Quick Actions */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
              Quick actions
            </Typography>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<CameraAltIcon />}
                onClick={() => navigate('/upload')}
                sx={{
                  flex: 1,
                  py: 2,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Scan receipt
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<WalletIcon />}
                onClick={() => navigate('/wallet')}
                sx={{
                  flex: 1,
                  py: 2,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                View wallet
              </Button>
            </Stack>
          </Box>

          {/* Recent Activity */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Recent activity
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/receipts')}
                sx={{ textTransform: 'none' }}
              >
                See all
              </Button>
            </Box>

            <Stack spacing={1}>
              {recentActivity.map((item) => (
                <Card
                  key={item.id}
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: item.color,
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                        }}
                      >
                        {item.merchant.charAt(0)}
                      </Avatar>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {item.merchant}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.category} • {item.date}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.amount}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        </Box>
      </PageContainer>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        onClick={() => navigate('/upload')}
        sx={{
          position: 'fixed',
          bottom: 88, // Above bottom navigation
          right: 24,
          zIndex: 1000,
        }}
      >
        <AddIcon />
      </Fab>

      <BottomNavigation />
    </Box>
  );
};

export default DashboardPageGoogle;
