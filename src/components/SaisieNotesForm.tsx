"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FileText } from "lucide-react";

export default function SaisieNotesForm() {
  const { data: session } = useSession();
  
  // 1. Initialisation de l'état du formulaire (selon la structure demandée)
  const [formData, setFormData] = useState({
    filiere: "",
    classe: "",
    matricule: "",
    ue: "",
    enseignant: session?.user?.name || "MENAH Michelle",
    semestre: "",
    typeEvaluation: "DS",
    coefficient: 4,
    valeur: ""
  });

  // États pour les listes déroulantes
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [matieres, setMatieres] = useState<any[]>([]);
  const [semestres, setSemestres] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Charger les classes et semestres au montage
  useEffect(() => {
    Promise.all([
      fetch('/api/classes').then(r => r.json()),
      fetch('/api/semestres?actif=true').then(r => r.json())
    ]).then(([cls, sem]) => {
      setClasses(Array.isArray(cls) ? cls : []);
      const semData = Array.isArray(sem) ? sem : [];
      setSemestres(semData);
      
      // Update enseignant et semestre par défaut
      setFormData(prev => ({
        ...prev,
        enseignant: session?.user?.name || "MENAH Michelle",
        semestre: semData.length > 0 ? semData[0].id : "Semestre 1"
      }));
      setLoadingData(false);
    }).catch(() => setLoadingData(false));
  }, [session]);

  // Charger les étudiants et matières quand la classe change
  useEffect(() => {
    if (formData.classe) {
      Promise.all([
        fetch(`/api/classes/${formData.classe}/etudiants`).then(r => r.json()),
        fetch(`/api/matieres?classeId=${formData.classe}`).then(r => r.json())
      ]).then(([etud, mat]) => {
        setStudents(Array.isArray(etud) ? etud : []);
        setMatieres(Array.isArray(mat) ? mat : []);
        
        // Auto-remplir la filière si disponible
        const selectedClasse = classes.find(c => c.id === formData.classe);
        if (selectedClasse?.filiere) {
          setFormData(prev => ({ ...prev, filiere: selectedClasse.filiere }));
        }
      });
    } else {
      setStudents([]);
      setMatieres([]);
    }
  }, [formData.classe, classes]);

  // Mettre à jour le matricule quand l'étudiant change
  useEffect(() => {
    if (formData.matricule && students.length > 0) {
      // In this specific setup, the student ID might be saved in 'matricule' field for API, 
      // or we can just find it.
      const student = students.find(s => s.id === formData.matricule);
      // It's handled naturally.
    }
  }, [formData.matricule, students]);

  // 2. Gestion des changements dans les champs
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Logique de gestion des actions du formulaire (Nouveau standard Elite)
  const handleActions = async (actionType: string) => {
    // 1. ACTION : ACTUALISER
    if (actionType === 'actualiser') {
      setFormData(prev => ({ ...prev, valeur: "", matricule: "" }));
      toast("Formulaire réinitialisé");
      return;
    }

    // 2. ACTION : VALIDER
    if (actionType === 'valider') {
      if (!formData.valeur || parseFloat(formData.valeur) > 20 || parseFloat(formData.valeur) < 0) {
        toast.error("Note invalide (doit être entre 0 et 20)");
        return;
      }
      toast.success("Données validées, prêtes pour l'enregistrement");
    }

    // 3. ACTION : ENREGISTRER
    if (actionType === 'enregistrer') {
      // Validation plus précise par champ pour guider l'utilisateur
      if (!formData.matricule) {
        toast.error("Veuillez sélectionner un Étudiant avant d'enregistrer.");
        return;
      }
      if (!formData.ue) {
        toast.error("Veuillez sélectionner une Matière (UE) avant d'enregistrer.");
        return;
      }
      if (formData.valeur === "" || formData.valeur === undefined || formData.valeur === null) {
        toast.error("Veuillez saisir une Note valide.");
        return;
      }
      
      // Suppression de la restriction restrictive sur la longueur du ID semestre (ex: s1, s2 doivent passer)
      if (!formData.semestre) {
        toast.error("Aucune session académique active identifiée. Contactez l'administration.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/retrographie/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matricule: formData.matricule,
            id_matiere: formData.ue,
            note: formData.valeur,
            id_semestre: formData.semestre,
            type_evaluation: formData.typeEvaluation,
            coefficient: Number(formData.coefficient),
            date_saisie: new Date().toISOString()
          })
        });

        if (response.ok) {
          toast.success("Note enregistrée dans la session de Rétrographie !");
          setFormData(prev => ({ ...prev, valeur: "", matricule: "" }));
        } else {
          const err = await response.json();
          toast.error(err.error || "Erreur lors de l'enregistrement");
        }
      } catch (error) {
        toast.error("Erreur technique lors de l'envoi");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loadingData) {
    return <div className="p-6 text-center text-slate-500 font-bold animate-pulse">Initialisation Protocole Saisie...</div>;
  }

  return (
    <div className="p-8 space-y-6 bg-white rounded-3xl shadow-xl w-full max-w-4xl mx-auto border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-black shadow-neon-soft">
          <FileText className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
           <h2 className="text-xl font-black text-slate-900 uppercase leading-none">Saisie de Notes Élite</h2>
           <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mt-1">Certification en temps réel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Classe */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">1. Classe</label>
          <select 
            name="classe" 
            value={formData.classe}
            onChange={handleChange}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            required
          >
            <option value="">-- Sélectionner Classe --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>

        {/* 2. Filière (Auto) */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">2. Filière</label>
          <input 
            type="text" 
            name="filiere" 
            value={formData.filiere}
            readOnly
            placeholder="Générée automatiquement"
            className="w-full p-4 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 shadow-inner"
          />
        </div>

        {/* 3. Étudiant / Matricule */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">3. Étudiant / Matricule</label>
          <select 
            name="matricule" 
            value={formData.matricule}
            onChange={handleChange}
            disabled={!formData.classe}
            className="w-full p-4 bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl shadow-sm focus:border-emerald-500 outline-none uppercase font-bold"
            required
          >
            <option value="">-- Sélectionner Étudiant --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.matricule} - {s.user.nom} {s.user.prenom}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Matière / UE */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">4. Matière (UE)</label>
          <select 
            name="ue" 
            value={formData.ue}
            onChange={handleChange}
            disabled={!formData.classe}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:border-emerald-500 outline-none"
            required
          >
            <option value="">-- Sélectionner UE --</option>
            {matieres.map(m => (
              <option key={m.id} value={m.id}>{m.intitule} ({m.credits} CR)</option>
            ))}
          </select>
        </div>

        {/* 5. Semestre */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">5. Semestre</label>
          <select 
            name="semestre" 
            value={formData.semestre}
            onChange={handleChange}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:border-emerald-500 outline-none"
            required
          >
            {semestres.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}
          </select>
        </div>

        {/* 6. Enseignant */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">6. Enseignant</label>
          <input 
            type="text" 
            name="enseignant" 
            value={formData.enseignant}
            readOnly
            className="w-full p-4 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 shadow-inner uppercase text-sm font-bold"
          />
        </div>

        {/* 7. Type d'Évaluation & Crédit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Type</label>
            <select 
              name="typeEvaluation" 
              value={formData.typeEvaluation}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:border-emerald-500 outline-none"
            >
              <option value="CC">CC</option>
              <option value="DS">DS</option>
              <option value="EXAM">EXAM</option>
              <option value="TP">TP</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Crédit (UE)</label>
            <input 
              type="number" 
              name="coefficient" 
              min="1"
              value={formData.coefficient}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:border-emerald-500 outline-none text-center"
            />
          </div>
        </div>

        {/* 8. NOTE */}
        <div>
          <label className="block text-xs font-bold uppercase text-[#1dff2f] bg-slate-900 rounded-t-xl px-4 py-2 border-b border-slate-800">Note / 20</label>
          <input 
            type="number" 
            name="valeur"
            min="0"
            max="20"
            step="0.1"
            value={formData.valeur}
            onChange={handleChange}
            placeholder="Ex: 14.5"
            className="w-full p-4 bg-slate-900 text-[#1dff2f] rounded-b-xl text-3xl font-black text-center shadow-inner focus:outline-none focus:ring-2 focus:ring-[#1dff2f]"
            required
          />
          <p className="text-[9px] text-slate-500 mt-2 italic flex items-center gap-1.5 px-1 truncate">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Si une note existe déjà, elle sera mise à jour.
          </p>
        </div>
      </div>

      {/* Triple Actions Bar (Standard Elite) */}
      <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-4">
        <button 
          onClick={() => handleActions('actualiser')}
          className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black uppercase tracking-widest rounded-full border border-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          Actualiser
        </button>
        <button 
          onClick={() => handleActions('enregistrer')}
          disabled={loading}
          className="flex-[2] py-4 bg-slate-950 text-[#1dff2f] border border-emerald-500/30 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 font-black uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Chiffrement..." : "ENREGISTRER LA NOTE"}
        </button>
      </div>
    </div>
  );
}
