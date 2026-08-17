const { supabase } = require('./config');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      // ثبت آهنگ جدید پس از آپلود در استوریج
      const { title, url } = req.body || {};
      if (!title || !url) {
        return res.status(400).json({ success: false, message: 'عنوان و لینک آهنگ الزامی است' });
      }

      const { data, error } = await supabase
        .from('songs')
        .insert([{ title, url }])
        .select();

      if (error) return res.status(500).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, song: data[0] });
    } 

    else if (req.method === 'PUT') {
      // ویرایش نام آهنگ
      const { id, title } = req.body || {};
      if (!id || !title) {
        return res.status(400).json({ success: false, message: 'شناسه و عنوان جدید الزامی است' });
      }

      const { error } = await supabase
        .from('songs')
        .update({ title })
        .eq('id', id);

      if (error) return res.status(500).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, message: 'عنوان آهنگ با موفقیت ویرایش شد' });
    } 

    else if (req.method === 'DELETE') {
      // حذف آهنگ
      const { id, fileName } = req.body || {};
      if (!id) return res.status(400).json({ success: false, message: 'شناسه آهنگ الزامی است' });

      // ۱. حذف از دیتابیس
      const { error: dbError } = await supabase.from('songs').delete().eq('id', id);
      if (dbError) return res.status(500).json({ success: false, message: dbError.message });

      // ۲. حذف فایل از Storage در صورت وجود نام فایل
      if (fileName) {
        await supabase.storage.from('songs').remove([fileName]);
      }

      return res.status(200).json({ success: true, message: 'آهنگ حذف شد' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'خطای سرور: ' + err.message });
  }
};
