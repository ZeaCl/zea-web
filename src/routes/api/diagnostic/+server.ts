import { json, type RequestHandler } from '@sveltejs/kit';
import { container } from '$lib/application/container';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();

    const result = await container.submitDiagnosticUseCase.execute({
      name: body.name,
      email: body.email,
      company: body.company,
      role: body.role,
      vertical: body.vertical,
      challenge: body.challenge
    });

    if (!result.success) {
      return json({ success: false, errors: result.errors }, { status: 400 });
    }

    return json({ success: true, leadId: result.leadId }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error inesperado del servidor';
    return json({ success: false, errors: [errorMsg] }, { status: 500 });
  }
};
