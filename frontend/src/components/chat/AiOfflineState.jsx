import errorImg from "../../assets/whippt_error.png";

export default function AiOfflineState() {
    return (
        <div className="empty-state">
            <img src={errorImg} alt="AI Offline" className="empty-logo"
                 style={{width: "240px", height: "240px", opacity: 0.9, marginBottom: "16px"}}
            />
            <div className="empty-title"
                 style={{color: "var(--text)", fontSize: "28px", fontWeight: "700", letterSpacing: "-0.5px"}}
                 >채찍피티가 잠들어 있어요
            </div>
            <div className="empty-sub"
                 style={{fontSize: "16px", color: "var(--text2)", marginTop: "8px", lineHeight: "1.7"}}
                 >※ 운영시간 13:00 ~ 18:00 (UTC+9)
            </div>
        </div>
    );
}