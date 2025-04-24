import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to dashboard if accessed directly
  redirect("/dashboard")

  return null
}
