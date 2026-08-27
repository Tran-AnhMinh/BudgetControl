/**
 * =======================================================
 * 0. COMMON HELPERS
 * =======================================================
 */
const Helper = {
  escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  formatCurrentDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }
};

/**
 * =======================================================
 * DATABASE MODULE (INDEXEDDB)
 * =======================================================
 */
const DBModule = (function () {
  const DB_NAME = "QRManagerDB";
  const DB_VERSION = 1;
  const STORE_NAME = "qr_codes";

  let dbInstance = null;

  function init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = (e) => {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };

      request.onerror = (e) => reject(e.target.error);
    });
  }

  function getAll() {
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  function add(item) {
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(item);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function update(item) {
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(item);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function remove(id) {
    return new Promise((resolve, reject) => {
      const tx = dbInstance.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  return {
    init,
    getAll,
    add,
    update,
    delete: remove,
  };
})();

/**
 * =======================================================
 * QR PAGE MODULE
 * =======================================================
 */
const QRPageModule = (function (DB, utils) {
  // ========================================
  // 1. CONSTANTS & CONFIG
  // ========================================
  const DEFAULT_PAGE_SIZE = 5;

  // ========================================
  // 2. STATE
  // ========================================
  let cachedData = [];
  let currentPage = 1;
  let pageSize = DEFAULT_PAGE_SIZE;
  let editingId = null;
  let currentImageBlob = null; // Quản lý Blob của ảnh hiện tại (cũ hoặc mới)

  let activeObjectURLs = [];
  let zoomObjectURL = null;
  let previewObjectURL = null;

  // ========================================
  // 3. DOM CACHE
  // ========================================
  let DOM = {};

  function cacheDOM() {
    DOM = {
      // Table & Pagination
      tableBody: document.getElementById("qrTableBody"),
      tableSummary: document.getElementById("tableSummary"),
      pagination: document.getElementById("pagination"),
      pageSizeSelect: document.getElementById("pageSizeSelect"),

      // Create / Edit Form Modal
      form: document.getElementById("qrForm"),
      uploadModal: document.getElementById("uploadModal"),
      modalTitle: document.querySelector("#uploadModal .modal-title"),
      submitBtn: document.getElementById("btnSubmitForm"),
      
      // Upload & Preview Containers
      imageUploadWrapper: document.getElementById("imageUploadWrapper"),
      imageInput: document.getElementById("imageInput"),
      imagePreviewWrapper: document.getElementById("imagePreviewWrapper"),
      imagePreview: document.getElementById("imagePreview"),
      btnRemovePreview: document.getElementById("btnRemovePreview"),

      // Other Form Inputs
      inputName: document.getElementById("nameInput"),
      inputBank: document.getElementById("bankInput"),
      inputAccount: document.getElementById("accountInput"),
      inputHolder: document.getElementById("holderInput"),
      inputDesc: document.getElementById("descInput"),
      inputStatus: document.getElementById("statusInput"),

      // Zoom Modal
      zoomModal: document.getElementById("zoomModal"),
      zoomImage: document.getElementById("modalZoomQRImage"),
    };
  }

  // ========================================
  // 4. MEMORY & OBJECT URL CLEANUP
  // ========================================
  function cleanupBlobURLs() {
    activeObjectURLs.forEach((url) => URL.revokeObjectURL(url));
    activeObjectURLs = [];
  }

  function cleanupZoomURL() {
    if (zoomObjectURL) {
      URL.revokeObjectURL(zoomObjectURL);
      zoomObjectURL = null;
    }
  }

  function cleanupPreviewURL() {
    if (previewObjectURL) {
      URL.revokeObjectURL(previewObjectURL);
      previewObjectURL = null;
    }
  }

  // ========================================
  // 5. PREVIEW & UPLOAD STATE TOGGLING
  // ========================================
  function showPreviewState(blobOrFile) {
    cleanupPreviewURL();
    currentImageBlob = blobOrFile;

    previewObjectURL = URL.createObjectURL(blobOrFile);
    if (DOM.imagePreview) DOM.imagePreview.src = previewObjectURL;

    // Ẩn vùng chọn tệp, hiện vùng xem trước
    if (DOM.imageUploadWrapper) DOM.imageUploadWrapper.classList.add("d-none");
    if (DOM.imagePreviewWrapper) DOM.imagePreviewWrapper.classList.remove("d-none");
  }

  function showUploadState() {
    cleanupPreviewURL();
    currentImageBlob = null;

    if (DOM.imageInput) DOM.imageInput.value = "";
    if (DOM.imagePreview) DOM.imagePreview.src = "";

    // Hiện vùng chọn tệp, ẩn vùng xem trước
    if (DOM.imagePreviewWrapper) DOM.imagePreviewWrapper.classList.add("d-none");
    if (DOM.imageUploadWrapper) DOM.imageUploadWrapper.classList.remove("d-none");
  }

  // ========================================
  // 6. DATA & BUSINESS LOGIC
  // ========================================
  async function loadData() {
    try {
      const data = await DB.getAll();
      cachedData = data.sort((a, b) => b.id - a.id);
      render();
    } catch (error) {
      console.error("Không thể tải dữ liệu QR:", error);
    }
  }

  function setPage(page) {
    const totalPages = Math.ceil(cachedData.length / pageSize) || 1;
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    render();
  }

  function setPageSize(newSize) {
    pageSize = parseInt(newSize, 10) || DEFAULT_PAGE_SIZE;
    currentPage = 1;
    render();
  }

  function resetForm() {
    editingId = null;
    DOM.form?.reset();
    showUploadState();
    if (DOM.modalTitle) DOM.modalTitle.textContent = "Thêm mã QR mới";
    if (DOM.submitBtn) DOM.submitBtn.textContent = "Lưu QR";
  }

  function openEditModal(id) {
    const item = cachedData.find((q) => q.id === id);
    if (!item) return;

    editingId = id;

    // Đổ dữ liệu vào Form
    if (DOM.inputName) DOM.inputName.value = item.name || "";
    if (DOM.inputBank) DOM.inputBank.value = item.bankName || "";
    if (DOM.inputAccount) DOM.inputAccount.value = item.accountNumber || "";
    if (DOM.inputHolder) DOM.inputHolder.value = item.accountHolder || "";
    if (DOM.inputDesc) DOM.inputDesc.value = item.description || "";
    if (DOM.inputStatus) DOM.inputStatus.checked = item.status === "active";

    // Hiển thị ảnh hiện có và ẩn input chọn file
    if (item.imageBlob) {
      showPreviewState(item.imageBlob);
    } else {
      showUploadState();
    }

    if (DOM.modalTitle) DOM.modalTitle.textContent = "Chỉnh sửa mã QR";
    if (DOM.submitBtn) DOM.submitBtn.textContent = "Cập nhật";

    const modal = bootstrap.Modal.getOrCreateInstance(DOM.uploadModal);
    modal.show();
  }

  function handleImageFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      showPreviewState(file);
    }
  }

  async function handleSaveQR() {
    const name = DOM.inputName?.value.trim();
    const bankName = DOM.inputBank?.value;
    const accountNumber = DOM.inputAccount?.value.trim();
    const accountHolder = DOM.inputHolder?.value.trim();
    const description = DOM.inputDesc?.value.trim();
    const status = DOM.inputStatus?.checked ? "active" : "paused";

    if (!currentImageBlob) {
      alert("Vui lòng chọn ảnh QR.");
      return;
    }

    if (!name || !accountNumber || !accountHolder) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    try {
      if (editingId) {
        const existingRecord = cachedData.find((q) => q.id === editingId);
        const updatedRecord = {
          ...existingRecord,
          imageBlob: currentImageBlob,
          name,
          bankName,
          accountNumber,
          accountHolder,
          description,
          status,
          updatedDate: utils.formatCurrentDate()
        };

        await DB.update(updatedRecord);
      } else {
        const newRecord = {
          id: Date.now(),
          imageBlob: currentImageBlob,
          name,
          bankName,
          accountNumber,
          accountHolder,
          description,
          status,
          createdDate: utils.formatCurrentDate()
        };

        await DB.add(newRecord);
      }

      const modal = bootstrap.Modal.getInstance(DOM.uploadModal);
      if (modal) modal.hide();

      resetForm();
      await loadData();
    } catch (error) {
      console.error("Lỗi khi lưu QR:", error);
      alert("Không thể lưu mã QR.");
    }
  }

  async function handleDeleteQR(id) {
    const isConfirmed = confirm("Bạn có chắc muốn xoá mã QR này?");
    if (!isConfirmed) return;

    try {
      await DB.delete(id);
      await loadData();
    } catch (error) {
      console.error("Lỗi khi xóa QR:", error);
      alert("Không thể xóa mã QR.");
    }
  }

  function openZoomModal(id) {
    const item = cachedData.find((q) => q.id === id);
    if (!item) return;

    cleanupZoomURL();
    zoomObjectURL = URL.createObjectURL(item.imageBlob);
    if (DOM.zoomImage) DOM.zoomImage.src = zoomObjectURL;

    const modal = bootstrap.Modal.getOrCreateInstance(DOM.zoomModal);
    modal.show();
  }
  // 7. RENDER

  function render() {
    cleanupBlobURLs();

    const totalItems = cachedData.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalItems);
    const pageItems = cachedData.slice(startIdx, endIdx);

    renderTable(pageItems);
    renderSummary(startIdx, endIdx, totalItems);
    renderPagination(totalPages);
  }

  function renderTable(items) {
    if (!DOM.tableBody) return;

    if (items.length === 0) {
      DOM.tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-5 text-muted">
            <i class="bi bi-qr-code fs-1 d-block mb-2"></i>
            <div>Chưa có mã QR nào.</div>
            <small>Hãy tải lên mã QR đầu tiên của bạn.</small>
          </td>
        </tr>
      `;
      return;
    }

    DOM.tableBody.innerHTML = items
      .map((item) => {
        const imageUrl = URL.createObjectURL(item.imageBlob);
        activeObjectURLs.push(imageUrl);

        return `
          <tr>
            <td>
              <div class="position-relative d-inline-block qr-item" data-id="${item.id}" style="cursor: pointer;" title="Bấm để xem ảnh lớn">
                <div class="qr-thumb-box">
                  <img src="${imageUrl}" class="qr-thumb-img" alt="QR Thumbnail">
                </div>
              </div>
            </td>
            <td>
              <div class="d-flex align-items-center gap-2">
                <span class="fw-semibold text-dark">${utils.escapeHTML(item.name)}</span>
              </div>
              <div class="text-sub mt-1">Tạo ngày ${item.createdDate}</div>
            </td>
            <td>
              <span class="fw-medium text-dark">${utils.escapeHTML(item.bankName)}</span>
            </td>
            <td>
              <div class="fw-bold text-dark font-monospace">${utils.escapeHTML(item.accountNumber)}</div>
              <div class="text-sub mt-1 text-uppercase">${utils.escapeHTML(item.accountHolder)}</div>
            </td>
            <td>
              <div class="text-secondary small" style="max-width: 250px;">
                ${utils.escapeHTML(item.description || "Không có mô tả")}
              </div>
            </td>
            <td class="text-center">
              <div class="d-inline-flex gap-1">
                <button type="button" class="btn btn-sm btn-outline-primary border-0 rounded-circle btn-edit-qr" data-id="${item.id}" title="Sửa">
                  <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger border-0 rounded-circle btn-delete-qr" data-id="${item.id}" title="Xóa">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  function renderSummary(startIdx, endIdx, totalItems) {
    if (!DOM.tableSummary) return;
    DOM.tableSummary.textContent =
      totalItems > 0
        ? `Hiển thị ${startIdx + 1} đến ${endIdx} trong ${totalItems} mã QR`
        : "0 mã QR";
  }

  function renderPagination(totalPages) {
    if (!DOM.pagination) return;

    let html = `
      <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
        <button type="button" class="page-link" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>
          <i class="bi bi-chevron-left"></i>
        </button>
      </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
      html += `
        <li class="page-item ${currentPage === i ? "active" : ""}">
          <button type="button" class="page-link" data-page="${i}">${i}</button>
        </li>
      `;
    }

    html += `
      <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
        <button type="button" class="page-link" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>
          <i class="bi bi-chevron-right"></i>
        </button>
      </li>
    `;

    DOM.pagination.innerHTML = html;
  }

  // ========================================
  // 8. EVENTS
  // ========================================
  function bindEvents() {
    DOM.pageSizeSelect?.addEventListener("change", (e) => setPageSize(e.target.value));

    DOM.submitBtn?.addEventListener("click", handleSaveQR);

    // 1. Khi chọn file: tự động ẩn ô chọn, hiện ảnh preview
    DOM.imageInput?.addEventListener("change", handleImageFileChange);

    // 2. Khi bấm nút X trên ảnh preview: xóa ảnh, hiện lại ô chọn file
    DOM.btnRemovePreview?.addEventListener("click", showUploadState);

    // Xử lý click trong bảng (Xem ảnh, Sửa, Xóa)
    DOM.tableBody?.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".btn-edit-qr");
      if (editBtn) {
        openEditModal(Number(editBtn.dataset.id));
        return;
      }

      const deleteBtn = e.target.closest(".btn-delete-qr");
      if (deleteBtn) {
        handleDeleteQR(Number(deleteBtn.dataset.id));
        return;
      }

      const qrItem = e.target.closest(".qr-item");
      if (qrItem) {
        openZoomModal(Number(qrItem.dataset.id));
      }
    });

    DOM.pagination?.addEventListener("click", (e) => {
      const button = e.target.closest("[data-page]");
      if (!button || button.disabled) return;
      setPage(Number(button.dataset.page));
    });

    // Reset Form & huỷ preview khi đóng Modal
    DOM.uploadModal?.addEventListener("hidden.bs.modal", resetForm);

    // Modal Zoom Hidden Event
    DOM.zoomModal?.addEventListener("hidden.bs.modal", () => {
      cleanupZoomURL();
      if (DOM.zoomImage) DOM.zoomImage.src = "";
    });
  }

  // ========================================
  // 9. INIT & PUBLIC API
  // ========================================
  async function init() {
    try {
      cacheDOM();
      await DB.init();
      bindEvents();
      await loadData();
    } catch (error) {
      console.error("Không thể khởi tạo QR Page:", error);
    }
  }

  return {
    init,
    refresh: loadData
  };
})(DBModule, Helper);

/**
 * =======================================================
 * ENTRY POINT
 * =======================================================
 */
document.addEventListener("DOMContentLoaded", () => {
  QRPageModule.init();
});