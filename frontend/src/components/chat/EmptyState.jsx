import whipptLogo from "../../assets/whippt_no_background.png";

export default function EmptyState({ onStarterClick }) {
    const starters = [
        { title: "Spring Boot", sub: "REST API 컨트롤러와 서비스 레이어를 분리하는 이유가 뭔가요?" },
        { title: "JPA", sub: "@Transactional은 언제 필요하고, 안 붙이면 어떤 문제가 생기나요?" },
        { title: "동시성", sub: "Java에서 synchronized와 ReentrantLock 차이를 쉽게 설명해줘" },
        { title: "네트워크", sub: "HTTP와 HTTPS의 차이, 그리고 TLS가 하는 일을 알려줘" },
    ];

    return (
        <div className="empty-state">
            <img src={whipptLogo} alt="WhipPT Logo" className="empty-logo" />
            <div className="empty-title">무엇을 도와드릴까요?</div>
            <div className="empty-sub">채찍피티와 대화를 시작하세요.<br />아래 질문으로 시작해보세요.</div>
            <div className="starter-grid">
                {starters.map(s => (
                    <button key={s.title} className="starter-btn" onClick={() => onStarterClick(s.sub)}>
                        <strong>{s.title}</strong>{s.sub}
                    </button>
                ))}
            </div>
        </div>
    );
}
