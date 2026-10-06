/*
 * Bug Hunt config
 * ใส่ค่าจาก Supabase: Project Settings → API
 *   supabaseUrl     = Project URL เช่น https://abcdxyz.supabase.co
 *   supabaseAnonKey = anon / publishable key (ใช้ในหน้าเว็บได้ ไม่ใช่ service_role)
 * ถ้าปล่อยว่าง ทั้งสองหน้าเกมจะเก็บคำตอบไว้ในเครื่องผู้เล่นเท่านั้น และ dashboard จะแสดงวิธีตั้งค่า
 *
 * session = ชื่อรอบของ workshop เปลี่ยนเมื่อจัดรอบใหม่ คำตอบของแต่ละรอบจะแยกกันใน dashboard
 */
window.BUG_HUNT_CONFIG = {
  supabaseUrl: 'https://fkohbdoiiizljhzdqnbm.supabase.co',
  supabaseAnonKey: 'sb_publishable_IFkyyv4s71Vdykikg_kgfw_Y8SYMygh',
  session: 'level-up-2026-10-10',
  // เวลาเล่นต่อรอบ (นาที): icebreak = /ice-breaking, full = /workshop
  durationMinutes: { icebreak: 10, full: 30 },
  // รหัสเข้ารอบ (เก็บเป็น SHA-256 ไม่ใช่ตัวรหัส) · ไม่มี key = เข้าได้เลย
  // เปลี่ยนรหัส: node -e "console.log(require('crypto').createHash('sha256').update('รหัสใหม่').digest('hex'))"
  accessCodes: { full: '0fb542ca673346178bfdea3aa5ff7f463e08e28b726bac96ec26b71eaeac4060' }
};
