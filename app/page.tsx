import { cookies } from "next/headers"
import { PasswordForm } from "@/components/password-form"
import { PitchDeck } from "@/components/pitch-deck"

export default async function Page() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("pitchdeck_auth")?.value === "authenticated"

  if (!isAuthenticated) {
    return <PasswordForm />
  }

  return <PitchDeck />
}
