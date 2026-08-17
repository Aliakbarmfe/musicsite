const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wfbisnmbqtlfpbjzvmfq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmYmlzbm1icXRsZnBianp2bWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODk2OTIsImV4cCI6MjEwMjU2NTY5Mn0.BGTfdOHabMdzJo4O32BE-ESApc0e9Rl1PF0VSzuLeW8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = { supabase, SUPABASE_URL, SUPABASE_KEY };
