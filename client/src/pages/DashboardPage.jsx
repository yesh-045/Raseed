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

  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch recent receipts from backend
  const fetchRecentActivity = async () => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) return;
      
      // Use the API service instead of direct fetch
      apiService.setUserId(user.uid);
      const res = await fetch(`${apiService.baseURL}/receipts/${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        const receiptsArr = data.receipts || [];
        // Sort by timestamp descending and take the 3 most recent
        const sorted = receiptsArr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        // Google logo colors
        const googleColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
        const mapped = sorted.slice(0, 3).map((r, idx) => ({
          id: r.receipt_id || r.id || idx,
          store: r.store || '',
          summary: r.summary || '',
          timestamp: r.timestamp || '',
          total_amount: r.total_amount,
          items: r.items || [],
          location: r.location || '',
          color: googleColors[idx % googleColors.length],
        }));
        setRecentActivity(mapped);
        // Update stats
        const totalReceipts = receiptsArr.length;
        const thisMonth = receiptsArr.filter(r => {
          if (!r.timestamp) return false;
          const d = new Date(r.timestamp);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        const totalSpend = receiptsArr.reduce((sum, r) => sum + (r.total_amount || 0), 0);
        setStats({
          totalSpend: `₹${totalSpend}`,
          totalReceipts,
          thisMonth,
        });
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  // Fetch user profile from Firestore
  const fetchProfile = async (autoOpen = false) => {
    setLoadingProfile(true);
    setProfileError('');
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) throw new Error('User not signed in');
      
      // Use the API service instead of direct fetch
      apiService.setUserId(user.uid);
      const res = await fetch(`${apiService.baseURL}/user/${user.uid}`);
      const data = await res.json();
      if (data.success === false) {
        // Use the empty profile from backend, but fill in Firebase info if available
        setProfile({
          ...data,
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
        });
        if (autoOpen) setProfileOpen(true);
      } else if (data.success === true) {
        setProfile({
          ...data,
          uid: data.uid || user.uid,
          name: data.name || user.displayName || '',
          email: data.email || user.email || '',
          phone: data.phone || user.phoneNumber || '',
        });
      } else {
        // Other errors
        let errMsg = 'Failed to fetch profile';
        errMsg = data.error || errMsg;
        setProfileError(errMsg);
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to fetch profile');
    }
    setLoadingProfile(false);
  };

  // Save user profile to backend
  const handleProfileSave = async () => {
    setLoadingProfile(true);
    setProfileError('');
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) throw new Error('User not signed in');
      // Always send the full profile object, updating created_at to now
      const updatedProfile = {
        ...profile
      };
      const res = await fetch(`${apiService.baseURL}/user/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save profile');
      }
      setProfileOpen(false);
    } catch (err) {
      setProfileError(err.message || 'Failed to save profile');
    }
    setLoadingProfile(false);
  };

  // Open profile dialog and fetch profile
  const handleProfileClick = () => {
    setProfileOpen(true);
    fetchProfile();
  };

  // On mount, check for profile and auto-open if not found
  // Track if profile check has run to avoid repeated dialog opening
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      const auth = getAuth(app);
      // Wait for Firebase Auth to be ready
      const unsubscribe = auth.onAuthStateChanged(user => {
        if (user && !profileChecked) {
          fetchProfile(true);
          fetchRecentActivity();
          setProfileChecked(true);
        }
      });
      return () => unsubscribe();
    };
    checkProfile();
    // eslint-disable-next-line
  }, [profileChecked]);

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
