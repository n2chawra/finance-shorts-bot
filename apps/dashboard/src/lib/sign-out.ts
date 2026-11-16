/**
 * Sign out: end the session, then go to the login page whatever happens. Used by the sidebar and the
 * command menu. Before 2026-11-17 both awaited the DELETE with no catch, so a network error left an
 * unhandled rejection and the owner stayed on the page (auditor dui-011). No imports, so the workers
 * tests can load it.
 */
export async function signOut(endSession: () => Promise<unknown>, toLogin: () => void): Promise<void> {
  try {
    await endSession();
  } catch {
    // offline or the server is down: the login page still loads, and signing in again replaces the cookie
  } finally {
    toLogin();
  }
}
