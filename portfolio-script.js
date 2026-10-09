const username = "FSGRJ";

const avatarEl = document.getElementById("avatar");
const nameEl = document.getElementById("name");
const loginEl = document.getElementById("login");
const bioEl = document.getElementById("bio");
const locationEl = document.getElementById("location");
const companyEl = document.getElementById("company");
const blogEl = document.getElementById("blog");
const createdAtEl = document.getElementById("createdAt");

const reposMetricEl = document.getElementById("reposMetric");
const followersMetricEl = document.getElementById("followersMetric");
const followingMetricEl = document.getElementById("followingMetric");
const starsMetricEl = document.getElementById("starsMetric");

const executiveSummaryEl = document.getElementById("executiveSummary");
const overviewListEl = document.getElementById("overviewList");
const repoListEl = document.getElementById("repoList");
const stackListEl = document.getElementById("stackList");
const downloadBtnEl = document.getElementById("downloadBtn");
const downloadSecondaryEl = document.getElementById("downloadSecondary");

let userDataGlobal = {};
let reposDataGlobal = [];

function getLanguageColor(language) {
  const colors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    "C#": "#178600",
    Java: "#b07219",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    PHP: "#4F5D95",
    Go: "#00ADD8",
    Ruby: "#701516",
    Rust: "#dea584",
    Kotlin: "#A97BFF",
    Dart: "#00C4B3",
    Vue: "#41b883",
    React: "#61dafb",
    "Jupyter Notebook": "#DA5B0B",
    C: "#555555",
    "C++": "#f34b7d",
    Dockerfile: "#384d54",
    "PowerShell": "#012456"
  };
  return colors[language] || "#58a6ff";
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(dateString));
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "Portfolio-GitHub"
    }
  });
  if (!res.ok) throw new Error(`Erro na requisição: ${res.status}`);
  return res.json();
}

function renderProfile(user) {
  userDataGlobal = user;
  avatarEl.src = user.avatar_url;
  nameEl.textContent = user.name || user.login;
  loginEl.textContent = `@${user.login}`;
  bioEl.textContent = user.bio || "Sem bio pública.";
  locationEl.textContent = user.location || "—";
  companyEl.textContent = user.company || "—";
  blogEl.innerHTML = user.blog ? `<a href="${user.blog}" target="_blank" rel="noreferrer">${user.blog}</a>` : "—";
  createdAtEl.textContent = formatDate(user.created_at);
}

function renderMetrics(user, repos) {
  reposMetricEl.textContent = user.public_repos;
  followersMetricEl.textContent = user.followers;
  followingMetricEl.textContent = user.following;
  starsMetricEl.textContent = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
}

function renderExecutiveSummary(user, repos) {
  const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];
  const activeRepos = repos.filter(r => {
    const date = new Date(r.updated_at);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 2);
    return date > cutoff;
  }).length;

  const items = [
    `<strong>${user.public_repos}</strong> repositórios públicos`,
    `<strong>${languages.length}</strong> linguagens utilizadas`,
    `<strong>${activeRepos}</strong> repositórios ativos`,
    `<strong>${user.followers}</strong> seguidores`
  ];

  executiveSummaryEl.innerHTML = items.map(item => `<div class="summary-item">${item}</div>`).join("");
}

function renderOverview(user, repos) {
  const languages = [...new Set(repos.map(r => r.language).filter(Boolean))].slice(0, 4).join(", ") || "Não especificado";
  const lastUpdated = [...repos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

  const items = [
    `<strong>${user.public_repos}</strong> repositórios públicos no perfil.`,
    `Linguagens principais: <strong>${languages}</strong>.`,
    `Última atualização: ${lastUpdated ? formatDate(lastUpdated.updated_at) : "Sem registros"}.`,
    user.company ? `Empresa: <strong>${user.company}</strong>.` : "Sem empresa informada.",
    user.location ? `Localização: <strong>${user.location}</strong>.` : "Sem localização informada."
  ];

  overviewListEl.innerHTML = items.map(item => `<li>${item}</li>`).join("");
}

function renderStack(repos) {
  const stack = [...new Set(repos.map(repo => repo.language).filter(Boolean))].slice(0, 12);
  stackListEl.innerHTML = stack
    .map(item => `<span class=\"stack-item\">${item}</span>`)
    .join("");
}

function renderRepositories(repos) {
  reposDataGlobal = repos;
  const topRepos = [...repos]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 8);

  repoListEl.innerHTML = topRepos
    .map(repo => {
      const color = getLanguageColor(repo.language);
      return `
        <div class=\"repo-item\">
          <div class=\"repo-top\">
            <a class=\"repo-name\" href=\"${repo.html_url}\" target=\"_blank\" rel=\"noreferrer\">${repo.name}</a>
          </div>
          <div class=\"repo-desc\">${repo.description || "Sem descrição."}</div>
          <div class=\"repo-meta\">
            <span><span class=\"lang-dot\" style=\"background:${color};\"></span>${repo.language || "—"}</span>
            <span>⭐ ${repo.stargazers_count}</span>
            <span>🍴 ${repo.forks_count}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderLanguageChart(repos) {
  const counts = {};
  repos.forEach(repo => {
    if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1;
  });

  const labels = Object.keys(counts).slice(0, 8);
  const data = Object.values(counts).slice(0, 8);

  new Chart(document.getElementById("languageChart"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: labels.map(l => getLanguageColor(l)),
        borderColor: "rgba(13,17,23,0.9)",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#e6edf3" } },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${ctx.parsed} repos`
          }
        }
      }
    }
  });
}

function renderTopReposChart(repos) {
  const top = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5);

  new Chart(document.getElementById("topReposChart"), {
    type: "bar",
    data: {
      labels: top.map(r => r.name),
      datasets: [{
        label: "Estrelas",
        data: top.map(r => r.stargazers_count),
        backgroundColor: top.map(r => getLanguageColor(r.language)),
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: "#e6edf3" },
          grid: { color: "rgba(255,255,255,0.05)" }
        },
        y: {
          ticks: { color: "#e6edf3" },
          grid: { display: false }
        }
      }
    }
  });
}

function generateReport() {
  const totalStars = reposDataGlobal.reduce((sum, r) => sum + r.stargazers_count, 0);
  const languages = [...new Set(reposDataGlobal.map(r => r.language).filter(Boolean))];
  const activeRepos = reposDataGlobal.filter(r => {
    const date = new Date(r.updated_at);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 2);
    return date > cutoff;
  }).length;

  const report = {
    perfil: {
      nome: userDataGlobal.name || userDataGlobal.login,
      usuario: `@${userDataGlobal.login}`,
      bio: userDataGlobal.bio || "",
      localizacao: userDataGlobal.location || "—",
      empresa: userDataGlobal.company || "—",
      website: userDataGlobal.blog || "—",
      criadoEm: formatDate(userDataGlobal.created_at),
      geradoEm: new Date().toLocaleString("pt-BR")
    },
    metricas: {
      repositoriosPublicos: userDataGlobal.public_repos,
      seguidores: userDataGlobal.followers,
      seguindo: userDataGlobal.following,
      gistsPublicos: userDataGlobal.public_gists,
      totalEstrelas: totalStars,
      repositoriosAtivos: activeRepos
    },
    linguagens: languages,
    repositoriosPrincipais: reposDataGlobal
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map(r => ({
        nome: r.name,
        descricao: r.description || "",
        url: r.html_url,
        linguagem: r.language || "—",
        estrelas: r.stargazers_count,
        forks: r.forks_count,
        atualizadoEm: formatDate(r.updated_at)
      }))
  };

  return report;
}

function downloadReport(format = "json") {
  const report = generateReport();

  if (format === "json") {
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-github-${userDataGlobal.login}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    let txt = `RELATÓRIO DE PERFIL GITHUB\\n`;\n    txt += `${"=".repeat(50)}\\n\\n`;\n    txt += `PERFIL\\n${"-".repeat(50)}\\n`;\n    txt += `Nome: ${report.perfil.nome}\\n`;\n    txt += `Usuário: ${report.perfil.usuario}\\n`;\n    txt += `Bio: ${report.perfil.bio}\\n`;\n    txt += `Localização: ${report.perfil.localizacao}\\n`;\n    txt += `Empresa: ${report.perfil.empresa}\\n`;\n    txt += `Website: ${report.perfil.website}\\n`;\n    txt += `Criado em: ${report.perfil.criadoEm}\\n\\n`;\n\n    txt += `MÉTRICAS\\n${"-".repeat(50)}\\n`;\n    txt += `Repositórios Públicos: ${report.metricas.repositoriosPublicos}\\n`;\n    txt += `Seguidores: ${report.metricas.seguidores}\\n`;\n    txt += `Seguindo: ${report.metricas.seguindo}\\n`;\n    txt += `Total de Estrelas: ${report.metricas.totalEstrelas}\\n`;\n    txt += `Repositórios Ativos: ${report.metricas.repositoriosAtivos}\\n\\n`;\n\n    txt += `LINGUAGENS\\n${"-".repeat(50)}\\n`;\n    txt += report.linguagens.join(\", \") + \"\\n\\n\";\n\n    txt += `REPOSITÓRIOS PRINCIPAIS\\n${"-".repeat(50)}\\n`;\n    report.repositoriosPrincipais.forEach((repo, idx) => {\n      txt += `\\n${idx + 1}. ${repo.nome}\\n`;\n      txt += `   URL: ${repo.url}\\n`;\n      txt += `   Linguagem: ${repo.linguagem}\\n`;\n      txt += `   Estrelas: ${repo.estrelas}\\n`;\n      txt += `   Forks: ${repo.forks}\\n`;\n    });\n\n    const blob = new Blob([txt], { type: \"text/plain\" });\n    const url = URL.createObjectURL(blob);\n    const link = document.createElement(\"a\");\n    link.href = url;\n    link.download = `relatorio-github-${userDataGlobal.login}-${Date.now()}.txt`;\n    link.click();\n    URL.revokeObjectURL(url);\n  }\n}\n\nfunction showDownloadModal() {\n  const modal = document.createElement(\"div\");\n  modal.className = \"modal active\";\n  modal.innerHTML = `\n    <div class=\"modal-content\">\n      <div class=\"modal-header\">\n        <h2>Baixar relatório</h2>\n      </div>\n      <p>Escolha o formato para exportar o relatório do perfil GitHub:</p>\n      <div class=\"modal-actions\">\n        <button class=\"primary-button\" onclick=\"downloadReport('json'); this.closest('.modal').remove();\">JSON</button>\n        <button class=\"ghost-button\" onclick=\"downloadReport('txt'); this.closest('.modal').remove();\">Texto (TXT)</button>\n        <button class=\"ghost-button\" onclick=\"this.closest('.modal').remove();\">Cancelar</button>\n      </div>\n    </div>\n  `;\n  document.body.appendChild(modal);\n}\n\ndownloadBtnEl.addEventListener(\"click\", showDownloadModal);\ndownloadSecondaryEl.addEventListener(\"click\", showDownloadModal);\n\nasync function loadPortfolio() {\n  try {\n    const user = await fetchJson(`https://api.github.com/users/${username}`);\n    const repos = await fetchJson(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);\n\n    renderProfile(user);\n    renderMetrics(user, repos);\n    renderExecutiveSummary(user, repos);\n    renderOverview(user, repos);\n    renderStack(repos);\n    renderRepositories(repos);\n    renderLanguageChart(repos);\n    renderTopReposChart(repos);\n  } catch (error) {\n    console.error(\"Erro ao carregar dados:\", error);\n    document.querySelector(\".content-panel\").innerHTML =\n      '<div style=\"padding: 20px; color: #f85149;\">Erro ao carregar dados do GitHub. Tente novamente mais tarde.</div>';\n  }\n}\n\nloadPortfolio();\n```

Se quiser, a próxima etapa final é:
- deixar esse arquivo como a página principal do GitHub Pages
- tornar o `index.html` idêntico ao `portfolio.html`
- ajustar o acesso direto em https://FSGRJ.github.io

Se quiser, eu também posso te entregar esse último ajuste em um bloco de `index.html` idêntico ao `portfolio.html`.
