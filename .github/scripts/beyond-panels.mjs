import { readFile, writeFile } from "node:fs/promises";

const art = new URL("../../assets/beyond/", import.meta.url);
const tech = new URL("../../assets/tech/", import.meta.url);
const escape = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const icon = async (file) => `data:image/svg+xml;base64,${(await readFile(new URL(file, tech))).toString("base64")}`;
const photo = async (file) => `data:image/jpeg;base64,${(await readFile(new URL(file, art))).toString("base64")}`;

const tools = [
  ["Ngôn ngữ", "Languages & Markup", [["Python", "python.svg"], ["Java", "java.svg"], ["C#", "csharp.svg"], ["HTML", "html5.svg"]]],
  ["Phát triển ứng dụng", "App Development", [["Django", "django.svg"], ["FastAPI", "fastapi.svg"], [".NET", "dotnet.svg"]]],
  ["AI & thiết bị biên", "AI & Edge", [["YOLOv11", "ultralytics.svg"], ["Raspberry Pi", "raspberrypi.svg"]]],
  ["Cơ sở dữ liệu & công cụ", "Databases & Tools", [["MySQL", "mysql.svg"], ["PostgreSQL", "postgresql.svg"], ["Git", "git.svg"]]],
];
const projects = [
  {
    name: "Pill Counter",
    image: "pill-counter.jpg",
    description: ["Hỗ trợ dược sĩ đếm thuốc", "trên khay bằng camera."],
    translation: ["Camera-based pill counting", "for pharmacists."],
    tags: ["YOLOv11", "Raspberry Pi"],
  },
  {
    name: "Trái tim cho em",
    image: "fundraising.jpg",
    description: ["Tạo chiến dịch gây quỹ", "và theo dõi khoản ủng hộ."],
    translation: ["Create fundraisers and", "track donations."],
    tags: ["Python", "Django"],
  },
  {
    name: "Kombat AI",
    image: "kombat-ai.jpg",
    description: ["Game đối kháng 2D", "với ba cấp độ AI."],
    translation: ["2D fighting game", "with three AI levels."],
    tags: ["Python", "Pygame"],
  },
];
const groups = await Promise.all(tools.map(async ([title, translation, entries]) => ({
  title,
  translation,
  entries: await Promise.all(entries.map(async ([name, file]) => ({ name, href: await icon(file) }))),
})));
for (const project of projects) {
  project.href = await photo(project.image);
}

function svg(title, width, height, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title">
  <title id="title">${escape(title)}</title>
  <defs>
    <linearGradient id="panel" x2=".92" y2="1">
      <stop stop-color="#101e3b"/>
      <stop offset=".47" stop-color="#091326"/>
      <stop offset="1" stop-color="#070f20"/>
    </linearGradient>
    <linearGradient id="tile" x2="1" y2="1">
      <stop stop-color="#172747"/>
      <stop offset="1" stop-color="#0a152b"/>
    </linearGradient>
    <linearGradient id="rule">
      <stop stop-color="#3057a6" stop-opacity="0"/>
      <stop offset=".54" stop-color="#35beff"/>
      <stop offset="1" stop-color="#9bd5ff" stop-opacity=".18"/>
    </linearGradient>
    <linearGradient id="fade" x2="0" y2="1">
      <stop stop-color="#091326"/>
      <stop offset=".68" stop-color="#091326" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <g font-family="system-ui,Segoe UI,sans-serif" fill="#e4efff">
    ${content}
  </g>
</svg>
`.replace(/[ \t]+$/gm, "");
}

function frame(width, height, title, symbol) {
  const ruleStart = 109 + title.length * 9.4;
  const rule = ruleStart < width - 14
    ? `<text x="${ruleStart - 34}" y="29" font-family="monospace" font-size="16" fill="#59beff">///</text>
       <path d="M${ruleStart - 7} 23H${width - 18}" stroke="url(#rule)"/>`
    : "";
  return `
    <rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="17" fill="url(#panel)" stroke="#264b7d"/>
    <path d="M16 1H${width - 16}M16 ${height - 1}H${width - 16}" stroke="url(#rule)"/>
    <text x="17" y="31" font-size="25" font-weight="700" fill="#7bc6ff">${symbol}</text>
    <text x="53" y="29" font-size="17" font-weight="750" letter-spacing=".4" fill="#d6eaff">${title}</text>
    ${rule}`;
}

function aboutPanel(width, height) {
  const code = [
    '<tspan fill="#f0a0ff">class</tspan> <tspan fill="#d6eaff">Developer:</tspan>',
    '    name = <tspan fill="#ffe299">"Bích Uyên"</tspan>',
    '    focus = <tspan fill="#ffe299">["Backend", "Computer Vision"]</tspan>',
    '    learning = <tspan fill="#ffe299">["FastAPI", "PostgreSQL"]</tspan>',
    '    <tspan fill="#f0a0ff">def</tspan> <tspan fill="#95d9ff">motto</tspan>(self):',
    '        <tspan fill="#f0a0ff">return</tspan> <tspan fill="#ffe299">"Code. Learn. Build. Repeat."</tspan>',
  ];
  const notes = [
    ["◇", "Mình là Uyên, sinh viên công nghệ thông tin.", "Hi, I'm Uyên, an information technology student."],
    ["✦", "Mình thích viết phần mềm giúp việc hằng ngày dễ hơn.", "I like building software that makes everyday tasks easier."],
    ["♪", "Mình cũng thích làm web có chuyển động và âm thanh.", "I also enjoy bringing motion and sound to the web."],
  ];
  return frame(width, height, "VỀ MÌNH / ABOUT ME", "◈") + `
    <rect x="14" y="44" width="${width - 28}" height="154" rx="11" fill="#09152b" stroke="#28436f"/>
    <path d="M47 58v126" stroke="#263b60"/>
    <g font-family="Consolas,monospace" font-size="14.4">
      ${code.map((line, index) => {
        const y = 68 + index * 20;
        const text = line.trimStart();
        const x = 57 + (line.length - text.length) * 8.64;
        return `<text x="27" y="${y}" fill="#758eb8">${index + 1}</text><text x="${x}" y="${y}">${text}</text>`;
      }).join("\n      ")}
    </g>
    ${notes.map(([symbol, note, translation], index) => {
      const y = 222 + index * 39;
      return `<text x="22" y="${y + 2}" font-size="19" fill="#7bc6ff">${symbol}</text>
      <text x="54" y="${y}" font-size="14">${note}</text>
      <text x="54" y="${y + 16}" font-size="12.5" fill="#aac2e6">${translation}</text>`;
    }).join("\n    ")}
    <path d="M${width - 56} ${height - 1}h38" stroke="#61baff" stroke-opacity=".55"/>`;
}

function intro(width, fontSize) {
  const phrases = [
    "Mình là Uyên · Sinh viên CNTT",
    "Hi, I'm Uyên · IT Student",
    "Backend · Computer Vision · Game AI",
  ];
  const rail = width * .24;
  const accents = width > 600
    ? `<path d="M14 21H${rail}M${width - rail} 21H${width - 14}" stroke="url(#rule)"/>
       <text x="${rail + 22}" y="29" font-size="21" font-weight="700" fill="#59beff">&lt;/&gt;</text>
       <text x="${width - rail - 58}" y="29" font-size="21" font-weight="700" fill="#59beff">&lt;/&gt;</text>`
    : "";
  return svg(phrases[0], width, 44, `
    <style>
      .secondary { opacity: 0; }
      @media (prefers-reduced-motion: no-preference) {
        .phrase { animation: visible 15s step-end var(--lag) infinite; }
        .mask { animation: type 15s steps(var(--letters), end) var(--lag) infinite; }
      }
      @keyframes visible { 0% { opacity: 1; } 33.33%, 100% { opacity: 0; } }
      @keyframes type { 0% { transform: translateX(var(--shift)); } 16%, 100% { transform: none; } }
    </style>
    <rect width="${width}" height="44" fill="#091326"/>
    ${accents}
    ${phrases.map((phrase, index) => {
      const span = phrase.length * fontSize * .6;
      return `<g class="phrase${index === 0 ? "" : " secondary"}" style="--lag: ${index * 5}s; --letters: ${phrase.length}; --shift: -${span}px">
        <clipPath id="reveal-${index}"><rect class="mask" x="${(width - span) / 2}" width="${span}" height="44"/></clipPath>
        <text x="${width / 2}" y="28" text-anchor="middle" font-family="Consolas,monospace" font-size="${fontSize}" fill="#d3e9ff"
          textLength="${span}" lengthAdjust="spacingAndGlyphs" clip-path="url(#reveal-${index})">${phrase}</text>
      </g>`;
    }).join("\n    ")}`);
}

function techPanel(width, height) {
  const tileWidth = (width - 42) / 2;
  const tileHeight = (height - 70) / 2;
  return frame(width, height, "CÔNG NGHỆ / TECH STACK", "▱") + groups.map(({ title, translation, entries }, index) => {
    const x = 14 + (index % 2) * (tileWidth + 14);
    const y = 44 + Math.floor(index / 2) * (tileHeight + 12);
    const spacing = (tileWidth - 16) / entries.length;
    return `
      <rect x="${x}" y="${y}" width="${tileWidth}" height="${tileHeight}" rx="12" fill="url(#tile)" stroke="#314e83"/>
      <text x="${x + 13}" y="${y + 20}" font-size="14" font-weight="650" fill="#b7dbff">${escape(title)}</text>
      <text x="${x + 13}" y="${y + 36}" font-size="11.5" fill="#aac2e6">${escape(translation)}</text>
      ${entries.map(({ name, href }, item) => {
        const center = x + 8 + spacing * (item + .5);
        return `<image href="${href}" x="${center - 17}" y="${y + 48}" width="34" height="34"/>
        <text x="${center}" y="${y + 103}" text-anchor="middle" font-size="13">${name}</text>`;
      }).join("\n      ")}`;
  }).join("");
}

function projectTile(project, x, y, width) {
  const textX = x + 100;
  let chipX = textX;
  const chips = project.tags.map((tag) => {
    const chipWidth = 14 + tag.length * 6;
    const chip = `<rect x="${chipX}" y="${y + 124}" width="${chipWidth}" height="18" rx="9" fill="#142c56" stroke="#315289"/>
    <text x="${chipX + chipWidth / 2}" y="${y + 137}" text-anchor="middle" font-size="10.2" fill="#c3e2ff">${tag}</text>`;
    chipX += chipWidth + 5;
    return chip;
  });
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${tileHeight}" rx="12" fill="url(#tile)" stroke="#355592"/>
    <svg x="${x + 6}" y="${y + 6}" width="83" height="144" viewBox="0 0 83 144" overflow="hidden">
      <clipPath id="clip-${project.image}"><rect width="83" height="144" rx="8"/></clipPath>
      <image href="${project.href}" width="83" height="144" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-${project.image})"/>
    </svg>
    <text x="${textX}" y="${y + 32}" font-size="17" font-weight="680">${project.name}</text>
    <text x="${textX}" y="${y + 53}" font-size="12.8" fill="#dbe8fb">${project.description[0]}</text>
    <text x="${textX}" y="${y + 69}" font-size="12.8" fill="#dbe8fb">${project.description[1]}</text>
    <text x="${textX}" y="${y + 91}" font-size="11.8" fill="#aac2e6">${project.translation[0]}</text>
    <text x="${textX}" y="${y + 106}" font-size="11.8" fill="#aac2e6">${project.translation[1]}</text>
    ${chips.join("\n    ")}`;
}

function focusPanel(width, height) {
  const topics = [
    ["◉", "Computer Vision", "Nhận diện vật thể bằng YOLOv11.", "Object detection with YOLOv11."],
    ["❯", "Backend APIs", "Viết API và làm việc với cơ sở dữ liệu.", "Building APIs and working with databases."],
    ["✧", "Game AI", "Tìm hiểu cách nhân vật ra quyết định.", "Exploring how game characters make decisions."],
  ];
  return frame(width, height, "ĐANG TÌM HIỂU / EXPLORING", "◌") + topics.map(([symbol, title, note, translation], index) => {
    const y = 59 + index * 55;
    return `<text x="22" y="${y + 8}" font-size="22" fill="#76c5ff">${symbol}</text>
    <text x="57" y="${y}" font-size="15.5" font-weight="700">${title}</text>
    <text x="57" y="${y + 16}" font-size="12.5" fill="#dbe8fb">${note}</text>
    <text x="57" y="${y + 31}" font-size="11.1" fill="#aac2e6">${translation}</text>`;
  }).join("\n    ") + `<path d="M${width - 108} ${height - 12}q35 2 85 -35" fill="none" stroke="#518dff" stroke-opacity=".6"/>`;
}

const splitHeading = "Về Bích Uyên và công nghệ / About Bích Uyên and her tech stack";
const projectsHeading = "Dự án và chủ đề đang tìm hiểu / Featured projects and current interests";
const aboutWidth = 458;
const aboutHeight = 336;
const techHeight = 310;
const wide = 1200;
const gap = 12;
const tileHeight = 156;
const projectHeight = 223;
const focusWidth = 338;
const featuredWidth = wide - focusWidth - gap;
const featuredTileWidth = (featuredWidth - 48) / 3;
const tileStride = tileHeight + 8;
const smallProjectsHeight = 50 + projects.length * tileStride;
const skyline = await photo("skyline.jpg");
const stars = [
  [.05, 40, 2.1], [.11, 28, 1.2], [.17, 53, 1.7], [.24, 21, 2.0], [.30, 68, 1.4],
  [.38, 19, 1.1], [.58, 24, 1.5], [.65, 63, 2.0], [.73, 24, 1.3], [.79, 49, 2.1],
  [.86, 22, 1.2], [.90, 71, 1.5], [.95, 39, 2.0],
];

function footerScene(width) {
  const center = width / 2;
  return svg("Hẹn gặp lại! / See you around!", width, 173, `
    <style>
      .meteor { opacity: 0; }
      @media (prefers-reduced-motion: no-preference) {
        .glint { animation: twinkle 4.5s ease-in-out var(--delay) infinite; }
        .meteor { animation: fall 7s ease-in var(--delay) infinite; }
        .cat { animation: patrol 10s ease-in-out infinite; }
        .cat-eyes { animation: blink 4.7s step-end infinite; }
      }
      @keyframes twinkle { 0%, 100% { opacity: .32; } 48% { opacity: 1; } }
      @keyframes fall {
        0%, 61% { opacity: 0; transform: translate(68px, -16px); }
        65% { opacity: .85; }
        76%, 100% { opacity: 0; transform: translate(-77px, 34px); }
      }
      @keyframes patrol {
        0%, 100% { transform: translate(0, 0); }
        30%, 70% { transform: translate(9px, -1px); }
        50% { transform: translate(17px, -4px); }
      }
      @keyframes blink { 0%, 94%, 100% { opacity: 1; } 91% { opacity: 0; } }
    </style>
    <rect width="${width}" height="173" rx="12" fill="#091326"/>
    <image href="${skyline}" y="72" width="${width}" height="101" preserveAspectRatio="xMidYMid slice"/>
    <rect y="66" width="${width}" height="88" fill="url(#fade)"/>
    ${stars.map(([position, y, size], index) => {
      const x = (position * width).toFixed(1);
      return `<g class="glint" style="--delay:-${(index * .51).toFixed(2)}s" fill="#a8d8ff" opacity=".65">
        <circle cx="${x}" cy="${y}" r="${size}"/>
        <path d="M${x} ${y - size - 1}v${size * 2 + 2}" stroke="#cce9ff" stroke-width=".75"/>
      </g>`;
    }).join("\n    ")}
    <g transform="translate(${width * .22} 33)"><path class="meteor" style="--delay:-2s" d="M49 -18L0 0" stroke="#b6ecff" stroke-width="1.8" stroke-linecap="round"/></g>
    <g transform="translate(${width * .86} 36)"><path class="meteor" style="--delay:-5.7s" d="M63 -21L0 0" stroke="#92c5ff" stroke-width="2.1" stroke-linecap="round"/></g>
    <g transform="translate(${width * .12} 99) scale(2.65)">
      <g class="cat" shape-rendering="crispEdges">
        <path d="M2 1h2v2h4V1h2v2h1v5h2v2h1V7h2v5h-2v2H4v-2H2V9H1V4h1z" fill="#b7d6ff" stroke="#263d70" stroke-width=".6"/>
        <path d="M2 2h1v2H2zm7 0h1v2H9z" fill="#d7adfa"/>
        <path class="cat-eyes" d="M3 6h1v2H3zm5 0h1v2H8z" fill="#1a2b57"/>
        <path d="M5 8h2v1H5z" fill="#9b6ec2"/>
      </g>
    </g>
    <path d="M${width * .29} 86Q${center} 97 ${width * .71} 86" fill="none" stroke="url(#rule)"/>
    <text x="${center}" y="51" text-anchor="middle" font-family="Segoe Script,Bradley Hand,cursive" font-style="italic" font-size="32" fill="#dbedff">Hẹn gặp lại!</text>
    <text x="${center}" y="75" text-anchor="middle" font-family="Consolas,monospace" font-size="17" fill="#9ecfff">See you around!</text>`);
}

const assets = [
  ["intro.svg", intro(wide, 18)],
  ["intro-mobile.svg", intro(aboutWidth, 16)],
  ["about-and-tech.svg", svg(splitHeading, wide, aboutHeight, `
    ${aboutPanel(aboutWidth, aboutHeight)}
    <g transform="translate(${aboutWidth + gap})">${techPanel(wide - aboutWidth - gap, aboutHeight)}</g>`)],
  ["about-and-tech-mobile.svg", svg(splitHeading, aboutWidth, aboutHeight + gap + techHeight, `
    ${aboutPanel(aboutWidth, aboutHeight)}
    <g transform="translate(0 ${aboutHeight + gap})">${techPanel(aboutWidth, techHeight)}</g>`)],
  ["projects-and-focus.svg", svg(projectsHeading, wide, projectHeight, `
    ${frame(featuredWidth, projectHeight, "DỰ ÁN / FEATURED PROJECTS", "▣")}
    ${projects.map((project, i) => projectTile(project, 14 + i * (featuredTileWidth + 10), 48, featuredTileWidth)).join("")}
    <g transform="translate(${featuredWidth + gap})">${focusPanel(focusWidth, projectHeight)}</g>`)],
  ["projects-and-focus-mobile.svg", svg(projectsHeading, aboutWidth, smallProjectsHeight + gap + projectHeight, `
    ${frame(aboutWidth, smallProjectsHeight, "DỰ ÁN / FEATURED PROJECTS", "▣")}
    ${projects.map((project, i) => projectTile(project, 14, 48 + i * tileStride, aboutWidth - 28)).join("")}
    <g transform="translate(0 ${smallProjectsHeight + gap})">${focusPanel(aboutWidth, projectHeight)}</g>`)],
  ["footer.svg", footerScene(1000)],
  ["footer-mobile.svg", footerScene(aboutWidth)],
];

await Promise.all(assets.map(([name, artContent]) => writeFile(new URL(name, art), artContent)));
