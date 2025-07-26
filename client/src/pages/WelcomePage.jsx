import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Alert,
  Fade,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components';

const WelcomePage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await login();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Card
            elevation={8}
            sx={{
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              {/* Logo/Brand */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: 'Google Sans, Roboto, sans-serif',
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 1,
                  }}
                >
                  Raseed
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    fontFamily: 'Google Sans, Roboto, sans-serif',
                    fontWeight: 400,
                  }}
                >
                  Your receipts, reimagined
                </Typography>
              </Box>

              {/* Welcome Text */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'Google Sans, Roboto, sans-serif',
                    fontWeight: 600,
                    mb: 2,
                    color: 'text.primary',
                  }}
                >
                  Welcome to Raseed
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6, mb: 3 }}
                >
                  Transform your receipt management with AI-powered extraction,
                  smart categorization, and powerful insights into your spending habits.
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Sign In Button */}
              {isLoading ? (
                <LoadingSpinner message="Signing you in..." />
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleSignIn}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                  fullWidth
                >
                  Continue with Google
                </Button>
              )}

              {/* Features List */}
              <Box sx={{ mt: 4, textAlign: 'left' }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 2, textAlign: 'center' }}
                >
                  What you'll get:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    '🧠 AI-powered receipt scanning and data extraction',
                    '📊 Smart expense categorization and insights',
                    '💳 Digital wallet for loyalty cards and coupons',
                    '🔍 Powerful search and filtering capabilities',
                    '📱 Mobile-first design for on-the-go management',
                  ].map((feature, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      {feature}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default WelcomePage;
