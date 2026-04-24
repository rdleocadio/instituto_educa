const form = document.getElementById("project-application-form");
const message = document.getElementById("form-message");

const REQUIRED_MESSAGE = "Este campo é obrigatório.";
const INDIGENOUS_ETHNICITY_MESSAGE = "Informe a etnia quando o segmento selecionado for Povos Indígenas.";

if (form) {
  const segmentSelect = form.querySelector('[name="segment"]');
  const ethnicityInput = form.querySelector('[name="indigenous_ethnicity"]');

  if (segmentSelect && ethnicityInput) {
    segmentSelect.addEventListener("change", () => {
      if (segmentSelect.value === "Povos Indígenas") {
        ethnicityInput.setAttribute("required", "required");
      } else {
        ethnicityInput.removeAttribute("required");
        clearFieldError(ethnicityInput);
      }
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearAllFieldErrors();

    const isValid = validateForm();

    if (!isValid) {
      message.textContent = "Existem campos obrigatórios não preenchidos.";
      message.className = "form-message form-message--error";

      const firstError = form.querySelector(".field-error");

      if (firstError) {
        firstError.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        firstError.focus({ preventScroll: true });
      }

      return;
    }

    message.textContent = "Enviando inscrição...";
    message.className = "form-message form-message--loading";

    const formData = new FormData(form);

    try {
      const response = await fetch("https://tfpxdtkvzkzsudkpmpou.supabase.co/functions/v1/submit-edital", {
        method: "POST",
        body: formData
      });

      const text = await response.text();

      let result = {};

      try {
        result = JSON.parse(text);
      } catch (error) {
        console.error("Resposta não é JSON:", text);
      }

      if (!response.ok) {
        throw new Error(result.error || text || "Não foi possível enviar a inscrição.");
      }

      window.location.replace("sucesso.html");

    } catch (error) {
      message.textContent = error.message || "Erro ao enviar. Tente novamente.";
      message.className = "form-message form-message--error";
    }
  });

  form.addEventListener("input", (event) => {
    const field = event.target;

    if (field.classList.contains("field-error")) {
      validateField(field);
    }
  });

  form.addEventListener("change", (event) => {
    const field = event.target;

    if (field.classList.contains("field-error")) {
      validateField(field);
    }
  });
}

function validateForm() {
  let isValid = true;

  const fields = form.querySelectorAll("input, select, textarea");

  fields.forEach((field) => {
    if (!validateField(field)) {
      isValid = false;
    }
  });

  return isValid;
}

function validateField(field) {
  if (!shouldValidateField(field)) return true;

  const fieldName = field.getAttribute("name");

  if (fieldName === "indigenous_ethnicity") {
    const segment = form.querySelector('[name="segment"]')?.value;

    if (segment === "Povos Indígenas" && !field.value.trim()) {
      setFieldError(field, INDIGENOUS_ETHNICITY_MESSAGE);
      return false;
    }

    clearFieldError(field);
    return true;
  }

  if (field.type === "file") {
    if (field.hasAttribute("required") && field.files.length === 0) {
      setFieldError(field, REQUIRED_MESSAGE);
      return false;
    }

    clearFieldError(field);
    return true;
  }

  if (field.type === "checkbox") {
    const checkboxGroupName = field.name;
    const group = form.querySelectorAll(`input[type="checkbox"][name="${checkboxGroupName}"]`);
    const oneChecked = Array.from(group).some((checkbox) => checkbox.checked);

    if (checkboxGroupName === "ods") {
      const odsErrorMessage = document.getElementById("ods-error-message");

      if (!oneChecked) {
        if (odsErrorMessage) {
          odsErrorMessage.textContent = "Selecione pelo menos uma ODS.";
          odsErrorMessage.classList.add("is-visible");
        }

        return false;
      }

      if (odsErrorMessage) {
        odsErrorMessage.textContent = "";
        odsErrorMessage.classList.remove("is-visible");
      }

      return true;
    }

    return true;
  }

  if (field.hasAttribute("required") && !field.value.trim()) {
    setFieldError(field, REQUIRED_MESSAGE);
    return false;
  }

  clearFieldError(field);
  return true;
}

function shouldValidateField(field) {
  if (!field.name) return false;
  if (field.disabled) return false;
  if (field.type === "hidden") return false;
  if (field.type === "submit") return false;
  if (field.type === "button") return false;

  return true;
}

function setFieldError(field, text) {
  field.classList.add("field-error");

  let wrapper = field.closest(".field-wrapper");

  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.className = "field-wrapper";

    field.parentNode.insertBefore(wrapper, field);
    wrapper.appendChild(field);
  }

  let error = wrapper.querySelector(".field-error-message");

  if (!error) {
    error = document.createElement("span");
    error.className = "field-error-message";
    wrapper.appendChild(error);
  }

  error.textContent = text;
}

function clearFieldError(field) {
  field.classList.remove("field-error");

  const wrapper = field.closest(".field-wrapper");

  if (!wrapper) return;

  const error = wrapper.querySelector(".field-error-message");

  if (error) error.remove();
}

function clearAllFieldErrors() {
  form.querySelectorAll(".field-error").forEach((field) => {
    field.classList.remove("field-error");
  });

  form.querySelectorAll(".field-error-message").forEach((error) => {
    error.remove();
  });

  const odsErrorMessage = document.getElementById("ods-error-message");

  if (odsErrorMessage) {
    odsErrorMessage.textContent = "";
    odsErrorMessage.classList.remove("is-visible");
  }
}
