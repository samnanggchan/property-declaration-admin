"use client";

export function sanitizePrintTitle(title: string): string {
  return (title || "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s*-\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

export function printCleanDocument(
  elementId: string = "printable-document",
  documentTitle?: string,
) {
  const sanitizedTitle = documentTitle
    ? sanitizePrintTitle(documentTitle)
    : undefined;
  const target =
    document.getElementById(elementId) ||
    document.querySelector(".printable-area");
  if (!target) {
    if (sanitizedTitle) {
      const prevTitle = document.title;
      document.title = sanitizedTitle;
      window.print();
      document.title = prevTitle;
    } else {
      window.print();
    }
    return;
  }

  const existingFrame = document.getElementById("clean-print-iframe");
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement("iframe");
  iframe.id = "clean-print-iframe";
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.top = "-99999px";
  iframe.style.left = "-99999px";
  iframe.style.width = "210mm";
  iframe.style.height = "297mm";
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    if (documentTitle) {
      const prevTitle = document.title;
      document.title = documentTitle;
      window.print();
      document.title = prevTitle;
    } else {
      window.print();
    }
    return;
  }

  const styleElements = Array.from(
    document.querySelectorAll("link[rel='stylesheet'], style"),
  )
    .map((el) => el.outerHTML)
    .join("\n");

  const fontLinks = Array.from(
    document.querySelectorAll(
      "link[rel='preconnect'], link[rel='preload'], link[href*='font']",
    ),
  )
    .map((el) => el.outerHTML)
    .join("\n");

  const title =
    sanitizedTitle ||
    sanitizePrintTitle(document.title) ||
    "បោះពុម្ពឯកសារផ្លូវការ";

  iframeDoc.open();
  iframeDoc.write(`
<!DOCTYPE html>
<html lang="km">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    ${fontLinks}
    ${styleElements}
    <style>
      @page {
        size: A4 portrait;
        margin: 0;
      }
      *, *::before, *::after {
        box-sizing: border-box;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        background-color: #ffffff !important;
        color: #000000 !important;
        width: 210mm !important;
        min-height: 297mm !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print, [data-slot="site-header"], header, nav, aside {
        display: none !important;
      }
      #printable-document,
      .printable-area {
        display: block !important;
        width: 210mm !important;
        max-width: 210mm !important;
        min-width: 210mm !important;
        margin: 0 auto !important;
        padding: 0 !important;
        background: #ffffff !important;
        border: none !important;
        box-shadow: none !important;
      }
      .a4-sheet {
        display: block !important;
        box-sizing: border-box !important;
        width: 210mm !important;
        max-width: 210mm !important;
        min-width: 210mm !important;
        min-height: calc(297mm - 1mm) !important;
        margin: 0 auto !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        background: #ffffff !important;
        background-color: #ffffff !important;
        color: #000000 !important;
        page-break-after: always !important;
        break-after: page !important;
      }
      .a4-sheet:last-of-type,
      .a4-sheet:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
      .page-break {
        display: none !important;
      }
    </style>
  </head>
  <body class="font-battambang">
    ${target.outerHTML}
  </body>
</html>
  `);
  iframeDoc.close();

  const triggerPrint = () => {
    const prevTitle = document.title;
    try {
      if (title) {
        document.title = title;
      }
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        if (documentTitle) {
          document.title = prevTitle;
        }
        iframe.remove();
      }, 1500);
    }
  };

  if (iframeDoc.fonts && iframeDoc.fonts.ready) {
    iframeDoc.fonts.ready
      .then(() => {
        setTimeout(triggerPrint, 150);
      })
      .catch(() => {
        setTimeout(triggerPrint, 250);
      });
  } else {
    setTimeout(triggerPrint, 250);
  }
}
