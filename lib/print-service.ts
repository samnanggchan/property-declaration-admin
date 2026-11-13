"use client";

export function sanitizePrintTitle(title: string): string {
  return (title || "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s*-\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface PrintCleanDocumentOptions {
  documentTitle?: string;
  pageSize?: string;
  pageWidth?: string;
  pageHeight?: string;
  pagePadding?: string;
}

export function printCleanDocument(
  elementId: string = "printable-document",
  optionsOrTitle?: string | PrintCleanDocumentOptions,
) {
  const options: PrintCleanDocumentOptions =
    typeof optionsOrTitle === "string"
      ? { documentTitle: optionsOrTitle }
      : optionsOrTitle || {};

  const sanitizedTitle = options.documentTitle
    ? sanitizePrintTitle(options.documentTitle)
    : undefined;

  const pageSize = options.pageSize || "A4 portrait";
  const pageWidth = options.pageWidth || "210mm";
  const pageHeight = options.pageHeight || "297mm";
  const pagePadding = options.pagePadding || "10mm 20mm 10mm 22mm";
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
  iframe.style.width = pageWidth;
  iframe.style.height = pageHeight;
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
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
        size: ${pageSize};
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
        width: ${pageWidth} !important;
        min-height: ${pageHeight} !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print, [data-slot="site-header"], header, nav, aside {
        display: none !important;
      }
      #printable-document,
      .printable-area {
        display: block !important;
        width: ${pageWidth} !important;
        max-width: ${pageWidth} !important;
        min-width: ${pageWidth} !important;
        margin: 0 auto !important;
        padding: 0 !important;
        background: #ffffff !important;
        border: none !important;
        box-shadow: none !important;
      }
      .a4-sheet, .custom-sheet {
        box-sizing: border-box !important;
        width: ${pageWidth} !important;
        max-width: ${pageWidth} !important;
        min-width: ${pageWidth} !important;
        min-height: calc(${pageHeight} - 1mm) !important;
        margin: 0 auto !important;
        padding: ${pagePadding} !important;
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
      .a4-sheet:last-child,
      .custom-sheet:last-of-type,
      .custom-sheet:last-child {
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
        if (sanitizedTitle) {
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
