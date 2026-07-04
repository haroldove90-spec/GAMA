import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generates a PDF from a DOM element.
 * @param elementId The ID of the HTML element to render.
 * @param orderNo The order number for naming the file.
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
  
  try {
    // Render using html2canvas with optimal settings
    const canvas = await html2canvas(element, {
      scale: 2, // Double resolution for crisp text
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#FFFFFF',
      windowWidth: 800,
    });

    // Restore original styles
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
