# TELC B2 Exam System - API Documentation

## Overview

The TELC B2 Exam System API is a RESTful API built with Flask that provides endpoints for exam management, student testing, and administration functions.

**Base URL**: `http://localhost:5000/api` (Development)

## Authentication

### Admin Authentication

Admin endpoints require token-based authentication via the `X-Admin-Token` header:

```http
X-Admin-Token: your-admin-token-here
```

Example:
```bash
curl -H "X-Admin-Token: your-admin-token-here" \
     http://localhost:5000/api/admin/stats
```

### Rate Limiting

All endpoints implement rate limiting:
- Public endpoints: 120 requests per minute
- Admin endpoints: 30 requests per minute
- Translation endpoints: 50 requests per minute

## API Endpoints

### 1. System Endpoints

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-10T12:00:00Z"
}
```

#### System Information
```http
GET /
```

**Response:**
```json
{
  "message": "TELC B2 Exam System API",
  "version": "1.0.0",
  "endpoints": [
    "/api/exams",
    "/api/exam-results",
    "/api/translate",
    "/api/admin/stats"
  ]
}
```

### 2. Exam Management

#### List All Exams
```http
GET /api/exams
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "TELC B2 Übungsprüfung 1",
    "created_at": "2024-01-10T12:00:00Z"
  },
  {
    "id": 2,
    "title": "TELC B2 Übungsprüfung 2",
    "created_at": "2024-01-11T14:30:00Z"
  }
]
```

#### Get Exam Details
```http
GET /api/exams/:id
```

**Response:**
```json
{
  "id": 1,
  "title": "TELC B2 Übungsprüfung 1",
  "created_at": "2024-01-10T12:00:00Z",
  "leseverstehen_teil1": {
    "titles": ["Title A", "Title B", "..."],
    "texts": ["Text 1", "Text 2", "..."],
    "answers": ["a", "b", "c", "d", "e"]
  },
  "leseverstehen_teil2": {
    "texts": ["Long text 1", "..."],
    "questions": [
      {
        "question": "Question 6",
        "options": ["Option A", "Option B", "Option C"],
        "answer": "a"
      }
    ]
  },
  "leseverstehen_teil3": {
    "situations": ["Situation 11", "Situation 12", "..."],
    "ads": ["Ad A", "Ad B", "..."]
  },
  "sprachbausteine_teil1": {
    "text": "Text with [BLANK_21] and [BLANK_22]...",
    "options": {
      "21": ["Option A", "Option B", "Option C"],
      "22": ["Option A", "Option B", "Option C"]
    },
    "answers": ["a", "b", "c", "..."]
  },
  "sprachbausteine_teil2": {
    "text": "Text with [BLANK_31] and [BLANK_32]...",
    "words": ["Word A", "Word B", "..."],
    "answers": ["a", "b", "c", "..."]
  },
  "hoerverstehen": {
    "teil1": {
      "audio_url": "https://example.com/audio1.mp3",
      "statements": ["Statement 41", "Statement 42", "..."],
      "answers": [true, false, true, false, true]
    },
    "teil2": {
      "audio_url": "https://example.com/audio2.mp3",
      "statements": ["Statement 46", "Statement 47", "..."],
      "answers": [false, true, false, true, false, true, false, true, false, true]
    },
    "teil3": {
      "audio_url": "https://example.com/audio3.mp3",
      "statements": ["Statement 56", "Statement 57", "..."],
      "answers": [true, true, false, false, true]
    }
  },
  "schriftlicher_ausdruck": {
    "task_a": "Write a formal letter about...",
    "task_b": "Write an opinion essay about..."
  }
}
```

#### Create New Exam (Admin)
```http
POST /api/exams
X-Admin-Token: your-admin-token-here
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "TELC B2 Neue Prüfung",
  "lv1_titles": ["Titel A", "Titel B", "..."],
  "lv1_texts": ["Text 1", "Text 2", "..."],
  "lv1_answers": ["a", "b", "c", "d", "e"],
  "lv2_texts": ["Langer Text 1", "..."],
  "lv2_questions": [
    {
      "question": "Frage 6",
      "options": ["Option A", "Option B", "Option C"],
      "answer": "a"
    }
  ],
  "lv3_situations": ["Situation 11", "..."],
  "lv3_ads": ["Anzeige A", "..."],
  "sb1_text": "Text mit Lücken...",
  "sb1_words": ["a", "b", "c"],
  "sb1_answers": ["a", "b", "..."],
  "sb2_text": "Text mit Lücken...",
  "sb2_options": ["Wort A", "..."],
  "sb2_answers": ["a", "b", "..."],
  "hv1_audio_url": "https://example.com/audio1.mp3",
  "hv1_statements": ["Aussage 41", "..."],
  "hv1_answers": [true, false, true, false, true],
  "hv2_audio_url": "https://example.com/audio2.mp3",
  "hv2_statements": ["Aussage 46", "..."],
  "hv2_answers": [false, true, false, true, false, true, false, true, false, true],
  "hv3_audio_url": "https://example.com/audio3.mp3",
  "hv3_statements": ["Aussage 56", "..."],
  "hv3_answers": [true, true, false, false, true],
  "sa_task_a": "Formeller Brief über...",
  "sa_task_b": "Meinungsaufsatz über..."
}
```

**Response:**
```json
{
  "id": 3,
  "title": "TELC B2 Neue Prüfung",
  "created_at": "2024-01-12T10:00:00Z"
}
```

#### Update Exam (Admin)
```http
PUT /api/exams/:id
X-Admin-Token: your-admin-token-here
Content-Type: application/json
```

**Request Body:** Same as Create Exam

**Response:**
```json
{
  "message": "Exam updated successfully",
  "exam_id": 1
}
```

#### Delete Exam (Admin)
```http
DELETE /api/exams/:id
X-Admin-Token: your-admin-token-here
```

**Response:**
```json
{
  "message": "Exam deleted successfully"
}
```

### 3. Exam Results

#### Submit Exam Results
```http
POST /api/exam-results
Content-Type: application/json
```

**Request Body:**
```json
{
  "exam_id": 1,
  "student_name": "Max Mustermann",
  "answers": {
    "1": "a",
    "2": "b",
    "3": "c",
    "4": "d",
    "5": "e",
    "6": "a",
    "7": "b",
    "8": "c",
    "9": "a",
    "10": "b",
    "11": "a",
    "12": "b",
    "13": "0",
    "14": "c",
    "15": "d",
    "16": "e",
    "17": "f",
    "18": "g",
    "19": "h",
    "20": "i",
    "21": "a",
    "22": "b",
    "23": "c",
    "24": "a",
    "25": "b",
    "26": "c",
    "27": "a",
    "28": "b",
    "29": "c",
    "30": "a",
    "31": "a",
    "32": "b",
    "33": "c",
    "34": "d",
    "35": "e",
    "36": "f",
    "37": "g",
    "38": "h",
    "39": "i",
    "40": "j",
    "41": true,
    "42": false,
    "43": true,
    "44": false,
    "45": true,
    "46": false,
    "47": true,
    "48": false,
    "49": true,
    "50": false,
    "51": true,
    "52": false,
    "53": true,
    "54": false,
    "55": true,
    "56": true,
    "57": true,
    "58": false,
    "59": false,
    "60": true,
    "schriftlicher_ausdruck_a": "Dear Sir/Madam...",
    "schriftlicher_ausdruck_b": "In my opinion..."
  }
}
```

**Response:**
```json
{
  "id": 1,
  "exam_id": 1,
  "student_name": "Max Mustermann",
  "score": 85.5,
  "section_scores": {
    "leseverstehen": 18,
    "sprachbausteine": 9,
    "hoerverstehen": 14,
    "schriftlicher_ausdruck": "pending_review"
  },
  "completed_at": "2024-01-12T15:30:00Z"
}
```

#### Get Exam Results (Admin)
```http
GET /api/exam-results
X-Admin-Token: your-admin-token-here
```

**Query Parameters:**
- `exam_id` (optional): Filter by exam ID
- `student_name` (optional): Filter by student name
- `from_date` (optional): Filter by completion date (ISO format)
- `to_date` (optional): Filter by completion date (ISO format)

**Response:**
```json
[
  {
    "id": 1,
    "exam_id": 1,
    "exam_title": "TELC B2 Übungsprüfung 1",
    "student_name": "Max Mustermann",
    "score": 85.5,
    "completed_at": "2024-01-12T15:30:00Z"
  },
  {
    "id": 2,
    "exam_id": 1,
    "exam_title": "TELC B2 Übungsprüfung 1",
    "student_name": "Anna Schmidt",
    "score": 92.0,
    "completed_at": "2024-01-12T16:45:00Z"
  }
]
```

### 4. Translation Services

#### Translate Text
```http
POST /api/translate
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "Dies ist ein Beispieltext.",
  "source_lang": "de",
  "target_lang": "fa",
  "service": "google"
}
```

**Response:**
```json
{
  "translated_text": "این یک متن نمونه است.",
  "source_lang": "de",
  "target_lang": "fa",
  "service": "google",
  "cached": false
}
```

#### Get Translated Exam
```http
GET /api/translate/exam/:id?lang=fa
```

**Response:**
```json
{
  "exam_id": 1,
  "target_lang": "fa",
  "translated_content": {
    "title": "آزمون تمرینی TELC B2 شماره 1",
    "leseverstehen_teil1": {
      "titles": ["عنوان الف", "عنوان ب", "..."],
      "texts": ["متن 1", "متن 2", "..."]
    },
    "// ... rest of translated exam content"
  },
  "cached": true,
  "translation_date": "2024-01-12T10:00:00Z"
}
```

### 5. Admin Statistics

#### Get System Statistics (Admin)
```http
GET /api/admin/stats
X-Admin-Token: your-admin-token-here
```

**Response:**
```json
{
  "exams": {
    "total": 5,
    "created_last_30_days": 2,
    "most_popular": {
      "id": 1,
      "title": "TELC B2 Übungsprüfung 1",
      "attempts": 156
    }
  },
  "results": {
    "total": 342,
    "last_30_days": 89,
    "average_score": 78.5,
    "pass_rate": 0.82,
    "score_distribution": {
      "90-100": 45,
      "80-89": 98,
      "70-79": 124,
      "60-69": 52,
      "below_60": 23
    }
  },
  "students": {
    "unique_total": 287,
    "active_last_30_days": 76
  },
  "translations": {
    "total_requests": 1523,
    "cached_hits": 1289,
    "cache_hit_rate": 0.846,
    "languages": {
      "fa": 1420,
      "ar": 67,
      "tr": 36
    }
  },
  "system": {
    "database_size": "124 MB",
    "api_uptime": "99.98%",
    "last_backup": "2024-01-12T03:00:00Z"
  }
}
```

## Error Responses

All endpoints use consistent error formatting:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {
    "// Additional error details if applicable"
  }
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Invalid request format or parameters |
| 401 | `unauthorized` | Missing or invalid admin token |
| 403 | `forbidden` | Insufficient permissions |
| 404 | `not_found` | Resource not found |
| 409 | `conflict` | Resource conflict (e.g., duplicate) |
| 429 | `too_many_requests` | Rate limit exceeded |
| 500 | `internal_server_error` | Server error |

### Example Error Response
```json
{
  "error": "not_found",
  "message": "Exam with ID 999 not found",
  "details": {
    "exam_id": 999,
    "timestamp": "2024-01-12T15:30:00Z"
  }
}
```

## Request/Response Headers

### Standard Request Headers
```http
Content-Type: application/json
Accept: application/json
X-Admin-Token: your-admin-token-here (for admin endpoints)
```

### Standard Response Headers
```http
Content-Type: application/json
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
X-RateLimit-Reset: 1704988800
```

## Pagination

For endpoints returning lists, pagination is supported:

**Query Parameters:**
- `page` (default: 1): Page number
- `per_page` (default: 20, max: 100): Items per page

**Response Headers:**
```http
X-Total-Count: 342
X-Page: 1
X-Per-Page: 20
X-Total-Pages: 18
```

## Webhook Events (Future)

The API will support webhooks for the following events:
- `exam.created`
- `exam.updated`
- `exam.deleted`
- `result.submitted`
- `result.graded`

## SDKs and Code Examples

### Python Example
```python
import requests

BASE_URL = "http://localhost:5000/api"
ADMIN_TOKEN = "your-admin-token-here"

# Get all exams
response = requests.get(f"{BASE_URL}/exams")
exams = response.json()

# Create new exam (admin)
headers = {"X-Admin-Token": ADMIN_TOKEN}
exam_data = {
    "title": "New TELC B2 Exam",
    "lv1_titles": ["Title A", "Title B"],
    # ... rest of exam data
}
response = requests.post(f"{BASE_URL}/exams", json=exam_data, headers=headers)
new_exam = response.json()
```

### JavaScript Example
```javascript
const BASE_URL = "http://localhost:5000/api";
const ADMIN_TOKEN = "your-admin-token-here";

// Get exam details
async function getExam(examId) {
  const response = await fetch(`${BASE_URL}/exams/${examId}`);
  return await response.json();
}

// Submit exam results
async function submitResults(examId, studentName, answers) {
  const response = await fetch(`${BASE_URL}/exam-results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      exam_id: examId,
      student_name: studentName,
      answers: answers
    })
  });
  return await response.json();
}
```

### cURL Examples
```bash
# Get all exams
curl http://localhost:5000/api/exams

# Get specific exam
curl http://localhost:5000/api/exams/1

# Create exam (admin)
curl -X POST http://localhost:5000/api/exams \
  -H "X-Admin-Token: your-admin-token-here" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Exam", "lv1_titles": ["A", "B"]}'

# Translate text
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hallo Welt", "target_lang": "fa"}'
```

## API Versioning

The API uses URL-based versioning. The current version is v1 (implicit).

Future versions will use the format: `/api/v2/exams`

## Rate Limiting Details

Rate limits are applied per IP address:

| Endpoint Type | Limit | Window |
|--------------|-------|---------|
| Public GET | 120 req | 60 sec |
| Public POST | 60 req | 60 sec |
| Admin endpoints | 30 req | 60 sec |
| Translation | 50 req | 60 sec |

When rate limited, the API returns:
```json
{
  "error": "too_many_requests",
  "message": "Rate limit exceeded. Please try again in 45 seconds.",
  "retry_after": 45
}
```

## CORS Policy

The API supports CORS for the configured frontend origin:

```http
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Admin-Token
```

## Best Practices

1. **Always handle errors**: Check response status codes
2. **Respect rate limits**: Implement exponential backoff
3. **Cache responses**: Especially for exam content
4. **Use HTTPS in production**: Never send tokens over HTTP
5. **Validate input**: Check data before sending to API
6. **Handle pagination**: Don't request all results at once

## Support

For API support or to report issues:
- GitHub Issues: [github.com/yourusername/telc-b2-exam-system/issues](https://github.com/yourusername/telc-b2-exam-system/issues)
- Email: support@example.com

---

Last updated: January 2024