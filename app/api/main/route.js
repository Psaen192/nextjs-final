import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: '6605475final',
});

export async function POST(req) {
  try {
    const { taskTitle, userName } = await req.json();

    if (!taskTitle || !userName) {
      return NextResponse.json({ message: 'ข้อมูลไม่ครบ' }, { status: 400 });
    }

    const [result] = await pool.query(
      'INSERT INTO boards (name, created_by) VALUES (?, ?)',
      [taskTitle, userName]
    );

    const insertedId = result.insertId;

    const [rows] = await pool.query(
      'SELECT id, name, created_by FROM boards WHERE id = ?',
      [insertedId]
    );

    return NextResponse.json({
      message: 'สร้างงานสำเร็จ',
      board: rows[0],
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'ไม่สามารถสร้างงานได้' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT id, name, created_by FROM boards');
    return NextResponse.json({ boards: rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'ไม่สามารถดึงข้อมูลได้' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'ไม่พบ ID' }, { status: 400 });
    }

    await pool.query('DELETE FROM boards WHERE id = ?', [id]);

    return NextResponse.json({ message: 'ลบสำเร็จ' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ message: 'ไม่สามารถลบได้' }, { status: 500 });
  }
}
