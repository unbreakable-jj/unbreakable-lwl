# Auth & Profile QA Checklist

## Sign-Up Flow
- [x] User can enter Full Name, Email, Password on signup form
- [x] Password must be at least 6 characters
- [x] Submit creates user record immediately (auto-confirm enabled)
- [x] User is logged in automatically after signup (no email confirmation required)
- [x] Profile row is created automatically via database trigger
- [x] User settings row is created automatically via database trigger
- [x] User can navigate to protected routes immediately after signup
- [x] Error messages display correctly for invalid input (empty name, invalid email, short password)

## Sign-In Flow
- [x] User can enter Email and Password on signin form
- [x] Valid credentials log user in immediately
- [x] Invalid credentials show clear error message
- [x] Session persists after browser refresh
- [x] User can navigate to protected routes after signin
- [x] Invalid/expired refresh tokens are cleared automatically (no infinite error loops)

## Sign-Out Flow
- [x] Sign out button clears session immediately
- [x] User is redirected to landing page
- [x] Protected routes redirect to landing after sign out
- [x] Local storage auth token is cleared

## Profile Bio (Basic)
- [x] Display name is editable and saves correctly
- [x] Username validates format (3-30 chars, letters/numbers/underscore only)
- [x] Bio text saves and displays correctly
- [x] Location saves and displays correctly
- [x] Date of birth saves and displays correctly
- [x] Public/Private toggle works and persists

## Coaching Profile (Age/Height/Weight)
- [x] Age input accepts valid numbers (0-120)
- [x] Height toggle switches between cm and ft/in
- [x] Height values convert correctly between units
- [x] Weight toggle switches between kg and lb
- [x] Weight values convert correctly between units
- [x] All values save and persist after page refresh
- [x] Coaching profile data is private (only visible to user)

## Auth Modal (UI)
- [x] Modal opens when clicking Sign In / Get Started buttons
- [x] Can switch between Sign In and Sign Up modes
- [x] Form fields clear when switching modes
- [x] Modal closes on successful auth
- [x] Loading state displays during auth request
- [x] Google sign-in button is removed (email/password only)

## Session Handling
- [x] Session state updates immediately on auth events
- [x] Invalid refresh tokens don't cause infinite loops
- [x] Auth context provides correct user/session state to all components
- [x] Protected routes show loading spinner while auth state initializes

## Integration with Coaching
- [x] Coaching profile data (age/height/weight) is used in programme generation
- [x] Coaching profile data is used in meal plan generation
- [x] Empty coaching profile values don't cause errors in prompts

## Theme Toggle (NEW)
- [x] Light/dark toggle visible on top-left of ALL page headers
- [x] Theme persists across sessions at user level
- [x] Both logged-in hub and logged-out pages have toggle
- [x] Toggle works correctly on: Index, Calculators, Programming, Fuel, Tracker, Help, Mindset

## Branding Updates (Phase 1 Complete)
- [x] "AI" references removed from user-facing CTAs and titles
- [x] "Artificial Intelligence" removed
- [x] Replaced with "Unbreakable Coach" and "10+ years coaching experience"
- [x] CTAs updated: "CREATE WITH AI" → "GET YOUR PLAN" / "BUILD WITH COACH"
- [x] "AI Feedback" → "Coach Feedback"
- [x] "AI Coaching" → "Expert Coaching"

## Edge Cases
- [x] Duplicate email registration shows clear error
- [x] Network errors during auth show user-friendly message
- [x] Rapid auth attempts don't cause race conditions
- [x] Browser back button doesn't cause auth state issues

## Security Notes
- Enable "Reject Leaked Passwords" in backend: Cloud → Users → Authentication Settings → Password Security
- All user data tables have RLS policies restricting access to own data
