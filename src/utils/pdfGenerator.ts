import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Converts an OKLCH color to standard sRGB.
 * Formula source: W3C CSS Color Module Level 4 / Oklab & OKLCH specs.
 */
function oklchToRgb(l: number, c: number, h: number, a: number = 1): string {
  // Convert hue to radians
  const hRad = (h * Math.PI) / 180;
  const aVal = c * Math.cos(hRad);
  const bVal = c * Math.sin(hRad);

  // Convert to non-linear LMS
  const l_ = l + 0.3963377774 * aVal + 0.2158037573 * bVal;
  const m_ = l - 0.1055613458 * aVal - 0.0638541728 * bVal;
  const s_ = l - 0.0894841775 * aVal - 1.2914855480 * bVal;

  // Convert to linear LMS
  const lLinear = l_ * l_ * l_;
  const mLinear = m_ * m_ * m_;
  const sLinear = s_ * s_ * s_;

  // Convert linear LMS to linear sRGB
  let r = +4.0767416621 * lLinear - 3.3077115913 * mLinear + 0.2309699292 * sLinear;
  let g = -1.2684380046 * lLinear + 2.6097574011 * mLinear - 0.3413193965 * sLinear;
  let b = -0.0041960863 * lLinear - 0.7034186147 * mLinear + 1.7076147010 * sLinear;

  // Gamma correction function
  const f = (x: number) => {
    return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  };

  // Clamp linear values between 0 and 1
  r = Math.max(0, Math.min(1, r));
  g = Math.max(0, Math.min(1, g));
  b = Math.max(0, Math.min(1, b));

  // Scale to 0-255
  const r255 = Math.round(f(r) * 255);
  const g255 = Math.round(f(g) * 255);
  const b255 = Math.round(f(b) * 255);

  if (a < 1) {
    return `rgba(${r255}, ${g255}, ${b255}, ${a})`;
  }
  return `rgb(${r255}, ${g255}, ${b255})`;
}

/**
 * Replaces all occurrences of oklch(...) inside a CSS string with standard rgb/rgba color values.
 */
function replaceOklchInString(cssText: string): string {
  // Matches oklch(L C H) or oklch(L C H / A) with space or comma separators
  const oklchRegex = /oklch\(\s*([\d.]+%?|none)(?:\s+|,\s*)([\d.]+%?|none)(?:\s+|,\s*)([\d.]+(?:deg|rad|grad|turn)?|none)(?:\s*(?:\/|,)\s*([\d.]+%?|none))?\s*\)/gi;

  return cssText.replace(oklchRegex, (_match, lStr, cStr, hStr, aStr) => {
    try {
      const cleanStr = (s: string) => s.trim().toLowerCase() === 'none' ? '0' : s;
      const lStrClean = cleanStr(lStr);
      const cStrClean = cleanStr(cStr);
      const hStrClean = cleanStr(hStr);

      let l = lStrClean.endsWith('%') ? parseFloat(lStrClean) / 100 : parseFloat(lStrClean);
      let c = cStrClean.endsWith('%') ? parseFloat(cStrClean) / 100 : parseFloat(cStrClean);

      // Handle hue unit conversion if any
      let h = parseFloat(hStrClean);
      if (hStrClean.toLowerCase().endsWith('rad')) {
        h = (parseFloat(hStrClean) * 180) / Math.PI;
      } else if (hStrClean.toLowerCase().endsWith('turn')) {
        h = parseFloat(hStrClean) * 360;
      } else if (hStrClean.toLowerCase().endsWith('grad')) {
        h = (parseFloat(hStrClean) * 360) / 400;
      }

      let a = 1;
      if (aStr) {
        const aStrClean = aStr.trim().toLowerCase() === 'none' ? '1' : aStr;
        a = aStrClean.endsWith('%') ? parseFloat(aStrClean) / 100 : parseFloat(aStrClean);
      }

      // Safeguards against NaN
      l = isNaN(l) ? 0 : l;
      c = isNaN(c) ? 0 : c;
      h = isNaN(h) ? 0 : h;
      a = isNaN(a) ? 1 : a;

      return oklchToRgb(l, c, h, a);
    } catch (e) {
      return 'rgb(0, 0, 0)';
    }
  });
}

/**
 * Generates a PDF from a DOM element.
 * @param elementId The ID of the HTML element to render.
 * @returns A promise that resolves to the jsPDF instance.
 */
export async function generatePDFInstance(elementId: string): Promise<jsPDF> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID ${elementId} not found.`);
  }

  // Set styles to ensure clean render
  const originalStyle = element.style.cssText;
  
  // Force specific dimensions to look like a clean print sheet (800px is a solid width for letter aspect ratio)
  element.style.width = '800px';
  element.style.maxWidth = '800px';
  element.style.backgroundColor = '#FFFFFF';

  // Array to store original style states for rollback
  const originalStyleElements: { element: HTMLStyleElement | HTMLLinkElement; text?: string; disabled: boolean }[] = [];
  const originalInlineElements: { element: HTMLElement; originalStyle: string }[] = [];
  const tempStyleTags: HTMLStyleElement[] = [];

  try {
    // 1. Traverse and sanitize document style tags & stylesheets
    const styleElements = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
    for (const el of styleElements) {
      if (el.tagName === 'STYLE') {
        const styleEl = el as HTMLStyleElement;
        const originalText = styleEl.textContent || '';
        originalStyleElements.push({
          element: styleEl,
          text: originalText,
          disabled: styleEl.disabled,
        });
        
        // Rewrite the styles in-place to use rgb fallback instead of oklch
        styleEl.textContent = replaceOklchInString(originalText);
      } else if (el.tagName === 'LINK') {
        const linkEl = el as HTMLLinkElement;
        originalStyleElements.push({
          element: linkEl,
          disabled: linkEl.disabled,
        });

        // Fetch cross-origin/local style sheets to override them
        try {
          const response = await fetch(linkEl.href);
          if (response.ok) {
            const cssText = await response.text();
            if (cssText.includes('oklch')) {
              const sanitizedCss = replaceOklchInString(cssText);
              
              // Create a temp style tag to replace this link tag
              const tempStyle = document.createElement('style');
              tempStyle.className = 'temp-pdf-style';
              tempStyle.textContent = sanitizedCss;
              document.head.appendChild(tempStyle);
              tempStyleTags.push(tempStyle);
              
              // Temporarily disable the original link stylesheet
              linkEl.disabled = true;
            }
          }
        } catch (e) {
          console.warn('Could not sanitize link stylesheet:', linkEl.href, e);
        }
      }
    }

    // 2. Traverse and sanitize inline oklch styles on ALL DOM elements
    const allElements = document.querySelectorAll('*');
    for (const el of Array.from(allElements)) {
      const htmlEl = el as HTMLElement;
      const styleAttr = htmlEl.getAttribute('style');
      if (styleAttr && styleAttr.includes('oklch')) {
        originalInlineElements.push({
          element: htmlEl,
          originalStyle: styleAttr,
        });
        htmlEl.setAttribute('style', replaceOklchInString(styleAttr));
      }
    }

    // 3. Render using html2canvas with optimal settings
    const canvas = await html2canvas(element, {
      scale: 2, // Double resolution for crisp text
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#FFFFFF',
      windowWidth: 800,
    });

    // Restore original inline styles
    for (const item of originalInlineElements) {
      item.element.setAttribute('style', item.originalStyle);
    }

    // Restore original stylesheet styles
    for (const item of originalStyleElements) {
      if (item.element.tagName === 'STYLE') {
        item.element.textContent = item.text || '';
        (item.element as HTMLStyleElement).disabled = item.disabled;
      } else if (item.element.tagName === 'LINK') {
        (item.element as HTMLLinkElement).disabled = item.disabled;
      }
    }

    // Remove any temporary styles we injected
    tempStyleTags.forEach((tag) => tag.remove());

    // Restore the print element's styling
    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF with Letter size (8.5 x 11 inches)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter'
    });

    const pdfWidth = 8.5;
    const pdfHeight = 11;
    
    // Center image on the page
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    
    return pdf;
  } catch (error) {
    // Ensure styles are restored on error
    for (const item of originalInlineElements) {
      item.element.setAttribute('style', item.originalStyle);
    }
    for (const item of originalStyleElements) {
      if (item.element.tagName === 'STYLE') {
        item.element.textContent = item.text || '';
        (item.element as HTMLStyleElement).disabled = item.disabled;
      } else if (item.element.tagName === 'LINK') {
        (item.element as HTMLLinkElement).disabled = item.disabled;
      }
    }
    tempStyleTags.forEach((tag) => tag.remove());
    element.style.cssText = originalStyle;
    
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Downloads the PDF directly.
 */
export async function downloadOrderPDF(elementId: string, orderNo: string): Promise<void> {
  const pdf = await generatePDFInstance(elementId);
  pdf.save(`Orden_de_Servicio_Gama_${orderNo}.pdf`);
}

/**
 * Generates a PDF blob for sharing.
 */
export async function getOrderPDFBlob(elementId: string): Promise<Blob> {
  const pdf = await generatePDFInstance(elementId);
  return pdf.output('blob');
}

/**
 * Formats a clean text message for WhatsApp or social media.
 */
export function formatWhatsAppMessage(order: any): string {
  const serviceTypes = [];
  if (order.servicio.revision) serviceTypes.push('Revisión');
  if (order.servicio.reparacion) serviceTypes.push('Reparación');
  if (order.servicio.mantenimiento) serviceTypes.push('Mantenimiento');
  if (order.servicio.mantenimientoCorrectivo) serviceTypes.push('Mantenimiento Correctivo');

  const formattedServices = serviceTypes.join(', ') || 'No especificado';
  const equipmentDesc = `${order.equipo.tipo.toUpperCase()} ${order.equipo.marca} (${order.equipo.modelo})`;

  return `*ORDEN DE SERVICIO DIGITAL - GAMA* 🛠️📱
----------------------------------------
*No. de Orden:* ${order.noOrden}
*Fecha:* ${order.fecha}
*Cliente:* ${order.cliente.nombreCompleto}
*Equipo:* ${equipmentDesc}
*Servicio:* ${formattedServices}
*Falla Reportada:* ${order.descripcionFalla}
*Diagnóstico Técnico:* ${order.diagnosticoTecnico || 'Pendiente'}
----------------------------------------
*Costos Estimados:*
- Mano de Obra: $${order.costos.manoObra.toFixed(2)}
- Refacciones: $${order.costos.refacciones.toFixed(2)}
*TOTAL ESTIMADO:* $${order.costos.total.toFixed(2)}
----------------------------------------
_Gracias por su confianza. ¡Cuidamos tu tecnología, garantizamos tu satisfacción!_
`;
}
