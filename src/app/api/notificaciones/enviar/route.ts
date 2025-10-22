import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Obtener la última encomienda para usar como ejemplo
    const { data: encomiendas, error: encomiendaError } = await supabase
      .from('encomiendas')
      .select(`
        id,
        codigo,
        transportista,
        fechaRecepcion,
        residenteId,
        usuarios!encomiendas_residenteId_fkey (
          id,
          nombre,
          email,
          departamentoId,
          departamentos!usuarios_departamentoId_fkey (
            id,
            numero,
            torre
          )
        )
      `)
      .order('fechaRecepcion', { ascending: false })
      .limit(1);

    if (encomiendaError) {
      console.error('Error al obtener encomienda:', encomiendaError);
      throw encomiendaError;
    }

    if (!encomiendas || encomiendas.length === 0) {
      return NextResponse.json(
        { error: 'No hay encomiendas disponibles para enviar la prueba' },
        { status: 404 }
      );
    }

    const encomienda = encomiendas[0];
    const residente = encomienda.usuarios;
    const departamento = residente?.departamentos;

    if (!residente) {
      return NextResponse.json(
        { error: 'No se encontró información del residente' },
        { status: 404 }
      );
    }

    const fechaFormateada = new Date(encomienda.fechaRecepcion).toLocaleString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Enviar correo con Resend
    const { data, error } = await resend.emails.send({
      from: 'CondoTrack <onboarding@resend.dev>', // Cambiar cuando tengas dominio propio
      to: [email],
      subject: '📦 Nueva encomienda recibida - CondoTrack (PRUEBA)',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; }
            .details { background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0; }
            .footer { background-color: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280; }
            .test-badge { margin-top: 20px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">📦 Nueva encomienda recibida</h1>
            </div>
            
            <div class="content">
              <p>Hola <strong>${residente.nombre}</strong>,</p>
              
              <p>Te informamos que ha llegado una nueva encomienda para ti en la conserjería del edificio.</p>
              
              <div class="details">
                <h3 style="margin-top: 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Detalles de la encomienda</h3>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0;"><strong>Código:</strong></td>
                    <td style="padding: 8px 0;">${encomienda.codigo}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Transportista:</strong></td>
                    <td style="padding: 8px 0;">${encomienda.transportista || 'No especificado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Fecha de llegada:</strong></td>
                    <td style="padding: 8px 0;">${fechaFormateada}</td>
                  </tr>
                  ${departamento ? `
                  <tr>
                    <td style="padding: 8px 0;"><strong>Ubicación:</strong></td>
                    <td style="padding: 8px 0;">Torre ${departamento.torre} · Depto ${departamento.numero}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <p>Por favor, acércate a la conserjería para retirar tu paquete presentando tu RUT o identificación.</p>
              
              <p style="font-size: 13px; font-style: italic; color: #6b7280;">
                Si tienes alguna consulta, responde este correo o contacta a la administración del edificio.
              </p>
              
              <div class="test-badge">
                <p style="margin: 0; font-size: 12px; color: #991b1b;">
                  <strong>🧪 CORREO DE PRUEBA</strong> - Este mensaje fue enviado como prueba del sistema de notificaciones a ${email}.
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">Este es un correo automático generado por CondoTrack</p>
              <p style="margin: 5px 0 0 0;">Sistema de gestión de encomiendas</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error al enviar correo con Resend:', error);
      throw error;
    }

    // Registrar la notificación en la base de datos
    const { error: notifError } = await supabase
      .from('notificaciones')
      .insert({
        encomiendaId: encomienda.id,
        medio: 'correo',
        mensaje: `Correo de prueba enviado a ${email}`,
        entregada: true,
      });

    if (notifError) {
      console.error('Error al registrar notificación:', notifError);
      // No lanzamos error porque el correo ya se envió
    }

    return NextResponse.json({
      success: true,
      message: 'Correo enviado exitosamente',
      emailId: data?.id,
    });

  } catch (error) {
    console.error('Error en el envío:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo de prueba' },
      { status: 500 }
    );
  }
}