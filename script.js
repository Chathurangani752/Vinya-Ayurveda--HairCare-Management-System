// HTML elements
const profileForm = document.getElementById("profileForm");
const progressForm = document.getElementById("progressForm");
const profileMessage = document.getElementById("profileMessage");
const progressMessage = document.getElementById("progressMessage");
const recommendationResults = document.getElementById("recommendationResults");
const progressTable = document.getElementById("progressTable");
const emptyRecords = document.getElementById("emptyRecords");

// Browser storage keys (demo only)
const PROFILE_KEY = "vinyaDemoProfile";
const PROGRESS_KEY = "vinyaDemoProgress";

let progressRecords = readStorage(PROGRESS_KEY, []);

// Read saved data
function readStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        return fallback;
    }
}

// Save data in this browser
function saveStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        return false;
    }
}

// Save customer profile
profileForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const profile = {
        name: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        hairType: document.getElementById("hairType").value,
        scalpType: document.getElementById("scalpType").value,
        concern: document.getElementById("concern").value,
        washFrequency: document.getElementById("washFrequency").value,
        routine: document.getElementById("routine").value.trim()
    };

    if (!profile.name || !profile.email || !profile.hairType ||
        !profile.scalpType || !profile.concern) {
        profileMessage.textContent = "Please complete all required fields.";
        return;
    }

    if (saveStorage(PROFILE_KEY, profile)) {
        profileMessage.textContent = "Your profile has been saved in this browser.";
        showRecommendations(profile);
    } else {
        profileMessage.textContent =
            "Could not save the profile. Browser storage may be unavailable.";
    }
});

// Load previously saved demo profile
function loadProfile() {
    const profile = readStorage(PROFILE_KEY, null);
    if (!profile) return;

    document.getElementById("fullName").value = profile.name || "";
    document.getElementById("email").value = profile.email || "";
    document.getElementById("hairType").value = profile.hairType || "";
    document.getElementById("scalpType").value = profile.scalpType || "";
    document.getElementById("concern").value = profile.concern || "";
    document.getElementById("washFrequency").value =
        profile.washFrequency || "2-3 times per week";
    document.getElementById("routine").value = profile.routine || "";

    showRecommendations(profile);
}

// Make suggestions based on selected hair concern and scalp type
function showRecommendations(profile) {
    const suggestions = [];

    const concernTips = {
        "Hair Fall": {
            title: "Gentle Hair Care",
            text: "Avoid tight hairstyles and rough brushing. Sudden or persistent hair loss should be assessed by a healthcare professional."
        },
        "Dry Hair": {
            title: "Moisture Care",
            text: "Use a suitable conditioner and reduce excessive heat styling."
        },
        "Dandruff": {
            title: "Scalp Care",
            text: "Consider an evidence-based anti-dandruff shampoo. Seek professional advice if the problem continues."
        },
        "Hair Breakage": {
            title: "Reduce Breakage",
            text: "Handle wet hair gently and limit heat, tight hairstyles and harsh chemical treatments."
        },
        "Hair Growth": {
            title: "Healthy Hair Routine",
            text: "Use gentle hair care, eat a balanced diet and track changes consistently. No routine guarantees faster growth."
        },
        "Scalp Itching": {
            title: "Comfortable Scalp",
            text: "Avoid products that irritate your scalp. Persistent itching, redness or sores need professional assessment."
        }
    };

    const scalpTips = {
        "Dry": {
            title: "Dry Scalp Care",
            text: "Choose gentle, non-irritating products. Stop using any product that makes irritation worse."
        },
        "Oily": {
            title: "Oily Scalp Care",
            text: "Wash as needed with a suitable shampoo and avoid heavy products directly on the scalp."
        },
        "Sensitive": {
            title: "Sensitive Scalp Care",
            text: "Choose non-irritating products where possible and test new products carefully."
        },
        "Normal": {
            title: "Maintain Your Routine",
            text: "Keep a consistent routine with products that suit your hair and scalp."
        },
        "Not sure": {
            title: "Know Your Scalp",
            text: "Observe how your scalp feels between washes. Ask a professional if you are unsure."
        }
    };

    if (concernTips[profile.concern]) {
        suggestions.push(concernTips[profile.concern]);
    }

    if (scalpTips[profile.scalpType]) {
        suggestions.push(scalpTips[profile.scalpType]);
    }

    suggestions.push({
        title: "Track Your Progress",
        text: "Record hair length and condition regularly using the same measurement method."
    });

    recommendationResults.replaceChildren();

    suggestions.forEach(function(item) {
        const column = document.createElement("div");
        column.className = "col-md-6";

        const card = document.createElement("div");
        card.className = "recommendation-card";

        const heading = document.createElement("h3");
        heading.textContent = item.title;

        const paragraph = document.createElement("p");
        paragraph.textContent = item.text;

        card.append(heading, paragraph);
        column.appendChild(card);
        recommendationResults.appendChild(column);
    });
}

// Show recommendations when the button is clicked
document.getElementById("getRecommendations").addEventListener("click", function() {
    const profile = readStorage(PROFILE_KEY, null);

    if (!profile) {
        recommendationResults.textContent = "Please save your profile first.";
        return;
    }

    showRecommendations(profile);
});

// Add progress record
progressForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const record = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        date: document.getElementById("progressDate").value,
        length: document.getElementById("hairLength").value,
        condition: document.getElementById("hairCondition").value,
        notes: document.getElementById("progressNotes").value.trim()
    };

    if (!record.date || record.length === "" ||
        Number(record.length) < 0 || Number(record.length) > 300) {
        progressMessage.textContent = "Please enter a valid date and hair length.";
        return;
    }

    const updatedRecords = [...progressRecords, record];

    if (saveStorage(PROGRESS_KEY, updatedRecords)) {
        progressRecords = updatedRecords;
        renderProgress();
        progressForm.reset();
        setTodayDate();
        progressMessage.textContent = "Your progress record has been added.";
    } else {
        progressMessage.textContent = "Could not save this record in browser storage.";
    }
});

// Show all progress records
function renderProgress() {
    progressTable.replaceChildren();
    emptyRecords.hidden = progressRecords.length > 0;

    progressRecords.forEach(function(record) {
        const row = document.createElement("tr");

        [record.date, record.length, record.condition, record.notes || "-"]
            .forEach(function(value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "btn btn-sm btn-outline-danger";
        deleteButton.textContent = "Delete";
        deleteButton.dataset.id = record.id;

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        progressTable.appendChild(row);
    });
}

// Delete a progress record
progressTable.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-id]");
    if (!button) return;

    const updatedRecords = progressRecords.filter(
        record => record.id !== button.dataset.id
    );

    if (saveStorage(PROGRESS_KEY, updatedRecords)) {
        progressRecords = updatedRecords;
        renderProgress();
        progressMessage.textContent = "Progress record deleted.";
    } else {
        progressMessage.textContent = "Could not delete the record.";
    }
});

// Clear this demo's saved data
document.getElementById("clearData").addEventListener("click", function() {
    if (!confirm("Delete the saved demo profile and progress records?")) return;

    try {
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem(PROGRESS_KEY);

        profileForm.reset();
        progressForm.reset();
        progressRecords = [];
        renderProgress();

        recommendationResults.textContent =
            "Save your profile to get personalised suggestions.";
        profileMessage.textContent = "Demo profile data cleared.";
        progressMessage.textContent = "";
        setTodayDate();
    } catch (error) {
        profileMessage.textContent = "Could not clear browser storage.";
    }
});

// Set today's date
function setTodayDate() {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 10);
    document.getElementById("progressDate").value = localDate;
}

// Start the page
setTodayDate();
loadProfile();
renderProgress();
