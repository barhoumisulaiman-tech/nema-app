import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `أنت مساعد ذكي لجمعية حفظ النعمة، وهي جمعية خيرية تعمل في المملكة العربية السعودية متخصصة في استلام فائض الطعام من المناسبات والمطاعم وتوزيعه على الأسر المحتاجة.

مهامك الأساسية:
1. تحليل بلاغات فائض الطعام وتقييم أولويتها
2. اقتراح أفضل مندوب للاستلام والتوزيع بناءً على القرب والتوفر والأداء
3. اقتراح أفضل الأسر للاستفادة بناءً على الأولوية والقرب
4. تقديم ملاحظات وتنبيهات تشغيلية ذكية
5. الإجابة على استفسارات الإدارة بشكل عملي وسريع

القواعد:
- أجب دائماً باللغة العربية الفصحى السهلة
- اجعل إجاباتك مختصرة وعملية ومباشرة
- ضع في اعتبارك أولاً: سلامة الطعام، سرعة التنفيذ، القرب الجغرافي، عدالة التوزيع
- عند الشك، أوصِ بالاستجابة السريعة لأن الطعام يفسد بسرعة
- تذكر دائماً أن هذا العمل خيري وإنساني`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Return a mock response if no API key is configured
      const lastMessage = messages[messages.length - 1]?.content || '';
      const mockResponse = generateMockResponse(lastMessage, context);
      return NextResponse.json({ message: mockResponse });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: SYSTEM_PROMPT + (context ? `\n\nالسياق الحالي:\n${context}` : ''),
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Claude API Error:', err);
      return NextResponse.json({
        message: generateMockResponse(messages[messages.length - 1]?.content || '', context)
      });
    }

    const data = await response.json();
    return NextResponse.json({ message: data.content[0]?.text || 'لا يوجد رد' });

  } catch (error) {
    console.error('AI Assistant Error:', error);
    return NextResponse.json({
      message: 'عذراً، حدث خطأ في الاتصال. سأحاول مساعدتك بناءً على البيانات المتاحة. يرجى التحقق من إعدادات API.'
    });
  }
}

function generateMockResponse(userMessage: string, context?: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('أولوية') || msg.includes('عاجل') || msg.includes('urgency')) {
    return `بناءً على تحليل الطلبات الحالية:

🔴 **الطلبات العاجلة (تحتاج استجابة فورية):**
• قاعة أفراح السعادة (NM-2024-001) - 120 وجبة - يجب الاستلام خلال 25 دقيقة
• استراحة الواحة (NM-2024-002) - 80 وجبة - المندوب في الطريق

🟡 **توصية:** ركّز على الطلبين العاجلين أولاً، ثم انتقل للطلبات الأخرى بعد التأكد من استلامها.`;
  }

  if (msg.includes('مندوب') || msg.includes('courier') || msg.includes('أقرب')) {
    return `🚗 **تقييم المناديب المتاحين الآن:**

1. **محمد العمري** ✅ متاح
   - الأقرب لمعظم الطلبات الحالية (حي النرجس)
   - 127 مهمة مكتملة · تقييم 4.9 ⭐
   - متوسط استجابة: 18 دقيقة

2. **أحمد الشمري** ✅ متاح
   - يغطي منطقة شرق الرياض
   - 63 مهمة مكتملة · تقييم 4.6 ⭐

💡 توصية: عيّن محمد للطلب NM-2024-001 وأحمد للطلب NM-2024-002 لتحسين زمن الاستجابة.`;
  }

  if (msg.includes('توزيع') || msg.includes('أسر') || msg.includes('families')) {
    return `🏡 **اقتراح التوزيع الأمثل:**

للطلب NM-2024-001 (120 وجبة):
• أسرة الجهني - حي النرجس (8 أفراد - أولوية عاجلة) → 40 وجبة
• أسرة الشهري - حي العارض (10 أفراد - أولوية عاجلة) → 50 وجبة  
• أسرة القحطاني - حي الياسمين (6 أفراد - أولوية متوسطة) → 30 وجبة

⏰ ملاحظة: ابدأ بحي النرجس لأنه الأقرب لموقع الجهة المتبرعة.`;
  }

  if (msg.includes('ملخص') || msg.includes('summary') || msg.includes('اليوم')) {
    return `📊 **ملخص العمليات اليوم:**

• إجمالي الطلبات: 6 طلبات
• منها عاجلة: 2 طلبات (يحتاجان استجابة فورية)
• مكتملة: 1 طلب (NM-2024-003)
• قيد التنفيذ: 2 طلبات
• جديدة لم تُعالج: 2 طلبات

👷 المناديب المتاحون: محمد العمري، أحمد الشمري (2 من أصل 4)
🏡 الأسر المنتظرة: 5 أسر

⚡ الإجراء المطلوب: معالجة الطلبين الجديدين (NM-2024-005 و NM-2024-006) في أسرع وقت.`;
  }

  if (msg.includes('رسالة') || msg.includes('message') || msg.includes('اكتب')) {
    return `💬 **رسالة جاهزة للمندوب:**

---
مرحباً محمد 👋

لديك مهمة استلام جديدة:

📍 **الموقع:** قاعة أفراح السعادة - حي النرجس، شارع الأمير محمد بن سعد
📦 **الطعام:** أرز كبسة بالدجاج + سلطة + حلويات
⚡ **الكمية:** 120 وجبة (30 صينية كبيرة)
⏰ **آخر وقت للاستلام:** 11:30 مساءً (متبقي 90 دقيقة)

يُرجى التوجه فوراً وتحديث الحالة عند الوصول.

شكراً ووفقك الله 🌿
---

يمكنك نسخ الرسالة وإرسالها للمندوب مباشرة.`;
  }

  return `مرحباً! أنا مساعد جمعية حفظ النعمة الذكي 🌿

يمكنني مساعدتك في:
• **تقييم الطلبات** وتحديد الأولويات
• **اقتراح أفضل مندوب** متاح للمهمة
• **اقتراح توزيع الطعام** على الأسر الأنسب
• **كتابة رسائل** للمناديب
• **تلخيص** حالة الطلبات اليومية

ما الذي تحتاج مساعدة فيه اليوم؟`;
}
