import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import app from '../firebase';
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Share as ShareIcon,
  Email as EmailIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  SelectAll as SelectAllIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components';

const ReceiptsPage = () => {
  // Search bar toggle state
  const [showSearch, setShowSearch] = useState(false);
  const handleSearchToggle = () => setShowSearch((prev) => !prev);
  // Sorting state
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('date-desc'); // default: newest first

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };
  const handleSortClose = () => {
    setSortAnchorEl(null);
  };
  const handleSortSelect = (criteria) => {
    setSortCriteria(criteria);
    setSortAnchorEl(null);
  };
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedReceipts, setSelectedReceipts] = useState([]);

  // Receipts data from backend
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Get UID from localStorage or AuthContext (adjust as needed)
    const auth = getAuth(app);
    const user = auth.currentUser;
    const uid = user.uid;
    console.log('Fetching receipts for UID:', uid);
    if (!uid) {
      setLoading(false);
      return;
    }
    fetch(`http://localhost:8000/receipts/${uid}`)
      .then(res => res.json())
      .then(data => {
        // Google logo colors
        const googleColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
        const receiptsArr = Array.isArray(data.receipts) ? data.receipts : [];
        const mapped = receiptsArr.map((r, idx) => ({
          id: r.receipt_id || r.id,
          merchant: r.store || 'Unknown',
          total: r.total_amount ? `₹${r.total_amount}` : '',
          date: r.timestamp ? new Date(r.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '',
          category: r.items && r.items.length > 0 ? r.items[0].category : '',
          color: googleColors[idx % googleColors.length],
          items: r.items ? r.items.length : 0,
          location: r.location || '',
          summary: r.summary || '',
          overspent: r.overspent,
        }));
        setReceipts(mapped);
        setLoading(false);
      })
      .catch(() => {
        setReceipts([]);
        setLoading(false);
      });
  }, []);

  // Dynamic categories from receipts
  const categories = React.useMemo(() => {
    const allCategories = receipts
      .map(r => r.items && Array.isArray(r.items) ? r.items.map(item => item.category) : [r.category])
      .flat()
      .filter(Boolean);
    const unique = Array.from(new Set(allCategories));
    return ['All', ...unique];
  }, [receipts]);

  const filteredReceipts = receipts.filter(receipt => {
  const matchesSearch = receipt.merchant && receipt.merchant.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesTab = tabValue === 0 || receipt.category === categories[tabValue];
  return matchesSearch && matchesTab;
  });

  // Sort filteredReceipts based on sortCriteria
  const sortedReceipts = React.useMemo(() => {
    const arr = [...filteredReceipts];
    switch (sortCriteria) {
      case 'date-desc':
        return arr.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'date-asc':
        return arr.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'amount-desc':
        return arr.sort((a, b) => (parseFloat(b.total.replace(/[^\d.]/g, '')) || 0) - (parseFloat(a.total.replace(/[^\d.]/g, '')) || 0));
      case 'amount-asc':
        return arr.sort((a, b) => (parseFloat(a.total.replace(/[^\d.]/g, '')) || 0) - (parseFloat(b.total.replace(/[^\d.]/g, '')) || 0));
      case 'merchant-asc':
        return arr.sort((a, b) => a.merchant.localeCompare(b.merchant));
      case 'merchant-desc':
        return arr.sort((a, b) => b.merchant.localeCompare(a.merchant));
      default:
        return arr;
    }
  }, [filteredReceipts, sortCriteria]);

  const handleReceiptClick = (receiptId) => {
    if (selectionMode) {
      handleReceiptSelect(receiptId);
    } else {
      // Find the actual backend id (receipt_id or id) from filteredReceipts
      const receipt = filteredReceipts.find(r => r.id === receiptId);
      const backendId = receipt && String(receipt.receipt_id || receipt.id);
      if (backendId) {
        navigate(`/receipt/${backendId}`);
      }
    }
  };

  const handleReceiptSelect = (receiptId) => {
    setSelectedReceipts(prev => {
      if (prev.includes(receiptId)) {
        return prev.filter(id => id !== receiptId);
      } else {
        return [...prev, receiptId];
      }
    });
  };

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedReceipts([]);
  };

  const handleSelectAll = () => {
    if (selectedReceipts.length === filteredReceipts.length) {
      setSelectedReceipts([]);
    } else {
      setSelectedReceipts(filteredReceipts.map(r => r.id));
    }
  };

  const handleBulkDownloadPDF = async () => {
    try {
      // TODO: Replace with actual backend API call
      // await downloadMultipleReceiptsPDF(selectedReceipts);
      
      // Simulate download for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSnackbar({
        open: true,
        message: `${selectedReceipts.length} receipts downloaded as PDF`,
        severity: 'success',
      });
      
      setSelectionMode(false);
      setSelectedReceipts([]);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to download receipts. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleMenuOpen = (event, receipt) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedReceipt(receipt);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReceipt(null);
  };

  const handleDownloadPDF = async () => {
    try {
      // TODO: Replace with actual backend API call
      // await downloadReceiptPDF(selectedReceipt.id);
      
      // Simulate download for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbar({
        open: true,
        message: `${selectedReceipt.merchant} receipt downloaded as PDF`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to download PDF. Please try again.',
        severity: 'error',
      });
    }
    handleMenuClose();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${selectedReceipt.merchant} Receipt`,
          text: `Receipt from ${selectedReceipt.merchant} - ${selectedReceipt.total}`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `Receipt from ${selectedReceipt.merchant} - ${selectedReceipt.total} on ${selectedReceipt.date}`
        );
        setSnackbar({
          open: true,
          message: 'Receipt details copied to clipboard',
          severity: 'success',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to share receipt',
        severity: 'error',
      });
    }
    handleMenuClose();
  };

  const handleEmail = () => {
    // TODO: Replace with actual email functionality
    // This would open email client or send via backend
    setSnackbar({
      open: true,
      message: `Emailing ${selectedReceipt.merchant} receipt...`,
      severity: 'info',
    });
    handleMenuClose();
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
            justifyContent: 'space-between',
          }}
        >
          {selectionMode ? (
            <>
              <IconButton
                onClick={handleToggleSelectionMode}
                size="small"
                sx={{ color: 'text.primary' }}
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 500, flex: 1 }}>
                {selectedReceipts.length} selected
              </Typography>
              <IconButton
                onClick={handleSelectAll}
                size="small"
                sx={{ color: 'primary.main' }}
              >
                <CheckBoxIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={() => navigate('/dashboard')}
                  size="small"
                  sx={{ color: 'text.primary' }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 500, flex: 1 }}>
                Receipts
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  size="small"
                  onClick={handleToggleSelectionMode}
                  sx={{ color: 'primary.main' }}
                >
                  <CheckBoxIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleSearchToggle}
                  sx={{ color: 'primary.main', ml: 1 }}
                >
                  <SearchIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleSortClick}
                  sx={{ color: 'primary.main', ml: 1 }}
                >
                  <FilterIcon />
                </IconButton>
                <Menu
                  anchorEl={sortAnchorEl}
                  open={Boolean(sortAnchorEl)}
                  onClose={handleSortClose}
                  PaperProps={{ sx: { borderRadius: '12px', minWidth: 180 } }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={() => handleSortSelect('date-desc')}>Date (Newest)</MenuItem>
                  <MenuItem onClick={() => handleSortSelect('date-asc')}>Date (Oldest)</MenuItem>
                  <MenuItem onClick={() => handleSortSelect('amount-desc')}>Amount (High to Low)</MenuItem>
                  <MenuItem onClick={() => handleSortSelect('amount-asc')}>Amount (Low to High)</MenuItem>
                  <MenuItem onClick={() => handleSortSelect('merchant-asc')}>Merchant (A-Z)</MenuItem>
                  <MenuItem onClick={() => handleSortSelect('merchant-desc')}>Merchant (Z-A)</MenuItem>
                </Menu>
              </Box>
            </>
          )}
        </Box>

        {/* Search Bar */}
        {!selectionMode && showSearch && (
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
        )}

        {/* Bulk Actions */}
        {selectionMode && selectedReceipts.length > 0 && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PdfIcon />}
                onClick={handleBulkDownloadPDF}
                sx={{ borderRadius: '20px', textTransform: 'none' }}
              >
                Download PDF
              </Button>
            </Stack>
          </Box>
        )}

        {/* Category Tabs */}
        {!selectionMode && (
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
        )}
      </Box>

      <PageContainer>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <Typography variant="body1" color="text.secondary">Loading receipts...</Typography>
          </Box>
        ) : filteredReceipts.length === 0 ? (
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
              {sortedReceipts.map((receipt) => (
                <Card
                  key={receipt.id}
                  elevation={0}
                  onClick={() => handleReceiptClick(receipt.id)}
                  sx={{
                    border: '1px solid',
                    borderColor: selectionMode && selectedReceipts.includes(receipt.id) 
                      ? 'primary.main' 
                      : 'divider',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    bgcolor: selectionMode && selectedReceipts.includes(receipt.id) 
                      ? 'primary.50' 
                      : 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: selectionMode ? 'none' : 'translateY(-2px)',
                      boxShadow: selectionMode ? 1 : 2,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      {/* Selection Checkbox */}
                      {selectionMode && (
                        <Box sx={{ display: 'flex', alignItems: 'center', pt: 1 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReceiptSelect(receipt.id);
                            }}
                          >
                            {selectedReceipts.includes(receipt.id) ? (
                              <CheckBoxIcon color="primary" />
                            ) : (
                              <CheckBoxOutlineBlankIcon />
                            )}
                          </IconButton>
                        </Box>
                      )}

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
                          
                          {!selectionMode && (
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleMenuOpen(e, receipt)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          )}
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleDownloadPDF}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Download PDF" />
        </MenuItem>
        
        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Share" />
        </MenuItem>
        
        <MenuItem onClick={handleEmail}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Email" />
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={8000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReceiptsPage;
