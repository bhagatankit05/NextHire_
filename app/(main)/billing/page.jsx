"use client";

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  Zap, 
  Download, 
  Calendar,
  TrendingUp,
  AlertCircle,
  Plus,
  ChevronRight
} from 'lucide-react';

const Billing = () => {
  const [activePlan, setActivePlan] = useState('free');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [credits, setCredits] = useState(5);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem('userPlan') || 'free';
    const savedCredits = localStorage.getItem('userCredits') || '5';
    setActivePlan(savedPlan);
    setCredits(parseInt(savedCredits));
  }, []);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      yearlyPrice: 0,
      credits: 5,
      features: [
        '5 Interview Credits',
        'Basic AI Questions',
        'Email Support',
        'Standard Templates',
        'Basic Analytics'
      ],
      color: 'gray',
      popular: false
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 29,
      yearlyPrice: 290,
      credits: 50,
      features: [
        '50 Interview Credits/month',
        'Advanced AI Questions',
        'Priority Support',
        'Custom Templates',
        'Advanced Analytics',
        'Resume Parsing',
        'Team Collaboration'
      ],
      color: 'blue',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      yearlyPrice: 990,
      credits: 999,
      features: [
        'Unlimited Interviews',
        'Premium AI Models',
        '24/7 Priority Support',
        'Custom Branding',
        'Advanced Analytics Dashboard',
        'API Access',
        'Dedicated Account Manager',
        'Custom Integrations'
      ],
      color: 'purple',
      popular: false
    }
  ];

  const paymentHistory = [
    { id: 1, date: '2024-10-01', amount: 29, plan: 'Professional', status: 'paid' },
    { id: 2, date: '2024-09-01', amount: 29, plan: 'Professional', status: 'paid' },
    { id: 3, date: '2024-08-01', amount: 29, plan: 'Professional', status: 'paid' },
  ];

  const creditPackages = [
    { credits: 10, price: 9, bonus: 0 },
    { credits: 25, price: 20, bonus: 5 },
    { credits: 50, price: 35, bonus: 15 },
    { credits: 100, price: 60, bonus: 40 }
  ];

  const handleUpgrade = (planId) => {
    localStorage.setItem('userPlan', planId);
    const plan = plans.find(p => p.id === planId);
    localStorage.setItem('userCredits', plan.credits.toString());
    setActivePlan(planId);
    setCredits(plan.credits);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleBuyCredits = (pkg) => {
    const newCredits = credits + pkg.credits + pkg.bonus;
    localStorage.setItem('userCredits', newCredits.toString());
    setCredits(newCredits);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getPrice = (plan) => {
    return billingCycle === 'monthly' ? plan.price : plan.yearlyPrice;
  };

  const getSavings = (plan) => {
    if (billingCycle === 'yearly' && plan.price > 0) {
      const monthlyCost = plan.price * 12;
      const yearlyCost = plan.yearlyPrice;
      return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-1">Manage your plan and billing information</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Current Plan Overview */}
        <div className="bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-medium">CURRENT PLAN</p>
              <h2 className="text-3xl font-bold mt-1 capitalize">{activePlan}</h2>
              <p className="text-blue-100 mt-2">Next billing date: November 15, 2025</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                <p className="text-sm text-blue-100">Available Credits</p>
                <p className="text-4xl font-bold">{credits}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Manage Plan
            </button>
            <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors">
              View Invoice
            </button>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center">
          <div className="bg-white rounded-full p-1 shadow-md inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isActive = activePlan === plan.id;
            const savings = getSavings(plan);
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                  plan.popular ? 'ring-2 ring-blue-500' : ''
                } ${isActive ? 'ring-2 ring-green-400' : ''}`}
              >
                {plan.popular && (
                  <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                {isActive && (
                  <div className="bg-green-400 text-white text-center py-1 text-sm font-medium">
                    Current Plan
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">
                      ${getPrice(plan)}
                    </span>
                    {plan.price > 0 && (
                      <span className="ml-2 text-gray-600">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-green-600 text-sm font-medium mt-2">
                      Save {savings}% with yearly billing
                    </p>
                  )}
                  
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isActive}
                    className={`w-full mt-8 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isActive ? 'Current Plan' : 'Upgrade'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Buy Credits */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Buy Additional Credits</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPackages.map((pkg, idx) => (
              <div
                key={idx}
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-all cursor-pointer relative"
              >
                {pkg.bonus > 0 && (
                  <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    +{pkg.bonus} Bonus
                  </div>
                )}
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">
                    {pkg.credits + pkg.bonus}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">Credits</p>
                  <p className="text-2xl font-bold text-blue-500 mt-4">
                    ${pkg.price}
                  </p>
                  <button
                    onClick={() => handleBuyCredits(pkg)}
                    className="w-full mt-4 bg-blue-400 text-white py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Plan
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {new Date(payment.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">{payment.plan}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                      ${payment.amount}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <Check className="w-3 h-3 mr-1" />
                        Paid
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-blue-500 hover:text-blue-600 flex items-center gap-1 ml-auto">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
          <div className="border-2 border-gray-200 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/2025</p>
              </div>
            </div>
            <button className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2">
              Update
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button className="mt-4 text-blue-500 hover:text-blue-700 font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Payment Method
          </button>
        </div>
      </main>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-slide-up">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span className="font-medium">Transaction successful!</span>
        </div>
      )}
    </div>
  );
};

export default Billing;