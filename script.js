
const $ = id => document.getElementById(id);

const input = $("input");
const result = $("result");
const historyBox = $("history");

let historyData = [];
let latestBenchmark = null;

function addHistory(title, detail) {
  historyData.unshift({ title, detail });
  historyData = historyData.slice(0, 10);
  renderHistory();
}

function renderHistory() {
  historyBox.replaceChildren();

  if (!historyData.length) {
    historyBox.textContent = "Belum ada riwayat.";
    return;
  }

  historyData.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.textContent = item.title + "\n" + item.detail;
    historyBox.appendChild(div);
  });
}

// Device information
const deviceInfo = {
  device: navigator.userAgent,
  platform: navigator.platform || "Tidak diketahui",
  cores: navigator.hardwareConcurrency || "Tidak tersedia",
  memory: navigator.deviceMemory || "Tidak tersedia"
};

$("deviceInfo").textContent =
  "Platform: " + deviceInfo.platform +
  "\nLogical cores: " + deviceInfo.cores +
  "\nMemory estimate: " +
  (typeof deviceInfo.memory === "number"
    ? deviceInfo.memory + " GB"
    : deviceInfo.memory);

// Unicode testing
function testText() {
  const text = input.value;
  const start = performance.now();

  const chars = Array.from(text);
  const bytes = new TextEncoder().encode(text).length;

  const elapsed = performance.now() - start;

  $("charCount").textContent = chars.length;
  $("byteCount").textContent = bytes + " B";
  $("timeCount").textContent = elapsed.toFixed(3) + " ms";

  result.textContent =
    "PENGUJIAN SELESAI\n\n" +
    "Karakter: " + chars.length +
    "\nUkuran UTF-8: " + bytes + " byte" +
    "\nWaktu: " + elapsed.toFixed(3) + " ms";

  addHistory("Unicode Test", chars.length + " karakter, " + bytes + " byte");
}

// Unicode analysis
function analyzeUnicode() {
  const chars = Array.from(input.value);

  const details = chars.slice(0, 100).map((char, index) => {
    const code = char.codePointAt(0)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");

    return (index + 1) + ". " +
      JSON.stringify(char) + " = U+" + code;
  });

  result.textContent =
    "UNICODE ANALYZER\n\n" +
    "Total: " + chars.length + " karakter\n\n" +
    (details.join("\n") || "Tidak ada karakter.") +
    (chars.length > 100 ? "\n\nMenampilkan 100 pertama." : "");
}

// Bounded local benchmark
async function runBenchmark() {
  const button = $("benchmarkBtn");
  button.disabled = true;
  $("benchmarkResult").textContent = "Benchmark berjalan...";

  // Yield to browser before computation
  await new Promise(resolve => setTimeout(resolve, 50));

  const start = performance.now();
  let checksum = 0;

  // Fixed, modest workload
  for (let i = 0; i < 300000; i++) {
    checksum = (checksum + Math.sqrt(i + 1)) % 1000003;
  }

  const elapsed = performance.now() - start;

  latestBenchmark = {
    deviceName: $("deviceName").value.trim() || "Perangkat tanpa nama",
    elapsed: Number(elapsed.toFixed(3)),
    cores: deviceInfo.cores,
    checksum
  };

  const code = btoa(unescape(encodeURIComponent(
    JSON.stringify(latestBenchmark)
  )));

  $("benchmarkResult").textContent =
    "BENCHMARK SELESAI\n\n" +
    "Perangkat: " + latestBenchmark.deviceName +
    "\nWaktu: " + latestBenchmark.elapsed + " ms" +
    "\nChecksum: " + checksum +
    "\n\nKODE PERBANDINGAN:\n" + code;

  addHistory(
    "Device Benchmark",
    latestBenchmark.deviceName + " — " + elapsed.toFixed(3) + " ms"
  );

  button.disabled = false;
}

// Compare benchmark results
function compareDevices() {
  try {
    const code = $("compareCode").value.trim();
    const other = JSON.parse(
      decodeURIComponent(escape(atob(code)))
    );

    if (
      !latestBenchmark ||
      typeof other.elapsed !== "number" ||
      !Number.isFinite(other.elapsed) ||
      other.elapsed <= 0
    ) {
      throw new Error("Data benchmark tidak valid.");
    }

    const current = latestBenchmark;

    let faster;

    if (current.elapsed < other.elapsed) {
      faster = current.deviceName;
    } else if (other.elapsed < current.elapsed) {
      faster = other.deviceName;
    } else {
      faster = "Hasil sama";
    }

    $("compareResult").textContent =
      "HASIL PERBANDINGAN\n\n" +
      current.deviceName + ": " + current.elapsed + " ms\n" +
      other.deviceName + ": " + other.elapsed + " ms\n\n" +
      "Waktu lebih rendah: " + faster +
      "\n\nCatatan: hasil dipengaruhi kondisi browser, " +
      "suhu, dan aktivitas perangkat.";

  } catch (error) {
    $("compareResult").textContent =
      "Tidak dapat membaca kode.\nPastikan kode benchmark lengkap dan benar.";
  }
}

$("testBtn").addEventListener("click", testText);
$("analyzeBtn").addEventListener("click", analyzeUnicode);
$("benchmarkBtn").addEventListener("click", runBenchmark);
$("compareBtn").addEventListener("click", compareDevices);

$("clearBtn").addEventListener("click", () => {
  historyData = [];
  renderHistory();
});
