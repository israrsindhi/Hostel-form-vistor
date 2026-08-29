/* ============================================================
   Bridge Way Boys Hostel — Daily Hosteler Form
   ------------------------------------------------------------
   1. Deploy the included "google-apps-script.gs" as a Web App
      in Google Apps Script (see SETUP-INSTRUCTIONS.md).
   2. Paste the deployment URL below.
   ============================================================ */
const SCRIPT_URL = "AKfycbzaVv2MzW2ot-QpJMkyCP-a7cclBa36_mhBBYonu9Pcl2igi-daItyqnL8B5X6WOoHksA";

const form = document.getElementById("hostelForm");
const submitBtn = document.getElementById("submitBtn");
const statusMsg = document.getElementById("statusMsg");
const nicFileInput = document.getElementById("nicFile");
const nicPreview = document.getElementById("nicPreview");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Show a preview when an image NIC file is chosen
nicFileInput.addEventListener("change", () => {
  const file = nicFileInput.files[0];
  nicPreview.hidden = true;
  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    setStatus("NIC file is too large. Please choose a file under 5MB.", "error");
    nicFileInput.value = "";
    return;
  }

  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      nicPreview.src = e.target.result;
      nicPreview.hidden = false;
    };
    reader.readAsDataURL(file);
  }
});

function setStatus(text, type) {
  statusMsg.textContent = text;
  statusMsg.className = "status" + (type ? " " + type : "");
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // includes data:mime;base64, prefix
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("", "");

  if (SCRIPT_URL.includes("PASTE_YOUR")) {
    setStatus("Form is not connected to Google Sheets yet. See SETUP-INSTRUCTIONS.md.", "error");
    return;
  }

  const nicFile = nicFileInput.files[0];
  if (!nicFile) {
    setStatus("Please attach a copy of the CNIC / NIC.", "error");
    return;
  }
  if (nicFile.size > MAX_FILE_SIZE) {
    setStatus("NIC file is too large. Please choose a file under 5MB.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";
  setStatus("Uploading registration, please wait...", "");

  try {
    const nicBase64 = await fileToBase64(nicFile);

    const payload = {
      fullName: form.fullName.value.trim(),
      fatherName: form.fatherName.value.trim(),
      cnic: form.cnic.value.trim(),
      phone: form.phone.value.trim(),
      address: form.address.value.trim(),
      emergencyPhone: form.emergencyPhone.value.trim(),
      checkinDate: form.checkinDate.value,
      days: form.days.value,
      roomType: form.roomType.value,
      nicFileName: nicFile.name,
      nicFileType: nicFile.type,
      nicFile: nicBase64,
      submittedAt: new Date().toISOString()
    };

    // Google Apps Script web apps don't return readable CORS responses
    // when called with a simple fetch, so we submit with 'no-cors' and
    // treat the request as successful once it has been sent.
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    setStatus("Registration submitted successfully. Welcome to Bridge Way Boys Hostel!", "success");
    form.reset();
    nicPreview.hidden = true;
  } catch (err) {
    console.error(err);
    setStatus("Something went wrong while submitting. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Registration";
  }
});
