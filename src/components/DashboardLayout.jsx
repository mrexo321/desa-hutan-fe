import React, { useCallback } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Header from "./Header";
import SessionExpiredModal from "./SessionExpiredModal";
import { useSessionWarning } from "../hooks/useSessionWarning";
import { useBackgroundRefresh } from "../hooks/useBakgroundRefresh";
import { useIdleTimeout } from "../hooks/useIdleTimeout";
import { setToken, triggerSessionExpired } from "../store/userSlice";
import environment from "../config/environment";

export default function DashboardLayout({ children, activeMenu }) {
  const dispatch = useDispatch();
  const refreshToken = useSelector((state) => state.user?.refreshToken);

  // Background token refresh
  useBackgroundRefresh();

  // Handler perpanjang sesi → hit refresh-token endpoint
  const handleExtendSession = useCallback(async () => {
    if (!refreshToken) {
      dispatch(triggerSessionExpired());
      return;
    }

    const res = await axios.post(
      `${environment.AUTH_URL}/auth/refresh-token`,
      { refreshToken },
    );

    const newAccessToken = res.data.data.accessToken;
    const newRefreshToken = res.data.data.refreshToken || refreshToken;

    dispatch(setToken({ accessToken: newAccessToken, refreshToken: newRefreshToken }));
  }, [refreshToken, dispatch]);

  // Handler timeout habis → dispatch session expired
  const handleTimeout = useCallback(() => {
    dispatch(triggerSessionExpired());
  }, [dispatch]);

  // Session warning modal state
  const { isOpen, countdown, isExtending, showWarning, handleExtend } =
    useSessionWarning({
      onExtend: handleExtendSession,
      onTimeout: handleTimeout,
    });

  // Idle timeout hook — aktif hanya di dashboard
  const { extendSession } = useIdleTimeout({
    idleTimeout: 30,       // 30 menit inaktivitas
    warningOffset: 2,      // Warning 2 menit sebelum timeout
    onWarning: showWarning,
    onTimeout: handleTimeout,
    enabled: true,
  });

  const handleExtendAndReset = async () => {
    await handleExtend();
    extendSession(); // Reset idle timer juga
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <Header />

        {/* Area Konten Utama */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>

      {/* Session Warning Modal */}
      <SessionExpiredModal
        isOpen={isOpen}
        countdown={countdown}
        isExtending={isExtending}
        onExtend={handleExtendAndReset}
        onLogout={handleTimeout}
      />
    </div>
  );
}
