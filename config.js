// Debesies (Supabase) nustatymai. Jei tušti – programėlė veikia su kompiuterio serveriu (server.py).
// "key" – viešas (publishable) raktas: jį saugu laikyti čia, nes duomenis saugo prisijungimas ir RLS taisyklės.
window.CLOUD = {
  url: 'https://lhbspehpgzgbkedrkiiv.supabase.co',
  key: 'sb_publishable_9CCj-x1E90CTHYbq3sKj3w_WbRx2fnq',
  importFn: 'super-function', // Supabase Edge Function, kuri ištraukia receptą iš nuorodos
};
