const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://eatsufmguejxdbklpltp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhdHN1Zm1ndWVqeGRia2xwbHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NjE5NjQsImV4cCI6MjEwMjUzNzk2NH0.WXbD04nD820j_Dz0VVYqbPQIn26R5nyhG_Ce8_6CcBc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = async (req, res) => {
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

  // ۱. دریافت لیست آهنگ‌ها
  if (action === 'get-songs') {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data || []);
    } catch (err) {
      return res.status(500).json({ error: 'خطای سرور' });
    }
  }

  // ۲. ورود مدیر
  if (action === 'login') {
    try {
      const { username, password } = req.body;
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

  // ۳. ویرایش نام آهنگ
  if (action === 'edit-song') {
    try {
      const { id, title } = req.body;
      const { error } = await supabase.from('songs').update({ title }).eq('id', id);
      if (error) return res.status(500).json({ success: false, message: error.message });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'خطا در ویرایش آهنگ' });
    }
  }

  // ۴. حذف آهنگ
  if (action === 'delete-song') {
    try {
      const { id, fileName } = req.body;
      if (fileName) {
        await supabase.storage.from('songs').remove([fileName]);
      }
      const { error } = await supabase.from('songs').delete().eq('id', id);
      if (error) return res.status(500).json({ success: false, message: error.message });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'خطا در حذف آهنگ' });
    }
  }

  // ۵. تغییر اطلاعات مدیر
  if (action === 'update-admin') {
    try {
      const { username, password } = req.body;
      const { data: admins } = await supabase.from('admins').select('id').limit(1);
      if (admins && admins.length > 0) {
        await supabase.from('admins').update({ username, password }).eq('id', admins[0].id);
        return res.status(200).json({ success: true });
      }
      return res.status(404).json({ success: false, message: 'مدیر یافت نشد' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'خطا در به روزرسانی اطلاعات' });
    }
  }

  return res.status(400).json({ error: 'اکشن معتبر نیست' });
};
        
