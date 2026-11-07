import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Header from './Header.svelte';

describe('Header component', () => {
  it('debe renderizar el logo ZEA tipográfico, el enlace a GitHub y los iconos de Apple/Android', () => {
    render(Header, { props: { lang: 'es', platform: 'ios' } });

    expect(screen.getByLabelText('ZEA')).toBeInTheDocument();
    expect(screen.getByTestId('github-link')).toBeInTheDocument();
    expect(screen.getByTestId('header-tab-ios')).toBeInTheDocument();
    expect(screen.getByTestId('header-tab-android')).toBeInTheDocument();
  });

  it('debe permitir cambiar de plataforma entre iOS y Android con los iconos sueltos', async () => {
    render(Header, { props: { lang: 'es', platform: 'ios' } });

    const btnIos = screen.getByTestId('header-tab-ios');
    const btnAndroid = screen.getByTestId('header-tab-android');

    expect(btnIos).toHaveClass('text-white');

    await fireEvent.click(btnAndroid);
    expect(btnAndroid).toHaveClass('text-[#3ddc84]');
  });

  it('debe permitir cambiar de idioma entre ENG y ES mediante texto y switch iOS', async () => {
    render(Header, { props: { lang: 'es' } });

    const btnEn = screen.getByTestId('lang-btn-en');
    const btnEs = screen.getByTestId('lang-btn-es');
    const switchBtn = screen.getByTestId('ios-lang-switch');

    expect(btnEn).toBeInTheDocument();
    expect(btnEs).toBeInTheDocument();
    expect(switchBtn).toBeInTheDocument();

    await fireEvent.click(switchBtn);
    expect(switchBtn).toHaveAttribute('aria-checked', 'true');
    expect(btnEn).toHaveClass('font-bold');

    await fireEvent.click(btnEs);
    expect(switchBtn).toHaveAttribute('aria-checked', 'false');
    expect(btnEs).toHaveClass('font-bold');
  });

  it('debe renderizar los enlaces de navegación Products, Developer e Industries y permitir cambiar activeNav', async () => {
    render(Header, { props: { lang: 'es', activeNav: 'industries' } });

    const navProducts = screen.getByTestId('nav-products');
    const navDeveloper = screen.getByTestId('nav-developer');
    const navIndustries = screen.getByTestId('nav-industries');

    expect(navProducts).toBeInTheDocument();
    expect(navDeveloper).toBeInTheDocument();
    expect(navIndustries).toBeInTheDocument();

    expect(navIndustries).toHaveClass('text-white font-bold');

    await fireEvent.click(navDeveloper);
    expect(navDeveloper).toHaveClass('text-white font-bold');

    await fireEvent.click(navProducts);
    expect(navProducts).toHaveClass('text-white font-bold');
  });
});
