import whipptLogo from "../../assets/whippt_no_background.png";

export default function EmptyState({ onStarterClick }) {
    const starters = [
        { title: "CS 지식", sub: "운영체제의 데드락 해결 방법을 설명해줘" },
        { title: "코드 리뷰", sub: "실무에서 활용할 수 있는 Java/Spring Tips 알려줘" },
        { title: "운동 루틴", sub: "케틀벨을 활용한 15분 타바타 루틴 짜줘" },
        { title: "알고리즘", sub: "이산수학 관련 문제 출제해줘" },
    ];

    return (
        <div className="empty-state">
            <img src={whipptLogo} alt="WhipPT Logo" className="empty-logo" />
            <div className="empty-title">무엇을 도와드릴까요?</div>
            <div className="empty-sub">로컬 LLM과 대화를 시작하세요.<br />아래 질문으로 시작해보세요.</div>
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