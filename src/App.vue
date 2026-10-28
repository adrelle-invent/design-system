<script setup>
import { ref, onMounted, computed } from "vue";

// Theme State
const theme = ref("system"); // 'light' | 'dark' | 'system'
const isResolvedDark = ref(false);
const hasSavedTheme = computed(() => localStorage.getItem("theme") !== null);

// UI States
const isDialogOpen = ref(false);
const isDrawerOpen = ref(false);
const isMobileSidebarOpen = ref(false);
const selectedUser = ref(null);
const nameInputRef = ref(null);
const searchQuery = ref("");
const tableFilter = ref("all"); // 'all' | 'active' | 'pending' | 'blocked'

// Users / Ledger Data
const defaultUsers = [
  {
    id: "USR-2041",
    name: "John Doe",
    email: "john@enterprise.io",
    role: "Admin",
    status: "Active",
    spent: 12450.0,
    created: "2026-09-21 08:30",
  },
  {
    id: "USR-2042",
    name: "Jane Smith",
    email: "jane@enterprise.io",
    role: "User",
    status: "Pending",
    spent: 4210.5,
    created: "2026-09-22 11:15",
  },
  {
    id: "USR-2043",
    name: "Mike Ross",
    email: "mike@enterprise.io",
    role: "User",
    status: "Blocked",
    spent: 850.0,
    created: "2026-09-23 14:02",
  },
  {
    id: "USR-2044",
    name: "Sarah Connor",
    email: "sarah@enterprise.io",
    role: "Manager",
    status: "Active",
    spent: 18900.25,
    created: "2026-09-24 16:45",
  },
];

const users = ref([...defaultUsers]);

// Form Input State
const newUser = ref({
  name: "",
  email: "",
  role: "User",
  status: "Active",
  spent: 1200.0,
  isActive: true,
  tier: "standard"
});

const userToDelete = ref(null);
const formErrors = ref([]);

// Filtered Users Computed
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesStatus =
      tableFilter.value === "all" ||
      user.status.toLowerCase() === tableFilter.value.toLowerCase();

    return matchesSearch && matchesStatus;
  });
});

// Theme Management Functions
const setTheme = (newTheme) => {
  theme.value = newTheme;
  localStorage.setItem("theme", newTheme);
  applyTheme();
};

const applyTheme = () => {
  const isDark =
    theme.value === "dark" ||
    (theme.value === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  isResolvedDark.value = isDark;

  if (theme.value === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  } else if (theme.value === "light") {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.remove("light");
  }
};

// User Actions
const saveUser = () => {
  formErrors.value = [];

  if (!newUser.value.name.trim()) {
    formErrors.value.push("Full name is required.");
  }
  if (!newUser.value.email.trim() || !newUser.value.email.includes("@")) {
    formErrors.value.push("Valid corporate email address is required.");
  }

  if (formErrors.value.length > 0) return;

  const nextIdNumber = 2040 + users.value.length + 1;
  users.value.push({
    id: `USR-${nextIdNumber}`,
    name: newUser.value.name,
    email: newUser.value.email,
    role: newUser.value.role,
    status: newUser.value.status,
    spent: Number(newUser.value.spent) || 0,
    created: new Date().toISOString().slice(0, 16).replace("T", " "),
  });

  // Reset Form
  newUser.value = {
    name: "",
    email: "",
    role: "User",
    status: "Active",
    spent: 1200.0,
  };
};

const openUserDrawer = (user) => {
  selectedUser.value = user;
  isDrawerOpen.value = true;
};

const confirmDelete = (index) => {
  userToDelete.value = index;
  isDialogOpen.value = true;
};

const deleteUser = () => {
  if (userToDelete.value !== null) {
    users.value.splice(userToDelete.value, 1);
    userToDelete.value = null;
  }
  isDialogOpen.value = false;
};

const restoreDefaultUsers = () => {
  users.value = [...defaultUsers];
};

const focusCreateInput = () => {
  if (nameInputRef.value) {
    nameInputRef.value.focus();
  }
};

const getBadgeVariant = (status) => {
  switch (status.toLowerCase()) {
    case "active":
      return "badge-success";
    case "pending":
      return "badge-warning";
    case "blocked":
      return "badge-danger";
    default:
      return "badge-neutral";
  }
};

const getBadgeDotColor = (status) => {
  switch (status.toLowerCase()) {
    case "active":
      return "badge-dot-success";
    case "pending":
      return "badge-dot-warning";
    case "blocked":
      return "badge-dot-danger";
    default:
      return "badge-dot-neutral";
  }
};

// Lifecycle Hooks
onMounted(() => {
  const saved = localStorage.getItem("theme");
  if (saved) {
    theme.value = saved;
  }
  applyTheme();

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", () => {
    if (theme.value === "system") {
      applyTheme();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      isDialogOpen.value = false;
      isDrawerOpen.value = false;
      isMobileSidebarOpen.value = false;
    }
  });
});
</script>

<template>
  <!-- APP SHELL -->
  <div class="app-shell">
    <!-- DESKTOP SIDEBAR -->
    <aside class="sidebar app-shell-sidebar">
      <div class="sidebar-header">
        <div class="flex items-center gap-2">
          <div
            class="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs"
          >
            AD
          </div>
          <span class="font-bold text-xs tracking-tight text-foreground"
            >Design System</span
          >
        </div>
        <span class="badge badge-mono text-[9px]">v1.6</span>
      </div>

      <div class="sidebar-content">
        <nav class="sidebar-menu">
          <a class="sidebar-item active" href="#">
            <span>Dashboard</span>
            <span class="sidebar-item-badge">4</span>
          </a>
          <a class="sidebar-item" href="#">
            <span>Members</span>
          </a>
          <a class="sidebar-item" href="#">
            <span>Projects</span>
          </a>
          <a class="sidebar-item" href="#">
            <span>Settings</span>
          </a>
        </nav>
      </div>

      <div class="sidebar-footer">
        <button class="button button-outline button-sm w-full">
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- MOBILE SIDEBAR DRAWER -->
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-50 flex md:hidden"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
        @click="isMobileSidebarOpen = false"
      ></div>

      <div
        class="relative flex w-full max-w-xs flex-1 flex-col bg-card border-r border-border h-full shadow-xl"
      >
        <div
          class="flex h-14 items-center justify-between px-4 border-b border-border"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs"
            >
              AD
            </div>
            <span class="font-bold text-xs tracking-tight text-foreground"
              >Design System</span
            >
          </div>
          <button
            @click="isMobileSidebarOpen = false"
            class="button button-ghost button-sm px-2"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <nav class="sidebar-menu">
            <a
              class="sidebar-item active"
              href="#"
              @click="isMobileSidebarOpen = false"
            >
              <span>Dashboard</span>
              <span class="sidebar-item-badge">4</span>
            </a>
            <a
              class="sidebar-item"
              href="#"
              @click="isMobileSidebarOpen = false"
            >
              <span>Members</span>
            </a>
            <a
              class="sidebar-item"
              href="#"
              @click="isMobileSidebarOpen = false"
            >
              <span>Projects</span>
            </a>
            <a
              class="sidebar-item"
              href="#"
              @click="isMobileSidebarOpen = false"
            >
              <span>Settings</span>
            </a>
          </nav>
        </div>

        <div class="p-4 border-t border-border">
          <button class="button button-outline button-sm w-full">
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MAIN APP SHELL -->
    <div class="app-shell-main">
      <!-- NAVBAR -->
      <header class="navbar">
        <div class="flex items-center gap-3">
          <button
            @click="isMobileSidebarOpen = true"
            class="md:hidden button button-outline button-sm px-2"
            aria-label="Open mobile menu"
          >
            Menu
          </button>

          <ol class="breadcrumb hidden sm:flex">
            <li class="breadcrumb-item"><a href="#">Console</a></li>
            <li class="breadcrumb-separator">/</li>
            <li class="breadcrumb-item"><a href="#">Design System</a></li>
            <li class="breadcrumb-separator">/</li>
            <li class="breadcrumb-item active">Operational Overview</li>
          </ol>
        </div>

        <div class="flex items-center gap-3">
          <!-- Segmented Theme Controller -->
          <div class="segmented-switcher">
            <button
              type="button"
              @click="setTheme('light')"
              :class="['segmented-tab', theme === 'light' ? 'active' : '']"
            >
              Light
            </button>
            <button
              type="button"
              @click="setTheme('dark')"
              :class="['segmented-tab', theme === 'dark' ? 'active' : '']"
            >
              Dark
            </button>
            <button
              type="button"
              @click="setTheme('system')"
              :class="['segmented-tab', theme === 'system' ? 'active' : '']"
            >
              System
            </button>
          </div>

          <button
            @click="focusCreateInput"
            class="button button-primary button-sm"
          >
            New Member
          </button>
        </div>
      </header>

      <!-- CONTENT BODY -->
      <main class="app-shell-content">
        <!-- COMMAND BAR HEADER -->
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border mb-6"
        >
          <div>
            <div class="flex items-center space-x-2">
              <span class="telemetry-pulse" />
              <h1 class="text-xl font-bold tracking-tight text-foreground">
                Design System Studio
              </h1>
            </div>
            <p
              class="text-xs text-neutral-foreground mt-1 flex items-center gap-2 font-medium"
            >
              <span class="font-mono">PROD-SYNC: ACTIVE</span>
              <span
                class="inline-block w-1 h-1 rounded-full bg-neutral-foreground/40"
              />
              <span>Modern SaaS Dashboard Aesthetic</span>
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="restoreDefaultUsers"
              class="button button-secondary button-sm"
            >
              Reset State
            </button>
            <button
              type="button"
              @click="openUserDrawer(users[0] || null)"
              class="button button-outline button-sm"
            >
              Preview Drawer
            </button>
          </div>
        </div>

        <!-- LEVEL 2 CLUSTER WELL & 5-LEVEL CONTAINER RHYTHM -->
        <div class="card-well mb-6">
          <div
            class="flex items-center justify-between pb-3 border-b border-border mb-4"
          >
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-foreground"
                >Cluster Telemetry</span
              >
              <span class="badge badge-success">
                <span class="badge-dot badge-dot-success" />
                <span>Healthy</span>
              </span>
            </div>
            <span class="font-mono text-xs text-neutral-foreground"
              >5-Level Container Rhythm</span
            >
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Level 3 Tile 1 -->
            <div class="card-tile">
              <div class="flex items-center justify-between">
                <span
                  class="text-[11px] font-semibold text-neutral-foreground uppercase tracking-wider"
                >
                  Active Accounts
                </span>
                <span class="badge badge-mono">COUNT</span>
              </div>
              <div class="mt-3 flex items-baseline space-x-2">
                <span class="stat-value">{{ users.length }}</span>
                <span class="text-xs text-neutral-foreground font-mono"
                  >accounts</span
                >
              </div>
              <div
                class="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs"
              >
                <span class="stat-change stat-change-positive">
                  +12.4% vs last cycle
                </span>
                <span class="text-neutral-foreground font-mono text-[10px]"
                  >REALTIME</span
                >
              </div>
            </div>

            <!-- Level 3 Tile 2 -->
            <div class="card-tile">
              <div class="flex items-center justify-between">
                <span
                  class="text-[11px] font-semibold text-neutral-foreground uppercase tracking-wider"
                >
                  Audited Receivables
                </span>
                <span class="badge badge-mono">USD</span>
              </div>
              <div class="mt-3 flex items-baseline space-x-2">
                <span class="stat-value">
                  ${{
                    users
                      .reduce((acc, u) => acc + (u.spent || 0), 0)
                      .toLocaleString("en-US", { minimumFractionDigits: 2 })
                  }}
                </span>
              </div>
              <div
                class="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs"
              >
                <span class="stat-change stat-change-positive">
                  +8.1% vs benchmark
                </span>
                <span class="text-neutral-foreground font-mono text-[10px]"
                  >VERIFIED</span
                >
              </div>
            </div>

            <!-- Level 3 Tile 3 -->
            <div class="card-tile">
              <div class="flex items-center justify-between">
                <span
                  class="text-[11px] font-semibold text-neutral-foreground uppercase tracking-wider"
                >
                  Security State
                </span>
                <span class="badge badge-mono">SOC2 AA</span>
              </div>
              <div class="mt-3 flex items-baseline space-x-2">
                <span class="stat-value">100.0%</span>
                <span class="text-xs text-neutral-foreground font-mono"
                  >compliant</span
                >
              </div>
              <div
                class="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs"
              >
                <span class="text-neutral-foreground font-mono text-[11px]">
                  Audited 4m ago
                </span>
                <span class="badge badge-success">Pass</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SPLIT LAYOUT: FORM & THEME TOKENS -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- CREATE MEMBER FORM -->
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">Register Member</h2>
              <p class="card-description">
                Strict input geometry with brand focus ring and validation.
              </p>
            </div>

            <form
              @submit.prevent="saveUser"
              class="card-content flex flex-col gap-4"
            >
              <!-- Error Banner -->
              <div v-if="formErrors.length > 0" class="form-error-banner">
                <div class="form-error-banner-title">
                  <span>Validation Incomplete</span>
                </div>
                <ul class="form-error-banner-list">
                  <li v-for="(err, idx) in formErrors" :key="idx">{{ err }}</li>
                </ul>
              </div>

              <div class="form-group">
                <label class="form-label" for="member-name">
                  Full Name <span class="form-label-required">*</span>
                </label>
                <input
                  id="member-name"
                  ref="nameInputRef"
                  v-model="newUser.name"
                  class="form-input"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  required
                />
                <span class="form-helper"
                  >Canonical identity on commercial invoices.</span
                >
              </div>

              <div class="form-group">
                <label class="form-label" for="member-email">
                  Corporate Email <span class="form-label-required">*</span>
                </label>
                <input
                  id="member-email"
                  v-model="newUser.email"
                  class="form-input"
                  type="email"
                  placeholder="alex@enterprise.io"
                  required
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label" for="member-role"
                    >Access Role</label
                  >
                  <select
                    id="member-role"
                    v-model="newUser.role"
                    class="form-select"
                  >
                    <option value="User">Standard User</option>
                    <option value="Manager">Department Manager</option>
                    <option value="Admin">Tenant Admin</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="member-status"
                    >Initial Status</label
                  >
                  <select
                    id="member-status"
                    v-model="newUser.status"
                    class="form-select"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending Approval</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="member-budget"
                  >Allocated Quota (USD)</label
                >
                <input
                  id="member-budget"
                  v-model.number="newUser.spent"
                  class="form-input font-mono"
                  type="number"
                  step="100"
                  placeholder="1200.00"
                />
              </div>

              <div class="form-group">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    id="member-active"
                    v-model="newUser.isActive"
                    class="form-checkbox w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    type="checkbox"
                  />
                  <span class="form-label mb-0">Active Member</span>
                </label>
              </div>

              <div class="form-group">
                <label class="form-label">Subscription Tier</label>
                <div class="flex items-center gap-6 mt-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="newUser.tier"
                      type="radio"
                      value="standard"
                      class="form-radio w-4 h-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <span class="text-sm font-medium">Standard</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="newUser.tier"
                      type="radio"
                      value="enterprise"
                      class="form-radio w-4 h-4 border-gray-300 text-primary focus:ring-primary"
                    />
                    <span class="text-sm font-medium">Enterprise</span>
                  </label>
                </div>
              </div>

              <div class="pt-2 flex items-center justify-between">
                <span class="text-xs text-neutral-foreground font-mono"
                  >ROLE: {{ newUser.role.toUpperCase() }}</span
                >
                <button type="submit" class="button button-primary">
                  <span>Register Account</span>
                </button>
              </div>
            </form>
          </div>

          <!-- THEME CONTROLLER & TOKEN INSPECTION -->
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">Token Matrix & Slate Parity</h2>
              <p class="card-description">
                Dark mode strictly built on slate-900 / slate-950 neutrals
                without pitch black.
              </p>
            </div>

            <div class="card-content flex flex-col gap-4">
              <!-- Mode Resolution Status -->
              <div class="card-well flex flex-col gap-2 text-xs">
                <div class="flex justify-between items-center">
                  <span class="text-neutral-foreground font-medium"
                    >Selected Theme:</span
                  >
                  <span
                    class="font-mono font-bold capitalize text-foreground"
                    >{{ theme }}</span
                  >
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-neutral-foreground font-medium"
                    >Resolved Canvas:</span
                  >
                  <span class="inline-flex items-center gap-1.5 font-bold">
                    <span class="w-2 h-2 rounded-full bg-primary" />
                    <span>{{
                      isResolvedDark
                        ? "Slate 950 (#020617)"
                        : "Slate 50 (#F8FAFC)"
                    }}</span>
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-neutral-foreground font-medium"
                    >Card Surface:</span
                  >
                  <span class="font-mono text-neutral-foreground">{{
                    isResolvedDark ? "#0F172A (slate-900)" : "#FFFFFF (white)"
                  }}</span>
                </div>
              </div>

              <!-- Color Palette Swatches -->
              <div>
                <span class="form-label mb-2 block"
                  >Authoritative Design Tokens</span
                >
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div
                    class="p-2 rounded-lg border border-border bg-card shadow-xs flex flex-col gap-1"
                  >
                    <div
                      class="h-6 rounded-md border border-border"
                      style="background-color: var(--primary)"
                    />
                    <span class="text-[10px] font-mono font-bold truncate"
                      >--primary</span
                    >
                    <span class="text-[9px] font-mono text-neutral-foreground"
                      >#0284C7</span
                    >
                  </div>
                  <div
                    class="p-2 rounded-lg border border-border bg-card shadow-xs flex flex-col gap-1"
                  >
                    <div
                      class="h-6 rounded-md border border-border"
                      style="background-color: var(--card)"
                    />
                    <span class="text-[10px] font-mono font-bold truncate"
                      >--card</span
                    >
                    <span class="text-[9px] font-mono text-neutral-foreground"
                      >Surface</span
                    >
                  </div>
                  <div
                    class="p-2 rounded-lg border border-border bg-card shadow-xs flex flex-col gap-1"
                  >
                    <div
                      class="h-6 rounded-md border border-border"
                      style="background-color: var(--border)"
                    />
                    <span class="text-[10px] font-mono font-bold truncate"
                      >--border</span
                    >
                    <span class="text-[9px] font-mono text-neutral-foreground"
                      >1px Stroke</span
                    >
                  </div>
                  <div
                    class="p-2 rounded-lg border border-border bg-card shadow-xs flex flex-col gap-1"
                  >
                    <div
                      class="h-6 rounded-md border border-border"
                      style="background-color: var(--success)"
                    />
                    <span class="text-[10px] font-mono font-bold truncate"
                      >--success</span
                    >
                    <span class="text-[9px] font-mono text-neutral-foreground"
                      >Emerald</span
                    >
                  </div>
                  <div
                    class="p-2 rounded-lg border border-border bg-card shadow-xs flex flex-col gap-1"
                  >
                    <div
                      class="h-6 rounded-md border border-border"
                      style="background-color: var(--warning)"
                    />
                    <span class="text-[10px] font-mono font-bold truncate"
                      >--warning</span
                    >
                    <span class="text-[9px] font-mono text-neutral-foreground"
                      >Amber</span
                    >
                  </div>
                  <div
                    class="p-2 rounded-lg border border-border bg-card shadow-xs flex flex-col gap-1"
                  >
                    <div
                      class="h-6 rounded-md border border-border"
                      style="background-color: var(--danger)"
                    />
                    <span class="text-[10px] font-mono font-bold truncate"
                      >--danger</span
                    >
                    <span class="text-[9px] font-mono text-neutral-foreground"
                      >Rose</span
                    >
                  </div>
                  <div
                    class="p-2 rounded-lg border border-border bg-card shadow-xs flex flex-col gap-1"
                  >
                    <div
                      class="h-6 rounded-md border border-border"
                      style="background-color: var(--primary-tint)"
                    />
                    <span class="text-[10px] font-mono font-bold truncate"
                      >--primary-tint</span
                    >
                    <span class="text-[9px] font-mono text-neutral-foreground"
                      >Blue Tint</span
                    >
                  </div>
                  <div
                    class="p-2 rounded-lg border border-border bg-card shadow-xs flex flex-col gap-1"
                  >
                    <div
                      class="h-6 rounded-md border border-border"
                      style="background-color: var(--card-nested)"
                    />
                    <span class="text-[10px] font-mono font-bold truncate"
                      >--card-nested</span
                    >
                    <span class="text-[9px] font-mono text-neutral-foreground"
                      >Well Tint</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- COMPONENT GALLERY: BUTTONS, BADGES, ALERTS -->
        <div class="card mb-6">
          <div class="card-header">
            <h2 class="card-title">Atomic Component Registry</h2>
            <p class="card-description">
              Unified design tokens across Action Controls, Rectangular Badges,
              and Semantic Alerts.
            </p>
          </div>

          <div class="card-content flex flex-col gap-6">
            <!-- Buttons Scale -->
            <div>
              <span class="form-label mb-2 block"
                >Action Buttons (rounded-lg, shadow-xs, cursor-pointer)</span
              >
              <div class="flex flex-wrap items-center gap-3">
                <button class="button button-primary">Primary Action</button>
                <button class="button button-secondary">
                  Secondary Outline
                </button>
                <button class="button button-accent">Subtle Tint</button>
                <button class="button button-destructive">Destructive</button>
                <button class="button button-ghost">Ghost</button>
                <button class="button button-link">Inline Link</button>
                <button class="button button-primary button-sm">
                  Compact (sm)
                </button>
                <button class="button button-primary button-lg">
                  Standard (lg)
                </button>
              </div>
            </div>

            <!-- Rectangular Badges -->
            <div>
              <span class="form-label mb-2 block"
                >Rectangular Status Badges (rounded-md, uppercase, with pulse
                dot)</span
              >
              <div class="flex flex-wrap items-center gap-3">
                <span class="badge badge-success">
                  <span class="badge-dot badge-dot-success" />
                  <span>Active</span>
                </span>
                <span class="badge badge-warning">
                  <span class="badge-dot badge-dot-warning" />
                  <span>Pending</span>
                </span>
                <span class="badge badge-danger">
                  <span class="badge-dot badge-dot-danger" />
                  <span>Blocked</span>
                </span>
                <span class="badge badge-info">
                  <span class="badge-dot badge-dot-info" />
                  <span>Telemetry</span>
                </span>
                <span class="badge badge-neutral badge-mono"> #INV-2041 </span>
              </div>
            </div>

            <!-- Semantic Alerts -->
            <div>
              <span class="form-label mb-2 block"
                >Semantic Feedback Banners (1px Tinted Border)</span
              >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="alert alert-success">
                  <div class="alert-content">
                    <div class="alert-title">Operational Confirmation</div>
                    <div class="alert-description">
                      Changes committed successfully to the primary cluster
                      ledger.
                    </div>
                  </div>
                </div>

                <div class="alert alert-info">
                  <div class="alert-content">
                    <div class="alert-title">System Advisory</div>
                    <div class="alert-description">
                      Scheduled maintenance planned for Sunday 02:00 UTC.
                    </div>
                  </div>
                </div>

                <div class="alert alert-warning">
                  <div class="alert-content">
                    <div class="alert-title">Quota Threshold Warning</div>
                    <div class="alert-description">
                      Tenant volume has reached 88% of provisioned throughput.
                    </div>
                  </div>
                </div>

                <div class="alert alert-danger">
                  <div class="alert-content">
                    <div class="alert-title">Authorization Safeguard</div>
                    <div class="alert-description">
                      Invalid signature supplied for API token revocation.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TABULAR LEDGER -->
        <div class="table-container mb-8">
          <!-- Table Control Bar -->
          <div
            class="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div>
              <h2 class="text-xs font-semibold text-foreground">
                Audited Commercial Ledger
              </h2>
              <p class="text-[11px] text-neutral-foreground mt-0.5">
                Strict monospace numeric alignment and rectangular status chips.
              </p>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Filter by name, ID or email..."
                class="form-input max-w-xs"
              />

              <!-- Filter Segmented Tabs -->
              <div class="segmented-switcher hidden lg:inline-flex">
                <button
                  type="button"
                  @click="tableFilter = 'all'"
                  :class="[
                    'segmented-tab',
                    tableFilter === 'all' ? 'active' : '',
                  ]"
                >
                  All
                </button>
                <button
                  type="button"
                  @click="tableFilter = 'active'"
                  :class="[
                    'segmented-tab',
                    tableFilter === 'active' ? 'active' : '',
                  ]"
                >
                  Active
                </button>
                <button
                  type="button"
                  @click="tableFilter = 'pending'"
                  :class="[
                    'segmented-tab',
                    tableFilter === 'pending' ? 'active' : '',
                  ]"
                >
                  Pending
                </button>
              </div>
            </div>
          </div>

          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col" class="py-3 px-4">Account ID</th>
                <th scope="col" class="py-3 px-4">Member Name</th>
                <th scope="col" class="py-3 px-4">Corporate Email</th>
                <th scope="col" class="py-3 px-4">Role</th>
                <th scope="col" class="py-3 px-4">Status</th>
                <th scope="col" class="py-3 px-4 text-right">Invoiced (USD)</th>
                <th scope="col" class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(user, index) in filteredUsers" :key="user.id">
                <td class="py-3 px-4 font-mono font-bold text-foreground">
                  {{ user.id }}
                </td>
                <td class="py-3 px-4 font-semibold text-foreground">
                  {{ user.name }}
                </td>
                <td class="py-3 px-4 text-neutral-foreground">
                  {{ user.email }}
                </td>
                <td class="py-3 px-4">
                  <span class="badge badge-neutral">{{ user.role }}</span>
                </td>
                <td class="py-3 px-4">
                  <span :class="['badge', getBadgeVariant(user.status)]">
                    <span
                      :class="['badge-dot', getBadgeDotColor(user.status)]"
                    />
                    <span>{{ user.status }}</span>
                  </span>
                </td>
                <td
                  class="py-3 px-4 text-right font-mono font-bold text-foreground"
                >
                  ${{
                    (user.spent || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })
                  }}
                </td>
                <td class="py-3 px-4 text-right whitespace-nowrap">
                  <div class="inline-flex items-center gap-1.5 justify-end">
                    <button
                      type="button"
                      @click="openUserDrawer(user)"
                      class="button button-outline button-sm"
                    >
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      @click="confirmDelete(index)"
                      class="button button-destructive button-sm"
                      title="Delete account"
                    >
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredUsers.length === 0">
                <td colspan="7" class="table-empty">
                  No matching account records found for query "{{
                    searchQuery
                  }}".
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Table Footer Pagination -->
          <div class="table-footer">
            <span>
              Showing {{ filteredUsers.length }} of {{ users.length }} member
              accounts
            </span>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                disabled
                class="button button-outline button-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled
                class="button button-outline button-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- 5-REGION SAFEGUARD MODAL DIALOG -->
  <div
    v-if="isDialogOpen"
    class="dialog-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-dialog-title"
    @click.self="isDialogOpen = false"
  >
    <div class="dialog dialog-sm">
      <div class="dialog-header">
        <h3 id="delete-dialog-title" class="dialog-title text-danger">
          <span>Confirm Revocation</span>
        </h3>
        <button
          type="button"
          @click="isDialogOpen = false"
          class="button button-ghost button-sm px-2"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <div class="dialog-body">
        <p class="text-neutral-foreground leading-relaxed">
          This operation will immediately revoke access and delete the target
          member account. All active session tokens will be permanently revoked.
        </p>
        <div class="card-well text-xs font-mono">STATUS: SAFEGUARD_ENGAGED</div>
      </div>

      <div class="dialog-footer">
        <button
          type="button"
          class="button button-secondary button-sm"
          @click="isDialogOpen = false"
        >
          Cancel
        </button>
        <button
          type="button"
          class="button button-destructive button-sm"
          @click="deleteUser"
        >
          Revoke Access
        </button>
      </div>
    </div>
  </div>

  <!-- SLIDE-OVER PREVIEW DRAWER -->
  <div
    v-if="isDrawerOpen"
    class="dialog-overlay"
    role="dialog"
    aria-modal="true"
    @click.self="isDrawerOpen = false"
  >
    <div class="drawer">
      <div class="drawer-header">
        <div>
          <h3 class="text-sm font-bold text-foreground">
            Member Account Telemetry
          </h3>
          <p class="text-[11px] text-neutral-foreground font-mono mt-0.5">
            {{ selectedUser?.id || "USR-PREVIEW" }}
          </p>
        </div>
        <button
          type="button"
          @click="isDrawerOpen = false"
          class="button button-ghost button-sm px-2"
          aria-label="Close drawer"
        >
          ✕
        </button>
      </div>

      <div class="drawer-body">
        <div class="card-well space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-foreground">{{
              selectedUser?.name
            }}</span>
            <span
              :class="[
                'badge',
                getBadgeVariant(selectedUser?.status || 'Active'),
              ]"
            >
              <span
                :class="[
                  'badge-dot',
                  getBadgeDotColor(selectedUser?.status || 'Active'),
                ]"
              />
              <span>{{ selectedUser?.status }}</span>
            </span>
          </div>
          <div class="text-xs text-neutral-foreground font-mono">
            {{ selectedUser?.email }}
          </div>
        </div>

        <div class="space-y-2">
          <span class="form-label">Ledger Information</span>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-lg border border-border bg-card">
              <span class="text-[11px] text-neutral-foreground block mb-1"
                >Invoiced Quota</span
              >
              <span class="font-mono font-bold text-base text-foreground">
                ${{
                  (selectedUser?.spent || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })
                }}
              </span>
            </div>
            <div class="p-3 rounded-lg border border-border bg-card">
              <span class="text-[11px] text-neutral-foreground block mb-1"
                >Access Role</span
              >
              <span class="font-semibold text-sm text-foreground">
                {{ selectedUser?.role }}
              </span>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <span class="form-label">Audit Timestamps</span>
          <div
            class="p-3 rounded-lg border border-border bg-card flex flex-col gap-1.5 text-xs"
          >
            <div class="flex justify-between">
              <span class="text-neutral-foreground">Created:</span>
              <span class="font-mono text-foreground">{{
                selectedUser?.created || "2026-09-25 12:00"
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-foreground">Tenancy Verification:</span>
              <span
                class="font-mono text-success font-bold"
                >VERIFIED_OK</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="drawer-footer">
        <button
          type="button"
          class="button button-secondary button-sm"
          @click="isDrawerOpen = false"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
</template>
