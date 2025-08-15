# Exam Submission Debugging Guide

## Overview

This document describes the debugging improvements made to the exam submission system to help identify and resolve issues with the Antwortbogen (answer sheet) submission process.

## Key Improvements

### 1. Enhanced Error Handling

- **Better Error Messages**: More descriptive error messages for different types of submission failures
- **Validation Feedback**: Clear feedback when answers are invalid or incomplete
- **Network Error Handling**: Improved handling of network connectivity issues

### 2. Comprehensive Logging

- **Submission Attempts**: All submission attempts are logged with detailed information
- **API Calls**: All API calls are tracked with timing and response data
- **Error Tracking**: Detailed error logging with context information
- **Answer Validation**: Validation results are logged before submission

### 3. Debug Panel

A debug panel is available in development mode (when `import.meta.env.DEV` is true) that provides:

- Current exam state information
- Answer validation results
- Recent error logs
- Recent API call logs
- Recent submission attempts
- System information

### 4. Answer Normalization

Improved answer normalization that:

- Cleans up empty/undefined values
- Handles Hörverstehen boolean values properly
- Normalizes LV2 answers from letters to indices
- Validates Schriftlicher Ausdruck data
- Removes completely empty sections

### 5. Enhanced Test Component

The `TestSubmission` component now includes:

- Multiple test scenarios (basic, complete, partial, empty)
- Better error reporting
- Comprehensive logging
- Toast notifications for feedback

## Debugging Workflow

### 1. Enable Debug Mode

The debug panel is automatically available in development mode. Look for the 🐛 Debug button in the bottom-right corner.

### 2. Check Current State

Use the debug panel to verify:
- Exam ID is correct
- Student name is set
- Timer phase is correct
- Answer count is reasonable

### 3. Validate Answers

The debug panel shows validation results for the current answers, including:
- Missing sections
- Incorrect array lengths
- Invalid data types

### 4. Monitor Submissions

Track submission attempts through:
- Console logs (detailed information)
- Debug panel (summary view)
- Browser developer tools

### 5. Check Error Logs

Review recent errors for:
- Network issues
- Validation failures
- Backend errors
- Data format problems

## Common Issues and Solutions

### Issue: "Bitte geben Sie Ihren Namen ein"
**Solution**: Ensure the student name field is filled before submission.

### Issue: "Bitte beantworten Sie mindestens eine Frage"
**Solution**: Verify that at least one question has been answered.

### Issue: "Schriftlicher Ausdruck kann nur in der entsprechenden Phase eingereicht werden"
**Solution**: Check that the timer phase matches the submission content.

### Issue: "Sie müssen mindestens 50% der Aufgaben beantworten"
**Solution**: Ensure at least 50% of Teil 1-3 questions are answered before submitting writing section.

### Issue: Network errors
**Solution**: Check internet connectivity and API endpoint availability.

## Testing

Use the `TestSubmission` component to test different scenarios:

1. **Basic Test**: Minimal answers for Teil 1-3
2. **Complete Test**: Full answers for Teil 1-3
3. **Writing Test**: Complete answers including writing section
4. **Partial Test**: Some answers missing
5. **Empty Test**: No answers (should fail validation)

## Log Files

Debug information is stored in localStorage:

- `exam_error_logs`: Recent error logs
- `exam_api_logs`: Recent API call logs
- `exam_submission_logs`: Recent submission attempts

Use the debug panel to view or clear these logs.

## Backend Validation

The backend performs several validations:

1. **Timer Phase Restrictions**: Ensures correct sections are submitted for each phase
2. **Answer Format**: Validates answer structure and data types
3. **Completion Requirements**: Checks minimum answer requirements
4. **Writing Section**: Validates Schriftlicher Ausdruck requirements

## Performance Monitoring

The system tracks:
- API call duration
- Submission processing time
- Error frequency
- Success rates

This information helps identify performance bottlenecks and reliability issues.

## Troubleshooting Steps

1. **Check Console**: Look for detailed error messages and logs
2. **Use Debug Panel**: Review current state and recent activity
3. **Validate Answers**: Ensure answer format is correct
4. **Test API**: Use TestSubmission component to isolate issues
5. **Check Network**: Verify API endpoint availability
6. **Review Logs**: Check localStorage for historical data

## Support

If issues persist after following this guide:

1. Collect debug information using the debug panel
2. Check browser console for error messages
3. Review network tab for failed API calls
4. Test with different scenarios using TestSubmission
5. Provide detailed error information when reporting issues