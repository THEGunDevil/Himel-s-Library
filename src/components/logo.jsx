const Logo = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 800 800"
    role="img"
    aria-label="Himel's Library logo"
    {...props}
  >
    <defs>
      <linearGradient id="g1" x1={0} x2={1} y1={0} y2={1}>
        <stop offset="0%" stopColor="#4A90E2" />
        <stop offset="100%" stopColor="#2B6CB0" />
      </linearGradient>
      <linearGradient id="g2" x1={0} x2={1} y1={0} y2={1}>
        <stop offset="0%" stopColor="#F6D365" />
        <stop offset="100%" stopColor="#FDA085" />
      </linearGradient>
      <style>
        {
          '\n      .title { font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size:48px; font-weight:700; fill:#182026; }\n      .subtitle { font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size:20px; fill:#394249; opacity:0.85; }\n    '
        }
      </style>
    </defs>
    <circle cx={400} cy={260} r={200} fill="url(#g1)" opacity={0.1} />
    <g transform="translate(160,120)">
      <path
        d="M40 220 C 60 40, 200 40, 240 220 L 240 260 C 200 140, 60 140, 40 260 Z"
        fill="white"
        stroke="#2B6CB0"
        strokeWidth={6}
      />
      <path
        d="M320 220 C 300 40, 160 40, 120 220 L 120 260 C 160 140, 300 140, 320 260 Z"
        fill="white"
        stroke="#2B6CB0"
        strokeWidth={6}
      />
      <path
        d="M240 220 C 260 160, 280 160, 300 220"
        fill="none"
        stroke="#2B6CB0"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M85 200 C 140 170, 200 170, 255 200"
        fill="none"
        stroke="#9FBCE6"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.8}
      />
      <path
        d="M115 230 C 170 200, 230 200, 285 230"
        fill="none"
        stroke="#9FBCE6"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.6}
      />
    </g>
    <g transform="translate(320,70)">
      <rect x={0} y={150} width={28} height={130} rx={6} fill="url(#g2)" />
      <rect x={92} y={150} width={28} height={130} rx={6} fill="url(#g2)" />
      <path d="M28 220 L 92 220 L 60 270 Z" fill="#ffffff" opacity={0.06} />
      <rect x={28} y={200} width={64} height={28} rx={8} fill="url(#g2)" />
      <path d="M60 320 L 40 300 L 80 300 Z" fill="#F6D365" opacity={0.9} />
    </g>
    <g transform="translate(0,520)" textAnchor="middle">
      <text x={400} y={50} className="title" style={{fontSize: "95px"}}>
        {"Himel's Library"}
      </text>
    </g>
    <desc>
      {
        "Logo for Himel's Library: stylized open book with a bookmark-shaped 'H'. Colors blue gradient and warm accent."
      }
    </desc>
  </svg>
);
export default Logo;
