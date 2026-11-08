import "server-only";
import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const Req = z.object({
  topic: z.string().min(3).max(500),
  recipient: z.string().min(1).max(200),
  tone: z.enum(["resmi", "samimi", "arkadasca"]),
  language: z.enum(["tr", "en"]).default("tr"),
  points: z.string().max(1000).optional(),
});

const Res = z.object({
  subject: z.string(),
  greeting: z.string(),
  body: z.string(),
  closing: z.string(),
  signature: z.string(),
});

const TONE: Record<z.infer<typeof Req>["tone"], string> = {
  resmi: "resmi, profesyonel, mesafeli ama saygılı",
  samimi: "samimi, nazik, anlayışlı",
  arkadasca: "sıcak, rahat, konuşma havasında",
};

export async function POST(req: Request) {
  const limited = await rateLimit({
    action: "eposta",
    windowMs: 60 * 60 * 1000,
    max: 30,
  });
  if (!limited.ok) {
    return json(
      { error: "Saatte en fazla 30 e-posta taslağı üretebilirsin." },
      429,
    );
  }

  let body: z.infer<typeof Req>;
  try {
    body = Req.parse(await req.json());
  } catch {
    return json({ error: "Geçersiz istek gövdesi." }, 400);
  }

  const lang =
    body.language === "en" ? "English" : "Türkçe";
  const system = [
    `Sen deneyimli bir yazı koçusun. Kullanıcı için ${lang} e-posta taslağı hazırlıyorsun.`,
    `Ton: ${TONE[body.tone]}.`,
    "JSON şemasına uyarak subject (konu satırı), greeting (selamlama), body (gövde, 2-4 paragraf), closing (kapanış) ve signature (imza yer tutucu, örn. 'Saygılarımla, [Adınız]') üret.",
    "Gövdede madde işareti kullanma; kısa paragraflar yaz. Fazla süslemeden kaçın.",
    body.points
      ? `Mutlaka değinmesi gereken noktalar: ${body.points}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const prompt = `Konu: ${body.topic}\nAlıcı: ${body.recipient}\nLütfen e-postayı hazırla.`;

  try {
    const { object } = await generateObject({
      model: groq("openai/gpt-oss-120b"),
      schema: Res,
      system,
      prompt,
      temperature: 0.5,
    });
    return json(object);
  } catch (err) {
    console.error("[eposta] failed:", err);
    return json({ error: "Taslak üretilemedi." }, 502);
  }
}

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
