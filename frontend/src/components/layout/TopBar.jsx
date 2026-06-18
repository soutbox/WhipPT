export default function TopBar({ toggleSidebar, title }) {
    return (
        <div className="topbar">
            <button className="toggle-btn" onClick={toggleSidebar} title="사이드바 토글">
                ☰
            </button>
            <span className="topbar-title">{title}</span>
            <div className="status-dot" title="서버 연결됨" />
        </div>
    );
}