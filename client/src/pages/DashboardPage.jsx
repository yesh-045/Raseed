import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Fab,
  Avatar,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  CameraAlt as CameraAltIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PageContainer, BottomNavigation } from '../components';

const DashboardPage = () => {
  const navigate = useNavigate();

  // Mock data - Actual app stats
  const stats = {
    totalSpend: '$1,234.56',
    totalReceipts: 12,
    thisMonth: 4,
  };

  const recentActivity = [
    {
      id: 1,
      merchant: 'Starbucks',
      amount: '$15.47',
      date: 'Today',
      color: '#00704A',
    },
    {
      id: 2,
      merchant: 'Target',
      amount: '$89.23',
      date: 'Yesterday',
      color: '#CC0000',
    },
    {
      id: 3,
      merchant: 'Uber',
      amount: '$23.45',
      date: '2 days ago',
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
            justifyContent: 'center',
            px: 2,
            py: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Raseed
          </Typography>
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
            <Card elevation={2} sx={{ borderRadius: '16px' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Total spend extracted
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 400, mb: 2 }}>
                      {stats.totalSpend}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      From {stats.totalReceipts} receipts
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ReceiptIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Card 
                elevation={2} 
                sx={{ 
                  flex: 1, 
                  borderRadius: '16px' 
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Receipts saved
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 500 }}>
                    {stats.totalReceipts}
                  </Typography>
                </CardContent>
              </Card>

              <Card 
                elevation={2} 
                sx={{ 
                  flex: 1, 
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
            </Box>
          </Stack>

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
                  elevation={2}
                  sx={{
                    borderRadius: '12px',
                    cursor: 'pointer',
                    '&:hover': {
                      elevation: 4,
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
                          {item.date}
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
        <CameraAltIcon />
      </Fab>

      <BottomNavigation />
    </Box>
  );
};

export default DashboardPage;
