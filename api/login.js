const { supabase } = require('./config');

module.exports = async (req, res) => {
  // تنظیم CORS برای دسترسی فرانت‌اند
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'روش ارسال درخواست معتبر نیست' });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'نام کاربری و رمز عبور الزامی است' });
  }

  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(401).json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است' });
    }

    return res.status(200).json({ success: true, message: 'ورود موفقیت‌آمیز بود' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'خطای سرور: ' + err.message });
  }
};
