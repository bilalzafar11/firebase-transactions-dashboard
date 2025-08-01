// ✅ Firebase setup from CDN (browser imports)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔐 Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDM9fpO8WBuar4lM487auML6NHctODapHs",
  authDomain: "dashboard-app-390fa.firebaseapp.com",
  projectId: "dashboard-app-390fa",
  storageBucket: "dashboard-app-390fa.appspot.com",
  messagingSenderId: "724170240324",
  appId: "1:724170240324:web:bc88d9ce1de5f7ed882711",
  measurementId: "G-ZZ45VKXFG1"
};

// 🔌 Initialize Firebase services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// 🚀 Once page loads
window.addEventListener("DOMContentLoaded", () => {
  // 🌙 Theme toggle button (if present)
  const themeToggleBtn = document.getElementById("themeToggle");
  if (themeToggleBtn) {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") document.body.classList.add("dark");

    themeToggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const activeTheme = document.body.classList.contains("dark") ? "dark" : "light";
      localStorage.setItem("theme", activeTheme);
    });
  }

  // 📈 Line chart setup (if canvas exists)
  const lineCanvas = document.getElementById("lineChart")?.getContext("2d");
  if (lineCanvas) {
    new Chart(lineCanvas, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label: "Sales",
          data: [120, 190, 300, 250, 320, 280, 350],
          fill: true,
          backgroundColor: "rgba(52, 152, 219, 0.2)",
          borderColor: "#3498db",
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: "#3498db"
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        interaction: { mode: "nearest", axis: "x", intersect: false },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 50 } } }
      }
    });
  }

  // 🥧 Pie chart setup (if canvas exists)
  const pieCanvas = document.getElementById("pieChart")?.getContext("2d");
  if (pieCanvas) {
    new Chart(pieCanvas, {
      type: "pie",
      data: {
        labels: ["Mobile", "Desktop", "Tablet"],
        datasets: [{
          label: "Users",
          data: [55, 30, 15],
          backgroundColor: ["#1abc9c", "#3498db", "#9b59b6"],
          borderColor: "#fff",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 14, padding: 15 }
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed}%`
            }
          }
        }
      }
    });
  }

  // ➕ Add dummy transactions on button click
  const btn = document.getElementById("addDummyBtn");
  if (btn) {
    btn.addEventListener("click", addDummyTransactions);
  }

  // 🔄 Real-time display of Firestore transactions
  const transactionTableBody = document.querySelector("tbody");
  const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    transactionTableBody.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.user || "-"}</td>
        <td>${data.date || "-"}</td>
        <td>${data.amount || "-"}</td>
        <td>${data.status || "-"}</td>
      `;
      transactionTableBody.appendChild(row);
    });
  });
});

// 📥 Function to add 5 dummy transactions to Firestore
// 📥 Function to add 5 dummy transactions to Firestore with random past dates
async function addDummyTransactions() {
  console.log("✅ Adding dummy transactions...");

  const names = ["Ali Raza", "Ahmed Khan", "Sara Malik", "Zara Ali", "Usman Tariq"];
  const statuses = ["Completed", "Pending", "Cancelled"];

  try {
    for (let i = 0; i < 5; i++) {
      const randomUser = names[Math.floor(Math.random() * names.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomAmount = `$${Math.floor(Math.random() * 500 + 100)}`;

      // 🔁 Generate random past date (within 7 days)
      const daysAgo = Math.floor(Math.random() * 7); // 0–6
      const randomDateObj = new Date();
      randomDateObj.setDate(randomDateObj.getDate() - daysAgo);
      const randomDate = randomDateObj.toISOString().split("T")[0];

      await addDoc(collection(db, "transactions"), {
        user: randomUser,
        date: randomDate,
        amount: randomAmount,
        status: randomStatus,
        timestamp: serverTimestamp()
      });
    }

    alert("✅ Dummy transactions added!");
  } catch (err) {
    console.error("❌ Error:", err);
    alert("❌ Failed to add transactions.");
  }
}

const dateFilter = document.getElementById("date-filter");
const statusFilter = document.getElementById("status-filter");

function setupFilters() {
  dateFilter.addEventListener("change", loadFilteredTransactions);
  statusFilter.addEventListener("change", loadFilteredTransactions);
  loadFilteredTransactions(); // Initial load
}

function loadFilteredTransactions() {
  const selectedDate = dateFilter.value;
  const selectedStatus = statusFilter.value;

  const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
  onSnapshot(q, (snapshot) => {
    const tableBody = document.getElementById("transaction-table-body");
    tableBody.innerHTML = "";

    snapshot.forEach((doc) => {
      const data = doc.data();

      let transactionDate = "-";
      if (data.date?.toDate) {
        transactionDate = data.date.toDate().toISOString().split("T")[0];
      } else if (typeof data.date === "string") {
        transactionDate = data.date;
      }

      const isDateMatch = !selectedDate || transactionDate === selectedDate;
      const isStatusMatch = !selectedStatus || data.status === selectedStatus;

      if (isDateMatch && isStatusMatch) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${data.user || data.name || "-"}</td>
          <td>${transactionDate}</td>
          <td>${data.amount || "-"}</td>
          <td>${data.status || "-"}</td>
        `;
        tableBody.appendChild(row);
      }
    });
  });
}

setupFilters(); // 👈 required to activate filtering


function loadTransactions() {
  db.collection("transactions").onSnapshot((snapshot) => {
    const tableBody = document.getElementById("transaction-table-body");
    tableBody.innerHTML = ""; // Clear previous rows

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      const selectedDate = dateFilter.value;
      const selectedStatus = statusFilter.value;

      const transactionDate = data.date?.toDate?.().toISOString().split("T")[0];

      const isDateMatch = !selectedDate || transactionDate === selectedDate;
      const isStatusMatch = !selectedStatus || data.status === selectedStatus;

      if (isDateMatch && isStatusMatch) {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${data.name}</td>
          <td>${transactionDate}</td>
          <td>$${data.amount}</td>
          <td>${data.status}</td>
        `;

        tableBody.appendChild(row);
      }
    });
  });
}

dateFilter.addEventListener("change", loadTransactions);
statusFilter.addEventListener("change", loadTransactions);

// Load on page ready
loadTransactions();


// 🌍 Make the function available globally (for testing if needed)
window.addDummyTransactions = addDummyTransactions;
