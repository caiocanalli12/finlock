import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div style={{ padding: '50px', color: 'var(--light-cyan)', backgroundColor: 'var(--evergreen)', minHeight: '100vh', fontFamily: 'Outfit' }}>
      <h1>Dashboard Privado</h1>
      <p>Você foi autenticado com sucesso. Aqui ficará o painel de finanças.</p>
      <Link to="/" style={{ color: 'var(--pearl-aqua)' }}>Sair (Voltar para a home)</Link>
    </div>
  );
}
