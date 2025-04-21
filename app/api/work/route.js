import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: '6605475final',
  charset: 'utf8mb4', // ✅ รองรับภาษาไทย
});

// GET - ดึง tasks
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');

    if (!boardId) {
      return NextResponse.json({ message: 'ต้องมี boardId' }, { status: 400 });
    }

    const [tasks] = await pool.query('SELECT * FROM tasks WHERE board_id = ?', [boardId]);
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 });
  }
}

// POST - สร้าง task ใหม่
export async function POST(request) {
  try {
    const body = await request.json();
    const headers = request.headers;
    const createdBy = decodeURIComponent(headers.get('x-user-name') || '');

    const { title, description, boardId } = body;

    if (!title || !boardId || !createdBy) {
      return NextResponse.json({ message: 'ข้อมูลไม่ครบ' }, { status: 400 });
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, board_id, created_by) VALUES (?, ?, ?, ?)',
      [title, description, boardId, createdBy]
    );

    const [newTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    return NextResponse.json({ task: newTask[0] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการสร้างงาน' }, { status: 500 });
  }
}

// PUT - แก้ไข task
export async function PUT(request) {
  try {
    const body = await request.json();
    const headers = request.headers;
    const user = decodeURIComponent(headers.get('x-user-name') || '');

    const { id, title, description } = body;
    if (!id || !title || !description || !user) {
      return NextResponse.json({ message: 'ข้อมูลไม่ครบ' }, { status: 400 });
    }

    const [[task]] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task || task.created_by !== user) {
      return NextResponse.json({ message: 'ไม่มีสิทธิ์แก้ไขงานนี้' }, { status: 403 });
    }

    await pool.query('UPDATE tasks SET title = ?, description = ? WHERE id = ?', [
      title,
      description,
      id,
    ]);

    const [[updatedTask]] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    return NextResponse.json({ task: updatedTask }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการแก้ไขงาน' }, { status: 500 });
  }
}

// DELETE - ลบ task
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const user = decodeURIComponent(searchParams.get('user') || '');

    if (!taskId || !user) {
      return NextResponse.json({ message: 'ข้อมูลไม่ครบ' }, { status: 400 });
    }

    const [[task]] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!task || task.created_by !== user) {
      return NextResponse.json({ message: 'ไม่มีสิทธิ์ลบงานนี้' }, { status: 403 });
    }

    await pool.query('DELETE FROM tasks WHERE id = ?', [taskId]);
    return NextResponse.json({ message: 'ลบงานสำเร็จ' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการลบงาน' }, { status: 500 });
  }
}
