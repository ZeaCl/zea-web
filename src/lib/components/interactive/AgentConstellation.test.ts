import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import AgentConstellation from './AgentConstellation.svelte';

describe('AgentConstellation interactive component', () => {
  it('debe renderizar el nodo central del orquestador ZEA y los nodos de agentes', () => {
    render(AgentConstellation, { props: { lang: 'es' } });

    expect(screen.getByTestId('agent-node-core')).toBeInTheDocument();
    expect(screen.getByTestId('agent-node-legal')).toBeInTheDocument();
    expect(screen.getByTestId('agent-node-finance')).toBeInTheDocument();
  });

  it('debe permitir seleccionar un agente y mostrar su telemetría en el HUD inferior', async () => {
    render(AgentConstellation, { props: { lang: 'es' } });

    const financeNode = screen.getByTestId('agent-node-finance');
    await fireEvent.click(financeNode);

    const hud = screen.getByTestId('agent-telemetry-hud');
    expect(hud).toBeInTheDocument();
    expect(hud).toHaveTextContent('DETERMINISTIC LEDGER');
  });

  it('debe permitir disparar una tarea de misión crítica en el enjambre', async () => {
    render(AgentConstellation, { props: { lang: 'es' } });

    const triggerBtn = screen.getByTestId('trigger-swarm-btn');
    expect(triggerBtn).toBeInTheDocument();

    await fireEvent.click(triggerBtn);
    expect(triggerBtn).toBeInTheDocument();
  });
});
