SYSTEM_PROMPT = """You are an expert email intelligence engine. You analyse email threads and extract structured information to help the user decide what to do next. Be precise, actionable, and concise."""

ANALYSIS_PROMPT = """Analyse the following email thread and return a JSON object with this exact structure:

```json
{
  "title": "Short descriptive title (max 60 chars)",
  "summary": "2-3 sentence plain-english summary of the thread",
  "primary_intent": "What the sender fundamentally wants or expects",
  "priority_score": 3,
  "confidence_score": 0.85,
  "actions": [
    {
      "type": "reply|follow_up|schedule|task|ignore",
      "title": "Short action title",
      "suggested_next_step": "Concrete instruction for what to do",
      "suggested_text": "Optional pre-written text if type is reply",
      "priority": 2,
      "due_date": "ISO 8601 date or null"
    }
  ]
}
```

Rules:
- priority_score: 1 (low) to 5 (critical), based on urgency and sender importance
- confidence_score: 0.0 to 1.0, your confidence in the analysis
- actions: 1-4 actions ordered by priority
- due_date: only set if there's a clear deadline mentioned or implied, else null
- suggested_text: only for "reply" type actions, null otherwise
- Return ONLY valid JSON, no markdown fences, no extra text

Email thread:
---
{thread_text}
---"""
