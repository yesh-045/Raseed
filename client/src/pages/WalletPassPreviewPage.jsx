import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Receipt as ReceiptIcon,
  TrendingUp as InsightsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AppHeader, PageContainer, BottomNavigation } from '../components';

const WalletPassPreviewPage = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Mock wallet pass data - simplified for Google's minimal approach
  const passTypes = [
    {
      id: 'receipt_summary',
      title: 'Receipt Summary',
      description: 'Daily spending summary',
      icon: ReceiptIcon,
      data: { merchant: 'Starbucks', total: 15.47, date: 'Today' },
      color: '#1A73E8',
    },
    {
      id: 'spend_insights',
      title: 'Spending Insights',
      description: 'Weekly spending report',
      icon: InsightsIcon,
      data: { period: 'This Week', total: 234.56, change: '+12%' },
      color: '#26A69A',
    },
    {
      id: 'daily_digest',
      title: 'Daily Digest',
      description: 'Summary of today\'s transactions',
      icon: RefreshIcon,
      data: { transactions: 3, total: 47.23, categories: 2 },
      color: '#F9AB00',
    },
  ];

  const handleAddToWallet = (passType) => {
    // Simulate adding to Google Wallet
    setSnackbar({
      open: true,
      message: `${passType.title} added to Google Wallet!`
    });
    
    // Simulate success and navigate
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const renderPassPreview = (passType) => {
    const IconComponent = passType.icon;
    
    return (
      <Card 
        key={passType.id}
        elevation={2}
        sx={{ 
          mb: 3,
          background: `linear-gradient(135deg, ${passType.color} 0%, ${passType.color}CC 100%)`,
          color: 'white',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconComponent sx={{ fontSize: 32, mr: 2 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {passType.title}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {passType.description}
              </Typography>
            </Box>
          </Box>

          {/* Pass-specific content */}
          {passType.id === 'receipt_summary' && (
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 300, mb: 1 }}>
                ${passType.data.total}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {passType.data.merchant} • {passType.data.date}
              </Typography>
            </Box>
          )}

          {passType.id === 'spend_insights' && (
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 300, mb: 1 }}>
                ${passType.data.total}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {passType.data.period}
                </Typography>
                <Chip
                  label={passType.data.change}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
            </Box>
          )}

          {passType.id === 'daily_digest' && (
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  {passType.data.transactions}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Transactions
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  ${passType.data.total}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Total
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  {passType.data.categories}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Categories
                </Typography>
              </Grid>
            </Grid>
          )}

          <Button
            variant="contained"
            fullWidth
            startIcon={<WalletIcon />}
            onClick={() => handleAddToWallet(passType)}
            sx={{ 
              mt: 3,
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              color: 'white',
              fontWeight: 500
            }}
          >
            Add to Google Wallet
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ pb: 8 }}>
      <PageContainer>
        <AppHeader 
          title="Wallet Passes" 
          showBackButton={true}
          onBackClick={() => navigate('/dashboard')}
        />
        
        <Box sx={{ py: 3 }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            Available Passes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Add these passes to your Google Wallet for quick access
          </Typography>

          {passTypes.map(renderPassPreview)}

          {/* Info Card */}
          <Card elevation={1} sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                About Wallet Passes
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Quick Access"
                    secondary="View your spending data without opening the app"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Real-time Updates"
                    secondary="Passes update automatically with new receipt data"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="Secure & Private"
                    secondary="All data is encrypted and stored securely"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
      </PageContainer>

      <BottomNavigation />

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WalletPassPreviewPage;
