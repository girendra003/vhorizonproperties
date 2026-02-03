import { createClient } from '@supabase/supabase-js';

const url = 'https://hktvhkbcxtqdbitlwiwe.supabase.co';
const key = 'sb_publishable_Y4zvAHYGOMV4RG0KddVRoA_HbK4vTNW';

const supabase = createClient(url, key);

async function check() {
    console.log('--- Checking Properties Data (Detailed) ---');

    // Fetch properties with all filterable fields
    const { data, error } = await supabase
        .from('properties')
        .select('id, title, status, price, beds, baths, sqft, location');

    if (error) {
        console.error(`[ERROR] Failed to fetch properties: ${error.message}`);
        return;
    }

    if (data.length === 0) {
        console.log('[INFO] No properties found in the database.');
    } else {
        console.log(`[INFO] Found ${data.length} properties.`);
        data.forEach(p => {
            console.log(`[ID: ${p.id}] Status: ${p.status} | Price: ${p.price} | Beds: ${p.beds} | Baths: ${p.baths} | Sqft: ${p.sqft} | Loc: ${p.location}`);
        });
    }

    console.log('--- Done ---');
}

check();
