  const imageInput = document.getElementById('imageInput');
    const symptomInput = document.getElementById('symptomInput');
    const output = document.getElementById('output');
    const runBtn = document.getElementById('runBtn');
    const resetBtn = document.getElementById('resetBtn');
    const clearFileBtn = document.getElementById('clearFileBtn');

    function clearFile() {
      imageInput.value = '';
      output.textContent = 'Upload a leaf image and describe symptoms to get started 🌱';
    }

    function resetAll() {
      imageInput.value = '';
      symptomInput.value = '';
      output.textContent = 'Upload a leaf image and describe symptoms to get started 🌱';
      runBtn.disabled = false;
    }

    async function analyzeImage() {
      const file = imageInput.files[0];
      const symptomText = symptomInput.value.trim();

      if (!file) {
        output.textContent = "⚠️ Please upload an image first!";
        return;
      }

      runBtn.disabled = true;
      output.textContent = "🧠 Analyzing image and symptoms... please wait.";

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Image = reader.result.split(',')[1];

          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer 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`
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `You're a plant pathologist. A user has uploaded a leaf image and optionally described symptoms. Analyze both. If diseased, name the issue, describe the symptoms, and suggest an organic treatment.\n\nUser notes: ${symptomText || "No additional notes."}`
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:${file.type};base64,${base64Image}`
                      }
                    }
                  ]
                }
              ],
              max_tokens: 800
            })
          });

          if (!response.ok) {
            const err = await response.json();
            output.textContent = `❌ API Error:\n${err.error?.message || JSON.stringify(err)}`;
            runBtn.disabled = false;
            return;
          }

          const data = await response.json();

          if (data.choices?.length) {
            output.textContent = `✅ Diagnosis:\n\n${data.choices[0].message.content}`;
          } else {
            output.textContent = "⚠️ No diagnosis received. Try again.";
          }
        } catch (error) {
          output.textContent = `❌ Unexpected error:\n${error.message}`;
        } finally {
          runBtn.disabled = false;
        }
      };
      reader.readAsDataURL(file);
    }