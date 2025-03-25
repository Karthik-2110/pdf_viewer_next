'use server';

import { signIn, signOut } from "@/auth";

/**
 * Server action to sign out the user
 */
export async function signOutAction() {
  await signOut();
}

/**
 * Server action to sign in with Google
 */
export async function signInAction() {
  await signIn("google");
} 