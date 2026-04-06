export async function convertDocxToPdfViaCloudConvert(params: {
  docxBuffer: Buffer;
  filename: string;
}): Promise<Buffer> {
  const apiKey = process.env.CLOUDCONVERT_API_KEY;
  if (!apiKey) {
    throw new Error("CLOUDCONVERT_API_KEY is not configured");
  }

  const createJobRes = await fetch("https://api.cloudconvert.com/v2/jobs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tasks: {
        "import-my-file": { operation: "import/upload" },
        "convert-my-file": {
          operation: "convert",
          input: "import-my-file",
          input_format: "docx",
          output_format: "pdf"
        },
        "export-my-file": {
          operation: "export/url",
          input: "convert-my-file",
          inline: false,
          archive_multiple_files: false
        }
      }
    })
  });

  if (!createJobRes.ok) {
    throw new Error("CloudConvert job creation failed");
  }

  const jobJson: any = await createJobRes.json();
  const uploadTask = jobJson?.data?.tasks?.find((t: any) => t.name === "import-my-file");

  if (!uploadTask?.result?.form?.url) {
    throw new Error("CloudConvert upload URL missing");
  }

  const form = new FormData();
  Object.entries(uploadTask.result.form.parameters).forEach(([k, v]) => form.append(k, String(v)));
  form.append("file", new Blob([params.docxBuffer]), params.filename);

  const uploadRes = await fetch(uploadTask.result.form.url, { method: "POST", body: form });
  if (!uploadRes.ok) {
    throw new Error("CloudConvert upload failed");
  }

  let exportedUrl: string | undefined;
  for (let i = 0; i < 25; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const pollRes = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobJson.data.id}`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });

    const pollJson: any = await pollRes.json();
    const exportTask = pollJson?.data?.tasks?.find((task: any) => task.name === "export-my-file");
    const status = pollJson?.data?.status;

    if (status === "error") {
      throw new Error("CloudConvert conversion failed");
    }

    const url = exportTask?.result?.files?.[0]?.url;
    if (url) {
      exportedUrl = url;
      break;
    }
  }

  if (!exportedUrl) {
    throw new Error("CloudConvert conversion timed out");
  }

  const pdfRes = await fetch(exportedUrl);
  if (!pdfRes.ok) {
    throw new Error("Failed to download converted PDF");
  }

  const arrayBuffer = await pdfRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
