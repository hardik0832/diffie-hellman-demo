import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Button, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { modPow } from '../utils/diffieHellman';

export interface AttackSimulationProps {
  alicePublic: number;
  bobPublic: number;
  p: number;
  g: number;
  aliceSecret: number | null;
  bobSecret: number | null;
}

export default function AttackSimulation({
  alicePublic,
  bobPublic,
  p,
  g,
  aliceSecret,
  bobSecret,
}: AttackSimulationProps) {
  const [eveAttempts, setEveAttempts] = useState<number[]>([]);
  const [eveGuessedSecret, setEveGuessedSecret] = useState<number | null>(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackResult, setAttackResult] = useState<string>('');

  const simulateAttack = () => {
    setIsAttacking(true);
    setEveAttempts([]);
    setEveGuessedSecret(null);
    setAttackResult('');

    const attempts: number[] = [];
    let found = false;
    let guessedSecret: number | null = null;

    for (let i = 0; i < 10; i++) {
      const randomPrivateKey = Math.floor(Math.random() * p);
      attempts.push(randomPrivateKey);

      const eveComputedSecret = modPow(alicePublic, randomPrivateKey, p);

      if (eveComputedSecret === aliceSecret || eveComputedSecret === bobSecret) {
        found = true;
        guessedSecret = eveComputedSecret;
        break;
      }
    }

    setTimeout(() => {
      setEveAttempts(attempts);
      setEveGuessedSecret(guessedSecret);
      setAttackResult(found ? 'SUCCESS (extremely rare!)' : 'FAILED - Secret remains secure');
      setIsAttacking(false);
    }, 2000);
  };

  const resetAttack = () => {
    setEveAttempts([]);
    setEveGuessedSecret(null);
    setAttackResult('');
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">🔒 Attack Simulation (Eve's Perspective)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" gutterBottom>
            <strong>Scenario:</strong> Eve intercepts Alice's public key ({alicePublic}) and Bob's public key ({bobPublic}). 
            Can she compute the shared secret?
          </Typography>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="error.dark" gutterBottom>
              🕵️ Eve's Intercepted Information:
            </Typography>
            <Typography variant="body2" color="error.dark">
              • Prime (p): {p}<br/>
              • Generator (g): {g}<br/>
              • Alice's Public Key: {alicePublic}<br/>
              • Bob's Public Key: {bobPublic}<br/>
              • <strong>Missing:</strong> Alice's and Bob's private keys
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={simulateAttack}
              disabled={isAttacking || !aliceSecret || !bobSecret}
              sx={{ mr: 1 }}
            >
              {isAttacking ? 'Attacking...' : 'Simulate Attack'}
            </Button>
            <Button
              variant="outlined"
              onClick={resetAttack}
              disabled={isAttacking}
            >
              Reset
            </Button>
          </Box>

          {eveAttempts.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Eve's Attack Attempts:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {eveAttempts.map((attempt, index) => (
                  <Chip
                    key={index}
                    label={`Private Key: ${attempt}`}
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                ))}
              </Box>

              {eveGuessedSecret !== null && (
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, mb: 2 }}>
                  <Typography variant="subtitle2" color="success.dark">
                    🎯 Eve Successfully Guessed: {eveGuessedSecret}
                  </Typography>
                </Box>
              )}

              <Box sx={{ p: 2, bgcolor: attackResult.includes('SUCCESS') ? 'success.light' : 'info.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" color={attackResult.includes('SUCCESS') ? 'success.dark' : 'info.dark'}>
                  {attackResult}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {attackResult.includes('SUCCESS') 
                    ? 'This is extremely rare! In practice, with large primes, this would be computationally impossible.'
                    : 'Eve cannot compute the shared secret without knowing the private keys. This demonstrates why Diffie-Hellman is secure!'
                  }
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="info.dark" gutterBottom>
              🔐 Why This Attack Fails:
            </Typography>
            <Typography variant="body2" color="info.dark">
              • Eve knows: g, p, A (Alice's public), B (Bob's public)<br/>
              • To find the secret, Eve needs: a (Alice's private) or b (Bob's private)<br/>
              • This requires solving the Discrete Logarithm Problem<br/>
              • With large primes (2048+ bits), this is computationally infeasible<br/>
              • Even with quantum computers, this remains secure with proper parameters
            </Typography>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}