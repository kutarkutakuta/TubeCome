// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0/dist/transformers.min.js';

// TensorFlow.js と Universal Sentence Encoder 等を使う場合
// import * as tf from 'https://esm.sh/@tensorflow/tfjs@4.10.0';
// import * as use from 'https://esm.sh/@tensorflow-models/universal-sentence-encoder@1.3.3';

console.log("Hello from Functions!")

// 感情分析の簡易実装 (BERTは重いため、ここではTransformers.jsを使用する例)
// 注意: Edge Functionのメモリ制限(128MB~)により、大きなモデルはクラッシュする可能性があります。
// その場合は、より小さなモデルを選択するか、外部APIを利用してください。

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// モデルのロード（初回リクエスト時は遅延が発生する）
// 'Xenova/bert-base-multilingual-uncased-sentiment' などを想定
const pipe = await pipeline('sentiment-analysis', 'Xenova/bert-base-multilingual-uncased-sentiment');

Deno.serve(async (req) => {
  try {
    const { video_id } = await req.json()
    if (!video_id) {
        return new Response(JSON.stringify({ error: 'Missing video_id' }), { status: 400 })
    }

    // 未分析のコメントを取得
    const { data: comments, error } = await supabase
        .from('comments')
        .select('id, text_display')
        .eq('video_id', video_id)
        .is('sentiment_score', null) // 分析済みでないもの
        .limit(50); // 一度に処理する量

    if (error) throw error;
    if (!comments || comments.length === 0) {
        return new Response(JSON.stringify({ message: 'No comments to analyze' }), { status: 200 })
    }

    const updates = [];
    for (const comment of comments) {
        // テキストが短すぎる/長すぎる場合の処理
        const text = comment.text_display.substring(0, 512); 
        
        try {
            const output = await pipe(text);
            // output example: [{ label: '5 stars', score: 0.99 }] or [{ label: 'POSITIVE', score: 0.9 }]
            // モデルによってラベルが異なるため調整が必要
            
            const result = output[0];
            let score = result.score;
            let label = result.label;

            // スコアの正規化などをここで行う
            
            updates.push({
                id: comment.id,
                sentiment_score: score,
                sentiment_label: label,
            });
        } catch (e) {
            console.error(`Analysis failed for comment ${comment.id}:`, e);
        }
    }

    // 結果を保存
    if (updates.length > 0) {
        const { error: upsertError } = await supabase
            .from('comments')
            .upsert(updates, { onConflict: 'id' });
        
        if (upsertError) throw upsertError;
    }

    return new Response(
      JSON.stringify({ message: `Analyzed ${updates.length} comments` }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
