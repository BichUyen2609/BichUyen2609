import { mkdir, writeFile } from "node:fs/promises";

const { GITHUB_REPOSITORY_OWNER: login, GITHUB_TOKEN: token } = process.env;
const query = `
  query ($login: String!, $after: String) {
    user(login: $login) {
      followers { totalCount }
      repositories(first: 100, after: $after, privacy: PUBLIC, ownerAffiliations: OWNER) {
        totalCount
        nodes { stargazerCount }
        pageInfo { hasNextPage endCursor }
      }
      contributionsCollection {
        totalPullRequestContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              weekday
              contributionLevel
              contributionCount
            }
          }
        }
      }
    }
  }
`;

async function fetchProfile(after = null) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login, after } }),
  });
  if (!response.ok) {
    throw new Error(`GitHub profile query returned HTTP ${response.status}`);
  }
  const { data, errors } = await response.json();
  if (errors?.length || !data?.user) {
    throw new Error(errors?.map(({ message }) => message).join(", ") || "Missing GitHub profile");
  }
  return data.user;
}

const user = await fetchProfile();
const { contributionCalendar: calendar, totalPullRequestContributions } = user.contributionsCollection;
let stars = 0;
let currentPage = user.repositories;
while (true) {
  stars += currentPage.nodes.reduce((sum, repo) => sum + repo.stargazerCount, 0);
  if (!currentPage.pageInfo.hasNextPage) break;
  currentPage = (await fetchProfile(currentPage.pageInfo.endCursor)).repositories;
}

const levelColors = {
  NONE: "#1d304b",
  FIRST_QUARTILE: "#284f9a",
  SECOND_QUARTILE: "#3477d8",
  THIRD_QUARTILE: "#54a4fa",
  FOURTH_QUARTILE: "#a9dcff",
};
const gridX = 39;
const gridY = 61;
const step = 10;
const total = calendar.totalContributions.toLocaleString("en-US");
const monthLabels = [];
const squares = [];
let previousMonth;

for (const [weekIndex, { contributionDays }] of calendar.weeks.entries()) {
  const x = gridX + weekIndex * step;
  const month = contributionDays[0].date.slice(0, 7);
  if (month !== previousMonth) {
    monthLabels.push(`<text x="${x}" y="53">${month.slice(5)}</text>`);
    previousMonth = month;
  }

  for (const day of contributionDays) {
    const y = gridY + day.weekday * step;
    const motion = day.contributionLevel === "NONE" ? "" : ` class="active-day" style="--delay:${weekIndex * 52 + day.weekday * 16}ms"`;
    squares.push(`<rect${motion} x="${x}" y="${y}" width="8" height="8" rx="2" fill="${levelColors[day.contributionLevel]}"/>`);
  }
}

const legend = Object.values(levelColors).map((color, index) =>
  `<rect x="${438 + index * 10}" y="146" width="8" height="8" rx="2" fill="${color}"/>`
);

function svg(title, width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="caption">
  <title id="caption">${title}</title>
  <style>
    .weekly-glow { opacity: 0; }
    @media (prefers-reduced-motion: no-preference) {
      .active-day { animation: day-glow 6s ease-in-out var(--delay) infinite; }
      .weekly-line { stroke-dasharray: 1; animation: draw-line 1.65s ease-out both; }
      .weekly-fill { animation: fade-in 1.35s .3s both; }
      .weekly-point { animation: fade-in .48s var(--delay) both; }
      .weekly-glow { stroke-dasharray: .10 .90; animation: trace-line 6s linear 1.65s infinite; }
    }
    @keyframes day-glow {
      0%, 18%, 100% { filter: brightness(1); }
      7% { filter: brightness(1.65); }
    }
    @keyframes draw-line { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes trace-line {
      0% { opacity: 0; stroke-dashoffset: .12; }
      9% { opacity: 1; }
      88% { opacity: 1; }
      100% { opacity: 0; stroke-dashoffset: -1; }
    }
  </style>
  <defs>
    <linearGradient id="activity-panel" x2=".92" y2="1">
      <stop stop-color="#101e3b"/>
      <stop offset=".52" stop-color="#091326"/>
      <stop offset="1" stop-color="#070f20"/>
    </linearGradient>
    <linearGradient id="weekly-area" x2="0" y2="1">
      <stop stop-color="#65a9ff" stop-opacity=".3"/>
      <stop offset="1" stop-color="#65a9ff" stop-opacity=".015"/>
    </linearGradient>
  </defs>
  <g font-family="system-ui,Segoe UI,sans-serif">
    ${body}
  </g>
</svg>
`;
}

const panelHeight = 171;
function frame(width, title, end, height = panelHeight) {
  return `<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="17" fill="url(#activity-panel)" stroke="#264b7d"/>
  <path d="M18 27V17h4v10m3 0V12h4v15m3 0v-7h4v7" fill="#7bc6ff"/>
  <text x="50" y="28" font-size="17" font-weight="750" letter-spacing=".45" fill="#d6eaff">${title}</text>
  <text x="${end}" y="28" font-family="monospace" font-size="16" fill="#59beff">///</text>
  <path d="M${end + 34} 22H${width - 18}" stroke="#274c80"/>`;
}

const calendarBody = frame(700, "LỊCH ĐÓNG GÓP / CONTRIBUTION GRAPH", 451) + `
  <g font-family="system-ui,sans-serif" font-size="10" fill="#b7cbed">
    ${monthLabels.join("\n    ")}
    <text x="6" y="78" font-size="8.5">T2/Mon</text>
    <text x="6" y="98" font-size="8.5">T4/Wed</text>
    <text x="6" y="118" font-size="8.5">T6/Fri</text>
    <text x="395" y="154">Ít / Less</text>
    <text x="491" y="154">Nhiều / More</text>
  </g>
  <g>${squares.join("")}</g>
  <g>${legend.join("")}</g>
  <path d="M583 46v106" stroke="#304664"/>
  <g text-anchor="middle">
    <text x="641" y="65" fill="#d6e4f9" font-size="11">Đóng góp</text>
    <text x="641" y="78" fill="#b7cbed" font-size="10">Contributions</text>
    <text x="641" y="106" fill="#a9dcff" font-size="25" font-weight="700">${total}</text>
    <text x="641" y="125" fill="#b7cbed" font-size="10">Trong năm qua</text>
    <text x="641" y="138" fill="#b7cbed" font-size="9">Past year</text>
  </g>`;

const statsWidth = 552;
const metrics = [
  ["Kho mã", "Repositories", user.repositories.totalCount, "▣"],
  ["Người theo dõi", "Followers", user.followers.totalCount, "◉"],
  ["Sao", "Stars", stars, "★"],
  ["PR trong năm", "PRs this year", totalPullRequestContributions, "⑂"],
];
const statsBody = frame(statsWidth, "THỐNG KÊ GITHUB / GITHUB STATS", 383) + metrics.map(([label, translation, number, symbol], index) => {
  const x = 16 + index * 133;
  const center = x + 60;
  return `<rect x="${x}" y="45" width="121" height="107" rx="12" fill="#101d3a" stroke="#2b4c84"/>
    <text x="${center}" y="75" text-anchor="middle" fill="#8fc9ff" font-size="23">${symbol}</text>
    <text x="${center}" y="103" text-anchor="middle" fill="#e1efff" font-size="21" font-weight="750">${number.toLocaleString("en-US")}</text>
    <text x="${center}" y="124" text-anchor="middle" fill="#d2e5ff" font-size="11.3">${label}</text>
    <text x="${center}" y="139" text-anchor="middle" fill="#aac2e6" font-size="10.3">${translation}</text>`;
}).join("\n  ");
const activityCaption = `Hoạt động GitHub / GitHub activity. ${metrics.map(([label, translation, number]) => `${label} / ${translation}: ${number}`).join(". ")}. ${total} đóng góp trong năm qua / contributions in the past year.`;
const statsWidthOnMobile = 700 / statsWidth;
const stackedHeight = Math.ceil(panelHeight * statsWidthOnMobile) + 12;

const recentWeeks = calendar.weeks.slice(-12).map(({ contributionDays }) => ({
  date: contributionDays[0].date,
  count: contributionDays.reduce((sum, day) => sum + day.contributionCount, 0),
}));

function weeklyChart(width) {
  const height = 189;
  const left = 48;
  const right = width - 32;
  const top = 48;
  const bottom = 148;
  const ceiling = 2 * Math.max(1, Math.ceil(Math.max(0, ...recentWeeks.map(({ count }) => count)) / 2));
  const points = recentWeeks.map(({ date, count }, index) => ({
    date,
    count,
    x: left + (right - left) * index / Math.max(1, recentWeeks.length - 1),
    y: bottom - (bottom - top) * count / ceiling,
  }));
  const line = points.map(({ x, y }, index) => `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const area = points.length ? `${line} L${points.at(-1).x} ${bottom} H${left} Z` : "";
  const scales = [ceiling, ceiling / 2, 0].map((tick, index) => {
    const y = top + (bottom - top) * index / 2;
    return `<path d="M${left} ${y}H${right}" stroke="#263e62"/>
      <text x="${left - 9}" y="${y + 4}" text-anchor="end" fill="#aac2e6" font-size="11">${tick}</text>`;
  }).join("\n    ");
  const markers = points.map(({ x, y, date, count }, index) => `
    <circle class="weekly-point" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.5" fill="#8ed7ff" stroke="#132541" stroke-width="1.3" style="--delay:${index * 108}ms">
      <title>${date}: ${count} đóng góp / contributions</title>
    </circle>
    <text x="${x.toFixed(2)}" y="170" text-anchor="middle" fill="#aac2e6" font-family="monospace" font-size="11">${date.slice(8)}/${date.slice(5, 7)}</text>`).join("");
  const caption = `Đóng góp theo tuần / Weekly contributions. ${points.map(({ date, count }) => `${date}: ${count}`).join(", ")}.`;
  return svg(caption, width, height, `
    ${frame(width, "ĐÓNG GÓP THEO TUẦN / WEEKLY CONTRIBUTIONS", 503, height)}
    ${scales}
    <path class="weekly-fill" d="${area}" fill="url(#weekly-area)"/>
    <path class="weekly-line" d="${line}" pathLength="1" fill="none" stroke="#579cff" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round"/>
    <path class="weekly-glow" d="${line}" pathLength="1" fill="none" stroke="#c4eeff" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"/>
    ${markers}`);
}

await mkdir("dist", { recursive: true });
await Promise.all([
  writeFile("dist/contribution-calendar.svg", svg(`${total} GitHub contributions in the past year`, 700, panelHeight, calendarBody)),
  writeFile("dist/profile-activity.svg", svg(activityCaption, statsWidth + 712, panelHeight, `
    ${statsBody}
    <g transform="translate(${statsWidth + 12})">${calendarBody}</g>`)),
  writeFile("dist/profile-activity-mobile.svg", svg(activityCaption, 700, stackedHeight + panelHeight, `
    <g transform="scale(${statsWidthOnMobile})">${statsBody}</g>
    <g transform="translate(0 ${stackedHeight})">${calendarBody}</g>`)),
  writeFile("dist/weekly-activity.svg", weeklyChart(1264)),
  writeFile("dist/weekly-activity-mobile.svg", weeklyChart(700)),
]);
