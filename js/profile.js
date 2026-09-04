function goBack() {
    if (document.referrer) {
        history.back();
    } else {
        window.location.href = "index.html";
    }
}

function resizeImageToDataURL(file, maxSize = 200, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = reject;
            img.onload = () => {
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

const ProfileModule = (function () {

    const STORAGE_KEY = "profile";

    let profile = { fullName: "", role: "", detail: "", avatar: "" };
    let pendingAvatar = "";
    let isEditing = false;
    let backupState = { fullName: "", role: "", detail: "", avatar: "" };

    let DOM = {};

    function cacheDOM() {
        DOM = {
            avatarImg: document.getElementById("profileAvatarImg"),
            avatarInitial: document.getElementById("profileAvatarInitial"),
            avatarEditBtn: document.getElementById("avatarEditBtn"),
            avatarInput: document.getElementById("avatarInput"),
            fullName: document.getElementById("profileFullName"),
            role: document.getElementById("profileRole"),
            detail: document.getElementById("profileDetail"),

            viewGroup: document.getElementById("viewModeActions"),
            editGroup: document.getElementById("editModeActions"),
            editBtn: document.getElementById("editBtn"),
            cancelBtn: document.getElementById("cancelBtn"),
            saveBtn: document.getElementById("saveBtn")
        };
    }

    function loadData() {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        profile = {
            fullName: saved.fullName || "",
            role: saved.role || "",
            detail: saved.detail || "",
            avatar: saved.avatar || ""
        };
    }

    function saveData() {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        existing.fullName = profile.fullName;
        existing.role = profile.role;
        existing.detail = profile.detail;
        existing.avatar = profile.avatar;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }

    function readInputs() {
        profile.fullName = DOM.fullName?.value.trim() || "";
        profile.role = DOM.role?.value.trim() || "";
        profile.detail = DOM.detail?.value.trim() || "";
    }

    function toggleEditMode(editing) {
        isEditing = editing;

        if (isEditing) {
            backupState = { ...profile };
            pendingAvatar = "";
            DOM.fullName?.removeAttribute("disabled");
            DOM.role?.removeAttribute("disabled");
            DOM.detail?.removeAttribute("disabled");
            DOM.avatarEditBtn?.classList.remove("d-none");
            DOM.viewGroup?.classList.add("d-none");
            DOM.editGroup?.classList.remove("d-none");
        } else {
            DOM.fullName?.setAttribute("disabled", "true");
            DOM.role?.setAttribute("disabled", "true");
            DOM.detail?.setAttribute("disabled", "true");
            DOM.avatarEditBtn?.classList.add("d-none");
            DOM.editGroup?.classList.add("d-none");
            DOM.viewGroup?.classList.remove("d-none");
        }

        render();
    }

    function cancelEdit() {
        profile = { ...backupState };
        pendingAvatar = "";
        toggleEditMode(false);
    }

    function saveEdit() {
        readInputs();
        if (pendingAvatar) profile.avatar = pendingAvatar;
        pendingAvatar = "";
        saveData();
        toggleEditMode(false);
    }

    async function handleAvatarChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        pendingAvatar = await resizeImageToDataURL(file);
        renderAvatar();
    }

    function renderAvatar() {
        const dataUrl = pendingAvatar || profile.avatar;
        if (dataUrl) {
            DOM.avatarImg.src = dataUrl;
            DOM.avatarImg.classList.remove("d-none");
            DOM.avatarInitial?.classList.add("d-none");
        } else {
            DOM.avatarImg?.classList.add("d-none");
            DOM.avatarInitial?.classList.remove("d-none");
            if (DOM.avatarInitial) DOM.avatarInitial.textContent = profile.fullName.trim().charAt(0).toUpperCase() || "U";
        }
    }

    function render() {
        if (DOM.fullName) DOM.fullName.value = profile.fullName;
        if (DOM.role) DOM.role.value = profile.role;
        if (DOM.detail) DOM.detail.value = profile.detail;
        renderAvatar();
    }

    function bindEvents() {
        DOM.editBtn?.addEventListener("click", () => toggleEditMode(true));
        DOM.cancelBtn?.addEventListener("click", cancelEdit);
        DOM.saveBtn?.addEventListener("click", saveEdit);

        DOM.avatarEditBtn?.addEventListener("click", () => DOM.avatarInput?.click());
        DOM.avatarInput?.addEventListener("change", handleAvatarChange);

        DOM.fullName?.addEventListener("input", renderAvatar);
    }

    function init() {
        cacheDOM();
        loadData();
        bindEvents();
        toggleEditMode(false);
    }

    return { init };
})();

document.addEventListener("DOMContentLoaded", function () {
    ProfileModule.init();
});
