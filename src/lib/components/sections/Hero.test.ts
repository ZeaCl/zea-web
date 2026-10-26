import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Hero from './Hero.svelte';

describe('Hero component', () => {
  it('debe renderizar el titular de operaciones de misión crítica y métricas', () => {
    render(Hero, { props: { lang: 'es' } });

    expect(screen.getByText('Operaciones de Misión Crítica')).toBeInTheDocument();
    expect(screen.getByText('+2.600')).toBeInTheDocument();
    expect(screen.getByText('456')).toBeInTheDocument();
  });

  it('debe alternar entre los logs del terminal al hacer click en los botones de vertical', async () => {
    render(Hero, { props: { lang: 'es' } });

    expect(screen.getByText(/LEGAL AGENT/)).toBeInTheDocument();

    const financeBtn = screen.getByText('Finanzas & AUM');
    await fireEvent.click(financeBtn);

    expect(screen.getByText(/FINANCE AGENT/)).toBeInTheDocument();
  });
});
