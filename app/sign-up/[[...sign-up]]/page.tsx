import {SignUp} from '@clerk/nextjs';
export default function SignUpPage() {
  return (
    <div><SignUp signInFallbackRedirectUrl="/subscribe" /></div>
  );
}