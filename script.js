
/* =====================================================
   BLOODPRINT - FIREBASE + SIMULASI SCAN
   ===================================================== */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  query,
  limitToLast
} from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


/* =====================================================
   1. KONFIGURASI FIREBASE
   ===================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyAYIlqjnE9m2IhS6--67fwo4o7p2P6Rvto",
  authDomain: "bloodprint-17e06.firebaseapp.com",
  databaseURL:
    "https://bloodprint-17e06-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bloodprint-17e06",
  storageBucket: "bloodprint-17e06.firebasestorage.app",
  messagingSenderId: "1072351451840",
  appId: "1:1072351451840:web:b5db80d0a871c2c206eb25"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);


/* =====================================================
   2. ELEMEN DASHBOARD
   ===================================================== */

const bloodButtons =
  document.querySelectorAll(".blood-option");

const resultBlood =
  document.getElementById("resultBlood");

const accuracy =
  document.getElementById("accuracy");

const accuracyCircle =
  document.getElementById("accuracyCircle");

const toast =
  document.getElementById("toast");

const scanButton =
  document.getElementById("scanBtn");

const sendButton =
  document.getElementById("sendBtn");

const patientIdInput =
  document.getElementById("patientId");

const patientNameInput =
  document.getElementById("patientName");

const historyBody =
  document.getElementById("historyBody");

const dateElement =
  document.getElementById("date");

const timeElement =
  document.getElementById("time");


/* =====================================================
   3. VARIABEL
   ===================================================== */

let selectedBlood = "A+";
let currentResult = null;
let activeUser = null;
let unsubscribeHistory = null;


/* =====================================================
   4. NOTIFIKASI
   ===================================================== */

function showToast(message) {
  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}


/* =====================================================
   5. TANGGAL DAN WAKTU
   ===================================================== */

function updateDateTime() {
  const now = new Date();

  if (dateElement) {
    dateElement.textContent =
      new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }).format(now);
  }

  if (timeElement) {
    timeElement.textContent =
      now.toLocaleTimeString("id-ID", {
        hour12: false
      });
  }
}

updateDateTime();
setInterval(updateDateTime, 1000);


/* =====================================================
   6. AKURASI
   ===================================================== */

function setAccuracy(value) {
  const safeValue = Math.max(0, Math.min(100, value));

  if (accuracy) {
    accuracy.textContent = safeValue;
  }

  if (accuracyCircle) {
    const radius = 78;
    const circumference = 2 * Math.PI * radius;

    accuracyCircle.style.strokeDasharray = circumference;
    accuracyCircle.style.strokeDashoffset =
      circumference * (1 - safeValue / 100);
  }
}

setAccuracy(98);


/* =====================================================
   7. FORM LOGIN FIREBASE
   ===================================================== */

function createLoginScreen() {
  if (document.getElementById("firebaseLoginScreen")) {
    return;
  }

  const style = document.createElement("style");

  style.textContent = `
    #firebaseLoginScreen {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: #f4f7fb;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    #firebaseLoginScreen .login-card {
      width: 100%;
      max-width: 390px;
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 8px 35px rgba(0,0,0,.12);
    }

    #firebaseLoginScreen h2 {
      margin-top: 0;
      color: #b91c32;
    }

    #firebaseLoginScreen input {
      box-sizing: border-box;
      display: block;
      width: 100%;
      padding: 12px;
      margin: 12px 0;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 14px;
    }

    #firebaseLoginScreen button {
      width: 100%;
      padding: 13px;
      border: 0;
      border-radius: 8px;
      background: #b91c32;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }

    #firebaseLoginMessage {
      color: #b91c32;
      font-size: 13px;
      margin-top: 12px;
      overflow-wrap: anywhere;
    }

    #firebaseLoginScreen .login-subtitle {
      color: #64748b;
      font-size: 14px;
      line-height: 1.5;
    }
  `;

  document.head.appendChild(style);

  const screen = document.createElement("div");
  screen.id = "firebaseLoginScreen";

  screen.innerHTML = `
    <form class="login-card" id="firebaseLoginForm">
      <h2>BLOODPRINT</h2>
      <p class="login-subtitle">
        Login untuk mengakses dashboard dan database.
      </p>

      <label for="firebaseEmail">Email</label>
      <input
        id="firebaseEmail"
        type="email"
        autocomplete="username"
        placeholder="Email akun Firebase"
        required
      >

      <label for="firebasePassword">Password</label>
      <input
        id="firebasePassword"
        type="password"
        autocomplete="current-password"
        placeholder="Password akun Firebase"
        required
      >

      <button id="firebaseLoginButton" type="submit">
        LOGIN
      </button>

      <div id="firebaseLoginMessage" role="status"></div>
    </form>
  `;

  document.body.appendChild(screen);

  const form = document.getElementById("firebaseLoginForm");
  const message = document.getElementById("firebaseLoginMessage");
  const loginButton = document.getElementById("firebaseLoginButton");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email =
      document.getElementById("firebaseEmail").value.trim();

    const password =
      document.getElementById("firebasePassword").value;

    loginButton.disabled = true;
    loginButton.textContent = "MEMERIKSA...";
    message.textContent = "";

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login Firebase:", error);

      message.textContent =
        error.code === "auth/invalid-credential"
          ? "Email atau password salah."
          : error.code === "auth/too-many-requests"
          ? "Terlalu banyak percobaan. Coba lagi nanti."
          : "Login gagal: " + error.message;
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "LOGIN";
    }
  });
}


/* =====================================================
   8. STATUS LOGIN DAN LOGOUT
   ===================================================== */

function updateAccountInfo(user) {
  let accountBox = document.getElementById("firebaseAccountBox");

  if (!accountBox) {
    accountBox = document.createElement("div");
    accountBox.id = "firebaseAccountBox";

    Object.assign(accountBox.style, {
      position: "fixed",
      right: "12px",
      bottom: "12px",
      zIndex: "1000",
      background: "white",
      padding: "10px 12px",
      borderRadius: "8px",
      boxShadow: "0 2px 12px rgba(0,0,0,.15)",
      font: "12px Arial, sans-serif",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      maxWidth: "calc(100vw - 24px)"
    });

    document.body.appendChild(accountBox);
  }

  accountBox.replaceChildren();

  const label = document.createElement("span");
  label.textContent = "Login: " + user.email;
  label.style.overflowWrap = "anywhere";

  const logoutButton = document.createElement("button");
  logoutButton.textContent = "Keluar";

  Object.assign(logoutButton.style, {
    border: "0",
    background: "#b91c32",
    color: "white",
    padding: "7px 10px",
    borderRadius: "6px",
    cursor: "pointer"
  });

  logoutButton.addEventListener("click", async () => {
    try {
      await signOut(auth);
      showToast("Kamu sudah logout.");
    } catch (error) {
      console.error(error);
      showToast("Logout gagal.");
    }
  });

  accountBox.append(label, logoutButton);
}


/* =====================================================
   9. PILIH GOLONGAN DARAH
   ===================================================== */

bloodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    bloodButtons.forEach((item) =>
      item.classList.remove("selected")
    );

    button.classList.add("selected");
    selectedBlood = button.dataset.blood;

    showToast("Golongan " + selectedBlood + " dipilih.");
  });
});


/* =====================================================
   10. SIMULASI SCAN
   ===================================================== */

if (scanButton) {
  scanButton.addEventListener("click", async () => {
    if (!activeUser) {
      showToast("Login Firebase terlebih dahulu.");
      return;
    }

    const patientId = patientIdInput.value.trim();
    const patientName = patientNameInput.value.trim();

    if (!patientId || !patientName) {
      showToast("Masukkan ID dan nama pasien terlebih dahulu.");
      return;
    }

    scanButton.disabled = true;

    const scanText = scanButton.querySelector("span:nth-child(2)");

    if (scanText) {
      scanText.textContent = "MENGIDENTIFIKASI...";
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // HASIL SIMULASI, BUKAN PREDIKSI CNN ASLI
      const cnnResult = "A+";
      const cnnConfidence = 98;

      resultBlood.textContent = cnnResult;
      setAccuracy(cnnConfidence);

      selectedBlood = cnnResult;

      bloodButtons.forEach((button) => {
        button.classList.toggle(
          "selected",
          button.dataset.blood === cnnResult
        );
      });

      currentResult = {
        patientId,
        patientName,
        bloodGroup: cnnResult,
        confidence: cnnConfidence,
        source: "SIMULATION",
        createdAt: Date.now(),
        createdAtText: new Date().toLocaleString("id-ID")
      };

      const resultPatient =
        document.getElementById("resultPatient");

      if (resultPatient) {
        resultPatient.textContent =
          patientName + " (" + patientId + ")";
      }

      showToast(
        "Simulasi selesai: " +
        cnnResult +
        " (" + cnnConfidence + "%). Tekan KIRIM untuk menyimpan."
      );

    } catch (error) {
      console.error(error);
      showToast("Simulasi gagal.");
    } finally {
      scanButton.disabled = false;

      if (scanText) {
        scanText.textContent = "MULAI SCAN";
      }
    }
  });
}


/* =====================================================
   11. KIRIM / SIMPAN HASIL KE FIREBASE
   ===================================================== */

if (sendButton) {
  sendButton.addEventListener("click", async () => {
    if (!activeUser) {
      showToast("Login Firebase terlebih dahulu.");
      return;
    }

    if (!currentResult) {
      showToast("Lakukan simulasi scan terlebih dahulu.");
      return;
    }

    sendButton.disabled = true;
    sendButton.textContent = "MENYIMPAN...";

    try {
      const historyRef = ref(
        db,
        "results/" + activeUser.uid
      );

      const newRecordRef = push(historyRef);

      await set(newRecordRef, {
        ...currentResult,
        bloodGroup: selectedBlood,
        savedAt: Date.now()
      });

      showToast("Hasil berhasil disimpan ke Firebase.");

      currentResult = null;

    } catch (error) {
      console.error("Gagal menyimpan data:", error);

      showToast(
        "Gagal menyimpan data. Periksa koneksi dan Rules Firebase."
      );
    } finally {
      sendButton.disabled = false;

      sendButton.innerHTML = `
        <span class="send-icon">➤</span>
        KIRIM
      `;
    }
  });
}


/* =====================================================
   12. RIWAYAT PASIEN DARI FIREBASE
   ===================================================== */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getBloodClass(blood) {
  const classes = {
    "A+": "blood-a",
    "A-": "blood-a-minus",
    "AB+": "blood-ab",
    "AB-": "blood-ab",
    "B+": "blood-b",
    "B-": "blood-b",
    "O+": "blood-o",
    "O-": "blood-o"
  };

  return classes[blood] || "";
}

function renderHistory(records) {
  if (!historyBody) return;

  if (records.length === 0) {
    historyBody.innerHTML = `
      <tr>
        <td colspan="6">Belum ada data tersimpan di Firebase.</td>
      </tr>
    `;
    return;
  }

  historyBody.innerHTML = records
    .map((record, index) => {
      const date = new Date(
        Number(record.createdAt || record.savedAt || Date.now())
      ).toLocaleString("id-ID");

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHTML(record.patientId)}</td>
          <td>${escapeHTML(record.patientName)}</td>
          <td>
            <span class="blood-tag ${getBloodClass(record.bloodGroup)}">
              ${escapeHTML(record.bloodGroup)}
            </span>
          </td>
          <td>${escapeHTML(record.confidence)}%</td>
          <td>${escapeHTML(date)}</td>
        </tr>
      `;
    })
    .join("");
}

function listenToHistory(user) {
  if (unsubscribeHistory) {
    unsubscribeHistory();
    unsubscribeHistory = null;
  }

  const historyRef = query(
    ref(db, "results/" + user.uid),
    limitToLast(100)
  );

  unsubscribeHistory = onValue(
    historyRef,
    (snapshot) => {
      const records = [];

      snapshot.forEach((child) => {
        records.push({
          id: child.key,
          ...child.val()
        });
      });

      records.sort(
        (a, b) =>
          Number(b.createdAt || b.savedAt || 0) -
          Number(a.createdAt || a.savedAt || 0)
      );

      renderHistory(records);

      const historyInfo =
        document.getElementById("historyInfo");

      if (historyInfo) {
        historyInfo.textContent =
          "Menampilkan " + records.length + " data dari Firebase";
      }
    },
    (error) => {
      console.error("Gagal membaca riwayat:", error);
      showToast("Riwayat gagal dibaca. Periksa Rules Firebase.");
    }
  );
}


/* =====================================================
   13. STATUS AUTENTIKASI
   ===================================================== */

createLoginScreen();

onAuthStateChanged(auth, (user) => {
  activeUser = user;

  const loginScreen =
    document.getElementById("firebaseLoginScreen");

  if (user) {
    if (loginScreen) {
      loginScreen.remove();
    }

    updateAccountInfo(user);
    listenToHistory(user);

    showToast("Login Firebase berhasil.");
  } else {
    if (unsubscribeHistory) {
      unsubscribeHistory();
      unsubscribeHistory = null;
    }

    const accountBox =
      document.getElementById("firebaseAccountBox");

    if (accountBox) {
      accountBox.remove();
    }

    if (historyBody) {
      historyBody.innerHTML = `
        <tr>
          <td colspan="6">Login untuk melihat riwayat pasien.</td>
        </tr>
      `;
    }

    createLoginScreen();
  }
});
