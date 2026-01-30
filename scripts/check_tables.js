import { createClient } from '@supabase/supabase-js';

const url = 'https://hktvhkbcxtqdbitlwiwe.supabase.co';
const key = 'sb_publishable_Y4zvAHYGOMV4RG0KddVRoA_HbK4vTNW';

const supabase = createClient(url, key);

async function check() {
    console.log('--- Checking Tables ---');

    // Check Properties
    const { data: pData, error: pError } = await supabase.from('properties').select('id').limit(1);
    if (pError) console.log(`[PROPERTIES] Error: ${pError.message}`);
    else console.log(`[PROPERTIES] Exists. Found ${pData.length > 0 ? 'data' : 'no data'}.`);

    // Check Agents
    const { data: aData, error: aError } = await supabase.from('agents').select('id').limit(1);
    if (aError) console.log(`[AGENTS] Error: ${aError.message}`);
    else console.log(`[AGENTS] Exists. Found ${aData.length > 0 ? 'data' : 'no data'}.`);

    // Check Testimonials
    const { data: tData, error: tError } = await supabase.from('testimonials').select('id').limit(1);
    if (tError) console.log(`[TESTIMONIALS] Error: ${tError.message}`);
    else console.log(`[TESTIMONIALS] Exists. Found ${tData.length > 0 ? 'data' : 'no data'}.`);

    console.log('--- Done ---');
}

check();
