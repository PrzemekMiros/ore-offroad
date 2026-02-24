const ENDPOINT = "https://www.futurewebstudio.pl/contactFormPortfolio.php";
const MESSAGES = {
  sending: "Wysyłam wiadomość...",
  error: "Wystąpił problem. Spróbuj ponownie za chwilę.",
  fallback: "Wiadomość dotarła - skontaktujemy się wkrótce.",
};

function createSubmitHandler(form, statusEl) {
  return async function handleContactSubmit(event) {
    event.preventDefault();
    if (statusEl) {
      statusEl.textContent = MESSAGES.sending;
      statusEl.dataset.state = "sending";
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Nie udało się wysłać wiadomości");
      }

      const result = await response.json();
      if (statusEl) {
        statusEl.innerHTML = result?.message ?? MESSAGES.fallback;
        statusEl.dataset.state = "success";
      }

      form.reset();
    } catch (error) {
      console.error("Błąd formularza kontaktowego:", error);
      if (statusEl) {
        statusEl.textContent = MESSAGES.error;
        statusEl.dataset.state = "error";
      }
    }
  };
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const statusEl = document.getElementById("contact-form-status");
  if (form.__contactFormHandler) {
    form.removeEventListener("submit", form.__contactFormHandler);
  }

  const handler = createSubmitHandler(form, statusEl);
  form.__contactFormHandler = handler;
  form.addEventListener("submit", handler);
}

function runContactFormInit() {
  initContactForm();
}

runContactFormInit();
document.addEventListener("DOMContentLoaded", runContactFormInit);
document.addEventListener("astro:page-load", runContactFormInit);
document.addEventListener("astro:after-swap", runContactFormInit);
