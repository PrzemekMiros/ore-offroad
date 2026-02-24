(() => {
  const STORAGE_KEY = "cookie-consent-v1";
  const COOKIE_NAME = "cookie_consent";

  const init = () => {
    const modal = document.querySelector("[data-cookie-modal]");
    if (!modal) return;
    if (modal.dataset.cookieBound === "true") return;
    modal.dataset.cookieBound = "true";

    const tabs = Array.from(modal.querySelectorAll("[data-cookie-tab]"));
    const panels = Array.from(modal.querySelectorAll("[data-cookie-panel]"));
    const checkboxes = Array.from(modal.querySelectorAll("[data-cookie-category]"));
    const acceptBtn = modal.querySelector("[data-cookie-accept]");
    const denyBtn = modal.querySelector("[data-cookie-deny]");
    const saveBtn = modal.querySelector("[data-cookie-save]");
    const customizeBtn = modal.querySelector("[data-cookie-customize]");
    const openers = Array.from(document.querySelectorAll("[data-cookie-open]"));

    const readConsent = () => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    };

    const writeConsent = (consent) => {
      const payload = Object.assign({}, consent, {
        timestamp: new Date().toISOString(),
      });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      const cookieValue = encodeURIComponent(JSON.stringify(payload));
      document.cookie = `${COOKIE_NAME}=${cookieValue}; Max-Age=31536000; Path=/; SameSite=Lax`;
    };

    const applyConsentToUI = (consent) => {
      checkboxes.forEach((checkbox) => {
        const key = checkbox.dataset.cookieCategory;
        if (!key) return;
        if (checkbox.disabled) {
          checkbox.checked = true;
          return;
        }
        checkbox.checked = Boolean(consent && consent[key]);
      });
    };

    const getConsentFromUI = () => {
      const consent = { necessary: true };
      checkboxes.forEach((checkbox) => {
        const key = checkbox.dataset.cookieCategory;
        if (!key) return;
        if (checkbox.disabled) {
          consent[key] = true;
          return;
        }
        consent[key] = checkbox.checked;
      });
      return consent;
    };

    const openModal = () => {
      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("overflow-hidden");
      modal.focus();
    };

    const closeModal = () => {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("overflow-hidden");
    };

    const setTabActive = (target) => {
      tabs.forEach((tab) => {
        const isActive = tab.dataset.cookieTab === target;
        tab.setAttribute("aria-selected", String(isActive));
        tab.classList.toggle("text-[#00a3ff]", isActive);
        tab.classList.toggle("border-b-2", isActive);
        tab.classList.toggle("border-[#00a3ff]", isActive);
        tab.classList.toggle("text-gray-800", !isActive);
      });

      panels.forEach((panel) => {
        panel.classList.toggle("hidden", panel.dataset.cookiePanel !== target);
      });
    };

    const acceptAll = () => {
      writeConsent({
        necessary: true,
        functional: true,
        analytics: true,
        marketing: true,
      });
      closeModal();
    };

    const denyAll = () => {
      writeConsent({
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false,
      });
      closeModal();
    };

    const saveCustom = () => {
      writeConsent(getConsentFromUI());
      closeModal();
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.cookieTab;
        if (target) setTabActive(target);
      });
    });

    openers.forEach((opener) => {
      opener.addEventListener("click", (event) => {
        event.preventDefault();
        const stored = readConsent();
        if (stored) applyConsentToUI(stored);
        setTabActive("consent");
        openModal();
      });
    });

    if (acceptBtn) acceptBtn.addEventListener("click", acceptAll);
    if (denyBtn) denyBtn.addEventListener("click", denyAll);
    if (saveBtn) saveBtn.addEventListener("click", saveCustom);
    if (customizeBtn) customizeBtn.addEventListener("click", () => setTabActive("details"));

    modal.addEventListener("click", (event) => {
      if (event.target !== modal) return;
      if (readConsent()) closeModal();
    });

    window.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (readConsent()) closeModal();
    });

    const stored = readConsent();
    if (stored) {
      applyConsentToUI(stored);
      closeModal();
    } else {
      setTabActive("consent");
      openModal();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("astro:page-load", init);
  document.addEventListener("astro:after-swap", init);
})();
