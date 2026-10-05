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
  supabaseUrl: '',
  supabaseAnonKey: '',
  session: 'level-up-2026-10-10'
};
