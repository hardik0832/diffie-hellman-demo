import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, TextField, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function EncryptionDemo({ sharedSecret }: { sharedSecret: number | null }) {
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');

  const simpleEncrypt = (text: string, key: number): string => {
    return text.split('').map(char => {
      const charCode = char.charCodeAt(0);
      return String.fromCharCode((charCode + key) % 256);
    }).join('');
  };

  const simpleDecrypt = (text: string, key: number): string => {
    return text.split('').map(char => {
      const charCode = char.charCodeAt(0);
      return String.fromCharCode((charCode - key + 256) % 256);
    }).join('');
  };

  const handleEncrypt = () => {
    if (sharedSecret && message) {
      const encrypted = simpleEncrypt(message, sharedSecret);
      setEncryptedMessage(encrypted);
    }
  };

  const handleDecrypt = () => {
    if (sharedSecret && encryptedMessage) {
      const decrypted = simpleDecrypt(encryptedMessage, sharedSecret);
      setDecryptedMessage(decrypted);
    }
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Encryption Demo (Optional)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" gutterBottom>
            Use your shared secret to encrypt and decrypt messages (for demonstration only).
          </Typography>
          <TextField
            label="Message to Encrypt"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            margin="dense"
            disabled={!sharedSecret}
          />
          <Button
            variant="contained"
            onClick={handleEncrypt}
            disabled={!sharedSecret || !message}
            sx={{ mt: 1, mr: 1 }}
          >
            Encrypt
          </Button>
          <Button
            variant="outlined"
            onClick={handleDecrypt}
            disabled={!sharedSecret || !encryptedMessage}
            sx={{ mt: 1 }}
          >
            Decrypt
          </Button>
          {encryptedMessage && (
            <Box mt={2}>
              <Typography variant="subtitle2">Encrypted Message:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                {encryptedMessage}
              </Typography>
            </Box>
          )}
          {decryptedMessage && (
            <Box mt={2}>
              <Typography variant="subtitle2">Decrypted Message:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                {decryptedMessage}
              </Typography>
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}