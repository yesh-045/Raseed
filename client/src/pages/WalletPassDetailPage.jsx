import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Snackbar,
  Alert,
  Avatar,
  Chip,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  AccountBalanceWallet as WalletIcon,
  QrCode as QrCodeIcon,
  Share as ShareIcon,
  Receipt as ReceiptIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PageContainer, BottomNavigation } from '../components';

const WalletPassDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get receipt data from navigation state or use mock data
  const receiptData = location.state?.receipt || {
    id: 1,
    merchant: 'Starbucks',
    amount: '$15.47',
    date: '2024-01-15',
    time: '10:30 AM',
    location: '123 Main St, Seattle, WA',
    items: [
      { name: 'Grande Latte', price: '$5.25' },
      { name: 'Blueberry Muffin', price: '$3.95' },
      { name: 'Americano', price: '$4.45' },
      { name: 'Tax', price: '$1.82' }
    ],
    paymentMethod: 'Card ending in 4532',
    categoryColor: '#00704A',
  };

  const handleAddToWallet = () => {
    setSnackbar({
      open: true,
      message: 'Receipt added to Google Wallet successfully!',
      severity: 'success',
    });
  };

  const handleShare = () => {
    setSnackbar({
      open: true,
      message: 'Receipt shared successfully!',
      severity: 'success',
    });
  };

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => navigate(-1)} edge="start">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Receipt Details
            </Typography>
          </Box>
          
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <PageContainer>
        <Box sx={{ pt: 3 }}>
          {/* Receipt Pass Card */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${receiptData.categoryColor} 0%, ${receiptData.categoryColor}CC 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  }}
                >
                  <StoreIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {receiptData.merchant}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {receiptData.date} • {receiptData.time}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                    Total Amount
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 400 }}>
                    {receiptData.amount}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <QrCodeIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Actions */}
          <Box sx={{ mb: 4 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<WalletIcon />}
              onClick={handleAddToWallet}
              sx={{
                py: 2,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 500,
                mb: 2,
              }}
            >
              Add to Google Wallet
            </Button>
            
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ShareIcon />}
              onClick={handleShare}
              sx={{
                py: 2,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Share Receipt
            </Button>
          </Box>

          {/* Receipt Details */}
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px',
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                Receipt Information
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Merchant
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {receiptData.merchant}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {receiptData.date} {receiptData.time}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>
                    {receiptData.location}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {receiptData.paymentMethod}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Items */}
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                Items Purchased
              </Typography>
              
              <Stack spacing={2}>
                {receiptData.items.map((item, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.price}
                      </Typography>
                    </Box>
                    {index < receiptData.items.length - 1 && (
                      <Divider sx={{ mt: 2 }} />
                    )}
                  </Box>
                ))}
              </Stack>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Total
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {receiptData.amount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </PageContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <BottomNavigation />
    </Box>
  );
};

export default WalletPassDetailPage;
