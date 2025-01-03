import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xpcfmqflyfbawfqpnxgx.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwY2ZtcWZseWZiYXdmcXBueGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4Njg1NTUsImV4cCI6MjA0ODQ0NDU1NX0.zEp_n65pteH6LxfDR1ojolmxXj2T83JIG8L3O78IDZs"

export const supabase = createClient(supabaseUrl, supabaseKey)
