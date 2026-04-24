const form = document.getElementById("project-application-form");
const message = document.getElementById("form-message");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "Enviando inscrição...";
    message.className = "form-message form-message--loading";

    const formData = new FormData(form);

    try {
      const response = await fetch("https://tfpxdtkvzkzsudkpmpou.supabase.co/functions/v1/submit-edital", {
        method: "POST",
        body: formData
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível enviar a inscrição.");
      }

      message.textContent = "Inscrição enviada com sucesso!";
      message.className = "form-message form-message--success";

      form.reset();
    } catch (error) {
      message.textContent = "Erro ao enviar. Tente novamente.";
      message.className = "form-message form-message--error";
      console.error("Erro no envio do formulário:", error);
    }
  });
}
