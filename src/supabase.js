import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pwctdziiqapgtdnqjgpn.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_5FccBHRKGNZi0F3oFOJZVw_JX5Fbopk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)