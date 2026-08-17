const { supabase } = require('./config');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { currentUsername, currentPassword, newUsername, newPassword } = req.body || {};

  if (!currentUsername || !currentPassword || !newUsername || !newPassword) {
    return res.status(400).json({ success: false, message: 'لطفاً تمامی فیلدها را پر کنید' });
  }

  try {
    // ۱. بررسی درست بودن اطلاعات فعلی
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', currentUsername)
      .eq('password', currentPassword)
      .single();

    if (error || !data) {
      return res.status(401).json({ success: false, message: 'نام کاربری یا رمز عبور فعلی اشتباه است' });
    }

    // ۲. به‌روزرسانی اطلاعات مدیر
    const { error: updateError } = await supabase
      .from('admins')
      .update({ username: newUsername, password: newPassword })
      .eq('id', data.id);

    if (updateError) {
      return res.status(500).json({ success: false, message: 'خطا در به‌روزرسانی اطلاعات' });
    }

    return res.status(200).json({ success: true, message: 'اطلاعات مدیر با موفقیت تغییر یافت' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'خطای سرور: ' + err.message });
  }
};
