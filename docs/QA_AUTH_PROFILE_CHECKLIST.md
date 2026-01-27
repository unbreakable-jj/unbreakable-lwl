# Auth & Profile QA Checklist

## Sign-Up Flow
- [ ] User can enter Full Name, Email, Password on signup form
- [ ] Password must be at least 6 characters
- [ ] Submit creates user record immediately (auto-confirm enabled)
- [ ] User is logged in automatically after signup (no email confirmation required)
- [ ] Profile row is created automatically via database trigger
- [ ] User settings row is created automatically via database trigger
- [ ] User can navigate to protected routes immediately after signup
- [ ] Error messages display correctly for invalid input (empty name, invalid email, short password)

## Sign-In Flow
- [ ] User can enter Email and Password on signin form
- [ ] Valid credentials log user in immediately
- [ ] Invalid credentials show clear error message
- [ ] Session persists after browser refresh
- [ ] User can navigate to protected routes after signin
- [ ] Invalid/expired refresh tokens are cleared automatically (no infinite error loops)

## Sign-Out Flow
- [ ] Sign out button clears session immediately
- [ ] User is redirected to landing page
- [ ] Protected routes redirect to landing after sign out
- [ ] Local storage auth token is cleared

## Profile Bio (Basic)
- [ ] Display name is editable and saves correctly
- [ ] Username validates format (3-30 chars, letters/numbers/underscore only)
- [ ] Bio text saves and displays correctly
- [ ] Location saves and displays correctly
- [ ] Date of birth saves and displays correctly
- [ ] Public/Private toggle works and persists

## Coaching Profile (Age/Height/Weight)
- [ ] Age input accepts valid numbers (0-120)
- [ ] Height toggle switches between cm and ft/in
- [ ] Height values convert correctly between units
- [ ] Weight toggle switches between kg and lb
- [ ] Weight values convert correctly between units
- [ ] All values save and persist after page refresh
- [ ] Coaching profile data is private (only visible to user)

## Auth Modal (UI)
- [ ] Modal opens when clicking Sign In / Get Started buttons
- [ ] Can switch between Sign In and Sign Up modes
- [ ] Form fields clear when switching modes
- [ ] Modal closes on successful auth
- [ ] Loading state displays during auth request
- [ ] Google sign-in button is removed (email/password only)

## Session Handling
- [ ] Session state updates immediately on auth events
- [ ] Invalid refresh tokens don't cause infinite loops
- [ ] Auth context provides correct user/session state to all components
- [ ] Protected routes show loading spinner while auth state initializes

## Integration with Coaching
- [ ] Coaching profile data (age/height/weight) is used in programme generation
- [ ] Coaching profile data is used in meal plan generation
- [ ] Empty coaching profile values don't cause errors in AI prompts

## Edge Cases
- [ ] Duplicate email registration shows clear error
- [ ] Network errors during auth show user-friendly message
- [ ] Rapid auth attempts don't cause race conditions
- [ ] Browser back button doesn't cause auth state issues
