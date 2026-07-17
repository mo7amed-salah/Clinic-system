import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import {
  Stethoscope, LayoutDashboard, Calendar, Users, LogOut, Lock, User,
  AlertCircle, Plus, X, UserPlus, Clock
} from "lucide-react";

const inputStyle = { border: "1px solid #E7E1D6", borderRadius: "8px", padding: "8px 10px", fontSize: "14px", outline: "none", backgroundColor: "#FAF7F2", width: "100%" };

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 mb-3">
      <span className="text-sm font-semibold" style={{ color: "#1C2626" }}>{label}</span>
      {children}
    </label>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(28,38,38,0.5)" }}>
      <div className="rounded-xl w-full max-w-lg" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "#E7E1D6" }}>
          <h3 className="text-lg font-bold" style={{ color: "#1C2626" }}>{title}</h3>
          <button onClick={onClose}><X size={20} color="#1C2626" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientForm, setPatientForm] = useState({ name: "", phone: "", email: "", birth_date: "", gender: "male" });

  const [showApptModal, setShowApptModal] = useState(false);
  const [apptForm, setApptForm] = useState({ patient_id: "", doctor_id: "", appt_date: "", appt_time: "", visit_type: "new", fee: "" });

  // -------------------------------------------------------------
  // Auth: watch the current session
  // -------------------------------------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load this user's profile (permissions) once logged in
  useEffect(() => {
    if (!session) { setProfile(null); return; }
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error("Could not load profile:", error.message);
        setProfile(data || null);
      });
  }, [session]);

  // -------------------------------------------------------------
  // Load core data once logged in
  // -------------------------------------------------------------
  useEffect(() => {
    if (!session) return;
    loadAll();
  }, [session]);

  async function loadAll() {
    setLoadingData(true);
    const [{ data: p }, { data: d }, { data: a }] = await Promise.all([
      supabase.from("patients").select("*").order("created_at", { ascending: false }),
      supabase.from("doctors").select("*"),
      supabase.from("appointments").select("*").order("appt_date", { ascending: true }),
    ]);
    setPatients(p || []);
    setDoctors(d || []);
    setAppointments(a || []);
    setLoadingData(false);
  }

  const doctorName = (id) => doctors.find((d) => d.id === id)?.name || "-";
  const patientName = (id) => patients.find((p) => p.id === id)?.name || "-";

  async function handleLogin() {
    setLoggingIn(true);
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    if (error) setLoginError(error.message);
    setLoggingIn(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function submitPatient() {
    if (!patientForm.name || !patientForm.phone) return;
    const { error } = await supabase.from("patients").insert([patientForm]);
    if (error) { alert("خطأ: " + error.message); return; }
    setPatientForm({ name: "", phone: "", email: "", birth_date: "", gender: "male" });
    setShowPatientModal(false);
    loadAll();
  }

  async function submitAppt() {
    if (!apptForm.patient_id || !apptForm.doctor_id || !apptForm.appt_date || !apptForm.appt_time) return;
    const { error } = await supabase.from("appointments").insert([{ ...apptForm, fee: Number(apptForm.fee) || 0 }]);
    if (error) { alert("خطأ: " + error.message); return; }
    setApptForm({ patient_id: "", doctor_id: "", appt_date: "", appt_time: "", visit_type: "new", fee: "" });
    setShowApptModal(false);
    loadAll();
  }

  // -------------------------------------------------------------
  // Loading / Login screens
  // -------------------------------------------------------------
  if (loadingSession) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#103C3C", color: "#FAF7F2" }}>جاري التحميل...</div>;
  }

  if (!session) {
    return (
      <div dir="rtl" className="min-h-screen w-full flex items-center justify-center p-6" style={{ backgroundColor: "#103C3C" }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "#C89B3C" }}>
              <Stethoscope size={28} color="#103C3C" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#FAF7F2" }}>عيادة النور الطبي</h1>
            <p className="text-sm mt-1" style={{ color: "#FAF7F290" }}>سجّل دخولك للمتابعة</p>
          </div>
          <div className="rounded-xl p-6" style={{ backgroundColor: "#FAF7F2" }}>
            <Field label="البريد الإلكتروني">
              <div className="relative">
                <User size={16} className="absolute top-1/2 -translate-y-1/2 right-2.5" style={{ color: "#74807D" }} />
                <input style={{ ...inputStyle, paddingRight: 34 }} value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
            </Field>
            <Field label="كلمة السر">
              <div className="relative">
                <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-2.5" style={{ color: "#74807D" }} />
                <input type="password" style={{ ...inputStyle, paddingRight: 34 }} value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
            </Field>
            {loginError && <div className="flex items-center gap-2 text-sm mb-3" style={{ color: "#B5482F" }}><AlertCircle size={14} /> {loginError}</div>}
            <button onClick={handleLogin} disabled={loggingIn} className="w-full py-2.5 rounded-lg font-bold" style={{ backgroundColor: "#103C3C", color: "#FAF7F2" }}>
              {loggingIn ? "جاري الدخول..." : "دخول"}
            </button>
          </div>
          <p className="text-xs text-center mt-4" style={{ color: "#FAF7F270" }}>
            أول مستخدم لازم يتعمل من لوحة تحكم Supabase مباشرة (Authentication → Add user)
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Main app
  // -------------------------------------------------------------
  return (
    <div dir="rtl" className="min-h-screen w-full flex" style={{ backgroundColor: "#FAF7F2" }}>
      <aside className="w-60 shrink-0 flex flex-col p-4 gap-1" style={{ backgroundColor: "#103C3C" }}>
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#C89B3C" }}>
            <Stethoscope size={20} color="#103C3C" />
          </div>
          <div className="font-bold text-sm" style={{ color: "#FAF7F2" }}>عيادة النور الطبي</div>
        </div>

        <div className="px-3 py-2 mb-2 rounded-lg text-xs" style={{ backgroundColor: "#1F5F5A", color: "#FAF7F2" }}>
          {profile?.display_name || session.user.email}
        </div>

        {[
          { key: "dashboard", label: "الرئيسية", icon: LayoutDashboard },
          { key: "appointments", label: "المواعيد", icon: Calendar },
          { key: "patients", label: "المرضى", icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: activeTab === key ? "#C89B3C" : "transparent", color: activeTab === key ? "#103C3C" : "#FAF7F2" }}>
            <Icon size={18} /> {label}
          </button>
        ))}

        <div className="mt-auto pt-4 border-t" style={{ borderColor: "#FAF7F220" }}>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full" style={{ backgroundColor: "#B5482F", color: "#FAF7F2" }}>
            <LogOut size={16} /> تسجيل خروج
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {loadingData && <p className="text-sm mb-4" style={{ color: "#74807D" }}>جاري تحميل البيانات من قاعدة البيانات...</p>}

        {activeTab === "dashboard" && (
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#1C2626" }}>نظرة عامة</h1>
            <p className="text-sm mb-5" style={{ color: "#74807D" }}>البيانات دي حقيقية دلوقتي، جاية من Supabase مباشرة</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg p-4" style={{ backgroundColor: "#103C3C", color: "#FAF7F2" }}>
                <div className="text-sm opacity-80 mb-1">عدد المرضى</div>
                <div className="text-2xl font-bold">{patients.length}</div>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: "#C89B3C", color: "#1C2626" }}>
                <div className="text-sm opacity-80 mb-1">عدد المواعيد</div>
                <div className="text-2xl font-bold">{appointments.length}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-2xl font-bold" style={{ color: "#1C2626" }}>المواعيد</h1>
              <button onClick={() => setShowApptModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm" style={{ backgroundColor: "#C89B3C", color: "#103C3C" }}>
                <Plus size={16} /> حجز موعد جديد
              </button>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E7E1D6", backgroundColor: "#FFFFFF" }}>
              <table className="w-full text-sm">
                <thead><tr style={{ backgroundColor: "#FAF7F2" }}>
                  {["المريض", "الطبيب", "التاريخ", "الوقت", "الحالة"].map((h, i) => <th key={i} className="p-3 text-start font-semibold" style={{ color: "#1C2626" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {appointments.length === 0 && <tr><td colSpan={5} className="p-6 text-center" style={{ color: "#74807D" }}>لا يوجد مواعيد بعد</td></tr>}
                  {appointments.map(a => (
                    <tr key={a.id} className="border-t" style={{ borderColor: "#E7E1D6" }}>
                      <td className="p-3">{patientName(a.patient_id)}</td>
                      <td className="p-3">{doctorName(a.doctor_id)}</td>
                      <td className="p-3">{a.appt_date}</td>
                      <td className="p-3">{a.appt_time}</td>
                      <td className="p-3">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "patients" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-2xl font-bold" style={{ color: "#1C2626" }}>المرضى</h1>
              <button onClick={() => setShowPatientModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm" style={{ backgroundColor: "#C89B3C", color: "#103C3C" }}>
                <UserPlus size={16} /> إضافة مريض جديد
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {patients.map(p => (
                <div key={p.id} className="rounded-xl p-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E7E1D6" }}>
                  <div className="font-bold" style={{ color: "#1C2626" }}>{p.name}</div>
                  <div className="text-sm" style={{ color: "#74807D" }}>{p.phone}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Modal open={showPatientModal} onClose={() => setShowPatientModal(false)} title="إضافة مريض جديد">
        <Field label="الاسم"><input style={inputStyle} value={patientForm.name} onChange={e => setPatientForm({ ...patientForm, name: e.target.value })} /></Field>
        <Field label="رقم الهاتف"><input style={inputStyle} value={patientForm.phone} onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })} /></Field>
        <Field label="البريد الإلكتروني"><input style={inputStyle} value={patientForm.email} onChange={e => setPatientForm({ ...patientForm, email: e.target.value })} /></Field>
        <Field label="تاريخ الميلاد"><input type="date" style={inputStyle} value={patientForm.birth_date} onChange={e => setPatientForm({ ...patientForm, birth_date: e.target.value })} /></Field>
        <button onClick={submitPatient} className="w-full mt-2 py-2.5 rounded-lg font-bold" style={{ backgroundColor: "#103C3C", color: "#FAF7F2" }}>حفظ المريض</button>
      </Modal>

      <Modal open={showApptModal} onClose={() => setShowApptModal(false)} title="حجز موعد جديد">
        <Field label="المريض">
          <select style={inputStyle} value={apptForm.patient_id} onChange={e => setApptForm({ ...apptForm, patient_id: e.target.value })}>
            <option value="">اختر المريض</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="الطبيب">
          <select style={inputStyle} value={apptForm.doctor_id} onChange={e => setApptForm({ ...apptForm, doctor_id: e.target.value })}>
            <option value="">اختر الطبيب</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="التاريخ"><input type="date" style={inputStyle} value={apptForm.appt_date} onChange={e => setApptForm({ ...apptForm, appt_date: e.target.value })} /></Field>
          <Field label="الوقت"><input type="time" style={inputStyle} value={apptForm.appt_time} onChange={e => setApptForm({ ...apptForm, appt_time: e.target.value })} /></Field>
        </div>
        <button onClick={submitAppt} className="w-full mt-2 py-2.5 rounded-lg font-bold" style={{ backgroundColor: "#103C3C", color: "#FAF7F2" }}>تأكيد الحجز</button>
      </Modal>
    </div>
  );
}
