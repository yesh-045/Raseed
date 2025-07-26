import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Alert,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Psychology as AIIcon,
  AutoAwesome as ProcessingIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';

const ProcessingStatusPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [processingComplete, setProcessingComplete] = useState(false);
  const files = location.state?.files || [];

  const steps = [
    {
      label: 'File Upload',
      description: 'Your receipts have been uploaded successfully',
      icon: <UploadIcon />,
      status: 'completed'
    },
    {
      label: 'OCR Processing',
      description: 'Extracting text and data from your receipts',
      icon: <ProcessingIcon />,
      status: 'in-progress'
    },
    {
      label: 'AI Analysis',
      description: 'AI is analyzing and categorizing your receipt data',
      icon: <AIIcon />,
      status: 'pending'
    },
    {
      label: 'Wallet Pass Generation',
      description: 'Creating your Google Wallet passes',
      icon: <WalletIcon />,
      status: 'pending'
    }
  ];

  const [stepStatuses, setStepStatuses] = useState(steps.map(step => step.status));

  useEffect(() => {
    // Simulate processing steps
    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setStepStatuses(prev => {
          const newStatuses = [...prev];
          newStatuses[i] = 'completed';
          if (i < steps.length - 1) {
            newStatuses[i + 1] = 'in-progress';
          }
          return newStatuses;
        });
        
        setActiveStep(i + 1);
      }
      
      setProcessingComplete(true);
    };

    processSteps();
  }, []);

  const getStepIcon = (index) => {
    const status = stepStatuses[index];
    if (status === 'completed') {
      return <CheckIcon sx={{ color: 'success.main' }} />;
    }
    return steps[index].icon;
  };

  const getStepColor = (index) => {
    const status = stepStatuses[index];
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Container maxWidth="md" sx={{ py: 4, pb: isMobile ? 12 : 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            Processing Your Receipts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please wait while we process your receipts and generate wallet passes
          </Typography>
        </Box>

        {/* Files Being Processed */}
        <Card elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Files Being Processed
            </Typography>
            {files.map((file, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  borderBottom: index < files.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="body2">{file.name}</Typography>
                <Chip
                  label={processingComplete ? 'Completed' : 'Processing'}
                  size="small"
                  color={processingComplete ? 'success' : 'primary'}
                  variant="outlined"
                />
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Processing Steps */}
        <Card elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Processing Status
            </Typography>
            
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label} completed={stepStatuses[index] === 'completed'}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: stepStatuses[index] === 'completed' ? 'success.main' : 
                                         stepStatuses[index] === 'in-progress' ? 'primary.main' : 'grey.300',
                          color: 'white',
                          mr: 2
                        }}
                      >
                        {getStepIcon(index)}
                      </Box>
                    )}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {step.description}
                    </Typography>
                    {stepStatuses[index] === 'in-progress' && (
                      <LinearProgress sx={{ mb: 2, height: 6, borderRadius: 3 }} />
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Completion Status */}
        {processingComplete && (
          <Card elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
            <CardContent>
              <Alert severity="success" sx={{ mb: 2 }}>
                Processing completed successfully! Your wallet passes are ready.
              </Alert>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/wallet-preview', { 
                    state: { 
                      files: files,
                      processedData: {
                        merchant: 'Example Store',
                        total: 25.99,
                        date: new Date().toLocaleDateString(),
                        items: ['Item 1', 'Item 2', 'Item 3']
                      }
                    }
                  })}
                >
                  View Wallet Pass
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Real-time Updates */}
        {!processingComplete && (
          <Card elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Real-time Updates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We'll notify you when processing is complete. You can safely navigate away from this page.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Bottom Navigation for Mobile */}
      {isMobile && <BottomNavigation />}
    </Box>
  );
};

export default ProcessingStatusPage;
