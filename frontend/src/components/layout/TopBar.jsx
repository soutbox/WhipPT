export default function TopBar({toggleSidebar, title, isAiOnline, sidebarOpen, waitingJobs = 0}) {
  const iconTitle = sidebarOpen ? "사이드바 닫기" : "사이드바 열기";

  return (
    <div className="topbar">
      <button className="toggle-btn" onClick={toggleSidebar} title={iconTitle} aria-label={iconTitle}>
        {sidebarOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 3v18"/>
            <path d="M14 9l3 3-3 3"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 3v18"/>
            <path d="M15 9l-3 3 3 3"/>
          </svg>
        )}
      </button>
      <span className="topbar-title">{title}</span>
      <div className="status-group">
        <div className={`status-dot ${isAiOnline ? 'online' : 'offline'}`}/>
        <span className={`status-label ${isAiOnline ? 'online' : 'offline'}`}>
          {isAiOnline ? 'Online' : 'Offline'}
        </span>
        {isAiOnline && waitingJobs > 0 && (
          <>
            <div className="status-dot busy"/>
            <span className="status-label busy">대기 {waitingJobs}</span>
          </>
        )}
      </div>
    </div>
  );
}
