'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Search, 
  Download, 
  RefreshCw, 
  GraduationCap,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const RetrographiePage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/retrographie');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        toast.error("Erreur lors de la récupération des données");
      }
    } catch (error) {
      toast.error("Erreur technique");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const filteredEtudiants = stats?.etudiants?.filter((e: any) => 
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.filiere.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Chargement de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
            <TrendingUp className="w-3 h-3" />
            Session en temps réel
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
            Rétrographie & <span className="text-emerald-500">Bulletins</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-lg">
            Certification et scellée automatique des relevés de notes dès complétude du cursus.
          </p>
        </div>

        <button 
          onClick={fetchStats}
          disabled={refreshing}
          className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser les données
        </button>
      </div>

      {/* Global Progress Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
      >
        <div className="flex justify-between items-end mb-6 relative z-10">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">État d'avancement global</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.progressionGlobale || 0}% <span className="text-emerald-500 text-lg">terminés</span></h3>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-slate-900">{stats?.complets || 0}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bulletins certifiés</p>
          </div>
        </div>
        
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative z-10 p-1">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stats?.progressionGlobale || 0}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full shadow-lg shadow-emerald-500/20"
          ></motion.div>
        </div>

        {/* Floating Decors */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Étudiants", value: stats?.totalEtudiants || 0, icon: GraduationCap, color: "text-slate-900" },
          { label: "En cours", value: stats?.enAttente || 0, icon: Clock, color: "text-amber-500" },
          { label: "Prêts à générer", value: stats?.complets || 0, icon: CheckCircle, color: "text-emerald-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and List */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un étudiant (Nom, Filière, Matricule)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-slate-700 font-medium placeholder:text-slate-300"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredEtudiants.length > 0 ? (
            filteredEtudiants.map((item: any) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-wrap items-center justify-between gap-6 hover:shadow-xl hover:border-emerald-200 transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                    item.status === 'Complet' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {item.nom.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{item.nom}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">{item.filiere}</span>
                      <span className="text-[10px] font-medium text-slate-300">ID: {item.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10 flex-1 md:flex-none justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-700">{item.notes}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Matières certifiées</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                      item.status === 'Complet' 
                      ? 'bg-slate-900 text-emerald-400 hover:bg-black hover:shadow-lg shadow-emerald-500/10' 
                      : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}>
                      {item.status === 'Complet' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Certifier le relevé
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          Cursus partiel
                        </>
                      )}
                    </button>
                    
                    {item.status === 'Complet' && (
                      <button className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white p-20 rounded-[3rem] border border-dashed border-slate-200 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Aucun étudiant trouvé</h3>
              <p className="text-slate-400 mt-2">Ajustez votre recherche ou actualisez les données.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetrographiePage;
