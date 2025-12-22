
import React, { useState } from 'react';
import { Search, UserPlus, Phone, Loader2 } from 'lucide-react';
import { CustomerProfile } from '../types';
import { findCustomerByPhone, saveCustomer } from '../services/storageService';
import { AGE_RANGES } from '../constants';

interface CustomerLookupProps {
  onCustomerSelect: (customer: CustomerProfile) => void;
}

const CustomerLookup: React.FC<CustomerLookupProps> = ({ onCustomerSelect }) => {
  const [phone, setPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Registration Form State
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'男'|'女'>('女');
  const [newAge, setNewAge] = useState('30-39');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setIsLoading(true);
    try {
      const customer = await findCustomerByPhone(phone);
      if (customer) {
        onCustomerSelect(customer);
      } else {
        setIsRegistering(true);
      }
    } catch (error) {
      alert("查詢失敗，請檢查網路連線");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !newName) return;

    setIsLoading(true);
    const newCustomer: CustomerProfile = {
      id: phone,
      basic: {
        name: newName,
        phone: phone,
        ageRange: newAge,
        gender: newGender,
        hasChemicalHistory: '無'
      },
      lifestyle: {
        washFrequency: '每日',
        oilOnsetTime: '半天 (約12小時)',
        itchiness: '無',
        dandruff: '無',
        hairLossPerception: '正常',
        stressLevel: '中'
      },
      history: []
    };

    try {
      await saveCustomer(newCustomer);
      onCustomerSelect(newCustomer);
    } catch (error) {
      alert("建立檔案失敗，請檢查網路連線");
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistering) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-stone-100 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6 text-orange-700" />
          </div>
          <h2 className="text-xl font-bold text-stone-800">建立新顧客檔案</h2>
          <p className="text-stone-500 text-sm">找不到此電話號碼，請建立新資料</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">手機號碼</label>
            <input 
              type="tel" 
              value={phone} 
              disabled 
              className="w-full rounded-lg border-stone-300 bg-stone-100 text-stone-500 cursor-not-allowed font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">顧客姓名</label>
            <input 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-lg border-stone-300 bg-white text-stone-900 focus:border-orange-500 focus:ring-orange-500 placeholder-stone-400"
              required
              placeholder="請輸入姓名"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">性別</label>
                <select 
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value as '男'|'女')}
                  className="w-full rounded-lg border-stone-300 bg-white text-stone-900 focus:border-orange-500"
                >
                  <option value="女">女</option>
                  <option value="男">男</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">年齡區間</label>
                <select 
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value)}
                  className="w-full rounded-lg border-stone-300 bg-white text-stone-900 focus:border-orange-500"
                >
                  {AGE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
             </div>
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-700 hover:bg-orange-800 text-white font-bold py-3 rounded-xl shadow-md transition-all mt-4 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? '處理中...' : '建立檔案並開始'}
          </button>
          <button 
            type="button"
            onClick={() => setIsRegistering(false)}
            disabled={isLoading}
            className="w-full text-stone-400 hover:text-stone-600 text-sm font-medium py-2"
          >
            返回搜尋
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-stone-100 animate-fade-in-up mt-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-stone-800 mb-2">顧客資料</h2>
        <p className="text-stone-500">請輸入手機號碼以打開個人紀錄</p>
      </div>

      <form onSubmit={handleSearch} className="space-y-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-stone-400" />
          </div>
          <input
            type="tel"
            className="block w-full pl-10 pr-3 py-4 border border-stone-300 rounded-xl leading-5 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-lg transition-all font-bold"
            placeholder="請輸入手機號碼"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-orange-800 hover:bg-orange-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all text-lg"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          {isLoading ? '查詢中...' : '查詢 / 建立檔案'}
        </button>
      </form>
    </div>
  );
};

export default CustomerLookup;
