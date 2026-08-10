import React, { useState, useEffect } from 'react';
import { axiosClient } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { MapPin, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

export const SurveyorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<any[]>([]);
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  const [masters, setMasters] = useState<{
    states: any[];
    districts: any[];
    blocks: any[];
    socialCategories: any[];
  }>({
    states: [],
    districts: [],
    blocks: [],
    socialCategories: [],
  });

  const [surveyForm, setSurveyForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    email: '',
    mobile: '',
    gender: 'MALE',
    password: 'Password@123',
    dob: '',
    houseNumber: '',
    buildingName: '',
    streetLandmark: '',
    stateId: '',
    districtId: '',
    blockId: '',
    pincode: '',
    socialCategoryId: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSurveyorData = async () => {
    try {
      if (user?.id) {
        const locRes: any = await axiosClient.get(`/user-locations/user/${user.id}`);
        if (locRes.data) setLocations(locRes.data);
      }

      const [stRes, socRes]: any[] = await Promise.all([
        axiosClient.get('/master/states'),
        axiosClient.get('/master/social-categories'),
      ]);

      setMasters({
        states: stRes.data || [],
        districts: [],
        blocks: [],
        socialCategories: socRes.data || [],
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchDistricts = async (stateId: string, resetBlocks = true) => {
    const res: any = await axiosClient.get(`/master/districts?stateId=${stateId}`);
    setMasters((prev) => ({
      ...prev,
      districts: res.data || [],
      blocks: resetBlocks ? [] : prev.blocks,
    }));
  };

  const fetchBlocks = async (districtId: string) => {
    const res: any = await axiosClient.get(`/master/blocks?districtId=${districtId}`);
    setMasters((prev) => ({ ...prev, blocks: res.data || [] }));
  };

  useEffect(() => {
    loadSurveyorData();
  }, [user]);

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMessage(null);
      const res: any = await axiosClient.post('/auth/register-surveyor', surveyForm);
      if (res.success) {
        setSuccessMessage(`Household Survey Registered Successfully for ${surveyForm.firstName} ${surveyForm.lastName}!`);
        setShowSurveyModal(false);
        setSurveyForm({
          firstName: '',
          middleName: '',
          lastName: '',
          fatherName: '',
          motherName: '',
          spouseName: '',
          email: '',
          mobile: '',
          gender: 'MALE',
          password: 'Password@123',
          dob: '',
          houseNumber: '',
          buildingName: '',
          streetLandmark: '',
          stateId: '',
          districtId: '',
          blockId: '',
          pincode: '',
          socialCategoryId: '',
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="card-container mb-8 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white border-0 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">Field Surveyor Operations Portal</h1>
              <span className="badge badge-draft text-sm py-1.5 px-3">
                <MapPin className="w-4 h-4" /> Block Level Surveyor
              </span>
            </div>
            <p className="text-blue-100 text-sm">
              Surveyor: <span className="text-white font-semibold">{user?.firstName} {user?.lastName}</span> | Mobile: {user?.mobile}
            </p>
          </div>

          <button onClick={() => setShowSurveyModal(true)} className="btn btn-success py-3 px-5 text-sm font-bold shadow-lg">
            <Plus className="w-5 h-5" /> Start New Household Survey
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Assigned Zonal Jurisdictions */}
      <div className="card-container mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span>Assigned Zonal Jurisdictions</span>
        </h2>

        {locations.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm">
            No specific zonal location assigned yet. Administrator can map state/district/block to your profile.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div key={loc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-semibold text-blue-600 uppercase block mb-1">State & Zone</span>
                <h4 className="font-bold text-slate-900 text-base">{loc.state?.stateName}</h4>
                <p className="text-xs text-slate-600 mt-1">
                  District: <strong className="text-slate-800">{loc.district?.districtName || 'All Districts'}</strong>
                </p>
                <p className="text-xs text-slate-600">
                  Block: <strong className="text-slate-800">{loc.block?.blockName || 'All Blocks'}</strong>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Surveyor Guidelines */}
      <div className="card-container bg-slate-50 border-slate-200">
        <h3 className="text-md font-bold text-slate-900 mb-2">Field Surveyor Instructions</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
          <li>Ensure citizen identity documents (Aadhaar, Ration Card) are physically verified during household visits.</li>
          <li>Surveyor registrations automatically link the beneficiary account to your Surveyor ID.</li>
          <li>Once submitted, the application will be routed to the Administrator workbench for final approval & survey number generation.</li>
        </ul>
      </div>

      {/* New Household Survey Modal */}
      {showSurveyModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">New Household Survey Entry</h3>
              <button onClick={() => setShowSurveyModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSurveySubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="First Name *"
                  value={surveyForm.firstName}
                  onChange={(e) => setSurveyForm({ ...surveyForm, firstName: e.target.value })}
                  className="form-input text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Middle Name"
                  value={surveyForm.middleName}
                  onChange={(e) => setSurveyForm({ ...surveyForm, middleName: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={surveyForm.lastName}
                  onChange={(e) => setSurveyForm({ ...surveyForm, lastName: e.target.value })}
                  className="form-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Father's Name *"
                  value={surveyForm.fatherName}
                  onChange={(e) => setSurveyForm({ ...surveyForm, fatherName: e.target.value })}
                  className="form-input text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Mother's Name *"
                  value={surveyForm.motherName}
                  onChange={(e) => setSurveyForm({ ...surveyForm, motherName: e.target.value })}
                  className="form-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="10-digit Mobile *"
                  maxLength={10}
                  value={surveyForm.mobile}
                  onChange={(e) => setSurveyForm({ ...surveyForm, mobile: e.target.value.replace(/\D/g, '') })}
                  className="form-input text-sm"
                  required
                />
                <select
                  value={surveyForm.gender}
                  onChange={(e) => setSurveyForm({ ...surveyForm, gender: e.target.value })}
                  className="form-select text-sm"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                <input
                  type="date"
                  value={surveyForm.dob}
                  onChange={(e) => setSurveyForm({ ...surveyForm, dob: e.target.value })}
                  className="form-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <select
                  value={surveyForm.stateId}
                  onChange={(e) => {
                    setSurveyForm({ ...surveyForm, stateId: e.target.value, districtId: '', blockId: '' });
                    if (e.target.value) fetchDistricts(e.target.value);
                  }}
                  className="form-select text-sm"
                  required
                >
                  <option value="">Select State *</option>
                  {masters.states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.stateName}
                    </option>
                  ))}
                </select>
                <select
                  value={surveyForm.districtId}
                  onChange={(e) => {
                    setSurveyForm({ ...surveyForm, districtId: e.target.value, blockId: '' });
                    if (e.target.value) fetchBlocks(e.target.value);
                  }}
                  disabled={!surveyForm.stateId}
                  className="form-select text-sm"
                  required
                >
                  <option value="">Select District *</option>
                  {masters.districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.districtName}
                    </option>
                  ))}
                </select>
                <select
                  value={surveyForm.blockId}
                  onChange={(e) => setSurveyForm({ ...surveyForm, blockId: e.target.value })}
                  disabled={!surveyForm.districtId}
                  className="form-select text-sm"
                  required
                >
                  <option value="">Select Block *</option>
                  {masters.blocks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.blockName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="House No / Street *"
                  value={surveyForm.houseNumber}
                  onChange={(e) => setSurveyForm({ ...surveyForm, houseNumber: e.target.value })}
                  className="form-input text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Pincode *"
                  maxLength={6}
                  value={surveyForm.pincode}
                  onChange={(e) => setSurveyForm({ ...surveyForm, pincode: e.target.value.replace(/\D/g, '') })}
                  className="form-input text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowSurveyModal(false)} className="btn btn-secondary text-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-sm font-bold">
                  Register Household Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
