const API_DEFAULT = "/api";
const REFRESH_MS = 30000;
const EMPLOYEE_PAGE_SIZE = 8;
const ATTENDANCE_PAGE_SIZE = 8;

const navItems = [
  ["dashboard", "Dashboard", "DB"],
  ["employees", "Employees", "EM"],
  ["departments", "Departments", "DP"],
  ["attendance", "Attendance", "AT"],
  ["leave", "Leave", "LV"],
  ["performance", "Performance", "PF"],
  ["payroll", "Payroll", "PR"],
  ["payslip", "Payslip", "PS"],
  ["profile", "Profile", "ME"]
];

const state = {
  activePage: localStorage.getItem("nexushr_token") ? "dashboard" : "login",
  theme: localStorage.getItem("nexushr_theme") || "dark",
  token: localStorage.getItem("nexushr_token") || "",
  user: readJson("nexushr_user", null),
  avatar: "",
  avatarDraft: "",
  avatarZoom: 1,
  avatarOffsetX: 0,
  avatarOffsetY: 0,
  loading: false,
  apiOnline: false,
  error: "",
  notice: "",
  modal: null,
  search: "",
  employeePage: 1,
  attendancePage: 1,
  data: {
    dashboard: null,
    employees: [],
    departments: [],
    attendance: [],
    leaves: [],
    payrolls: [],
    performances: [],
    leaveBalances: []
  }
};

let refreshTimer = null;

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem("nexushr_theme", theme);
  document.documentElement.dataset.theme = theme;
}

function apiUrl(path) {
  return `${API_DEFAULT}${path}`;
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const hasBody = options.body !== undefined;
  if (hasBody && !(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  let response;
  try {
    response = await fetch(apiUrl(path), { ...options, headers });
  } catch {
    throw new Error(connectionErrorMessage());
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload?.message;
    const error = new Error(message || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return payload;
}

function connectionErrorMessage() {
  return "Service is unavailable. Please make sure NexusHR is running and try again.";
}

async function loadBackendData({ quiet = false } = {}) {
  if (!state.token) return;
  state.loading = !quiet;
  state.error = "";
  if (!quiet) render();

  const calls = dataCallsForRole();

  const results = await Promise.allSettled(calls.map(([, path]) => api(path)));
  let successCount = 0;
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      state.data[calls[index][0]] = normalizeApiResult(calls[index][0], result.value);
      successCount += 1;
    }
  });

  state.apiOnline = successCount > 0;
  state.loading = false;
  if (successCount === 0) {
    state.error = "Backend is reachable only after login with a valid token. If you just changed accounts, sign in again.";
  }
  render();
}

function normalizeApiResult(key, value) {
  if (key === "dashboard") return value || {};
  if (Array.isArray(value)) return value;
  if (value && ["employees", "leaveBalances"].includes(key)) return [value];
  return [];
}

function dataCallsForRole() {
  if (isEmployeeRole()) {
    return [
      ["employees", "/self/employee"],
      ["attendance", "/self/attendance"],
      ["leaves", "/self/leaves"],
      ["payrolls", "/self/payrolls"],
      ["performances", "/self/performance"],
      ["leaveBalances", "/self/leave-balance"],
      ["departments", "/self/departments"]
    ];
  }

  return [
    ["dashboard", "/dashboard"],
    ["employees", "/employees"],
    ["departments", "/departments"],
    ["attendance", "/attendance"],
    ["leaves", "/leaves"],
    ["payrolls", "/payrolls"],
    ["performances", "/performance"],
    ["leaveBalances", "/leave-balances"]
  ];
}

async function login(username, password) {
  await runAuth(async () => {
    const response = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    saveSession(response);
  }, error => isInvalidLogin(error) ? "Invalid username or password" : error.message);
}

async function runAuth(task, messageForError) {
  state.loading = true;
  state.error = "";
  render();
  try {
    await task();
    state.activePage = "dashboard";
    await loadBackendData();
    startRefresh();
  } catch (error) {
    state.loading = false;
    state.error = messageForError(error);
    render();
  }
}

function saveSession(response) {
  state.token = response.token || "";
  state.user = response;
  state.avatar = loadAvatar(response.username);
  localStorage.setItem("nexushr_token", state.token);
  localStorage.setItem("nexushr_user", JSON.stringify(response));
}

function isInvalidLogin(error) {
  const message = String(error?.message || "").toLowerCase();
  return [400, 401, 403].includes(error?.status) ||
    message.includes("bad credentials") ||
    message.includes("user not found") ||
    message.includes("password") ||
    message.includes("unauthorized") ||
    message.includes("forbidden");
}

function logout() {
  state.token = "";
  state.user = null;
  state.avatar = "";
  clearAvatarDraft();
  state.apiOnline = false;
  localStorage.removeItem("nexushr_token");
  localStorage.removeItem("nexushr_user");
  state.activePage = "login";
  stopRefresh();
  render();
}

function startRefresh() {
  stopRefresh();
  refreshTimer = window.setInterval(() => {
    if (state.token && state.activePage !== "login" && !state.modal) {
      loadBackendData({ quiet: true });
    }
  }, REFRESH_MS);
}

function stopRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = null;
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function avatarKey(username = state.user?.username) {
  return `nexushr_avatar_${username || "guest"}`;
}

function loadAvatar(username = state.user?.username) {
  return localStorage.getItem(avatarKey(username)) || "";
}

function saveAvatar(dataUrl) {
  if (!state.user?.username) return;
  state.avatar = dataUrl || "";
  clearAvatarDraft();
  if (dataUrl) {
    localStorage.setItem(avatarKey(), dataUrl);
  } else {
    localStorage.removeItem(avatarKey());
  }
}

function clearAvatarDraft() {
  state.avatarDraft = "";
  state.avatarZoom = 1;
  state.avatarOffsetX = 0;
  state.avatarOffsetY = 0;
}

function avatarMarkup(extraClass = "") {
  const image = state.avatar || loadAvatar();
  const style = image ? `style="background-image:url('${esc(image)}')"` : "";
  return `<span class="avatar ${extraClass} ${image ? "has-image" : ""}" ${style}></span>`;
}

function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function dateOnly(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
}

function displayDate(value) {
  const iso = dateOnly(value);
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function timeOnly(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function employeeName(employee) {
  return employee?.employeeName || [employee?.firstName, employee?.lastName].filter(Boolean).join(" ") || employee?.name || "-";
}

function departmentName(value) {
  return value?.departmentName || value?.department?.departmentName || value?.department?.name || value?.name || value?.department || "-";
}

function byId(list, id) {
  return list.find(item => String(item.id) === String(id));
}

function userRole() {
  return String(state.user?.role || "").replace("ROLE_", "").toUpperCase();
}

function isAdmin() {
  return userRole() === "ADMIN";
}

function isHr() {
  return userRole() === "HR";
}

function isEmployeeRole() {
  return userRole() === "EMPLOYEE";
}

function canManageEmployees() {
  return isAdmin() || isHr();
}

function canManageDepartments() {
  return isAdmin() || isHr();
}

function canReviewLeave() {
  return isAdmin() || isHr();
}

function canManagePayroll() {
  return isAdmin() || isHr();
}

function canManagePerformance() {
  return isAdmin() || isHr();
}

function currentEmployee() {
  const email = String(state.user?.email || "").toLowerCase();
  const username = String(state.user?.username || "").toLowerCase();
  return state.data.employees.find(employee =>
    String(employee.email || "").toLowerCase() === email ||
    String(employee.employeeCode || "").toLowerCase() === username ||
    String(employee.email || "").toLowerCase() === username
  ) || null;
}

function currentEmployeeId() {
  return currentEmployee()?.id;
}

function isOwnEmployee(employee) {
  const email = String(state.user?.email || "").toLowerCase();
  const username = String(state.user?.username || "").toLowerCase();
  return String(employee?.email || "").toLowerCase() === email ||
    String(employee?.employeeCode || "").toLowerCase() === username;
}

function ownsEmployeeRecord(row) {
  const employee = currentEmployee();
  if (!employee) return false;
  return String(row?.employeeId || row?.id || "") === String(employee.id) ||
    String(row?.employeeName || "").toLowerCase() === employeeName(employee).toLowerCase();
}

function scopedEmployees() {
  if (!isEmployeeRole()) return state.data.employees;
  const employee = currentEmployee();
  return employee ? [employee] : [];
}

function scopedRows(key) {
  const rows = state.data[key] || [];
  if (!isEmployeeRole()) return rows;
  if (key === "employees") return scopedEmployees();
  return rows.filter(ownsEmployeeRecord);
}

function availableNavItems() {
  if (isEmployeeRole()) {
    return navItems.filter(([id]) => ["dashboard", "employees", "attendance", "leave", "performance", "payroll", "payslip", "profile"].includes(id));
  }
  return navItems;
}

function render() {
  document.documentElement.dataset.theme = state.theme;
  document.querySelector("#app").innerHTML = state.activePage === "login" ? renderLogin() : renderShell();
  bindEvents();
}

function markLogo() {
  return `<span class="brand-mark"><span></span><span></span><span></span><span></span></span>`;
}

function renderLogin() {
  return `
    <section class="login-shell">
      <div class="login-hero">
        <div class="brand">${markLogo()}<span>NexusHR</span></div>
        <div class="login-copy">
          <h1>Welcome Back!</h1>
          <p>Sign in with credentials issued by your HR or Admin team.</p>
          <div class="login-points">
            ${["Employee accounts are invitation-only", "Role-based operations", "Backend-driven HR workflows", "Dark and light workspace"].map(item => `
              <div class="login-point"><span class="mini-icon">OK</span><span>${item}</span></div>
            `).join("")}
          </div>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="floating-board"><div class="small">Workforce Analytics</div><div class="bar-chart">${[44, 72, 58, 88, 66, 96, 74, 104].map(h => `<span style="height:${h}px"></span>`).join("")}</div></div>
          <div class="floating-card"><div class="small">Secure Workspace</div><div class="metric-value">Live</div><div class="trend good small">Protected access</div></div>
        </div>
      </div>
      <div class="login-form-wrap">
        ${authCard()}
      </div>
    </section>
  `;
}

function authCard() {
  const shared = `
    ${window.location.protocol === "file:" ? `<div class="error-banner">Open NexusHR through the local server URL to enable secure service access.</div>` : ""}
    ${state.error ? `<div class="error-banner">${esc(state.error)}</div>` : ""}
    ${state.notice ? `<div class="success-banner">${esc(state.notice)}</div>` : ""}
  `;

  return `<form class="auth-card" data-auth-form>
    <div class="card-head"><div><h2>Sign In</h2><p>Use your assigned NexusHR credentials</p></div></div>
    ${shared}
    <div class="field"><label>Username</label><input class="input" name="username" required autocomplete="username" /></div>
    <div class="field"><label>Password</label><input class="input" name="password" type="password" required autocomplete="current-password" /></div>
    <div class="auth-row"><span>${state.loading ? "Signing in..." : "Secure access only"}</span></div>
    <button class="primary-button" type="submit" ${state.loading ? "disabled" : ""}>${state.loading ? "Please wait..." : "Sign In"}</button>
  </form>`;
}

function renderShell() {
  const userName = state.user?.username || "Admin";
  const role = userRole() || "USER";
  const nav = availableNavItems();
  if (!nav.some(([id]) => id === state.activePage)) {
    state.activePage = "dashboard";
  }
  return `
    <section class="app-shell">
      <aside class="sidebar">
        <div class="brand">${markLogo()}<span>NexusHR</span></div>
        <nav class="nav-list">
          ${nav.map(([id, label, icon]) => `<button class="nav-item ${state.activePage === id ? "active" : ""}" data-page="${id}" title="${label}"><span class="nav-code">${icon}</span><span>${label}</span></button>`).join("")}
        </nav>
      </aside>
      <section class="content">
        <header class="topbar">
          <div class="search"><input class="input" data-search placeholder="Search current page..." value="${esc(state.search)}" /></div>
          <div class="user-cluster">
            <span class="api-status ${state.apiOnline ? "online" : "offline"}">${state.apiOnline ? "Online" : "Offline"}</span>
            ${themeButton()}
            <button class="icon-button" data-refresh title="Refresh records">R</button>
            <button class="avatar-button" data-profile-avatar title="Edit profile picture">${avatarMarkup()}</button>
            <div><strong>${esc(userName)}</strong><div class="small">${esc(role)}</div></div>
            <button class="outline-button" data-logout>Logout</button>
          </div>
        </header>
        ${state.notice ? `<div class="success-banner page-error">${esc(state.notice)}</div>` : ""}
        ${state.error ? `<div class="error-banner page-error">${esc(state.error)}</div>` : ""}
        ${state.loading ? `<div class="loading-line">Working...</div>` : ""}
        ${pageContent()}
        ${appFooter()}
        ${state.modal ? renderModal() : ""}
      </section>
    </section>
  `;
}

function themeButton() {
  return `<button class="icon-button theme-toggle" type="button" data-theme-toggle title="Toggle theme">${state.theme === "dark" ? "LT" : "DK"}</button>`;
}

function pageHead(title, subtitle, action = "") {
  return `<div class="page-head"><div class="page-title"><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>${action}</div>`;
}

function appFooter() {
  const year = new Date().getFullYear();
  return `<footer class="app-footer"><span>NexusHR - AI-enabled HR platform for Admin, HR, and Employee self-service</span><span>Copyright ${year} NexusHR. All rights reserved.</span></footer>`;
}

function pageContent() {
  if (state.activePage === "employees") return employeesPage();
  if (state.activePage === "departments") return departmentsPage();
  if (state.activePage === "attendance") return attendancePage();
  if (state.activePage === "leave") return leavePage();
  if (state.activePage === "performance") return performancePage();
  if (state.activePage === "payroll") return payrollPage();
  if (state.activePage === "payslip") return payslipPage();
  if (state.activePage === "profile") return profilePage();
  return dashboardPage();
}

function dashboardPage() {
  const dashboard = state.data.dashboard || {};
  const employees = scopedRows("employees");
  const attendance = scopedRows("attendance");
  const leaves = scopedRows("leaves");
  const payrolls = scopedRows("payrolls");
  const departments = state.data.departments;
  const title = isEmployeeRole() ? "My Dashboard" : "Dashboard";
  const subtitle = isEmployeeRole() ? "Your attendance, leave, payroll, and performance snapshot." : "Live workforce snapshot for authorized users.";
  const metrics = isEmployeeRole()
    ? employeeProgressMetrics(attendance, payrolls)
    : [
        metric("EM", "Total Employees", dashboard.totalEmployees ?? employees.length, "Authorized records", "good"),
        metric("AT", "Present Today", dashboard.presentToday ?? countStatus(attendance, "PRESENT"), "Today", "good"),
        metric("LV", "Pending Leaves", countStatus(leaves, "PENDING"), "Needs review", "bad"),
        metric("PR", "Payroll This Month", money(dashboard.monthlyPayroll ?? sum(payrolls, "netSalary")), "Approved access", "good")
      ].join("");
  return `
    ${pageHead(title, subtitle)}
    <div class="grid metrics">
      ${metrics}
    </div>
    <div class="grid dashboard-grid" style="margin-top:18px">
      ${attendanceOverviewCard(attendance)}
      ${donutCard("Leave Overview", [["Approved", dashboard.approvedLeaves ?? countStatus(leaves, "APPROVED"), "var(--green)"], ["Pending", dashboard.pendingLeaves ?? countStatus(leaves, "PENDING"), "var(--yellow)"], ["Rejected", countStatus(leaves, "REJECTED"), "var(--red)"]])}
      ${donutCard("Department Distribution", departmentDistribution(departments, isEmployeeRole() ? state.data.employees : employees), true)}
    </div>
    <div class="grid bottom-grid" style="margin-top:18px">${miniList("Recent Leave Requests", recentLeaves(leaves))}${miniList("Recent Employees", recentEmployees(employees))}${miniList("Payroll Activity", recentPayrolls(payrolls))}</div>
  `;
}

function employeesPage() {
  const rows = filterRows(scopedRows("employees"), employee => [employeeName(employee), employee.email, employee.designation, departmentName(employee), employee.status].join(" "));
  const paged = paginateRows(rows, state.employeePage, EMPLOYEE_PAGE_SIZE);
  state.employeePage = paged.page;
  const action = canManageEmployees()
    ? `<div class="actions"><button class="primary-button fit" data-open-modal="employee-create">+ Add Employee</button><button class="outline-button" data-open-modal="user-create">Create Login</button></div>`
    : "";
  return `
    ${pageHead(isEmployeeRole() ? "My Employee Details" : "Employees", canManageEmployees() ? "Create, edit, search, and deactivate employees." : "View your own employee record.", action)}
    ${canManageEmployees() ? `<div class="loading-line">Workflow: create the employee database record first, then use Create Login to issue username and password. Employees cannot self-register.</div>` : ""}
    ${table(["Employee", "Department", "Email", "Phone", "Status", "Actions"], paged.rows.map(employee => [
      employeeCell(employeeName(employee)),
      departmentName(employee),
      employee.email || "-",
      employee.phoneNumber || "-",
      statusPill(employee.status || "-"),
      canManageEmployees() ? rowActions(employeeActions(employee)) : `<span class="muted">Read only</span>`
    ]))}
    ${employeePagination(paged)}
  `;
}

function employeeActions(employee) {
  const actions = [["Edit", "employee-edit", employee.id], ["Create Login", "user-create", employee.id]];
  if (!isOwnEmployee(employee)) {
    actions.push(["Deactivate", "employee-delete", employee.id]);
  }
  return actions;
}

function departmentsPage() {
  const rows = filterRows(state.data.departments, department => [department.departmentCode, department.departmentName, department.description].join(" "));
  return `
    ${pageHead("Departments", "Create departments. Remove only empty departments with no assigned employees.", canManageDepartments() ? `<button class="primary-button fit" data-open-modal="department-create">+ Add Department</button>` : "")}
    ${table(["Code", "Department", "Description", "Actions"], rows.map(department => [
      department.departmentCode || "-",
      department.departmentName || "-",
      department.description || "-",
      canManageDepartments() ? rowActions(departmentActions(department)) : `<span class="muted">Read only</span>`
    ]))}
  `;
}

function departmentActions(department) {
  const actions = [["Edit", "department-edit", department.id]];
  if (departmentEmployeeCount(department) === 0) {
    actions.push(["Remove", "department-delete", department.id]);
  }
  return actions;
}

function departmentEmployeeCount(department) {
  if (department.employeeCount != null) return Number(department.employeeCount);
  return state.data.employees.filter(employee =>
    employee.departmentId === department.id ||
    employee.departmentName === department.departmentName
  ).length;
}

function attendancePage() {
  const rows = filterRows(scopedRows("attendance"), row => [row.employeeName, row.status, row.attendanceDate].join(" "));
  const paged = paginateRows(rows, state.attendancePage, ATTENDANCE_PAGE_SIZE);
  state.attendancePage = paged.page;
  const subtitle = isEmployeeRole() ? "Check yourself in/out and view your own attendance." : "Check employees in/out and view attendance.";
  const action = isEmployeeRole() && !currentEmployeeId()
    ? ""
    : `<div class="actions"><button class="primary-button fit" data-open-modal="attendance-check-in">Check In</button><button class="outline-button" data-open-modal="attendance-check-out">Check Out</button></div>`;
  return `
    ${pageHead("Attendance", subtitle, action)}
    ${isEmployeeRole() && !currentEmployeeId() ? `<div class="error-banner">No employee record is linked to your account. Ask HR/Admin to add your employee record with email ${esc(state.user?.email || "your login email")}.</div>` : ""}
    <div class="grid metrics">
      ${metric("P", "Present", countStatus(rows, "PRESENT"), "", "good")}
      ${metric("A", "Absent", countStatus(rows, "ABSENT"), "", "bad")}
      ${metric("L", "Late", countStatus(rows, "LATE"), "", "bad")}
      ${metric("H", "Half Day", countStatus(rows, "HALF_DAY"), "", "bad")}
    </div>
    <div style="margin-top:18px">${table(["Employee", "Date", "Check In", "Check Out", "Status", "Working Hours"], paged.rows.map(row => [
      employeeCell(row.employeeName || employeeName(row.employee)),
      displayDate(row.attendanceDate),
      timeOnly(row.checkInTime),
      timeOnly(row.checkOutTime),
      statusPill(row.status || "-"),
      row.workingHours ? `${Number(row.workingHours).toFixed(2)}h` : "-"
    ]))}${recordPagination(paged, "attendance", "attendance records")}</div>
  `;
}

function leavePage() {
  const rows = filterRows(scopedRows("leaves"), row => [row.employeeName, row.leaveType, row.status, row.reason].join(" "));
  const balanceButton = canReviewLeave() ? `<button class="outline-button" data-open-modal="leave-balance">Leave Balance</button>` : "";
  const applyButton = isEmployeeRole() && !currentEmployeeId() ? "" : `<button class="primary-button fit" data-open-modal="leave-apply">Apply Leave</button>`;
  return `
    ${pageHead("Leave Management", isEmployeeRole() ? "Apply for leave and track your own requests." : "Apply, approve, reject, and manage leave balances.", `<div class="actions">${applyButton}${balanceButton}</div>`)}
    ${isEmployeeRole() && !currentEmployeeId() ? `<div class="error-banner">No employee record is linked to your account, so leave application is disabled.</div>` : ""}
    ${table(["Employee", "Leave Type", "From", "To", "Days", "Reason", "Status", "Actions"], rows.map(row => [
      row.employeeName || employeeName(row.employee),
      row.leaveType || "-",
      displayDate(row.startDate),
      displayDate(row.endDate),
      row.totalDays || "-",
      row.reason || "-",
      statusPill(row.status || "-"),
      rowActions(leaveActions(row))
    ]))}
  `;
}

function leaveActions(row) {
  const actions = [];
  if (canReviewLeave() && String(row.status).toUpperCase() === "PENDING") {
    actions.push(["Approve", "leave-approve", row.id], ["Reject", "leave-reject", row.id]);
  }
  return actions.length ? actions : [["View", "leave-view", row.id]];
}

function payrollPage() {
  const rows = filterRows(scopedRows("payrolls"), row => [row.employeeName, row.month, row.year, row.status].join(" "));
  const action = canManagePayroll() ? `<button class="primary-button fit" data-open-modal="payroll-generate">Generate Payroll</button>` : "";
  return `
    ${pageHead("Payroll Management", canManagePayroll() ? "Generate and approve payroll." : "View your own payroll records.", action)}
    ${table(["Month", "Employee", "Basic", "Net Salary", "Status", "Actions"], rows.map(row => [
      `${row.month || "-"} / ${row.year || "-"}`,
      row.employeeName || employeeName(row.employee),
      money(row.basicSalary),
      money(row.netSalary),
      statusPill(row.status || "-"),
      rowActions(payrollActions(row))
    ]))}
  `;
}

function payrollActions(row) {
  const actions = [["View", "payroll-view", row.id]];
  if (canManagePayroll() && String(row.status || "").toUpperCase() !== "APPROVED") actions.push(["Approve", "payroll-approve", row.id]);
  if (String(row.status || "").toUpperCase() === "APPROVED") actions.push(["Payslip", "payslip-download", row.id]);
  return actions;
}

function payslipPage() {
  const rows = filterRows(scopedRows("payrolls"), row => [row.employeeName, row.month, row.year, row.status].join(" "));
  return `
    ${pageHead("Payslip", "Download payslips for approved payroll records.")}
    ${table(["Employee", "Month", "Basic Salary", "Deductions", "Net Salary", "Actions"], rows.map(row => [
      employeeCell(row.employeeName || employeeName(row.employee)),
      `${row.month || "-"} / ${row.year || "-"}`,
      money(row.basicSalary),
      money(row.deductions),
      money(row.netSalary),
      String(row.status || "").toUpperCase() === "APPROVED" ? rowActions([["Download", "payslip-download", row.id]]) : `<span class="muted">Approval needed</span>`
    ]))}
  `;
}

function performancePage() {
  const rows = filterRows(scopedRows("performances"), row => [row.employeeName, row.goal, row.reviewerName, row.status].join(" "));
  const action = canManagePerformance() ? `<button class="primary-button fit" data-open-modal="performance-create">Add Review</button>` : "";
  return `
    ${pageHead("Performance Management", canManagePerformance() ? "Create and edit performance reviews. Reviews are retained for audit history." : "View your own performance reviews.", action)}
    ${table(["Employee", "Goal", "Reviewer", "Review Date", "Rating", "Status", "Actions"], rows.map(row => [
      row.employeeName || employeeName(row.employee),
      row.goal || "-",
      row.reviewerName || "-",
      displayDate(row.reviewDate),
      stars(Number(row.rating || 0)),
      statusPill(row.status || "Completed"),
      canManagePerformance() ? rowActions([["Edit", "performance-edit", row.id]]) : `<span class="muted">Read only</span>`
    ]))}
  `;
}

function profilePage() {
  const user = state.user || {};
  const employee = currentEmployee();
  return `
    ${pageHead("Profile", "Update profile, password, and avatar.", `<div class="actions"><button class="primary-button fit" data-open-modal="avatar-edit">Edit Avatar</button><button class="outline-button" data-open-modal="profile-edit">Update Profile</button><button class="outline-button" data-open-modal="password-change">Change Password</button></div>`)}
    <div class="profile-grid">
      <div class="profile-card profile-summary">${avatarMarkup()}<button class="outline-button compact" data-open-modal="avatar-edit">Edit Photo</button><div><h2>${esc(user.username || "User")}</h2><div class="muted">${esc(String(user.role || "").replace("ROLE_", "") || "NexusHR User")}</div></div><div class="profile-meta"><div>Email: ${esc(user.email || "-")}</div><div>Status: ${esc(accountStatusLabel(user))}</div></div></div>
      <div class="profile-card form-grid">
        <div class="field" style="margin-top:0"><label>Username</label><input class="input" value="${esc(user.username || "")}" disabled /></div>
        <div class="field" style="margin-top:0"><label>Email</label><input class="input" value="${esc(user.email || "")}" disabled /></div>
        <div class="field" style="margin-top:0"><label>Role</label><input class="input" value="${esc(String(user.role || "").replace("ROLE_", ""))}" disabled /></div>
        <div class="field" style="margin-top:0"><label>Employee Link</label><input class="input" value="${esc(employee ? employeeName(employee) : "No employee record matched")}" disabled /></div>
      </div>
    </div>
  `;
}

function accountStatusLabel(user) {
  if (user?.enabled === false) return "Disabled";
  return "Enabled";
}

function renderModal() {
  const spec = modalSpec(state.modal.type, state.modal.id);
  if (!spec) return "";
  return `
    <div class="modal-backdrop" data-close-modal>
      <form class="modal" data-modal-form data-modal-type="${esc(state.modal.type)}" data-modal-id="${esc(state.modal.id || "")}" onsubmit="return false">
        <div class="modal-head"><div><h2>${esc(spec.title)}</h2><p>${esc(spec.subtitle || "")}</p></div><button class="icon-button" type="button" data-close-modal>X</button></div>
        ${spec.body}
        <div class="modal-actions"><button class="outline-button" type="button" data-close-modal>Cancel</button>${spec.submit ? `<button class="primary-button fit" type="submit">${esc(spec.submit)}</button>` : ""}</div>
      </form>
    </div>
  `;
}

function modalSpec(type, id) {
  const employee = byId(state.data.employees, id) || {};
  const department = byId(state.data.departments, id) || {};
  const leave = byId(state.data.leaves, id) || {};
  const payroll = byId(state.data.payrolls, id) || {};
  const review = byId(state.data.performances, id) || {};

  const specs = {
    "employee-create": { title: "Add Employee", submit: "Create Employee", body: employeeForm({}) },
    "employee-edit": { title: "Edit Employee", submit: "Save Employee", body: employeeForm(employee) },
    "employee-delete": { title: "Deactivate Employee", submit: "Deactivate", body: confirmBody(`Deactivate ${employeeName(employee)}? Their attendance, payroll, leave, and performance history will be preserved.`) },
    "user-create": { title: "Create Login Credentials", submit: "Create User", subtitle: "Create username and password for an employee already added in the database.", body: userForm(employee) },
    "department-create": { title: "Add Department", submit: "Create Department", body: departmentForm({}) },
    "department-edit": { title: "Edit Department", submit: "Save Department", body: departmentForm(department) },
    "department-delete": { title: "Remove Department", submit: "Remove", body: confirmBody(`Remove ${department.departmentName || "this department"}? This is allowed only when no employees are assigned.`) },
    "attendance-check-in": { title: "Check In", submit: "Check In", body: selfOrEmployeePicker() },
    "attendance-check-out": { title: "Check Out", submit: "Check Out", body: selfOrEmployeePicker() },
    "leave-apply": { title: "Apply Leave", submit: "Apply Leave", body: leaveForm() },
    "leave-approve": { title: "Approve Leave", submit: "Approve", body: confirmBody(`Approve leave request for ${leave.employeeName || "employee"}?`) },
    "leave-reject": { title: "Reject Leave", submit: "Reject", body: confirmBody(`Reject leave request for ${leave.employeeName || "employee"}?`) },
    "leave-view": { title: "Leave Details", body: detailsBody(leave) },
    "leave-balance": { title: "Leave Balance", submit: "Save Balance", body: leaveBalanceForm() },
    "payroll-generate": { title: "Generate Payroll", submit: "Generate", body: payrollGenerateForm() },
    "payroll-approve": { title: "Approve Payroll", submit: "Approve", body: payrollApproveForm(payroll) },
    "payroll-view": { title: "Payroll Details", body: detailsBody(payroll) },
    "performance-create": { title: "Add Performance Review", submit: "Create Review", body: performanceForm({}) },
    "performance-edit": { title: "Edit Performance Review", submit: "Save Review", body: performanceForm(review) },
    "profile-edit": { title: "Update Profile", submit: "Save Profile", body: profileForm() },
    "avatar-edit": { title: "Edit Profile Photo", submit: "Save Photo", subtitle: "Choose a local image for your NexusHR avatar.", body: avatarForm() },
    "password-change": { title: "Change Password", submit: "Change Password", body: passwordForm() }
  };
  return specs[type];
}

function input(name, label, value = "", type = "text", attrs = "") {
  return `<div class="field"><label>${esc(label)}</label><input class="input" name="${esc(name)}" type="${esc(type)}" value="${esc(value ?? "")}" ${attrs} /></div>`;
}

function select(name, label, options, value = "") {
  return `<div class="field"><label>${esc(label)}</label><select class="select" name="${esc(name)}">${options.map(option => {
    const optionValue = Array.isArray(option) ? option[0] : option;
    const optionLabel = Array.isArray(option) ? option[1] : option;
    return `<option value="${esc(optionValue)}" ${String(optionValue) === String(value) ? "selected" : ""}>${esc(optionLabel)}</option>`;
  }).join("")}</select></div>`;
}

function employeePicker(selected = "") {
  return select("employeeId", "Employee", state.data.employees.map(e => [e.id, employeeName(e)]), selected);
}

function selfOrEmployeePicker() {
  if (!isEmployeeRole()) return employeePicker();
  const employee = currentEmployee();
  if (!employee) return `<div class="error-banner modal-wide">No employee record is linked to this user. Ask HR/Admin to create an employee record using your account email.</div>`;
  return `<input type="hidden" name="employeeId" value="${esc(employee.id)}" />${confirmBody(`This action will be recorded for ${employeeName(employee)}.`)}`;
}

function userForm(employee = {}) {
  const email = employee.email || "";
  const username = employee.employeeCode || email || "";
  return `<div class="modal-grid">
    ${employee.id ? `<input type="hidden" name="employeeId" value="${esc(employee.id)}" />` : employeePicker()}
    ${input("username", "Username", username, "text", "required")}
    ${input("email", "Email", email, "email", "required")}
    ${input("password", "Temporary Password", "", "password", "required")}
    ${select("role", "Role", isAdmin() ? ["EMPLOYEE", "HR", "ADMIN"] : ["EMPLOYEE"], "EMPLOYEE")}
  </div>`;
}

function employeeForm(employee) {
  return `<div class="modal-grid">
    ${input("firstName", "First Name", employee.firstName, "text", "required")}
    ${input("lastName", "Last Name", employee.lastName, "text", "required")}
    ${input("email", "Email", employee.email, "email", "required")}
    ${select("departmentId", "Department", state.data.departments.map(d => [d.id, d.departmentName]), employee.departmentId)}
    ${input("designation", "Designation", employee.designation, "text", "required")}
    ${input("salary", "Salary", employee.salary, "number", "required min=\"1\" step=\"0.01\"")}
    ${input("employeeCode", "Employee Code", employee.employeeCode, "text", "required")}
    ${input("phoneNumber", "Phone Number", employee.phoneNumber, "tel", "required pattern=\"[0-9]{10}\"")}
    ${input("joiningDate", "Joining Date", dateOnly(employee.joiningDate), "date", "required")}
    ${select("status", "Status", ["ACTIVE", "INACTIVE"], employee.status || "ACTIVE")}
  </div>`;
}

function departmentForm(department) {
  return `<div class="modal-grid">
    ${input("departmentCode", "Department Code", department.departmentCode, "text", "required")}
    ${input("departmentName", "Department Name", department.departmentName, "text", "required")}
    <div class="field modal-wide"><label>Description</label><textarea class="input textarea" name="description">${esc(department.description || "")}</textarea></div>
  </div>`;
}

function leaveForm() {
  return `<div class="modal-grid">
    ${selfOrEmployeePicker()}
    ${select("leaveType", "Leave Type", ["CASUAL_LEAVE", "SICK_LEAVE", "ANNUAL_LEAVE", "UNPAID_LEAVE"])}
    ${input("startDate", "Start Date", "", "date", "required")}
    ${input("endDate", "End Date", "", "date", "required")}
    <div class="field modal-wide"><label>Reason</label><textarea class="input textarea" name="reason" required></textarea></div>
  </div>`;
}

function leaveBalanceForm() {
  return `<div class="modal-grid">${employeePicker()}${input("totalLeaves", "Total Leaves", 24, "number", "required min=\"0\"")}</div>`;
}

function payrollGenerateForm() {
  const now = new Date();
  return `<div class="modal-grid">${employeePicker()}${input("month", "Month", now.getMonth() + 1, "number", "required min=\"1\" max=\"12\"")}${input("year", "Year", now.getFullYear(), "number", "required min=\"2000\"")}${input("bonus", "Bonus", 0, "number", "min=\"0\" step=\"0.01\"")}</div>`;
}

function payrollApproveForm(payroll) {
  return `<div class="modal-grid">${input("bonus", "Extra Bonus", payroll.bonus || 0, "number", "min=\"0\" step=\"0.01\"")}${input("deductions", "Extra Deductions", 0, "number", "min=\"0\" step=\"0.01\"")}${input("approvedBy", "Approved By", state.user?.username || "", "text", "required")}</div>`;
}

function performanceForm(review) {
  return `<div class="modal-grid">
    ${review.id ? "" : employeePicker(review.employeeId)}
    ${input("goal", "Goal", review.goal, "text", "required")}
    ${input("rating", "Rating", review.rating || 5, "number", "required min=\"1\" max=\"5\"")}
    ${input("reviewerName", "Reviewer Name", review.reviewerName || state.user?.username || "", "text", "required")}
    ${select("status", "Status", ["PENDING", "COMPLETED"], review.status || "COMPLETED")}
    <div class="field modal-wide"><label>Comments</label><textarea class="input textarea" name="comments">${esc(review.comments || "")}</textarea></div>
  </div>`;
}

function profileForm() {
  return `<div class="modal-grid">${input("username", "Username", state.user?.username || "", "text")}${input("email", "Email", state.user?.email || "", "email")}</div>`;
}

function avatarForm() {
  const preview = state.avatarDraft || state.avatar || loadAvatar();
  const transform = `translate(${Number(state.avatarOffsetX || 0)}px, ${Number(state.avatarOffsetY || 0)}px) scale(${Number(state.avatarZoom || 1)})`;
  return `<div class="avatar-editor">
    <div class="avatar-cropper" aria-label="Avatar resize preview">
      ${preview ? `<img src="${esc(preview)}" alt="Avatar preview" style="transform:${esc(transform)}" />` : avatarMarkup("avatar-preview")}
    </div>
    <div class="field"><label>Upload Photo</label><input class="input file-input" name="avatar" type="file" accept="image/*" /></div>
    <div class="avatar-resize-controls">
      <label class="range-row"><span>Zoom</span><input name="avatarZoom" data-avatar-control type="range" min="1" max="3" step="0.05" value="${esc(state.avatarZoom)}" /></label>
      <label class="range-row"><span>Move X</span><input name="avatarOffsetX" data-avatar-control type="range" min="-80" max="80" step="1" value="${esc(state.avatarOffsetX)}" /></label>
      <label class="range-row"><span>Move Y</span><input name="avatarOffsetY" data-avatar-control type="range" min="-80" max="80" step="1" value="${esc(state.avatarOffsetY)}" /></label>
    </div>
    <label class="auth-row" style="margin:0"><span>Remove current photo</span><input type="checkbox" name="removeAvatar" value="true" /></label>
    <p class="muted">Resize before saving. Your photo is stored only in this browser.</p>
  </div>`;
}

function passwordForm() {
  return `<div class="modal-grid">${input("oldPassword", "Old Password", "", "password", "required")}${input("newPassword", "New Password", "", "password", "required")}</div>`;
}

function confirmBody(message) {
  return `<p class="confirm-text">${esc(message)}</p>`;
}

function detailsBody(value) {
  return `<div class="details-list">${Object.entries(value || {}).map(([key, val]) => `<div><strong>${esc(key)}</strong><span>${esc(typeof val === "object" ? JSON.stringify(val) : val)}</span></div>`).join("")}</div>`;
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function submitModal(form) {
  const type = form.dataset.modalType;
  const id = form.dataset.modalId;
  const values = formData(form);
  await mutate(async () => {
    ensureAllowed(type, id);
    if (type === "user-create") return api("/auth/register", { method: "POST", body: JSON.stringify({ username: values.username, email: values.email, password: values.password, role: values.role }) });
    if (type === "employee-create") return api("/employees", { method: "POST", body: JSON.stringify(employeePayload(values)) });
    if (type === "employee-edit") return api(`/employees/${id}`, { method: "PUT", body: JSON.stringify(employeePayload(values)) });
    if (type === "employee-delete") return api(`/employees/${id}`, { method: "PUT", body: JSON.stringify({ status: "INACTIVE" }) });
    if (type === "department-create") return api("/departments", { method: "POST", body: JSON.stringify(departmentPayload(values)) });
    if (type === "department-edit") return api(`/departments/${id}`, { method: "PUT", body: JSON.stringify(departmentPayload(values)) });
    if (type === "department-delete") return api(`/departments/${id}`, { method: "DELETE" });
    if (type === "attendance-check-in") {
      return isEmployeeRole()
        ? api("/self/attendance/check-in", { method: "POST" })
        : api(`/attendance/check-in/${values.employeeId}`, { method: "POST" });
    }
    if (type === "attendance-check-out") {
      return isEmployeeRole()
        ? api("/self/attendance/check-out", { method: "PUT" })
        : api(`/attendance/check-out/${values.employeeId}`, { method: "PUT" });
    }
    if (type === "leave-apply") {
      return isEmployeeRole()
        ? api("/self/leaves", { method: "POST", body: JSON.stringify(leavePayload(values)) })
        : api(`/leaves/apply/${values.employeeId}`, { method: "POST", body: JSON.stringify(leavePayload(values)) });
    }
    if (type === "leave-approve") return api(`/leaves/approve/${id}`, { method: "PUT" });
    if (type === "leave-reject") return api(`/leaves/reject/${id}`, { method: "PUT" });
    if (type === "leave-balance") return api(`/leave-balances/${values.employeeId}`, { method: "POST", body: JSON.stringify({ totalLeaves: Number(values.totalLeaves) }) }).catch(() => api(`/leave-balances/${values.employeeId}`, { method: "PUT", body: JSON.stringify({ totalLeaves: Number(values.totalLeaves) }) }));
    if (type === "payroll-generate") return api("/payrolls/generate", { method: "POST", body: JSON.stringify(payrollPayload(values)) });
    if (type === "payroll-approve") return api(`/payrolls/${id}/approve`, { method: "PUT", body: JSON.stringify(payrollApprovalPayload(values)) });
    if (type === "performance-create") return api(`/performance/review/${values.employeeId}`, { method: "POST", body: JSON.stringify(performancePayload(values)) });
    if (type === "performance-edit") return api(`/performance/${id}`, { method: "PUT", body: JSON.stringify(performancePayload(values)) });
    if (type === "profile-edit") {
      const response = await api("/auth/profile", { method: "PUT", body: JSON.stringify({ username: values.username || null, email: values.email || null }) });
      state.user = { ...state.user, ...response };
      localStorage.setItem("nexushr_user", JSON.stringify(state.user));
      return response;
    }
    if (type === "avatar-edit") return saveAvatarFromForm(form);
    if (type === "password-change") return api("/auth/change-password", { method: "PUT", body: JSON.stringify(values) });
  }, "Operation completed");
}

async function saveAvatarFromForm(form) {
  const remove = form.querySelector("[name='removeAvatar']")?.checked;
  if (remove) {
    saveAvatar("");
    return;
  }

  const draft = state.avatarDraft || state.avatar || loadAvatar();
  if (!draft) return;
  const dataUrl = await renderAvatarToDataUrl(draft, state.avatarZoom, state.avatarOffsetX, state.avatarOffsetY);
  saveAvatar(dataUrl);
}

async function loadAvatarDraft(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  if (file.size > 5 * 1024 * 1024) throw new Error("Please choose an image smaller than 5 MB");
  state.avatarDraft = await fileToDataUrl(file);
  state.avatarZoom = 1;
  state.avatarOffsetX = 0;
  state.avatarOffsetY = 0;
}

function renderAvatarToDataUrl(src, zoom = 1, offsetX = 0, offsetY = 0) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      const safeZoom = Math.max(1, Math.min(3, Number(zoom) || 1));
      const scale = Math.max(size / image.width, size / image.height) * safeZoom;
      const width = image.width * scale;
      const height = image.height * scale;
      const x = (size - width) / 2 + Number(offsetX || 0);
      const y = (size - height) / 2 + Number(offsetY || 0);

      context.clearRect(0, 0, size, size);
      context.save();
      context.beginPath();
      context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      context.clip();
      context.drawImage(image, x, y, width, height);
      context.restore();
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("Could not resize image"));
    image.src = src;
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
}

function ensureAllowed(type, id) {
  const employeeSelfActions = ["attendance-check-in", "attendance-check-out", "leave-apply", "profile-edit", "avatar-edit", "password-change"];
  if (isEmployeeRole()) {
    if (!employeeSelfActions.includes(type) && type !== "payroll-view" && type !== "leave-view") {
      throw new Error("This operation is restricted for employee accounts.");
    }
    if (["attendance-check-in", "attendance-check-out", "leave-apply"].includes(type) && !currentEmployeeId()) {
      throw new Error("No employee record is linked to this login. Ask HR/Admin to add your employee record with this email.");
    }
  }

  if (type.startsWith("employee-") || type === "user-create") {
    if (!canManageEmployees()) throw new Error("Only HR/Admin can manage employees and credentials.");
  }
  if (type === "employee-delete") {
    const employee = byId(state.data.employees, id);
    if (employee && isOwnEmployee(employee)) {
      throw new Error("You cannot delete your own employee record.");
    }
  }
  if (type.startsWith("department-") && !canManageDepartments()) throw new Error("Only HR/Admin can manage departments.");
  if (["leave-approve", "leave-reject", "leave-balance"].includes(type) && !canReviewLeave()) throw new Error("Only HR/Admin can review leave.");
  if (type.startsWith("payroll-") && type !== "payroll-view" && !canManagePayroll()) throw new Error("Only HR/Admin can manage payroll.");
  if (type.startsWith("performance-") && !canManagePerformance()) throw new Error("Only HR/Admin can manage performance reviews.");

  if (isEmployeeRole() && id) {
    const record = byId([...state.data.leaves, ...state.data.payrolls, ...state.data.performances], id);
    if (record && !ownsEmployeeRecord(record)) throw new Error("Employees can only access their own records.");
  }
}

function employeePayload(v) {
  return {
    firstName: v.firstName,
    lastName: v.lastName,
    email: v.email,
    departmentId: Number(v.departmentId),
    designation: v.designation,
    salary: Number(v.salary),
    employeeCode: v.employeeCode,
    phoneNumber: v.phoneNumber,
    joiningDate: v.joiningDate,
    status: v.status
  };
}

function departmentPayload(v) {
  return { departmentCode: v.departmentCode, departmentName: v.departmentName, description: v.description || "" };
}

function leavePayload(v) {
  return { leaveType: v.leaveType, startDate: v.startDate, endDate: v.endDate, reason: v.reason };
}

function payrollPayload(v) {
  return { employeeId: Number(v.employeeId), month: Number(v.month), year: Number(v.year), bonus: Number(v.bonus || 0) };
}

function payrollApprovalPayload(v) {
  return { bonus: Number(v.bonus || 0), deductions: Number(v.deductions || 0), approvedBy: v.approvedBy };
}

function performancePayload(v) {
  return { goal: v.goal, rating: Number(v.rating), comments: v.comments || "", reviewerName: v.reviewerName, status: v.status || "COMPLETED" };
}

async function mutate(task, successMessage) {
  state.loading = true;
  state.error = "";
  state.notice = "";
  render();
  try {
    await task();
    state.modal = null;
    state.notice = successMessage;
    await loadBackendData({ quiet: true });
  } catch (error) {
    state.loading = false;
    state.error = error.message;
    render();
  }
}

async function downloadPayslip(id) {
  await mutate(async () => {
    let response;
    try {
      const path = isEmployeeRole() ? `/self/payslips/${id}` : `/payslips/${id}`;
      response = await fetch(apiUrl(path), { headers: { Authorization: `Bearer ${state.token}` } });
    } catch {
      throw new Error(connectionErrorMessage());
    }
    if (!response.ok) throw new Error(`Payslip download failed with status ${response.status}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `payslip-${id}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, "Payslip downloaded");
}

function filterRows(rows, textFn) {
  const query = state.search.trim().toLowerCase();
  if (!query) return rows;
  return rows.filter(row => textFn(row).toLowerCase().includes(query));
}

function countStatus(rows, status) {
  return rows.filter(row => String(row.status || "").toUpperCase() === status).length;
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function attendanceOverviewCard(rows) {
  const total = rows.length;
  const present = countStatus(rows, "PRESENT");
  const absent = countStatus(rows, "ABSENT");
  const late = countStatus(rows, "LATE");
  const halfDay = countStatus(rows, "HALF_DAY");
  const attended = present + late + halfDay;
  const attendanceRate = total ? Math.round((attended / total) * 100) : 0;
  const scope = isEmployeeRole() ? "your records" : "all employee records";

  return `
    <div class="card">
      <div class="card-head">
        <h2 class="section-title">Attendance Overview</h2>
        <button class="mini-select">${isEmployeeRole() ? "My Records" : "All Records"}</button>
      </div>
      <div class="attendance-summary simple">
        <div class="attendance-total">
          <strong>${attended} of ${total}</strong>
          <span>${attendanceRate}% attended across ${scope}</span>
        </div>
        <div class="attendance-breakdown">
          ${attendanceStat("Present", present, "green")}
          ${attendanceStat("Absent", absent, "red")}
          ${attendanceStat("Late", late, "yellow")}
          ${attendanceStat("Half Day", halfDay, "blue")}
        </div>
        <p class="muted">Late and half-day records are counted as attended, but shown separately for clarity.</p>
      </div>
    </div>
  `;
}

function attendanceStat(label, value, color) {
  return `<div class="attendance-stat"><span class="dot ${color}"></span><div><strong>${esc(value)}</strong><small>${esc(label)}</small></div></div>`;
}

function employeeProgressMetrics(attendance, payrolls) {
  const present = countStatus(attendance, "PRESENT");
  const absent = countStatus(attendance, "ABSENT");
  const late = countStatus(attendance, "LATE");
  const halfDay = countStatus(attendance, "HALF_DAY");
  const salaryTillDate = sum(payrolls, "netSalary");

  return [
    metric("P", "Present Days", present, "Your own attendance", "good"),
    metric("A", "Absent Days", absent, "Your own attendance", "bad"),
    metric("L", "Late / Half Days", late + halfDay, `${late} late, ${halfDay} half-day`, "bad"),
    metric("IN", "Salary Till Date", money(salaryTillDate), "Approved/generated payroll total", "good")
  ].join("");
}

function departmentDistribution(departments, employees) {
  if (departments.length) {
    return departments.slice(0, 5).map((department, index) => [
      department.departmentName || `Department ${index + 1}`,
      department.employeeCount ?? employees.filter(employee => employee.departmentId === department.id || employee.departmentName === department.departmentName).length,
      ["#7b5cff", "#ff6a7b", "#ffc247", "#d85cff", "#55a6ff"][index]
    ]);
  }
  return [];
}

function recentLeaves(leaves) {
  return leaves.slice(-4).reverse().map(leave => [leave.employeeName || "-", leave.leaveType || "Leave", `${leave.totalDays || 0} days`, leave.status || "-"]);
}

function recentEmployees(employees) {
  return employees.slice(-4).reverse().map(employee => [employeeName(employee), employee.designation || departmentName(employee), displayDate(employee.joiningDate), ""]);
}

function recentPayrolls(payrolls) {
  return payrolls.slice(-4).reverse().map(payroll => [payroll.employeeName || "-", `${payroll.month || "-"} / ${payroll.year || "-"}`, money(payroll.netSalary), payroll.status || "-"]);
}

function metric(icon, label, value, trend, type) {
  return `<div class="card metric-card"><div class="metric-label"><span class="metric-icon">${esc(icon)}</span><span>${esc(label)}</span></div><div class="metric-value">${esc(value)}</div><div class="trend ${type} small">${esc(trend)}</div></div>`;
}

function donutCard(title, rows, alt = false) {
  const safeRows = rows.length ? rows : [["No data", 0, "var(--muted)"]];
  return `<div class="card"><div class="card-head"><h2 class="section-title">${esc(title)}</h2></div><div class="donut-row"><div class="donut ${alt ? "alt" : ""}"></div><div class="legend">${safeRows.map(([name, value, color]) => `<div class="legend-row"><span><span class="dot" style="background:${color}"></span>${esc(name)}</span><strong>${esc(value)}</strong></div>`).join("")}</div></div></div>`;
}

function miniList(title, rows) {
  const body = rows.length ? rows.map(row => `<div class="list-item"><span class="avatar sm"></span><div><div class="list-title">${esc(row[0])}</div><div class="list-sub">${esc(row[1])}</div></div><span class="pill ${row[3] ? pillColor(row[3]) : "blue"}">${esc(row[3] || row[2] || "-")}</span></div>`).join("") : emptyState("No records yet.");
  return `<div class="card"><div class="card-head"><h2 class="section-title">${esc(title)}</h2></div><div class="list">${body}</div></div>`;
}

function table(headers, rows) {
  const body = rows.length ? rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${headers.length}">${emptyState("No records found.")}</td></tr>`;
  return `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function paginateRows(rows, requestedPage, pageSize) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.max(1, Math.min(Number(requestedPage) || 1, totalPages));
  const start = (page - 1) * pageSize;
  return {
    rows: rows.slice(start, start + pageSize),
    page,
    totalPages,
    totalRows: rows.length,
    start: rows.length ? start + 1 : 0,
    end: Math.min(start + pageSize, rows.length)
  };
}

function employeePagination(paged) {
  return recordPagination(paged, "employee", "employees", EMPLOYEE_PAGE_SIZE);
}

function recordPagination(paged, key, label, pageSize = ATTENDANCE_PAGE_SIZE) {
  const numbers = Array.from({ length: paged.totalPages }, (_, index) => index + 1)
    .map(page => `<button class="page-number ${page === paged.page ? "active" : ""}" data-record-page="${esc(key)}" data-page-number="${page}" type="button" aria-label="${esc(label)} page ${page}">${page}</button>`)
    .join("");
  if (paged.totalPages <= 1 && paged.totalRows <= pageSize) return "";
  return `<div class="pagination-bar"><span>Showing ${paged.start}-${paged.end} of ${paged.totalRows} ${esc(label)}</span><div class="pagination">${numbers}</div></div>`;
}

function emptyState(message) {
  return `<div class="empty-state">${esc(message)}</div>`;
}

function employeeCell(name) {
  return `<div class="employee-cell"><span class="avatar sm"></span><span>${esc(name)}</span></div>`;
}

function rowActions(actions) {
  return `<div class="actions">${actions.map(([label, action, id]) => `<button class="outline-button compact" data-action="${esc(action)}" data-id="${esc(id || "")}">${esc(label)}</button>`).join("")}</div>`;
}

function statusPill(status) {
  return `<span class="pill ${pillColor(status)}">${esc(status)}</span>`;
}

function pillColor(status) {
  const key = String(status || "").toLowerCase();
  if (key.includes("inactive") || key.includes("rejected") || key.includes("absent") || key.includes("disabled")) return "red";
  if (key.includes("active") || key.includes("approved") || key.includes("present") || key.includes("generated") || key.includes("completed") || key.includes("enabled")) return "green";
  if (key.includes("pending") || key.includes("late") || key.includes("half")) return "yellow";
  return "blue";
}

function stars(count) {
  const value = Math.max(0, Math.min(5, count));
  return `<span class="rating">${"*".repeat(value)}${"-".repeat(5 - value)}</span>`;
}

function bindEvents() {
  document.querySelector("[data-auth-form]")?.addEventListener("submit", event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    login(username, password);
  });

  document.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => {
    state.activePage = button.dataset.page;
    state.search = "";
    state.employeePage = 1;
    state.attendancePage = 1;
    render();
  }));

  document.querySelectorAll("[data-theme-toggle]").forEach(button => button.addEventListener("click", () => {
    setTheme(state.theme === "dark" ? "light" : "dark");
    render();
  }));

  document.querySelector("[data-search]")?.addEventListener("input", event => {
    state.search = event.target.value;
    if (state.activePage === "employees") state.employeePage = 1;
    if (state.activePage === "attendance") state.attendancePage = 1;
    render();
    const search = document.querySelector("[data-search]");
    if (search) {
      search.focus();
      search.setSelectionRange(search.value.length, search.value.length);
    }
  });

  document.querySelector("[data-refresh]")?.addEventListener("click", () => loadBackendData());
  document.querySelector("[data-logout]")?.addEventListener("click", logout);
  document.querySelectorAll("[data-record-page]").forEach(button => button.addEventListener("click", () => {
    const page = Number(button.dataset.pageNumber) || 1;
    if (button.dataset.recordPage === "employee") state.employeePage = page;
    if (button.dataset.recordPage === "attendance") state.attendancePage = page;
    render();
  }));
  document.querySelector("[data-profile-avatar]")?.addEventListener("click", () => {
    state.activePage = "profile";
    clearAvatarDraft();
    state.modal = { type: "avatar-edit" };
    state.search = "";
    render();
  });

  document.querySelectorAll("[data-open-modal]").forEach(button => button.addEventListener("click", () => {
    if (button.dataset.openModal === "avatar-edit") clearAvatarDraft();
    state.modal = { type: button.dataset.openModal };
    state.error = "";
    state.notice = "";
    render();
  }));

  document.querySelectorAll("[data-action]").forEach(button => button.addEventListener("click", () => {
    if (button.dataset.action === "payslip-download") {
      downloadPayslip(button.dataset.id);
      return;
    }
    state.modal = { type: button.dataset.action, id: button.dataset.id };
    state.error = "";
    state.notice = "";
    render();
  }));

  document.querySelectorAll("[data-close-modal]").forEach(element => element.addEventListener("click", event => {
    if (event.target === element || element.matches("button")) {
      state.modal = null;
      clearAvatarDraft();
      render();
    }
  }));

  document.querySelector("[name='avatar']")?.addEventListener("change", async event => {
    try {
      await loadAvatarDraft(event.target.files?.[0]);
      render();
    } catch (error) {
      state.error = error.message || "Could not load image";
      render();
    }
  });

  document.querySelectorAll("[data-avatar-control]").forEach(input => input.addEventListener("input", event => {
    const value = Number(event.target.value);
    if (event.target.name === "avatarZoom") state.avatarZoom = value;
    if (event.target.name === "avatarOffsetX") state.avatarOffsetX = value;
    if (event.target.name === "avatarOffsetY") state.avatarOffsetY = value;
    const image = document.querySelector(".avatar-cropper img");
    if (image) {
      image.style.transform = `translate(${state.avatarOffsetX}px, ${state.avatarOffsetY}px) scale(${state.avatarZoom})`;
    }
  }));

  document.querySelector("[data-modal-form]")?.addEventListener("submit", event => {
    event.preventDefault();
    submitModal(event.currentTarget);
  });
}

setTheme(state.theme);
render();
if (state.token) {
  loadBackendData();
  startRefresh();
}
