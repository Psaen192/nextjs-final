import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: '6605475final',
});

export async function POST(req) {
  const body = await req.json();
  const { action, name, password } = body;

  if (!name || !password) {
    return new Response(JSON.stringify({ error: 'ข้อมูลไม่ครบถ้วน' }), { status: 400 });
  }

  try {
    const conn = await pool.getConnection();

    if (action === 'register') {
      const [rows] = await conn.query('SELECT * FROM users WHERE name = ?', [name]);

      if (rows.length > 0) {
        conn.release();
        return new Response(JSON.stringify({ error: 'มีผู้ใช้นี้อยู่แล้ว' }), { status: 409 });
      }

      await conn.query('INSERT INTO users (name, password) VALUES (?, ?)', [name, password]);
      conn.release();
      return new Response(JSON.stringify({ message: 'สมัครบัญชีสำเร็จ' }), { status: 200 });
    }

    if (action === 'login') {
      const [rows] = await conn.query(
        'SELECT * FROM users WHERE name = ? AND password = ?',
        [name, password]
      );
      conn.release();

      if (rows.length === 1) {
        return new Response(JSON.stringify({ message: 'เข้าสู่ระบบสำเร็จ' }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: 'ชื่อหรือรหัสผ่านไม่ถูกต้อง' }), { status: 401 });
      }
    }

    conn.release();
    return new Response(JSON.stringify({ error: 'ไม่รู้จักคำสั่ง' }), { status: 400 });
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    return new Response(JSON.stringify({ error: 'เกิดข้อผิดพลาดในระบบ' }), { status: 500 });
  }
}
