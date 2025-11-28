
function search() {
    const date = document.getElementById("date").value;
    const studentList = document.getElementById("studentList");

    if (!date) {
        studentList.style.display = "none";
        return;
    }

    studentList.style.display = "block";
    loadAttendanceForDate(date);
}

function markAttendance() {
    const date = document.getElementById("date").value;

    if (!date) {
        alert("Please select a date before marking attendance.");
        return;
    }

    const rows = document.querySelectorAll(".student-row");
    const todayRecords = [];

    rows.forEach(row => {
        const name = row.querySelector(".student-name").textContent.trim();
        const presentCB = row.querySelector(".present-cb");
        const absentCB = row.querySelector(".absent-cb");
        const actionsDiv = row.querySelector(".actions");

        let statusValue = "";
        let statusText = "";

        if (presentCB && presentCB.checked && !(absentCB && absentCB.checked)) {
            statusValue = "Present";
            statusText = "<span style='color:green;font-weight:bold;'>Present</span>";
        } else if (absentCB && absentCB.checked && !(presentCB && presentCB.checked)) {
            statusValue = "Absent";
            statusText = "<span style='color:red;font-weight:bold;'>Absent</span>";
        } else {
            statusValue = "Not Marked";
            statusText = "<span style='color:gray;'>Not Marked</span>";
        }

        actionsDiv.innerHTML = statusText;

        todayRecords.push({
            date: date,
            name: name,
            status: statusValue
        });
    });

    // remove old records only for THIS date, keep all other days
    let existing = JSON.parse(localStorage.getItem("attendanceRecords") || "[]");
    existing = existing.filter(r => r.date !== date);

    existing.push(...todayRecords);

    localStorage.setItem("attendanceRecords", JSON.stringify(existing));

    alert("Attendance saved for " + date);
}

// Load attendance for a selected date (after refresh + Search)
function loadAttendanceForDate(date) {
    const records = JSON.parse(localStorage.getItem("attendanceRecords") || "[]");
    const rows = document.querySelectorAll(".student-row");

    rows.forEach(row => {
        const name = row.querySelector(".student-name").textContent.trim();
        const actionsDiv = row.querySelector(".actions");

        const record = records.find(r => r.date === date && r.name === name);

        if (record) {
            if (record.status === "Present") {
                actionsDiv.innerHTML =
                    "<span style='color:green;font-weight:bold;'>Present</span>";
            } else if (record.status === "Absent") {
                actionsDiv.innerHTML =
                    "<span style='color:red;font-weight:bold;'>Absent</span>";
            } else {
                actionsDiv.innerHTML =
                    "<span style='color:gray;'>Not Marked</span>";
            }
        } else {
            // if no record for that date, show checkboxes so you can mark
            actionsDiv.innerHTML = `
                <label><input type="checkbox" class="present-cb"> Present</label>
                <label><input type="checkbox" class="absent-cb"> Absent</label>
            `;
        }
    });
}

function fetchReport() {
    const selectedDate = document.getElementById("date").value;

    if (!selectedDate) {
        alert("Please select a date");
        return;
    }

    const records = JSON.parse(localStorage.getItem("attendanceRecords") || "[]");
    const rows = document.querySelectorAll(".student-row");

  
    const filteredRecords = records.filter(r => r.date <= selectedDate);

    
    const latestPerDay = {};
    filteredRecords.forEach(r => {
        const key = r.name + "|" + r.date;
        latestPerDay[key] = r; 
    });

    const uniqueRecords = Object.values(latestPerDay);

   
    const summary = {};

    uniqueRecords.forEach(r => {
        if (!summary[r.name]) {
            summary[r.name] = { present: 0, total: 0 };
        }

        // Count this day as a class only if Present or Absent
        if (r.status === "Present" || r.status === "Absent") {
            summary[r.name].total += 1;
        }

        if (r.status === "Present") {
            summary[r.name].present += 1;
        }
    });

    // ✅ Update UI
    rows.forEach(row => {
        const name = row.querySelector(".student-name").textContent.trim();
        const actionsDiv = row.querySelector(".actions");
        const data = summary[name];

        if (!data || data.total === 0) {
            actionsDiv.innerHTML = `
                <span style="margin-right:20px;">0/0</span>
                <span>0%</span>
            `;
            return;
        }

        const percentage = ((data.present / data.total) * 100).toFixed(0);

        actionsDiv.innerHTML = `
            <span style="margin-right:20px; font-weight:bold;">
                ${data.present}/${data.total}
            </span>
            <span style="font-weight:bold; color:${percentage == 100 ? "green" : "orange"};">
                ${percentage}%
            </span>
        `;
    });
}
