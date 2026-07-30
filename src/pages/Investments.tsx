import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Wallet, TrendingUp, DollarSign, Calculator, Target, Briefcase, Pencil, Check } from 'lucide-react';

// Mock Data
const MOCKED_ASSETS: any[] = [];

export default function Investments() {
  const [availableBalance] = useState(() => {
    const savedInitialBalance = localStorage.getItem('finlock_initial_balance');
    let balance = 0;
    if (savedInitialBalance) {
      const parsedBalance = parseFloat(savedInitialBalance);
      if (!isNaN(parsedBalance) && parsedBalance > 0) {
        balance += parsedBalance;
      }
    }
    
    // Mocks padrão da Dashboard
    balance += 5800; // Salário (Receita)
    balance -= 324.50; // Mercado (Despesa)
    balance -= 109; // Internet (Despesa)
    
    return balance;
  });
  
  const [totalInvested, setTotalInvested] = useState(() => {
    const saved = localStorage.getItem('finlock_investments_total');
    if (saved) return parseFloat(saved);
    return MOCKED_ASSETS.reduce((acc, asset) => acc + asset.value, 0);
  });

  const [isEditingInvested, setIsEditingInvested] = useState(false);
  const [editInvestedValue, setEditInvestedValue] = useState(totalInvested.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingInvested && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingInvested]);

  const handleSaveInvested = () => {
    const parsed = parseFloat(editInvestedValue);
    if (!isNaN(parsed) && parsed >= 0) {
      setTotalInvested(parsed);
      localStorage.setItem('finlock_investments_total', parsed.toString());
    } else {
      setEditInvestedValue(totalInvested.toString());
    }
    setIsEditingInvested(false);
  };

  // Calculadora State
  const [initialAmount, setInitialAmount] = useState<string>('');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('');
  const [period, setPeriod] = useState<string>('');
  const [periodType, setPeriodType] = useState<'months' | 'years'>('months');
  const [interestRate, setInterestRate] = useState<string>('');
  const [rateType, setRateType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  
  const [projection, setProjection] = useState<{ finalAmount: number, totalInvested: number, totalInterest: number } | null>(null);

  // Vincular taxa ao ativo selecionado
  useEffect(() => {
    if (selectedAssetId) {
      const asset = MOCKED_ASSETS.find(a => a.id === selectedAssetId);
      if (asset) {
        setInterestRate(asset.expectedReturn.toString());
        setRateType('monthly'); // Mocks são baseados em rentabilidade mensal
      }
    }
  }, [selectedAssetId]);

  // Cálculo de juros compostos
  useEffect(() => {
    const P = parseFloat(initialAmount) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    const t = parseFloat(period) || 0;
    let r = parseFloat(interestRate) || 0;

    if (t <= 0) {
      setProjection(null);
      return;
    }

    let rateDecimal = r / 100;

    // Normaliza o período para meses (a fórmula assume aportes mensais)
    const totalMonths = periodType === 'years' ? t * 12 : t;
    
    // Normaliza a taxa de juros para mensal
    let monthlyRate = rateDecimal;
    if (rateType === 'yearly' && rateDecimal > 0) {
      // Converte taxa anual para taxa mensal equivalente
      monthlyRate = Math.pow(1 + rateDecimal, 1 / 12) - 1;
    }

    let finalAmount = 0;
    
    if (monthlyRate === 0) {
      finalAmount = P + (PMT * totalMonths);
    } else {
      // Fórmula: Montante = P(1+i)^n + PMT[((1+i)^n - 1)/i]
      finalAmount = P * Math.pow(1 + monthlyRate, totalMonths) + PMT * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    }

    const totalInvestedPrincipal = P + (PMT * totalMonths);
    const totalInterest = finalAmount - totalInvestedPrincipal;

    setProjection({
      finalAmount,
      totalInvested: totalInvestedPrincipal,
      totalInterest
    });

  }, [initialAmount, monthlyContribution, period, periodType, interestRate, rateType]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Agrupar ativos por categoria
  const groupedAssets = MOCKED_ASSETS.reduce((acc, asset) => {
    if (!acc[asset.category]) acc[asset.category] = [];
    acc[asset.category].push(asset);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* HEADER */}
      <div>
        <h2 style={{ color: 'var(--text-main)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>Investimentos</h2>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Gerencie sua carteira e simule seus rendimentos futuros.</p>
      </div>

      {/* LINHA 1: SALDOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <article className="balance-card" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 500 }}>
              <Wallet size={20} color="var(--primary)" />
              Saldo Disponível
            </span>
          </div>
          <strong style={{ color: 'var(--text-main)', fontSize: '2rem', display: 'block', marginTop: '12px' }}>
            {formatCurrency(availableBalance)}
          </strong>
        </article>

        <article className="balance-card" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 500 }}>
              <TrendingUp size={20} color="var(--primary)" />
              Saldo de Investimentos
            </span>
            {!isEditingInvested && (
              <button 
                onClick={() => setIsEditingInvested(true)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Editar saldo"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>
          {isEditingInvested ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <input
                ref={inputRef}
                type="number"
                step="0.01"
                value={editInvestedValue}
                onChange={e => setEditInvestedValue(e.target.value)}
                onBlur={handleSaveInvested}
                onKeyDown={e => e.key === 'Enter' && handleSaveInvested()}
                style={{ fontSize: '1.8rem', padding: '4px 8px', width: '100%', maxWidth: '200px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--primary)', borderRadius: '8px', fontWeight: 'bold' }}
              />
              <button onClick={handleSaveInvested} style={{ background: 'var(--primary)', color: 'var(--bg-main)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={20} />
              </button>
            </div>
          ) : (
            <strong style={{ color: 'var(--text-main)', fontSize: '2rem', display: 'block', marginTop: '12px' }}>
              {formatCurrency(totalInvested)}
            </strong>
          )}
        </article>
      </div>

      {/* LINHA 2: DISTRIBUIÇÃO DE ATIVOS */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ color: 'var(--text-main)', marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif' }}>
          <Briefcase size={20} color="var(--primary)" />
          Distribuição de Ativos
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {MOCKED_ASSETS.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Briefcase size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto', display: 'block' }} />
              <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>Nenhum ativo cadastrado.</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>A sua carteira de ativos distribuídos aparecerá aqui.</p>
            </div>
          ) : (
            (Object.entries(groupedAssets) as [string, any[]][]).map(([category, assets]) => (
              <div key={category}>
                <h4 style={{ color: 'var(--text-muted)', margin: '0 0 12px 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {category}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                  {assets.map((asset: any) => (
                    <div key={asset.id} style={{ 
                      backgroundColor: 'rgba(157, 181, 178, 0.05)', 
                      border: '1px solid rgba(157, 181, 178, 0.2)', 
                      borderRadius: '12px', 
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'transform 0.2s',
                      cursor: 'default'
                    }} className="asset-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>{asset.ticker}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', backgroundColor: 'rgba(157,181,178,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                          +{asset.expectedReturn}% a.m.
                        </span>
                      </div>
                      <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', opacity: 0.9 }}>{asset.name}</span>
                      <strong style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginTop: '4px' }}>
                        {formatCurrency(asset.value)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* LINHA 3: CALCULADORA DE JUROS COMPOSTOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Formulário */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ color: 'var(--text-main)', marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif' }}>
            <Calculator size={20} color="var(--primary)" />
            Simulador de Juros Compostos
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>Aporte Inicial (R$)</label>
                <input 
                  type="number" 
                  value={initialAmount} 
                  onChange={e => setInitialAmount(e.target.value)} 
                  placeholder="0.00"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', marginTop: '8px' }}
                />
              </div>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>Aporte Mensal (R$)</label>
                <input 
                  type="number" 
                  value={monthlyContribution} 
                  onChange={e => setMonthlyContribution(e.target.value)} 
                  placeholder="0.00"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', marginTop: '8px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>Período</label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <input 
                  type="number" 
                  value={period} 
                  onChange={e => setPeriod(e.target.value)} 
                  placeholder="Ex: 12"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                />
                <select 
                  value={periodType} 
                  onChange={e => setPeriodType(e.target.value as 'months' | 'years')}
                  style={{ width: '120px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                >
                  <option value="months">Meses</option>
                  <option value="years">Anos</option>
                </select>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(157, 181, 178, 0.2)', margin: '8px 0' }}></div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>Vincular taxa a um ativo da carteira</label>
              <select 
                value={selectedAssetId} 
                onChange={e => setSelectedAssetId(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)', marginTop: '8px', cursor: 'pointer' }}
              >
                <option value="">-- Taxa Personalizada --</option>
                {MOCKED_ASSETS.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.ticker} ({asset.expectedReturn}% ao mês)</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>
                Taxa de Rendimento (%)
              </label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <input 
                  type="number" 
                  step="0.01"
                  value={interestRate} 
                  onChange={e => {
                    setInterestRate(e.target.value);
                    setSelectedAssetId(''); 
                  }} 
                  placeholder="Ex: 1.0"
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    borderRadius: '8px', 
                    backgroundColor: 'var(--bg-main)', 
                    border: '1px solid',
                    borderColor: selectedAssetId ? 'var(--primary)' : 'var(--border)', 
                    color: 'var(--text-main)', 
                    transition: 'border-color 0.2s'
                  }}
                />
                <select 
                  value={rateType} 
                  onChange={e => {
                    setRateType(e.target.value as 'monthly' | 'yearly');
                    setSelectedAssetId(''); 
                  }}
                  style={{ width: '120px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                >
                  <option value="monthly">ao mês</option>
                  <option value="yearly">ao ano</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: 'var(--text-main)', marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif' }}>
            <Target size={20} color="var(--primary)" />
            Projeção Final
          </h3>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px' }}>
            {projection ? (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <div style={{ backgroundColor: 'rgba(157, 181, 178, 0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(157, 181, 178, 0.2)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor Total Acumulado</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '2.5rem', lineHeight: 1, wordBreak: 'break-word' }}>
                    {formatCurrency(projection.finalAmount)}
                  </strong>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Total Investido</span>
                    <strong style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}>{formatCurrency(projection.totalInvested)}</strong>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Total em Juros</span>
                    <strong style={{ color: '#4ade80', fontSize: '1.2rem' }}>+ {formatCurrency(projection.totalInterest)}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
                <DollarSign size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>Preencha os dados do aporte e do período ao lado para simular seus rendimentos.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .asset-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
