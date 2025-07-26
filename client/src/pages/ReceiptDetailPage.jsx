import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Chip, Stack, Button, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAuth } from 'firebase/auth';
import app from '../firebase';

const ReceiptDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user || !id) {
        setLoading(false);
        return;
      }
      console.log(`Fetching receipt with id: ${id} for user: ${user.uid}`);
      const res = await fetch(`http://localhost:8000/receipts/${user.uid}`);
      const data = await res.json();
      const found = (data.receipts || []).find(r => (r.receipt_id || r.id) === id);
      setReceipt(found || null);
      setLoading(false);
    };
    fetchReceipt();
  }, [id]);

  if (loading) {
    return <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography>Loading...</Typography></Box>;
  }

  if (!receipt) {
    return <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography>Receipt not found.</Typography></Box>;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      <Box sx={{ position: 'sticky', top: 0, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', zIndex: 100, px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none' }}></Button>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>Receipt Details</Typography>
      </Box>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Card elevation={2} sx={{ borderRadius: '16px' }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>{receipt.store || 'Unknown Store'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Date: {receipt.timestamp ? new Date(receipt.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Location: {receipt.location || 'N/A'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>OCR Source: {receipt.ocr_source || 'N/A'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Total Amount: <b>₹{receipt.total_amount}</b></Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Goal Amount: <b>₹{receipt.goal_amount}</b></Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Overspent: {receipt.overspent ? 'Yes' : 'No'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Summary: {receipt.summary || '-'}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>Items</Typography>
            <Stack spacing={1}>
              {receipt.items && receipt.items.length > 0 ? (
                receipt.items.map((item, idx) => (
                  <Box key={idx} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: '8px', bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{item.item_name}</Typography>
                    <Typography variant="body2" color="text.secondary">Category: {item.category}</Typography>
                    <Typography variant="body2" color="text.secondary">Brand: {item.brand}</Typography>
                    <Typography variant="body2" color="text.secondary">Quantity: {item.quantity}</Typography>
                    <Typography variant="body2" color="text.secondary">Unit Price: ₹{item.unit_price}</Typography>
                    <Typography variant="body2" color="text.secondary">Market Price: ₹{item.market_price}</Typography>
                    <Typography variant="body2" color="text.secondary">Above Market Price: {item.above_market_price ? 'Yes' : 'No'}</Typography>
                    <Typography variant="body2" color="text.secondary">Wastage Probability: {item.wastage_probability}</Typography>
                    <Typography variant="body2" color="text.secondary">Classified As: {item.classified_as}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No items found.</Typography>
              )}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>Gemini Inference</Typography>
            {receipt.gemini_inference ? (
              <Box sx={{ p: 1, bgcolor: 'grey.50', borderRadius: '8px' }}>
                <Typography variant="body2" color="text.secondary">Category Spend: {JSON.stringify(receipt.gemini_inference.category_spend)}</Typography>
                <Typography variant="body2" color="text.secondary">Need vs Want Split: {JSON.stringify(receipt.gemini_inference.need_vs_want_split)}</Typography>
                <Typography variant="body2" color="text.secondary">Sentence Summary: {receipt.gemini_inference.sentence_summary}</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No inference data.</Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ReceiptDetailPage;
