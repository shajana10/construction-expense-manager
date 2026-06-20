const SUPABASE_URL = "https://mswdfspyagsajpgaprrj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zd2Rmc3B5YWdzYWpwZ2FwcnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NTUzMjAsImV4cCI6MjA5NzMzMTMyMH0.BqftNPANY2ADpqRsLwsf0I1MVzKWenn4XLXGKacj4v8";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log("Client:", supabase);