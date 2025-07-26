import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  Stack,
  IconButton,
  Fab,
} from '@mui/material';
import {
  CameraAlt as CameraAltIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Components
import { PageContainer, UploadDropZone, FileUploadItem } from '../components';

const UploadPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const supportedFormats = ['PDF', 'JPG', 'PNG', 'HEIC'];

  // Auto-process after upload (Files by Google style - no submit button)
  const handleFilesAdded = useCallback(async (newFiles) => {
    const processedFiles = newFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      status: 'processing',
      progress: 0,
      name: file.name,
      size: file.size,
    }));
    
    setFiles(prev => [...prev, ...processedFiles]);
    setProcessing(true);
    
    // Auto-start AI processing immediately
    await startProcessing(processedFiles);
  }, []);

  const startProcessing = async (filesToProcess) => {
    // Simulate AI processing for each file
    for (let i = 0; i < filesToProcess.length; i++) {
      const fileItem = filesToProcess[i];
      
      // Simulate processing progress with spinner per file
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, progress } : f
        ));
      }

      // Mark as completed
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'completed', progress: 100 } : f
      ));
    }

    setProcessing(false);
    

    // User can manually navigate when ready
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFilesAdded(Array.from(e.target.files));
      }
    };
    input.click();
  };

  const removeFile = (fileId) => {
    // Only allow removal if not processing
    if (!processing) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const handleReviewResults = () => {
    const completedFiles = files.filter(f => f.status === 'completed').length;
    navigate('/processing', { 
      state: { 
        processedFiles: completedFiles 
      } 
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
            Upload receipts
          </Typography>
        </Box>
      </Box>

      <PageContainer>
        {/* Empty State or Upload Zone */}
        {files.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            px: 3,
          }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <AddIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            </Box>
            
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
              No receipts yet
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 4, maxWidth: 280 }}
            >
              Upload receipts to extract and save details securely
            </Typography>

            <UploadDropZone
              onFilesSelected={handleFilesAdded}
              supportedFormats={supportedFormats}
              disabled={processing}
            />
          </Box>
        ) : (
          <Box sx={{ pt: 2 }}>
            {/* Processing Header */}
            <Box sx={{ mb: 3, px: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                {processing ? 'AI extracting data...' : 'Processing complete'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {files.length} receipt{files.length !== 1 ? 's' : ''} {processing ? 'being processed' : 'ready for review'}
              </Typography>
            </Box>

            {/* File List */}
            <Stack spacing={1}>
              {files.map((fileItem) => (
                <FileUploadItem
                  key={fileItem.id}
                  file={fileItem}
                  onRemove={removeFile}
                  showProgress={true}
                  disabled={processing}
                />
              ))}
            </Stack>

            {/* Review Button - Show when processing is complete */}
            {!processing && files.some(f => f.status === 'completed') && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleReviewResults}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Review & confirm data
                </Button>
              </Box>
            )}
          </Box>
        )}
      </PageContainer>

      {/* Floating Camera Button */}
      <Fab
        color="primary"
        onClick={handleCameraCapture}
        disabled={processing}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <CameraAltIcon />
      </Fab>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: '12px',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadPage;
