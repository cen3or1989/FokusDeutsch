# White Screen Issue Prevention and Debugging Guide

## Problem Description
After clicking on an exam, the page becomes completely white, indicating a React rendering error or API failure.

## Root Causes Identified

### 1. API Connection Issues
- Backend server not running
- Network connectivity problems
- CORS configuration issues
- Invalid exam ID

### 2. React Component Errors
- Unhandled JavaScript exceptions
- Missing dependencies
- Invalid props or state
- Memory leaks

### 3. Data Loading Issues
- Invalid exam data structure
- Missing required fields
- JSON parsing errors
- Timeout issues

### 4. **NEW: Undefined Array Access (Teil 2 Issue)**
- Trying to access `exam.leseverstehen_teil2.questions` when it's undefined
- Error: `Cannot read properties of undefined (reading 'map')`
- Missing null checks for exam data arrays

## Prevention Measures Implemented

### 1. Error Boundary Component
- Catches React rendering errors
- Provides user-friendly error messages
- Offers retry and navigation options
- Logs detailed error information

### 2. Enhanced Error Handling
- Comprehensive API error handling
- Graceful fallbacks for missing data
- Detailed error logging and tracking
- Session storage for error persistence

### 3. Debug Utilities
- Global error tracking
- API call monitoring
- Performance measurement
- White screen detection and auto-recovery

### 4. Loading States
- Proper loading indicators
- Error state handling
- Fallback UI components

### 5. **NEW: Safe Array Access Pattern**
```javascript
// ❌ WRONG - Causes white screen
exam.leseverstehen_teil2.questions.map(...)

// ✅ CORRECT - Safe access
(exam.leseverstehen_teil2.questions || []).map(...)

// ✅ CORRECT - Nested safe access
(exam.leseverstehen_teil2.questions || []).flatMap((q, qIdx) => [
  `leseverstehen_teil2.questions[${qIdx}].question`,
  ...(q.options || []).map((_, oIdx) => `leseverstehen_teil2.questions[${qIdx}].options[${oIdx}]`)
])
```

## Debugging Tools

### 1. Console Debugging
```javascript
// Get all debug information
window.getExamDebugInfo()

// Check for errors in session storage
sessionStorage.getItem('exam_errors')
sessionStorage.getItem('exam_fetch_error')
sessionStorage.getItem('last_error')
```

### 2. Error Boundary Features
- Unique error IDs for tracking
- Detailed error information in development
- Automatic error logging
- User-friendly error messages

### 3. API Monitoring
- Request/response logging
- Performance timing
- Error categorization
- Network status tracking

## Common Issues and Solutions

### Issue 1: Backend Server Not Running
**Symptoms:** White screen, console shows network errors
**Solution:** 
1. Start the backend server: `python src/main.py`
2. Check if server is running on correct port (5000)
3. Verify API_BASE_URL configuration

### Issue 2: Invalid Exam ID
**Symptoms:** 404 errors, "Invalid exam data" messages
**Solution:**
1. Check exam ID in URL
2. Verify exam exists in database
3. Check admin panel for exam availability

### Issue 3: CORS Issues
**Symptoms:** Network errors, blocked requests
**Solution:**
1. Check backend CORS configuration
2. Verify frontend origin settings
3. Check browser console for CORS errors

### Issue 4: Memory Leaks
**Symptoms:** Gradual performance degradation
**Solution:**
1. Check for unmounted component subscriptions
2. Verify cleanup in useEffect hooks
3. Monitor memory usage in browser dev tools

### **Issue 5: NEW - Undefined Array Access (Teil 2 White Screen)**
**Symptoms:** 
- White screen when clicking on exam sections
- Console error: `Cannot read properties of undefined (reading 'map')`
- Error occurs in exam section components

**Solution:**
1. **Add null checks for all exam data arrays:**
```javascript
// Before rendering any exam data, always check:
if (!exam?.section_name) {
  return <ErrorComponent />
}

// When accessing arrays, use safe access:
(exam.section_name?.array_name || []).map(...)
```

2. **Use optional chaining for nested objects:**
```javascript
// Instead of:
exam.leseverstehen_teil2.questions.map(...)

// Use:
(exam.leseverstehen_teil2?.questions || []).map(...)
```

3. **Add fallback UI for missing data:**
```javascript
if (!exam?.leseverstehen_teil2) {
  return (
    <Card>
      <CardContent>
        <div className="text-center">
          <h3>Teil 2 nicht verfügbar</h3>
          <p>Der Inhalt ist derzeit nicht verfügbar.</p>
        </div>
      </CardContent>
    </Card>
  )
}
```

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser developer tools (F12)
2. Check Console tab for errors
3. Look for network errors in Network tab
4. Check for React errors in Components tab

### Step 2: Verify Backend Status
1. Check if backend server is running
2. Test API endpoint directly: `http://localhost:5000/api/exams`
3. Verify database connection
4. Check backend logs for errors

### Step 3: Check Network Requests
1. Open Network tab in dev tools
2. Click on exam to trigger request
3. Check request/response details
4. Verify API endpoint and parameters

### Step 4: Use Debug Utilities
1. Run `window.getExamDebugInfo()` in console
2. Check session storage for error logs
3. Review component render history
4. Analyze API call performance

### Step 5: Test Error Recovery
1. Trigger error boundary by causing an error
2. Verify error message display
3. Test retry functionality
4. Check navigation options

### **Step 6: NEW - Check Exam Data Structure**
1. Verify exam data has all required sections
2. Check if arrays exist before accessing them
3. Use safe array access patterns
4. Add fallback UI for missing data

## Prevention Checklist

### Development
- [ ] Always wrap exam components in ErrorBoundary
- [ ] Use try-catch blocks for async operations
- [ ] Validate data before rendering
- [ ] Test error scenarios
- [ ] Monitor performance metrics
- [ ] **NEW: Use safe array access patterns**
- [ ] **NEW: Add null checks for all exam data**

### Testing
- [ ] Test with slow network connections
- [ ] Test with invalid exam IDs
- [ ] Test with backend server down
- [ ] Test error boundary functionality
- [ ] Test recovery mechanisms
- [ ] **NEW: Test with missing exam sections**
- [ ] **NEW: Test with incomplete exam data**

### Monitoring
- [ ] Log all errors with context
- [ ] Track API call performance
- [ ] Monitor white screen occurrences
- [ ] Track user recovery actions
- [ ] Analyze error patterns
- [ ] **NEW: Monitor undefined data access**

## Emergency Recovery

### For Users
1. **Refresh the page** - Most common solution
2. **Clear browser cache** - Remove corrupted data
3. **Try different browser** - Isolate browser-specific issues
4. **Check network connection** - Verify internet access

### For Developers
1. **Check backend logs** - Identify server issues
2. **Verify database connection** - Check data availability
3. **Test API endpoints** - Ensure backend functionality
4. **Review recent changes** - Identify code issues
5. **NEW: Check exam data structure** - Verify all required fields exist

## Error Codes Reference

| Error Type | Description | Common Causes |
|------------|-------------|---------------|
| `api_error` | API request failed | Backend down, network issues |
| `invalid_data` | Invalid exam data | Database corruption, missing fields |
| `white_screen` | Empty page detected | Component errors, rendering issues |
| `global_error` | Unhandled JavaScript error | Code bugs, missing dependencies |
| `exam_fetch_error` | Exam loading failed | Invalid ID, server issues |
| **`undefined_array_access`** | **Trying to map undefined array** | **Missing exam sections, no null checks** |

## Performance Monitoring

### Key Metrics
- API response times
- Component render times
- Memory usage
- Error frequency
- Recovery success rate

### Optimization Tips
- Implement request caching
- Use React.memo for expensive components
- Optimize bundle size
- Implement lazy loading
- Monitor memory leaks
- **NEW: Use safe array access to prevent crashes**

## Support Information

### Debug Data Collection
When reporting issues, include:
1. Error ID from error boundary
2. Console error messages
3. Network request details
4. Browser and OS information
5. Steps to reproduce
6. **NEW: Exam data structure details**

### Contact Information
- Check backend logs for detailed error information
- Use browser developer tools for frontend debugging
- Review this documentation for common solutions
- Test with different browsers and devices

## Future Improvements

### Planned Enhancements
- Real-time error reporting
- Automatic error recovery
- Performance optimization
- Enhanced monitoring
- User feedback collection
- **NEW: Automatic data validation**
- **NEW: Smart fallback UI generation**

### Best Practices
- Regular code reviews
- Comprehensive testing
- Performance monitoring
- Error tracking
- User experience optimization
- **NEW: Always use safe array access**
- **NEW: Validate exam data structure**

## **NEW: Safe Array Access Pattern Library**

### For Exam Sections:
```javascript
// Leseverstehen Teil 1
const titles = exam.leseverstehen_teil1?.titles || []
const texts = exam.leseverstehen_teil1?.texts || []

// Leseverstehen Teil 2
const questions = exam.leseverstehen_teil2?.questions || []
const texts = exam.leseverstehen_teil2?.texts || []

// Sprachbausteine
const options = exam.sprachbausteine_teil1?.options || []
const words = exam.sprachbausteine_teil2?.words || []

// Hörverstehen
const statements = exam.hoerverstehen?.teil1?.statements || []

// Schriftlicher Ausdruck
const taskA = exam.schriftlicher_ausdruck?.task_a || ''
const taskB = exam.schriftlicher_ausdruck?.task_b || ''
```

### For Nested Objects:
```javascript
// Safe nested access
const questionOptions = question?.options || []
const audioUrl = exam.hoerverstehen?.teil1?.audio_url || null

// Safe array mapping
const paths = (exam.leseverstehen_teil2?.questions || []).flatMap((q, qIdx) => [
  `questions[${qIdx}].question`,
  ...(q.options || []).map((_, oIdx) => `questions[${qIdx}].options[${oIdx}]`)
])
```

### Error Component Template:
```javascript
const ErrorComponent = ({ sectionName }) => (
  <Card style={{backgroundColor: 'var(--secondary-color)'}}>
    <CardContent className="p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">{sectionName} nicht verfügbar</h3>
        <p className="text-sm text-gray-600">
          Der Inhalt für {sectionName} ist derzeit nicht verfügbar.
        </p>
      </div>
    </CardContent>
  </Card>
)
```
