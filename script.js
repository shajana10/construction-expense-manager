let editingId = null;
let chart = null;

/* ================= LOGIN ================= */

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  const { error } =
    await window.supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    alert(error.message);
    return;
  }

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";

  populateMonths();
  loadExpenses();
}

/* ================= LOGOUT ================= */

async function logout() {
  await window.supabaseClient.auth.signOut();

  document.getElementById("app").style.display = "none";
  document.getElementById("loginBox").style.display = "flex";
}

/* ================= SESSION CHECK ================= */

window.addEventListener("DOMContentLoaded", async () => {

  const { data } =
    await window.supabaseClient.auth.getSession();

  if (data.session) {

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").style.display = "block";

    populateMonths();
    loadExpenses();

  } else {

    document.getElementById("loginBox").style.display = "flex";
    document.getElementById("app").style.display = "none";

  }

});

/* ================= MONTH FILTER ================= */

function populateMonths() {

  const select =
    document.getElementById("monthFilter");

  if (select.options.length > 1) return;

  const year = new Date().getFullYear();

  for (let i = 1; i <= 12; i++) {

    const month =
      String(i).padStart(2, "0");

    const option =
      document.createElement("option");

    option.value = `${year}-${month}`;
    option.textContent = `${year}-${month}`;

    select.appendChild(option);
  }
}

/* ================= LOAD EXPENSES ================= */

async function loadExpenses() {

  const { data, error } =
    await window.supabaseClient
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  let expenses = data || [];

  const selectedMonth =
    document.getElementById("monthFilter").value;

  if (selectedMonth !== "all") {

    expenses = expenses.filter(expense =>
      expense.date.startsWith(selectedMonth)
    );

  }

  renderTable(expenses);
  updateDashboard(expenses);
  updateChart(expenses);
}

/* ================= RENDER TABLE ================= */

function renderTable(expenses) {

  const tbody =
    document.getElementById("expense-list");

  tbody.innerHTML = "";

  expenses.forEach(expense => {

    tbody.innerHTML += `
      <tr>
        <td>${expense.name}</td>
        <td>${expense.category}</td>
        <td>₹${expense.amount}</td>
        <td>${expense.date}</td>
        <td>
          <button onclick="editExpense('${expense.id}')">
            Edit
          </button>

          <button onclick="deleteExpense('${expense.id}')">
            Delete
          </button>
        </td>
      </tr>
    `;

  });
}

/* ================= ADD / UPDATE ================= */

document
  .getElementById("expense-form")
  .addEventListener("submit", async (e) => {

    e.preventDefault();

    const name =
      document.getElementById("name").value;

    const category =
      document.getElementById("category").value;

    const amount =
      document.getElementById("amount").value;

    const date =
      document.getElementById("date").value;

    if (!name || !amount || !date) {
      alert("Please fill all fields");
      return;
    }

    if (editingId) {

      const { error } =
        await window.supabaseClient
          .from("expenses")
          .update({
            name,
            category,
            amount,
            date
          })
          .eq("id", editingId);

      if (error) {
        console.error(error);
        return;
      }

      editingId = null;

      document.getElementById("submit-btn")
        .textContent = "Add Expense";

    } else {

      const { error } =
        await window.supabaseClient
          .from("expenses")
          .insert([
            {
              name,
              category,
              amount,
              date
            }
          ]);

      if (error) {
        console.error(error);
        return;
      }
    }

    document
      .getElementById("expense-form")
      .reset();

    loadExpenses();

  });

/* ================= EDIT ================= */

window.editExpense = async function (id) {

  const { data, error } =
    await window.supabaseClient
      .from("expenses")
      .select("*")
      .eq("id", id)
      .single();

  if (error) {
    console.error(error);
    return;
  }

  document.getElementById("name").value =
    data.name;

  document.getElementById("category").value =
    data.category;

  document.getElementById("amount").value =
    data.amount;

  document.getElementById("date").value =
    data.date;

  editingId = id;

  document.getElementById("submit-btn")
    .textContent = "Update Expense";
};

/* ================= DELETE ================= */

window.deleteExpense = async function (id) {

  const confirmDelete =
    confirm("Delete this expense?");

  if (!confirmDelete) return;

  const { error } =
    await window.supabaseClient
      .from("expenses")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  loadExpenses();
};

/* ================= DASHBOARD ================= */

function updateDashboard(expenses) {

  let total = 0;
  let material = 0;
  let labour = 0;

  expenses.forEach(expense => {

    const amount =
      Number(expense.amount);

    total += amount;

    if (expense.category === "material") {
      material += amount;
    }

    if (expense.category === "labour") {
      labour += amount;
    }

  });

  document.getElementById("totalAmount")
    .innerText = `₹${total}`;

  document.getElementById("materialTotal")
    .innerText = `₹${material}`;

  document.getElementById("labourTotal")
    .innerText = `₹${labour}`;
}

/* ================= PIE CHART ================= */

function updateChart(expenses) {

  const container =
    document.getElementById("chartContainer");

  if (!expenses.length) {

    container.style.display = "none";

    if (chart) {
      chart.destroy();
      chart = null;
    }

    return;
  }

  container.style.display = "block";

  let material = 0;
  let labour = 0;

  expenses.forEach(expense => {

    const amount =
      Number(expense.amount);

    if (expense.category === "material") {
      material += amount;
    }

    if (expense.category === "labour") {
      labour += amount;
    }

  });

  if (chart) {
    chart.destroy();
  }

  const ctx =
    document.getElementById("expenseChart");

  chart = new Chart(ctx, {

    type: "pie",

    data: {

      labels: [
        "Material",
        "Labour"
      ],

      datasets: [
        {
          data: [
            material,
            labour
          ]
        }
      ]

    }

  });
}