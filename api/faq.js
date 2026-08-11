const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  // Читання даних — доступне всім, без токена
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('faq_items')
      .select('*')
      .order('id', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // Усі зміни (додавання/редагування/видалення) вимагають правильний токен адміна
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Невірний токен' });
  }

  if (req.method === 'POST') {
    const { cat, q, a } = req.body;
    if (!cat || !q || !a) return res.status(400).json({ error: 'Заповніть усі поля' });
    const { data, error } = await supabase
      .from('faq_items')
      .insert({ cat, q, a })
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (req.method === 'PUT') {
    const { id, cat, q, a } = req.body;
    if (!id || !cat || !q || !a) return res.status(400).json({ error: 'Заповніть усі поля' });
    const { error } = await supabase
      .from('faq_items')
      .update({ cat, q, a })
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Немає id' });
    const { error } = await supabase
      .from('faq_items')
      .delete()
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Метод не підтримується' });
}
