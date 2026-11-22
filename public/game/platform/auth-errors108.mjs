// Never expose an empty upstream error ("{}") as the player's only explanation.
export function authErrorMessage108(error, action='login') {
 const code=typeof error?.code==='string'?error.code:'';
 const status=Number(error?.status)||0;
 const message=typeof error?.message==='string'?error.message.trim():'';
 if(message==='Passwords do not match.'||message==='Open the password reset link from your email first.')return message;
 if(code==='email_not_confirmed')return 'Confirm your email before signing in. Check your inbox and spam folder, or request a new confirmation below.';
 if(code==='invalid_credentials')return 'Sign-in failed. Check your email and password. If registration showed an error, the account may not have been created yet.';
 if(status===429||code.startsWith('over_'))return 'Too many attempts. Please wait a minute before trying again.';
 if(code==='email_address_invalid')return 'Enter a valid email address.';
 if(code==='weak_password')return 'Please choose a stronger password.';
 if(code==='user_already_exists'||code==='email_exists')return 'This account already exists. Sign in or use Forgot password.';
 if(code==='otp_expired')return 'This email link has expired or has already been used. Request a new link.';
 if(code==='signup_disabled')return 'Registration is temporarily unavailable. Please try again later.';
 const transient=status>=500||status===408||code==='request_timeout'||error?.name==='AuthRetryableFetchError'||/timeout|timed out|deadline|failed to fetch|network/i.test(message);
 if(transient||!message||message==='{}'||message==='[object Object]'){
  if(action==='register')return 'Registration could not be confirmed because the account service did not respond. Your account may not have been created. Please wait a minute, then try again.';
  if(action==='reset'||action==='resend')return 'The email request could not be completed. Please wait a minute and try again. If no email arrives, contact info@memexduelverse.com.';
  return 'The account service is temporarily unavailable. Please try again in a minute.';
 }
 return 'This request could not be completed. Please try again. If the problem continues, contact info@memexduelverse.com.';
}
