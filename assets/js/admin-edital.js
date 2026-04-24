const ADMIN_ENDPOINT = "https://tfpxdtkvzkzsudkpmpou.supabase.co/functions/v1/admin-edital";
const DELETE_ENDPOINT = "https://tfpxdtkvzkzsudkpmpou.supabase.co/functions/v1/delete-edital-application";

const loginSection = document.getElementById("admin-login");
const contentSection = document.getElementById("admin-content");
const loginForm = document.getElementById("admin-login-form");
const passwordInput = document.getElementById("admin-password");
const message = document.getElementById("admin-message");
const tableBody = document.getElementById("applications-table-body");
const exportButton = document.getElementById("export-csv");

let applicationsData = [];
let currentAdminPassword = "";

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  message.textContent = "Carregando inscrições...";

  try {
    const response = await fetch(ADMIN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: passwordInput.value }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Não foi possível carregar as inscrições.");
    }

    currentAdminPassword = passwordInput.value;
    applicationsData = result.applications || [];

    renderTable(applicationsData);

    loginSection.classList.add("is-hidden");
    contentSection.classList.remove("is-hidden");
  } catch (error) {
    message.textContent = error.message;
  }
});

exportButton.addEventListener("click", () => {
  exportToCSV(applicationsData);
});

tableBody.addEventListener("click", async (event) => {
  const button = event.target.closest(".delete-application-btn");

  if (!button) return;

  const applicationId = button.dataset.applicationId;
  const applicationName = button.dataset.applicationName || "esta inscrição";

  const confirmed = confirm(
    `Tem certeza que deseja excluir a inscrição de "${applicationName}"?\n\nEssa ação apagará os dados e os arquivos anexados.`
  );

  if (!confirmed) return;

  button.disabled = true;
  button.textContent = "Excluindo...";

  try {
    const response = await fetch(DELETE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: currentAdminPassword,
        applicationId,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Não foi possível excluir a inscrição.");
    }

    applicationsData = applicationsData.filter((item) => item.id !== applicationId);
    renderTable(applicationsData);

    alert("Inscrição excluída com sucesso.");
  } catch (error) {
    alert(error.message);
    button.disabled = false;
    button.textContent = "Excluir";
  }
});

function renderTable(applications) {
  tableBody.innerHTML = "";

  if (!applications.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="11">Nenhuma inscrição encontrada.</td>
      </tr>
    `;
    return;
  }

  applications.forEach((application) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${formatDate(application.created_at)}</td>
      <td>${escapeHTML(application.edital_name || "")}</td>
      <td>${escapeHTML(application.institution_name || "")}</td>
      <td>${escapeHTML(application.cnpj || "")}</td>
      <td>${escapeHTML(application.project_name || "")}</td>
      <td>${escapeHTML(application.project_lead_name || "")}</td>
      <td>${escapeHTML(application.project_email || "")}</td>
      <td>${escapeHTML(application.project_phone || "")}</td>
      <td>${escapeHTML(application.segment || "")}</td>
      <td>${formatODS(application.ods)}</td>
      <td>${renderDocuments(application.files || [])}</td>
      <td>
        <button
          type="button"
          class="delete-application-btn"
          data-application-id="${escapeHTML(application.id || "")}"
          data-application-name="${escapeHTML(application.institution_name || "")}"
        >
          Excluir
        </button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

function renderDocuments(files) {
  if (!files.length) return "Sem arquivos";

  return `
    <div class="documents-list">
      ${files.map((file) => `
        <a href="${escapeHTML(file.url)}" target="_blank" rel="noopener noreferrer">
          ${formatFileType(file.file_type)}
        </a>
      `).join("")}
    </div>
  `;
}

function exportToCSV(applications) {
  const headers = [
    "Data",
    "Edital",
    "Instituição",
    "CNPJ",
    "Endereço Instituição",
    "Cidade Instituição",
    "Estado Instituição",
    "Segmento",
    "Etnia",
    "Representante Legal",
    "CPF",
    "Endereço Representante",
    "Cidade Representante",
    "Estado Representante",
    "Nome do Projeto",
    "Período de Execução",
    "Local de Execução",
    "Responsável pelo Projeto",
    "Telefone",
    "Email",
    "Banco",
    "Agência",
    "Conta Corrente",
    "Pix",
    "Histórico",
    "Quantidade de famílias",
    "Quantidade de pessoas",
    "Objetivo Geral",
    "Objetivos Específicos",
    "Justificativa",
    "Metodologia",
    "Resultados",
    "ODS",
    "Arquivos"
  ];

  const rows = applications.map((application) => {
    const fileLinks = (application.files || [])
      .map((file) => `${formatFileType(file.file_type)}: ${file.url}`)
      .join(" | ");

    return [
      formatDate(application.created_at),
      application.edital_name,
      application.institution_name,
      application.cnpj,
      application.institution_address,
      application.institution_city,
      application.institution_state,
      application.segment,
      application.indigenous_ethnicity,
      application.legal_name,
      application.legal_cpf,
      application.legal_address,
      application.legal_city,
      application.legal_state,
      application.project_name,
      application.execution_period,
      application.execution_location,
      application.project_lead_name,
      application.project_phone,
      application.project_email,
      application.bank_name,
      application.bank_branch,
      application.bank_account,
      application.pix_key,
      application.community_history,
      application.families_count,
      application.people_count,
      application.general_objective,
      application.objective_1,
      application.justification,
      application.methodology,
      application.result_1,
      Array.isArray(application.ods) ? application.ods.join(", ") : application.ods,
      fileLinks
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `inscricoes-edital-instituto-educa-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

function formatDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatODS(ods) {
  if (!ods) return "";

  if (Array.isArray(ods)) {
    return ods.join(", ");
  }

  return String(ods);
}

function formatFileType(type) {
  const labels = {
    cartao_cnpj: "Cartão CNPJ",
    estatuto: "Estatuto",
    ata_eleicao: "Ata da eleição",
    cnd_fgts: "CND FGTS",
    cnd_trabalhista: "CND Trabalhista",
    cnd_receita_federal: "CND Receita Federal",
  };

  return labels[type] || type;
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";

  const stringValue = String(value).replaceAll('"', '""');

  return `"${stringValue}"`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
