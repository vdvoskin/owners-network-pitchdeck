"use server"

import { cookies } from "next/headers"

const ACCESS_PASSWORD = "ownersnetwork"

export async function verifyPassword(password: string): Promise<{ success: boolean }> {
  if (password === ACCESS_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set("pitchdeck_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    })
    return { success: true }
  }
  return { success: false }
}

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get("pitchdeck_auth")?.value === "authenticated"
}
