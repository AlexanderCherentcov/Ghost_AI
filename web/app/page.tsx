// Redirect root to the premium landing HTML
import { redirect } from 'next/navigation'

export default function Page() {
  redirect('/index-landing.html')
}
