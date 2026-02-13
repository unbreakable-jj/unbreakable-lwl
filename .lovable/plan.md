

# Fix: Signup Returning 422 -- Signups Disabled

## The Problem

Backend authentication logs confirm that signup POST requests are returning **HTTP 422** status codes. The email `overandunderpt@gmail.com` does not exist in the database, so this is NOT a duplicate account issue. A 422 on signup when the user doesn't exist means **signups are disabled** at the authentication configuration level.

The current error handling in the form catches the error but may not display it clearly, making it appear like "nothing happens."

## Root Cause

Signups are disabled in the backend authentication settings. Every signup attempt is rejected by the server before any account creation occurs.

## The Fix (2 Steps)

### Step 1: Enable Signups in Auth Configuration

Use the backend auth configuration tool to **enable signups**. This is a one-line configuration change on the backend -- no code changes needed for this step.

### Step 2: Improve Error Handling in AuthModal

Update `src/components/tracker/AuthModal.tsx` to:
- Add a specific check for 422 status codes and display a clear error message like "Signup is currently unavailable. Please try again later."
- Ensure ALL error paths show a visible toast notification so the user always gets feedback
- Add a `DialogDescription` to fix the accessibility warning showing in console logs

### Files Changed

- `src/components/tracker/AuthModal.tsx` -- Better error messages and accessibility fix

### Expected Result

After these changes:
1. New users can create accounts from the landing page
2. After signup, they are automatically logged in and redirected to the onboarding wizard
3. Any errors during signup are clearly displayed to the user via toast notifications

