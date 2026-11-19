
const input = document.getElementById("input");
const result = document.getElementById("result");

const charCount = document.getElementById("charCount");
const byteCount = document.getElementById("byteCount");
const timeCount = document.getElementById("timeCount");

const historyBox = document.getElementById("history");

let historyData = [];

function testText() {
  const text = input.value;

  const start = performance.now();

  const chars = Array.from(text);
  const bytes = new TextEncoder().encode(text).length;

  const elapsed = performance.now() - start;

  charCount.textContent = chars.length;
  byteCount.textContent = bytes + " B";
  timeCount.textContent = elapsed.toFixed(3) + " ms";

  result.textContent =
    "PENGUJIAN SELESAI\n\n" +
    "Status: Berhasil\n" +
    "Jumlah karakter: " + chars.length + "\n" +
    "Ukuran UTF-8: " + bytes + " byte\n" +
    "Waktu pemrosesan: " + elapsed.toFixed(3) + " ms";

  addHistory(chars.length, bytes, elapsed);
}

function analyzeUnicode() {
  const chars = Array.from(input.value);

  const details = chars.slice(0, 100).map((char, index) => {
    const code = char.codePointAt(0)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0");

    return (
      (index + 1) + ". " +
      JSON.stringify(char) +
      " = U+" + code
    );
  });

  result.textContent =
    "UNICODE ANALYZER\n\n" +
    "Jumlah karakter: " + chars.length +
    "\n\n" +
    (details.join("\n") || "Tidak ada karakter.") +
    (chars.length > 100
      ? "\n\nMenampilkan 100 karakter pertama."
      : "");
}

function addHistory(chars, bytes, elapsed) {
  historyData.unshift({
    chars,
    bytes,
    elapsed: elapsed.toFixed(3)
  });

  historyData = historyData.slice(0, 10);

  renderHistory();
}

function renderHistory() {
  historyBox.replaceChildren();

  if (historyData.length === 0) {
    historyBox.textContent = "Belum ada riwayat.";
    return;
  }

  historyData.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "history-item";

    div.textContent =
      "Pengujian " + (index + 1) +
      "\nKarakter: " + item.chars +
      "\nUkuran: " + item.bytes + " byte" +
      "\nWaktu: " + item.elapsed + " ms";

    historyBox.appendChild(div);
  });
}

document.getElementById("testBtn")
  .addEventListener("click", testText);

document.getElementById("analyzeBtn")
  .addEventListener("click", analyzeUnicode);

document.getElementById("clearBtn")
  .addEventListener("click", () => {
    historyData = [];
    renderHistory();
  });
