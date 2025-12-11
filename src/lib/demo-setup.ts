"use client";

export async function startInstantDemo() {
  // 1. Set the cookie explicitly on the root path
  document.cookie = "glamops_demo_mode=true; path=/; max-age=3600; SameSite=Lax";

  // 2. Wait a split second to ensure browser registers it
  await new Promise((resolve) => setTimeout(resolve, 100));

  // 3. FORCE HARD RELOAD to Dashboard
  // We use window.location instead of router.push to ensure
  // the 'useSalon' hook runs from a clean slate and sees the cookie immediately.
  window.location.href = "/dashboard";
  
  return true;
}

export function clearDemoSession() {
  document.cookie = "glamops_demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}