import { reduxStore } from "../store/store";
import { hydrateFromStorage, clearUserData } from "../store/userSlice";

// ============================================================
// Cross-tab auth sync
//
// - Login di tab lain (user_profile muncul di localStorage) →
//   hydrate Redux tab ini secara silent. Redirect ke /dashboard
//   hanya kalau tab ini sedang persis di halaman /login.
// - Logout di tab lain (user_profile hilang) → clear Redux tab
//   ini secara silent. Redirect paksa ke /login hanya kalau tab
//   ini sedang berada di area /dashboard.
// - Tab yang sedang di halaman publik (peta, tentang kami, laman
//   utama, dll) tidak pernah dipaksa pindah halaman.
// ============================================================
const handleStorageEvent = (event) => {
  if (event.key !== "user_profile") return;

  if (event.newValue) {
    reduxStore.dispatch(hydrateFromStorage());
    if (window.location.pathname === "/login") {
      window.location.href = "/dashboard";
    }
  } else {
    reduxStore.dispatch(clearUserData());
    if (window.location.pathname.startsWith("/dashboard")) {
      window.location.href = "/login";
    }
  }
};

export const initAuthSync = () => {
  window.addEventListener("storage", handleStorageEvent);
};
