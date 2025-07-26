import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Chip,
  Avatar,
  InputBase,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components';

const ReceiptsOverviewPageGoogle = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock receipts data - Google Pay style
  const receipts = [
    {
      id: 1,
      merchant: 'Starbucks',
      total: '$15.47',
      date: 'Today, 2:30 PM',
      category: 'Coffee & Dining',
      color: '#00704A',
      items: 2,
      location: 'Times Square',
    },
    {
      id: 2,
      merchant: 'Target',
      total: '$89.23',
      date: 'Yesterday, 4:15 PM',
      category: 'Retail',
      color: '#CC0000',
      items: 5,
      location: 'Manhattan Store',
    },
    {
      id: 3,
      merchant: 'Uber',
      total: '$23.45',
      date: 'Dec 22, 11:20 AM',
      category: 'Transportation',
      color: '#000000',
      items: 1,
      location: '14th St to JFK',
    },
    {
      id: 4,
      merchant: 'Whole Foods',
      total: '$67.89',
      date: 'Dec 21, 6:45 PM',
      category: 'Groceries',
      color: '#00A046',
      items: 12,
      location: 'Union Square',
    },
  ];

  const categories = ['All', 'Coffee & Dining', 'Retail', 'Transportation', 'Groceries'];

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = tabValue === 0 || receipt.category === categories[tabValue];
    return matchesSearch && matchesTab;
  });

  const handleReceiptClick = (receiptId) => {
    navigate(`/receipts/${receiptId}`);
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
            px: 2,
            py: 2,
            gap: 2,
          }}
        >
          <IconButton
            onClick={() => navigate('/dashboard')}
            size="small"
            sx={{ color: 'text.primary' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 500, flex: 1 }}>
            Receipts
          </Typography>
          <IconButton size="small">
            <FilterIcon />
          </IconButton>
        </Box>

        {/* Search Bar */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'grey.100',
              borderRadius: '24px',
              px: 2,
              py: 1,
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase
              placeholder="Search receipts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>

        {/* Category Tabs */}
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 48,
            },
          }}
        >
          {categories.map((category, index) => (
            <Tab key={index} label={category} />
          ))}
        </Tabs>
      </Box>

      <PageContainer>
        {filteredReceipts.length === 0 ? (
          // Empty State
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '50vh',
            textAlign: 'center',
            px: 3,
          }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <ReceiptIcon sx={{ fontSize: 48, color: 'grey.400' }} />
            </Box>
            
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
              {searchQuery ? 'No matching receipts' : 'No receipts yet'}
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 4, maxWidth: 280 }}
            >
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : 'Upload your first receipt to get started'
              }
            </Typography>

            {!searchQuery && (
              <Button
                variant="contained"
                onClick={() => navigate('/upload')}
                sx={{
                  borderRadius: '24px',
                  textTransform: 'none',
                  py: 1.5,
                  px: 3,
                }}
              >
                Upload receipt
              </Button>
            )}
          </Box>
        ) : (
          // Receipts List
          <Box sx={{ pt: 2 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 3, px: 1 }}
            >
              {filteredReceipts.length} receipt{filteredReceipts.length !== 1 ? 's' : ''}
            </Typography>

            <Stack spacing={2}>
              {filteredReceipts.map((receipt) => (
                <Card
                  key={receipt.id}
                  elevation={0}
                  onClick={() => handleReceiptClick(receipt.id)}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      {/* Merchant Avatar */}
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: receipt.color,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '1.25rem',
                        }}
                      >
                        {receipt.merchant.charAt(0)}
                      </Avatar>

                      {/* Receipt Details */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              color: 'text.primary' 
                            }}
                          >
                            {receipt.merchant}
                          </Typography>
                          
                          <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {receipt.location} • {receipt.items} item{receipt.items !== 1 ? 's' : ''}
                        </Typography>

                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {receipt.date}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip 
                            label={receipt.category} 
                            size="small" 
                            variant="outlined"
                            sx={{ borderRadius: '8px' }}
                          />
                          
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              color: 'primary.main' 
                            }}
                          >
                            {receipt.total}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </PageContainer>
    </Box>
  );
};

export default ReceiptsOverviewPageGoogle;
