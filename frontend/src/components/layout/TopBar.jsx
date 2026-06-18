export default function TopBar({toggleSidebar, title, isAiOnline}) {
    return (
        <div className="topbar">
            <button className="toggle-btn" onClick={toggleSidebar} title="사이드바 토글">☰</button>
            <span className="topbar-title">{title}</span>
            <div className={`status-dot ${isAiOnline ? 'online' : 'offline'}`} title={isAiOnline ? '서버 연결됨' : '서버 오프라인'}/>
        </div>
    );
}