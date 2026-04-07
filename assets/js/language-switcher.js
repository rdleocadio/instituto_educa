document.addEventListener("DOMContentLoaded", () => {
  const ptButton = document.querySelector(".lang-pt");
  const esButton = document.querySelector(".lang-es");
  const enButton = document.querySelector(".lang-en");

  const defaultLanguage = "pt";
  const savedLanguage = localStorage.getItem("siteLanguage") || defaultLanguage;

  const originalTextContent = {};
  const originalPlaceholderContent = {};

  function getNestedValue(obj, path) {
    return path.split(".").reduce((acc, part) => {
      return acc && acc[part] !== undefined ? acc[part] : null;
    }, obj);
  }

  function setActiveButton(language) {
    ptButton?.classList.remove("is-active");
    esButton?.classList.remove("is-active");
    enButton?.classList.remove("is-active");

    if (language === "pt") ptButton?.classList.add("is-active");
    if (language === "es") esButton?.classList.add("is-active");
    if (language === "en") enButton?.classList.add("is-active");
  }

  function setDocumentLanguage(language) {
    if (language === "pt") {
      document.documentElement.lang = "pt-BR";
    } else if (language === "es") {
      document.documentElement.lang = "es";
    } else if (language === "en") {
      document.documentElement.lang = "en";
    }
  }

  function saveOriginalContent() {
    const textElements = document.querySelectorAll("[data-i18n]");
    const placeholderElements = document.querySelectorAll("[data-i18n-placeholder]");

    textElements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (key && originalTextContent[key] === undefined) {
        originalTextContent[key] = element.innerHTML;
      }
    });

    placeholderElements.forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      if (key && originalPlaceholderContent[key] === undefined) {
        originalPlaceholderContent[key] = element.getAttribute("placeholder") || "";
      }
    });
  }

  function restoreOriginalTextElements() {
    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");

      if (key && originalTextContent[key] !== undefined) {
        element.innerHTML = originalTextContent[key];
      }
    });
  }

  function restoreOriginalPlaceholderElements() {
    const elements = document.querySelectorAll("[data-i18n-placeholder]");

    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");

      if (key && originalPlaceholderContent[key] !== undefined) {
        element.setAttribute("placeholder", originalPlaceholderContent[key]);
      }
    });
  }

  function translateTextElements(language) {
    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const translation = getNestedValue(translations[language], key);

      if (translation !== null) {
        element.innerHTML = translation;
      }
    });
  }

  function translatePlaceholderElements(language) {
    const elements = document.querySelectorAll("[data-i18n-placeholder]");

    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      const translation = getNestedValue(translations[language], key);

      if (translation !== null) {
        element.setAttribute("placeholder", translation);
      }
    });
  }

  function translatePage(language) {
    if (language === "pt") {
      restoreOriginalTextElements();
      restoreOriginalPlaceholderElements();
      setDocumentLanguage("pt");
      setActiveButton("pt");
      localStorage.setItem("siteLanguage", "pt");
      return;
    }

    if (!translations[language]) {
      language = defaultLanguage;
    }

    if (language === "pt") {
      restoreOriginalTextElements();
      restoreOriginalPlaceholderElements();
    } else {
      translateTextElements(language);
      translatePlaceholderElements(language);
    }

    setDocumentLanguage(language);
    setActiveButton(language);
    localStorage.setItem("siteLanguage", language);
  }

  ptButton?.addEventListener("click", (event) => {
    event.preventDefault();
    translatePage("pt");
  });

  esButton?.addEventListener("click", (event) => {
    event.preventDefault();
    translatePage("es");
  });

  enButton?.addEventListener("click", (event) => {
    event.preventDefault();
    translatePage("en");
  });

  saveOriginalContent();
  translatePage(savedLanguage);
});
