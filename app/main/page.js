'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import './page.css';

export default function MainPage() {
  const [name, setName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [boards, setBoards] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (userName) {
      setName(userName);
    } else {
      router.push('/attractions');
    }

    const fetchBoards = async () => {
      try {
        const res = await fetch('/api/main');
        const data = await res.json();
        if (res.ok) {
          setBoards(data.boards);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Error fetching boards:', error);
      }
    };

    fetchBoards();
  }, [router]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setConfirmLogoutOpen(true);
    handleMenuClose();
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('userName');
    setConfirmLogoutOpen(false);
    router.push('/attractions');
  };

  const handleCancelLogout = () => {
    setConfirmLogoutOpen(false);
  };

  const handleCreateTask = () => {
    setOpenCreateDialog(true);
  };

  const handleSaveTask = async () => {
    try {
      const res = await fetch('/api/main', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle,
          userName: name,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'ไม่สามารถสร้างงานได้');

      localStorage.setItem('selectedBoard', JSON.stringify(data.board));
      setOpenCreateDialog(false);
      setTaskTitle('');
      router.push('/work');
    } catch (error) {
      console.error('Error creating task:', error.message);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const handleDeleteClick = (e, boardId) => {
    e.stopPropagation(); // ป้องกันการเปิดหน้า work
    setBoardToDelete(boardId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteBoard = async () => {
    try {
      const res = await fetch('/api/main', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: boardToDelete }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) throw new Error(data.message || 'ลบไม่สำเร็จ');

      setBoards((prev) => prev.filter((b) => b.id !== boardToDelete));
      setDeleteDialogOpen(false);
      setBoardToDelete(null);
    } catch (error) {
      console.error('Failed to delete board:', error.message);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Team Project
          </Typography>
          <div>
            <Button
              color="inherit"
              onClick={handleMenuClick}
              sx={{ textTransform: 'none' }}
            >
              {name}
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: '1rem', textAlign: 'center' }}>
        <Typography variant="h5">กระดานงาน</Typography>
      </Box>

      <div style={{ padding: '1rem' }}>
        {boards.length > 0 ? (
          boards.map((board, index) => {
            const isOwner = board.created_by === name;
            return (
              <div key={index} style={{ marginBottom: '1rem', display: 'flex' }}>
                <Button
                  variant="contained"
                  color={isOwner ? 'primary' : 'inherit'}
                  fullWidth
                  sx={{ justifyContent: 'space-between', textAlign: 'left' }}
                  onClick={() => {
                    localStorage.setItem('selectedBoard', JSON.stringify(board));
                    router.push('/work');
                  }}
                >
                  <span>{board.name}</span>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 2 }}>
                    {board.created_by}
                  </Typography>
                </Button>
                {isOwner && (
                  <IconButton
                    aria-label="delete"
                    size="small"
                    color="error"
                    onClick={(e) => handleDeleteClick(e, board.id)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
            );
          })
        ) : (
          <Typography>ยังไม่มีงาน</Typography>
        )}
      </div>

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleCreateTask}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>

      {/* Logout dialog */}
      <Dialog open={confirmLogoutOpen} onClose={handleCancelLogout}>
        <DialogTitle>ยืนยันการออกจากระบบ</DialogTitle>
        <DialogContent>
          <DialogContentText>คุณต้องการออกจากระบบจริง ๆ ใช่ไหม?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout}>ยกเลิก</Button>
          <Button color="error" onClick={handleConfirmLogout}>
            ออกจากระบบ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create board dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>สร้างงานใหม่</DialogTitle>
        <DialogContent>
          <DialogContentText>กรอกชื่องานที่คุณต้องการสร้าง</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="ชื่องาน"
            fullWidth
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleSaveTask}>สร้างงาน</Button>
        </DialogActions>
      </Dialog>

      {/* Delete board dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <DialogContentText>คุณแน่ใจหรือไม่ว่าต้องการลบกระดานนี้?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ยกเลิก</Button>
          <Button color="error" onClick={confirmDeleteBoard}>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
