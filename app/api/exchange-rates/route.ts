import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const APP_ID = process.env.OPEN_EXCHANGE_RATES_APP_ID;
    if (!APP_ID) {
      return NextResponse.json({ error: 'Open Exchange Rates API Key missing' }, { status: 500 });
    }

    const res = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${APP_ID}`);
    if (!res.ok) {
      throw new Error('Failed to fetch from Open Exchange Rates');
    }

    const data = await res.json();
    
    // data.rates contains the exchange rates relative to USD base
    return NextResponse.json({ success: true, rates: data.rates, base: data.base });
  } catch (error: any) {
    console.error('Exchange Rates Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch rates' }, { status: 500 });
  }
}
