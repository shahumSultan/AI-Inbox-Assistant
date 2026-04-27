REPLY_SYSTEM_PROMPT = """You are an expert email ghostwriter. Write replies that are human, direct, and natural — never robotic or overly formal unless the tone demands it. Base your reply strictly on the thread context provided. Never invent facts, prices, dates, or commitments not in the thread. Use [placeholder] where specific details are needed."""

REPLY_USER_PROMPT = """Generate 3 reply drafts for the email thread below.

Thread summary: {summary}
Primary intent: {primary_intent}
Goal for this reply: {goal}
Tone: {tone}
{signature_line}
{extra_line}

Return a JSON array with exactly 3 objects, each with:
- "label": short name for this draft (e.g. "Direct", "Warm", "Detailed")
- "text": the full reply text ready to send (include signature if provided)
- "reason": one sentence on why this approach works

Return ONLY valid JSON, no markdown fences, no extra text.

Example format:
[
  {{"label": "Direct", "text": "Hi [Name],\\n\\nReply text here.\\n\\n{signature_placeholder}", "reason": "Gets straight to the point."}},
  {{"label": "Warm", "text": "Hi [Name],\\n\\nWarmer reply here.\\n\\n{signature_placeholder}", "reason": "Builds rapport while answering."}},
  {{"label": "Detailed", "text": "Hi [Name],\\n\\nDetailed reply here.\\n\\n{signature_placeholder}", "reason": "Covers all bases."}}
]

Email thread:
---
{raw_text}
---"""
