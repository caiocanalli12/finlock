import React, { useEffect, useState } from 'react';

const navItems = [
  { label: 'Benefícios', href: '#beneficios' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Investimentos', href: '#investimentos' },
];

const features = [
  {
    label: '01',
    title: 'Controle sem planilha infinita',
    text: 'Receitas, despesas e saldo ficam no mesmo contexto, com leitura rápida para a rotina.',
  },
  {
    label: '02',
    title: 'Categorias que explicam o mês',
    text: 'Veja onde o dinheiro está indo e identifique padrões antes que eles virem surpresa.',
  },
  {
    label: '03',
    title: 'Evolução com sinais claros',
    text: 'Indicadores e gráficos ajudam a entender se o mês está saudável ou precisa de ajuste.',
  },
  {
    label: '04',
    title: 'Planejamento para investir melhor',
    text: 'Simule aportes, taxas e períodos para tomar decisões com mais calma.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Cadastre-se',
    text: 'Crie sua conta de forma rápida e segura.',
  },
  {
    number: '02',
    title: 'Registre o essencial',
    text: 'Adicione entradas, saídas e categorias sem perder tempo.',
  },
  {
    number: '03',
    title: 'Leia o painel',
    text: 'Acompanhe saldo, evolução e próximos passos em uma única visão.',
  },
];

const transactions = [
  ['Salário', 'Receita', '+ R$ 5.800'],
  ['Mercado', 'Alimentação', '- R$ 324'],
  ['Tesouro Selic', 'Investimento', '+ R$ 450'],
  ['Internet', 'Moradia', '- R$ 109'],
];

const categories = [
  { label: 'Moradia', value: '36%', size: 36 },
  { label: 'Alimentação', value: '24%', size: 24 },
  { label: 'Transporte', value: '18%', size: 18 },
  { label: 'Lazer', value: '12%', size: 12 },
];

function Logo() {
  return (
    <a className="logo" href="#inicio" aria-label="Voltar ao início do FinLock">
      <span className="logo__mark" aria-hidden="true">
        <span className="logo__slot" />
      </span>
      <span>FinLock</span>
    </a>
  );
}

function Navbar({ theme, onToggleTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);
  const nextThemeLabel = theme === 'dark' ? 'modo claro' : 'modo escuro';

  return (
    <header className="site-header">
      <nav className="navbar container" aria-label="Navegação principal">
        <Logo />
        <button
          className="menu-toggle"
          type="button"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
        <div className={`nav-panel ${isOpen ? 'is-open' : ''}`}>
          <div className="nav-links">
            {navItems.map((item) => (
              <a href={item.href} key={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            ))}
          </div>
          <div className="nav-actions">
            <button
              className="theme-toggle"
              type="button"
              aria-label={`Alternar para ${nextThemeLabel}`}
              aria-pressed={theme === 'dark'}
              onClick={onToggleTheme}
            >
              <span aria-hidden="true" />
              {theme === 'dark' ? 'Claro' : 'Escuro'}
            </button>
            <a className="button button--ghost" href="/login" onClick={closeMenu}>
              Entrar
            </a>
            <a className="button button--primary" href="/cadastro" onClick={closeMenu}>
              Criar conta
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}

function LedgerChart() {
  return (
    <div className="ledger-chart" aria-label="Gráfico demonstrativo de evolução financeira">
      <svg viewBox="0 0 200 200" role="img" aria-hidden="true">
        <circle cx="100" cy="100" r="80" fill="none" strokeWidth="24" className="chart-track" />
        <circle cx="100" cy="100" r="80" fill="none" strokeWidth="24" className="chart-slice chart-slice-1" strokeDasharray="251 503" strokeDashoffset="0" />
        <circle cx="100" cy="100" r="80" fill="none" strokeWidth="24" className="chart-slice chart-slice-2" strokeDasharray="151 503" strokeDashoffset="-251" />
        <circle cx="100" cy="100" r="80" fill="none" strokeWidth="24" className="chart-slice chart-slice-3" strokeDasharray="101 503" strokeDashoffset="-402" />
      </svg>
    </div>
  );
}

function DashboardShell({ compact = false }) {
  return (
    <div className={`dashboard-shell ${compact ? 'dashboard-shell--compact' : ''}`}>
      <aside className="app-sidebar" aria-hidden="true">
        <Logo />
        <span />
        <span />
        <span />
      </aside>
      <div className="app-screen">
        <div className="app-toolbar">
          <div>
            <span>Hoje</span>
            <strong>Resumo financeiro</strong>
          </div>
          <p>Dados demonstrativos</p>
        </div>

        <div className="balance-row">
          <article className="balance-card">
            <span>Saldo disponível</span>
            <strong>R$ 8.420,00</strong>
            <small>+12% este mês</small>
          </article>
          <article className="balance-card balance-card--thin">
            <span>Receitas</span>
            <strong>R$ 6.900</strong>
          </article>
          <article className="balance-card balance-card--thin">
            <span>Despesas</span>
            <strong>R$ 3.180</strong>
          </article>
        </div>

        <div className="workspace-row">
          <article className="chart-panel">
            <div className="panel-title">
              <span>Evolução mensal</span>
              <strong>Fluxo positivo</strong>
            </div>
            <LedgerChart />
          </article>

          <article className="category-panel">
            <div className="panel-title">
              <span>Categorias</span>
              <strong>Distribuição</strong>
            </div>
            {categories.slice(0, compact ? 3 : 4).map((category) => (
              <div className="category-row" key={category.label}>
                <div>
                  <span>{category.label}</span>
                  <small>{category.value}</small>
                </div>
                <div className="category-track">
                  <span style={{ width: `${category.size}%` }} />
                </div>
              </div>
            ))}
          </article>
        </div>

        {!compact && (
          <div className="transaction-strip" aria-label="Lançamentos demonstrativos">
            {transactions.map(([name, type, value]) => (
              <div className="transaction" key={name}>
                <span>{name}</span>
                <small>{type}</small>
                <strong className={value.startsWith('+') ? 'is-positive' : ''}>{value}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero section" id="inicio">
      <div className="container hero__grid">
        <div className="hero__content reveal">
          <p className="eyebrow">Organização financeira com segurança</p>
          <h1>Seu dinheiro, sem ruído.</h1>
          <p className="hero__lead">
            O FinLock reúne saldo, gastos, categorias e investimentos em um painel direto, para você
            entender o mês sem depender de planilhas confusas.
          </p>
          <div className="hero__actions">
            <a className="button button--primary button--large" href="/cadastro">
              Começar agora
            </a>
            <a className="button button--secondary button--large" href="#dashboard">
              Ver o painel
            </a>
          </div>
        </div>

        <div className="hero__visual reveal reveal--delay" aria-label="Prévia visual do dashboard">
          <div className="security-note">
            <span>lock</span>
            <strong>Dados organizados por contexto</strong>
          </div>
          <DashboardShell />
        </div>
      </div>
      <div className="container hero__baseline" aria-label="Destaques do FinLock">
        <span>SPA preparada para dashboard</span>
        <span>Login e cadastro previstos</span>
        <span>Investimentos em evolução</span>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="section benefits-section" id="beneficios">
      <div className="container split-heading reveal">
        <p className="eyebrow">Benefícios</p>
        <h2>Organização financeira com cara de produto, não de planilha maquiada.</h2>
      </div>
      <div className="container feature-list">
        {features.map((feature) => (
          <article className="feature-row reveal" key={feature.title}>
            <span>{feature.label}</span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="section how-section" id="como-funciona">
      <div className="container how-grid">
        <div className="section-heading section-heading--left reveal">
          <p className="eyebrow">Como funciona</p>
          <h2>Uma rotina curta para tirar as finanças do improviso.</h2>
        </div>
        <div className="steps">
          {steps.map((step) => (
            <article className="step reveal" key={step.number}>
              <span>{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="section dashboard-section" id="dashboard">
      <div className="container dashboard-grid">
        <div className="section-heading section-heading--left reveal">
          <p className="eyebrow">Dashboard</p>
          <h2>A experiência depois do login precisa parecer centralizada desde o primeiro olhar.</h2>
          <p>
            O painel demonstra como saldo, receitas, despesas, evolução e categorias podem conviver
            em uma tela única, com dados fictícios para apresentação.
          </p>
        </div>
        <div className="reveal reveal--delay">
          <DashboardShell compact />
        </div>
      </div>
    </section>
  );
}

function InvestmentsSection() {
  return (
    <section className="section investments" id="investimentos">
      <div className="container investments-grid">
        <div className="investment-panel reveal">
          <div className="investment-panel__header">
            <span>Simulação futura</span>
            <strong>R$ 32.780</strong>
          </div>
          <div className="investment-inputs">
            <div>
              <span>Valor inicial</span>
              <strong>R$ 5.000</strong>
            </div>
            <div>
              <span>Aporte mensal</span>
              <strong>R$ 450</strong>
            </div>
            <div>
              <span>Taxa estimada</span>
              <strong>0,85% a.m.</strong>
            </div>
            <div>
              <span>Período</span>
              <strong>48 meses</strong>
            </div>
          </div>
          <div className="projection-line" aria-hidden="true">
            <span />
          </div>
        </div>
        <div className="section-heading section-heading--left reveal reveal--delay">
          <p className="eyebrow">Investimentos</p>
          <h2>Projeções simples antes de comprometer o orçamento.</h2>
          <p>
            A seção prepara o terreno para acompanhar investimentos, consultar informações, informar
            valor inicial, aportes, taxa e período. O simulador real fica para a próxima etapa.
          </p>
          <a className="button button--secondary" href="/cadastro">
            Preparar minha conta
          </a>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="final-cta section">
      <div className="container final-cta__inner reveal">
        <div>
          <p className="eyebrow">Comece com clareza</p>
          <h2>Organize o mês antes que ele organize você.</h2>
        </div>
        <p>
          O FinLock ajuda você a acompanhar sua evolução financeira e planejar próximos passos com
          mais calma.
        </p>
        <a className="button button--primary button--large" href="/cadastro">
          Começar agora
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Logo />
          <p>
            Plataforma web para organização financeira pessoal, controle de gastos e planejamento
            com mais segurança.
          </p>
        </div>
        <nav className="footer__links" aria-label="Links do rodapé">
          {navItems.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
          <a href="/login">Login</a>
          <a href="/cadastro">Cadastro</a>
        </nav>
      </div>
      <div className="container footer__bottom">
        <span>© 2026 FinLock. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('finlock-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    return 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('finlock-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <DashboardPreview />
        <InvestmentsSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
