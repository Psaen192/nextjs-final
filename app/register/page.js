'use client';

import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import "./page.css";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const res = await fetch('/api/attractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        router.push('/attractions');
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการสมัคร');
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      textAlign: 'center',
      background: '#2683df',
    }}>
      <Box className="form-container">
        <h1>สมัครบัญชีใหม่</h1>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'center',
          mt: 3,
        }}>
          <TextField
            label="ชื่อ"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            label="รหัสผ่าน"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={2} mt={2}>
            <Button variant="contained" onClick={handleRegister}>สมัคร</Button>
            <Button variant="outlined" onClick={() => router.push('/attractions')}>กลับ</Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
