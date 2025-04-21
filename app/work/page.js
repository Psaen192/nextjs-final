'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar, Toolbar, Typography, Box, Fab, Dialog,
  DialogTitle, DialogContent, DialogActions,
  Button, TextField, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function WorkPage() {
  const [name, setName] = useState('');
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (!userName) return router.push('/attractions');
    setName(userName);

    const board = JSON.parse(localStorage.getItem('selectedBoard') || '{}');
    if (!board.id) return router.push('/main');
    setSelectedBoard(board);
    fetchTasks(board.id);
  }, []);

  const fetchTasks = async (boardId) => {
    try {
      const res = await fetch(`/api/work?boardId=${boardId}`);
      const data = await res.json();
      if (res.ok) setTasks(data.tasks);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) return;

    try {
      const res = await fetch('/api/work', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': encodeURIComponent(name),
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          boardId: selectedBoard.id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTasks([...tasks, data.task]);
        setOpenDialog(false);
        setTaskTitle('');
        setTaskDescription('');
      } else alert(data.message);
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
      console.error(err);
    }
  };

  const handleEditTask = async () => {
    if (!taskTitle.trim() || !editingTask) return;

    try {
      const res = await fetch('/api/work', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': encodeURIComponent(name),
        },
        body: JSON.stringify({
          id: editingTask.id,
          title: taskTitle,
          description: taskDescription,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTasks(tasks.map(t => t.id === editingTask.id ? data.task : t));
        setEditingTask(null);
        setOpenDialog(false);
      } else alert(data.message);
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    const confirm = window.confirm('คุณต้องการลบงานนี้ใช่หรือไม่?');
    if (!confirm) return;

    try {
      const res = await fetch(`/api/work?taskId=${id}&user=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== id));
      } else alert(data.message);
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
      console.error(err);
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {selectedBoard?.name || 'โปรเจค'}
          </Typography>
          <IconButton color="inherit" onClick={() => router.push('/main')}>
            <ArrowBackIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {tasks.map(task => (
          <Box key={task.id} sx={{
            p: 2, border: '1px solid #ccc', borderRadius: 2, boxShadow: 1, width: 300,
            backgroundColor: '#fff', position: 'relative'
          }}>
            <Typography variant="h6">{task.title}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>{task.description || 'ไม่มีรายละเอียด'}</Typography>
            <Typography variant="caption" sx={{
              position: 'absolute', top: 8, right: 8, color: '#666'
            }}>
              👤 {task.created_by}
            </Typography>

            {task.created_by === name && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <IconButton onClick={() => {
                  setEditingTask(task);
                  setTaskTitle(task.title);
                  setTaskDescription(task.description);
                  setOpenDialog(true);
                }}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteTask(task.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Fab color="primary" onClick={() => {
        setEditingTask(null);
        setTaskTitle('');
        setTaskDescription('');
        setOpenDialog(true);
      }} sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <AddIcon />
      </Fab>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingTask ? 'แก้ไขงาน' : 'เพิ่มงานใหม่'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="ชื่องาน" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
          <TextField fullWidth label="รายละเอียด" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} multiline rows={4} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
          <Button onClick={editingTask ? handleEditTask : handleSaveTask}>
            {editingTask ? 'บันทึก' : 'เพิ่ม'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
