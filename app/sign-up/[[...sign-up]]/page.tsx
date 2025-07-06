import {SignUp} from '@clerk/nextjs';
export default function SignUpPage() {
  return (
    /**
     * redirects to /create-profile after sign up
     */
    <div><SignUp signInFallbackRedirectUrl="/create-profile" /></div>
  );
}