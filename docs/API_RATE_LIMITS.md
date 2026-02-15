# API Rate Limits and Usage Guidelines

## Overview
AIVI AI Studio enforces rate limits to ensure fair usage and system stability. Limits are applied per IP address.

## Rate Limits

| Endpoint | Method | Limit | Window | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/generate-image` | POST | 5 requests | 60 seconds | Image generation (Process & Scene) |
| `/api/text-to-speech` | POST | 20 requests | 60 seconds | Text-to-Speech generation |
| `/api/analyze-video` | POST | 5 requests | 60 seconds | AI Video Analysis |

## Handling Rate Limits
If you exceed the limit, the API will return a `429 Too Many Requests` status code.

### Response Headers
The API includes headers to help you track your usage:
- `X-RateLimit-Limit`: The maximum number of requests allowed in the window.
- `X-RateLimit-Remaining`: The number of requests remaining in the current window.
- `X-RateLimit-Reset`: The time at which the current rate limit window resets (in UTC epoch seconds).

### Example Response
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again in 55 seconds."
}
```

## Best Practices
1. **Caching**: Cache API responses where possible to reduce calls.
2. **Debouncing**: Debounce user inputs (e.g., generate button clicks).
3. **Exponential Backoff**: If you receive a 429, wait for the duration specified in `X-RateLimit-Reset` before retrying.
