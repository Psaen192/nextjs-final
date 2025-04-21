'use client';

import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import './page.css';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/attractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', name, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('userName', name);
        alert(data.message);
        router.push('/main');
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        textAlign: 'center',
        background: '#2683df',
      }}
    >
      <Box className="form-container">
        <h1>Welcome To Team Project</h1>
        <h3>เข้าสู่ระบบเพื่อดำเนินการต่อ</h3>

        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
            mt: 3,
          }}
          noValidate
          autoComplete="off"
        >
          <Box className="input-row">
            <TextField
              label="ชื่อ"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
          </Box>
          <Box className="input-row">
            <TextField
              label="รหัสผ่าน"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
          </Box>
        </Box>

        <Stack
          spacing={3}
          direction="row"
          mt={2}
          sx={{ width: '100%', justifyContent: 'flex-end' }}
        >
          <Button variant="contained" onClick={handleSubmit}>
            ยืนยัน
          </Button>
          <Button variant="text" onClick={() => router.push('/register')}>
            สร้างบัญชีใหม่
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
