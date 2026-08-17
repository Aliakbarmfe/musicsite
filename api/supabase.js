import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eatsufmguejxdbklpltp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhdHN1Zm1ndWVqeGRia2xwbHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NjE5NjQsImV4cCI6MjEwMjUzNzk2NH0.WXbD04nD820j_Dz0VVYqbPQIn26R5nyhG_Ce8_6CcBc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  // تنظیم CORS برای دسترسی امن
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  // ۱. دریافت لیست آهنگ‌ها برای صفحه index.html
  if (action === 'get-songs') {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'خطای سرور' });
    }
  }

  // ۲. بررسی نام کاربری و رمز عبور مدیر هنگام ورود
  if (action === 'login') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'اطلاعات کامل نیست' });
      }

      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        return res.status(401).json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است' });
      }

      return res.status(200).json({ success: true, token: 'admin_authenticated_session' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'خطای سرور در احراز هویت' });
    }
  }

  return res.status(400).json({ error: 'اکشن معتبر نیست' });
}
