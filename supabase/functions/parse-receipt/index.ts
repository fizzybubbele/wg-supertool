import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

type ParsedReceipt = {
  store_name: string | null;
  purchase_date: string | null;
  total_amount: number | null;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    unit_price: number | null;
    total_price: number | null;
  }>;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function demoParse(): ParsedReceipt {
  return {
    store_name: 'Demo Supermarkt',
    purchase_date: new Date().toISOString().slice(0, 10),
    total_amount: 12.47,
    currency: 'EUR',
    items: [
      { name: 'Vollmilch 1L', quantity: 1, unit_price: 1.19, total_price: 1.19 },
      { name: 'Vollkornbrot', quantity: 1, unit_price: 2.49, total_price: 2.49 },
      { name: 'Eier 10er', quantity: 1, unit_price: 3.29, total_price: 3.29 },
      { name: 'Butter 250g', quantity: 1, unit_price: 2.19, total_price: 2.19 },
      { name: 'Apfelsaft 1L', quantity: 1, unit_price: 1.49, total_price: 1.49 },
    ],
  };
}

async function parseWithOpenAI(base64: string, mimeType: string): Promise<ParsedReceipt> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    return demoParse();
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Du extrahierst Kassenzettel-Daten. Antworte nur als JSON mit: store_name (string|null), purchase_date (YYYY-MM-DD|null), total_amount (number|null), currency (string), items (Array mit name, quantity, unit_price, total_price). Preise als Dezimalzahlen in EUR.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extrahiere alle Positionen und den Gesamtbetrag von diesem Kassenzettel.',
            },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
          ],
        },
      ],
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vision-API Fehler: ${errorText}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Keine Antwort von der Vision-API');
  }

  const parsed = JSON.parse(content) as ParsedReceipt;
  return {
    store_name: parsed.store_name ?? null,
    purchase_date: parsed.purchase_date ?? null,
    total_amount: parsed.total_amount ?? null,
    currency: parsed.currency ?? 'EUR',
    items: (parsed.items ?? []).map((item) => ({
      name: item.name,
      quantity: Number(item.quantity ?? 1),
      unit_price: item.unit_price != null ? Number(item.unit_price) : null,
      total_price: item.total_price != null ? Number(item.total_price) : null,
    })),
  };
}

function mimeFromPath(path: string) {
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let receiptId: string | undefined;
  let serviceClient: ReturnType<typeof createClient> | undefined;

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await req.json();
    receiptId = body.receipt_id;
    if (!receiptId) {
      return jsonResponse({ error: 'receipt_id fehlt' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    serviceClient = supabase;

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: receipt, error: receiptError } = await userClient
      .from('receipts')
      .select('id, household_id, storage_path, status')
      .eq('id', receiptId)
      .single();

    if (receiptError || !receipt) {
      return jsonResponse({ error: 'Kassenzettel nicht gefunden' }, 404);
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('receipts')
      .download(receipt.storage_path);

    if (downloadError || !fileData) {
      await supabase
        .from('receipts')
        .update({ status: 'failed', error_message: downloadError?.message ?? 'Download fehlgeschlagen' })
        .eq('id', receiptId);
      return jsonResponse({ error: 'Bild konnte nicht geladen werden' }, 500);
    }

    const bytes = new Uint8Array(await fileData.arrayBuffer());
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    const base64 = btoa(binary);
    const mimeType = fileData.type || mimeFromPath(receipt.storage_path);

    const parsed = await parseWithOpenAI(base64, mimeType);

    await supabase.from('receipt_items').delete().eq('receipt_id', receiptId);

    if (parsed.items.length > 0) {
      const itemRows = parsed.items.map((item, index) => ({
        receipt_id: receiptId,
        household_id: receipt.household_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        sort_order: index,
      }));

      const { error: itemsError } = await supabase.from('receipt_items').insert(itemRows);
      if (itemsError) {
        throw new Error(itemsError.message);
      }
    }

    const { error: updateError } = await supabase
      .from('receipts')
      .update({
        store_name: parsed.store_name,
        purchase_date: parsed.purchase_date,
        total_amount: parsed.total_amount,
        currency: parsed.currency,
        status: 'parsed',
        raw_vision_json: parsed,
        error_message: null,
      })
      .eq('id', receiptId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return jsonResponse({ success: true, receipt_id: receiptId, parsed });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    if (receiptId && serviceClient) {
      await serviceClient
        .from('receipts')
        .update({ status: 'failed', error_message: message })
        .eq('id', receiptId);
    }
    return jsonResponse({ error: message }, 500);
  }
});
