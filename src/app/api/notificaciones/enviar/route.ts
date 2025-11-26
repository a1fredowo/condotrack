import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value;
    console.log('[API Notif Enviar] Token presente:', !!token);
    
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    console.log('[API Notif Enviar] Usuario:', user?.nombre, 'Rol:', user?.rol);
    
    if (!user || !['admin', 'conserje'].includes(user.rol)) {
      console.log('[API Notif Enviar] Acceso denegado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { encomiendaId, email, residenteNombre, codigo, transportista } = body;

    if (!encomiendaId || !email) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Obtener datos de la encomienda
    const { data: encomienda, error: encError } = await supabase
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
          departamentos!usuarios_departamentoId_fkey (
            numero,
            torre
          )
        )
      `)
      .eq('id', encomiendaId)
      .single();

    if (encError || !encomienda) {
      return NextResponse.json(
        { error: 'Encomienda no encontrada' },
        { status: 404 }
      );
    }

    const residente = encomienda.usuarios;
    const departamento = residente?.departamentos;

    const fechaFormateada = new Date(encomienda.fechaRecepcion).toLocaleString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const nombreResidente = residenteNombre || residente?.nombre || 'Residente';
    const codigoEnc = codigo || encomienda.codigo;
    const transportistaEnc = transportista || encomienda.transportista;

    // Enviar correo con Resend
    const { data, error } = await resend.emails.send({
      from: 'CondoTrack <onboarding@resend.dev>',
      to: [email],
      subject: `📦 Encomienda pendiente de retiro - ${codigoEnc}`,
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
            .cta { margin-top: 20px; padding: 15px; background-color: #dbeafe; border-radius: 8px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">📦 Tienes una encomienda esperando</h1>
            </div>
            
            <div class="content">
              <p>Hola <strong>${nombreResidente}</strong>,</p>
              
              <p>Te recordamos que tienes una encomienda pendiente de retiro en la conserjería del edificio.</p>
              
              <div class="details">
                <h3 style="margin-top: 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Detalles de la encomienda</h3>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0;"><strong>Código:</strong></td>
                    <td style="padding: 8px 0;">${codigoEnc}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Transportista:</strong></td>
                    <td style="padding: 8px 0;">${transportistaEnc || 'No especificado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Fecha de llegada:</strong></td>
                    <td style="padding: 8px 0;">${fechaFormateada}</td>
                  </tr>
                  ${departamento ? `
                  <tr>
                    <td style="padding: 8px 0;"><strong>Destino:</strong></td>
                    <td style="padding: 8px 0;">Torre ${departamento.torre} · Depto ${departamento.numero}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <div class="cta">
                <p style="margin: 0; font-size: 14px;">
                  <strong>🏢 Acércate a la conserjería</strong><br>
                  Presenta el Codigo QR para retirar tu paquete.
                </p>
              </div>
              
              <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">
                Si ya retiraste esta encomienda, puedes ignorar este mensaje.
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">CondoTrack · Sistema de gestión de encomiendas</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error al enviar correo con Resend:', error);
      return NextResponse.json(
        { error: 'Error al enviar el correo' },
        { status: 500 }
      );
    }

    // Registrar la notificación en la base de datos
    await supabase
      .from('notificaciones')
      .insert({
        encomiendaId: encomienda.id,
        medio: 'correo',
        mensaje: `Recordatorio enviado a ${email} para encomienda ${codigoEnc}`,
        entregada: true,
      });

    console.log('📧 Notificación enviada a:', email, 'para encomienda:', codigoEnc);

    return NextResponse.json({
      success: true,
      message: 'Notificación enviada exitosamente',
      emailId: data?.id,
    });

  } catch (error) {
    console.error('Error en el envío:', error);
    return NextResponse.json(
      { error: 'Error al enviar la notificación' },
      { status: 500 }
    );
  }
}