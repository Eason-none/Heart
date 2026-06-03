import { redirect } from 'next/navigation'

// Root redirect: always go to onboarding welcome for now.
// In production, this checks auth and assessment status.
export default function RootPage() {
  redirect('/welcome')
}
