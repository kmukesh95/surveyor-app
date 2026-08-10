import React, { useState, useEffect } from 'react';
import { axiosClient } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Home,
  Users,
  GraduationCap,
  FileCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export const BeneficiaryDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [masters, setMasters] = useState<{
    states: any[];
    districts: any[];
    blocks: any[];
    socialCategories: any[];
    relations: any[];
    qualifications: any[];
  }>({
    states: [],
    districts: [],
    blocks: [],
    socialCategories: [],
    relations: [],
    qualifications: [],
  });

  const [profileForm, setProfileForm] = useState({
    fatherName: '',
    motherName: '',
    spouseName: '',
    dob: '',
    socialCategoryId: '',
  });

  const [addressForm, setAddressForm] = useState({
    houseNumber: '',
    buildingName: '',
    streetLandmark: '',
    stateId: '',
    districtId: '',
    blockId: '',
    pincode: '',
  });

  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [newFamily, setNewFamily] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    relationId: '',
    gender: 'FEMALE',
    dob: '',
    age: '',
    idProofNumber: '',
    occupation: '',
  });
  const [showFamilyModal, setShowFamilyModal] = useState(false);

  const [userQualifications, setUserQualifications] = useState<any[]>([]);
  const [newQual, setNewQual] = useState({
    qualificationId: '',
    passingYear: '',
    boardUniversity: '',
    gradePercentage: '',
  });

  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const detail = user?.beneficiaryDetail;
  const applicationStatus = detail?.applicationStatus || 'DRAFT';
  const isLocked = applicationStatus === 'SUBMITTED' || applicationStatus === 'APPROVED';

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [stRes, socRes, relRes, qualRes, meRes, docsRes, famRes]: any[] = await Promise.all([
        axiosClient.get('/master/states'),
        axiosClient.get('/master/social-categories'),
        axiosClient.get('/master/relations'),
        axiosClient.get('/master/qualifications'),
        axiosClient.get('/auth/me'),
        axiosClient.get('/documents'),
        axiosClient.get('/family-members'),
      ]);

      const stateList = stRes.data || [];
      setMasters({
        states: stateList,
        districts: [],
        blocks: [],
        socialCategories: socRes.data || [],
        relations: relRes.data || [],
        qualifications: qualRes.data || [],
      });

      if (meRes.data) {
        const u = meRes.data;
        if (u.beneficiaryDetail) {
          setProfileForm({
            fatherName: u.beneficiaryDetail.fatherName || '',
            motherName: u.beneficiaryDetail.motherName || '',
            spouseName: u.beneficiaryDetail.spouseName || '',
            dob: u.beneficiaryDetail.dob ? u.beneficiaryDetail.dob.split('T')[0] : '',
            socialCategoryId: u.beneficiaryDetail.socialCategoryId || '',
          });
        }
        if (u.beneficiaryAddresses && u.beneficiaryAddresses.length > 0) {
          const addr = u.beneficiaryAddresses[0];
          setAddressForm({
            houseNumber: addr.houseNumber || '',
            buildingName: addr.buildingName || '',
            streetLandmark: addr.streetLandmark || '',
            stateId: addr.stateId ? String(addr.stateId) : '',
            districtId: addr.districtId ? String(addr.districtId) : '',
            blockId: addr.blockId ? String(addr.blockId) : '',
            pincode: addr.pincode || '',
          });
          if (addr.stateId) await fetchDistricts(addr.stateId, false);
          if (addr.districtId) await fetchBlocks(addr.districtId);
        }
        if (u.beneficiaryQualifications) {
          setUserQualifications(u.beneficiaryQualifications);
        }
      }

      if (docsRes.data) setDocuments(docsRes.data);
      if (famRes.data) setFamilyMembers(famRes.data);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDistricts = async (stateId: string | number, resetBlocks = true) => {
    try {
      const res: any = await axiosClient.get(`/master/districts?stateId=${stateId}`);
      setMasters((prev) => ({
        ...prev,
        districts: res.data || [],
        blocks: resetBlocks ? [] : prev.blocks,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBlocks = async (districtId: string | number) => {
    try {
      const res: any = await axiosClient.get(`/master/blocks?districtId=${districtId}`);
      setMasters((prev) => ({ ...prev, blocks: res.data || [] }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatusMessage(null);
      const res: any = await axiosClient.put('/beneficiary/profile', profileForm);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Personal details saved successfully.' });
        await refreshUser();
        setActiveStep(2);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatusMessage(null);
      const res: any = await axiosClient.put('/beneficiary/address', addressForm);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Household address details saved.' });
        await refreshUser();
        setActiveStep(3);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleAddFamilyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatusMessage(null);
      const payload = {
        ...newFamily,
        firstName: newFamily.firstName.trim(),
        lastName: newFamily.lastName.trim(),
        age: newFamily.age ? Number(newFamily.age) : undefined,
        dob: newFamily.dob || undefined,
        middleName: newFamily.middleName || undefined,
        idProofNumber: newFamily.idProofNumber || undefined,
        occupation: newFamily.occupation || undefined,
      };

      const res: any = await axiosClient.post('/family-members', payload);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Family member added to household.' });
        setShowFamilyModal(false);
        setNewFamily({
          firstName: '',
          middleName: '',
          lastName: '',
          relationId: '',
          gender: 'FEMALE',
          dob: '',
          age: '',
          idProofNumber: '',
          occupation: '',
        });
        const famRes: any = await axiosClient.get('/family-members');
        if (famRes.data) setFamilyMembers(famRes.data);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteFamily = async (id: string) => {
    try {
      await axiosClient.delete(`/family-members/${id}`);
      const famRes: any = await axiosClient.get('/family-members');
      if (famRes.data) setFamilyMembers(famRes.data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddQual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        qualificationId: newQual.qualificationId,
        passingYear: newQual.passingYear ? Number(newQual.passingYear) : undefined,
        boardUniversity: newQual.boardUniversity ? newQual.boardUniversity.trim() : undefined,
        gradePercentage: newQual.gradePercentage ? newQual.gradePercentage.trim() : undefined,
      };

      const res: any = await axiosClient.post('/beneficiary/qualifications', payload);
      if (res.success) {
        await refreshUser();
        loadData();
        setNewQual({ qualificationId: '', passingYear: '', boardUniversity: '', gradePercentage: '' });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFileUpload = async (docType: string, file: File) => {
    try {
      setUploadingDocType(docType);
      const formData = new FormData();
      formData.append('docType', docType);
      formData.append('document', file);

      const res: any = await axiosClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success) {
        const docsRes: any = await axiosClient.get('/documents');
        if (docsRes.data) setDocuments(docsRes.data);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleDeleteDoc = async (id: number) => {
    try {
      await axiosClient.delete(`/documents/${id}`);
      const docsRes: any = await axiosClient.get('/documents');
      if (docsRes.data) setDocuments(docsRes.data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFinalSubmit = async () => {
    if (window.confirm('Are you sure you want to submit your final survey application to Administrator? Editing will be locked until review.')) {
      try {
        const res: any = await axiosClient.post('/beneficiary/submit');
        if (res.success) {
          await refreshUser();
          loadData();
        }
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (applicationStatus) {
      case 'DRAFT':
        return <span className="badge badge-draft text-sm py-1.5 px-3"><Clock className="w-4 h-4" /> Application Draft In-Progress</span>;
      case 'SUBMITTED':
        return <span className="badge badge-submitted text-sm py-1.5 px-3"><Lock className="w-4 h-4" /> Submitted & Under Admin Review</span>;
      case 'APPROVED':
        return <span className="badge badge-approved text-sm py-1.5 px-3"><CheckCircle2 className="w-4 h-4" /> Application Approved & Verified</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected text-sm py-1.5 px-3"><AlertTriangle className="w-4 h-4" /> Form Action Required (Rejected)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Application Status Card */}
      <div className="card-container mb-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">Household Beneficiary Profile</h1>
              {getStatusBadge()}
            </div>
            <p className="text-slate-300 text-sm">
              Head of Household: <span className="text-white font-semibold">{user?.firstName} {user?.lastName}</span> | Mobile: {user?.mobile}
            </p>
          </div>

          {detail?.surveyNumber && (
            <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl px-5 py-3 text-center">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">Official Survey Number</span>
              <span className="text-2xl font-black text-emerald-400 tracking-widest font-mono">{detail.surveyNumber}</span>
            </div>
          )}
        </div>

        {/* Lock or Rejection Banner */}
        {applicationStatus === 'SUBMITTED' && (
          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-200 text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-300 shrink-0" />
            <span>Your application is pending Administrator verification. Profile modifications are locked.</span>
          </div>
        )}

        {applicationStatus === 'REJECTED' && detail?.rejectionReason && (
          <div className="mt-4 p-3.5 bg-rose-500/20 border border-rose-400/30 rounded-xl text-rose-200 text-sm flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-rose-100 block">Administrator Feedback Reason:</strong>
              <span>{detail.rejectionReason}</span>
            </div>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {statusMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Stepper Navigation */}
      <div className="stepper-container px-4">
        {[
          { step: 1, label: 'Basic Details', icon: UserIcon },
          { step: 2, label: 'Address', icon: Home },
          { step: 3, label: 'Family Members', icon: Users },
          { step: 4, label: 'Qualifications', icon: GraduationCap },
          { step: 5, label: 'Documents', icon: FileCheck },
        ].map((item) => (
          <div
            key={item.step}
            onClick={() => setActiveStep(item.step)}
            className={`stepper-step ${activeStep === item.step ? 'active' : ''} ${activeStep > item.step ? 'completed' : ''}`}
          >
            <div className="step-circle">
              <item.icon className="w-5 h-5" />
            </div>
            <span className="step-label hidden md:block">{item.label}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Basic Details */}
      {activeStep === 1 && (
        <div className="card-container">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-600" />
            <span>Step 1: Personal & Family Background</span>
          </h2>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Father's Name *</label>
                <input
                  type="text"
                  value={profileForm.fatherName}
                  onChange={(e) => setProfileForm({ ...profileForm, fatherName: e.target.value })}
                  disabled={isLocked}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mother's Name *</label>
                <input
                  type="text"
                  value={profileForm.motherName}
                  onChange={(e) => setProfileForm({ ...profileForm, motherName: e.target.value })}
                  disabled={isLocked}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Spouse Name (Optional)</label>
                <input
                  type="text"
                  value={profileForm.spouseName}
                  onChange={(e) => setProfileForm({ ...profileForm, spouseName: e.target.value })}
                  disabled={isLocked}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input
                  type="date"
                  value={profileForm.dob}
                  onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                  disabled={isLocked}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Social Category</label>
                <select
                  value={profileForm.socialCategoryId}
                  onChange={(e) => setProfileForm({ ...profileForm, socialCategoryId: e.target.value })}
                  disabled={isLocked}
                  className="form-select"
                >
                  <option value="">Select Category</option>
                  {masters.socialCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.categoryName} ({c.categoryCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!isLocked && (
              <div className="flex justify-end pt-4">
                <button type="submit" className="btn btn-primary">
                  Save & Continue to Address →
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* STEP 2: Household Address */}
      {activeStep === 2 && (
        <div className="card-container">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            <span>Step 2: Household Location Address</span>
          </h2>

          <form onSubmit={handleAddressSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">House Number / Flat</label>
                <input
                  type="text"
                  value={addressForm.houseNumber}
                  onChange={(e) => setAddressForm({ ...addressForm, houseNumber: e.target.value })}
                  disabled={isLocked}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Building / Apartment Name</label>
                <input
                  type="text"
                  value={addressForm.buildingName}
                  onChange={(e) => setAddressForm({ ...addressForm, buildingName: e.target.value })}
                  disabled={isLocked}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Street / Landmark</label>
                <input
                  type="text"
                  value={addressForm.streetLandmark}
                  onChange={(e) => setAddressForm({ ...addressForm, streetLandmark: e.target.value })}
                  disabled={isLocked}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="form-group">
                <label className="form-label">State *</label>
                <select
                  value={addressForm.stateId}
                  onChange={(e) => {
                    setAddressForm({ ...addressForm, stateId: e.target.value, districtId: '', blockId: '' });
                    if (e.target.value) fetchDistricts(e.target.value);
                  }}
                  disabled={isLocked}
                  className="form-select"
                  required
                >
                  <option value="">Select State</option>
                  {masters.states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.stateName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">District *</label>
                <select
                  value={addressForm.districtId}
                  onChange={(e) => {
                    setAddressForm({ ...addressForm, districtId: e.target.value, blockId: '' });
                    if (e.target.value) fetchBlocks(e.target.value);
                  }}
                  disabled={isLocked || !addressForm.stateId}
                  className="form-select"
                  required
                >
                  <option value="">Select District</option>
                  {masters.districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.districtName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Block *</label>
                <select
                  value={addressForm.blockId}
                  onChange={(e) => setAddressForm({ ...addressForm, blockId: e.target.value })}
                  disabled={isLocked || !addressForm.districtId}
                  className="form-select"
                  required
                >
                  <option value="">Select Block</option>
                  {masters.blocks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.blockName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })}
                  disabled={isLocked}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {!isLocked && (
              <div className="flex justify-end pt-4">
                <button type="submit" className="btn btn-primary">
                  Save Address & Continue →
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* STEP 3: Household Family Members */}
      {activeStep === 3 && (
        <div className="card-container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Step 3: Household Family Members (Ration Card List)</span>
              </h2>
              <p className="text-sm text-slate-500">List all family members residing in the same household</p>
            </div>

            {!isLocked && (
              <button onClick={() => setShowFamilyModal(true)} className="btn btn-primary text-sm py-2">
                <Plus className="w-4 h-4" /> Add Family Member
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl mb-6">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Relation</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Occupation</th>
                  {!isLocked && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {familyMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      No family members added yet. Click "Add Family Member" above.
                    </td>
                  </tr>
                ) : (
                  familyMembers.map((fam) => (
                    <tr key={fam.id}>
                      <td className="font-semibold text-slate-900">
                        {fam.firstName} {fam.lastName}
                      </td>
                      <td>
                        <span className="badge badge-submitted">{fam.relation?.relationName || 'Member'}</span>
                      </td>
                      <td>{fam.gender}</td>
                      <td>{fam.age ? `${fam.age} yrs` : 'N/A'}</td>
                      <td>{fam.occupation || 'N/A'}</td>
                      {!isLocked && (
                        <td>
                          <button
                            onClick={() => handleDeleteFamily(fam.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button onClick={() => setActiveStep(4)} className="btn btn-primary">
              Continue to Qualifications →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Educational Qualifications */}
      {activeStep === 4 && (
        <div className="card-container">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>Step 4: Educational Qualifications</span>
          </h2>

          {!isLocked && (
            <form onSubmit={handleAddQual} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Add New Qualification Record</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select
                  value={newQual.qualificationId}
                  onChange={(e) => setNewQual({ ...newQual, qualificationId: e.target.value })}
                  className="form-select text-sm"
                  required
                >
                  <option value="">Select Level (10th/12th/UG)</option>
                  {masters.qualifications.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.qualificationName}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Board / University"
                  value={newQual.boardUniversity}
                  onChange={(e) => setNewQual({ ...newQual, boardUniversity: e.target.value })}
                  className="form-input text-sm"
                />

                <input
                  type="number"
                  placeholder="Passing Year"
                  value={newQual.passingYear}
                  onChange={(e) => setNewQual({ ...newQual, passingYear: e.target.value })}
                  className="form-input text-sm"
                />

                <button type="submit" className="btn btn-primary text-sm py-2">
                  <Plus className="w-4 h-4" /> Add Record
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto border border-slate-200 rounded-xl mb-6">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Qualification</th>
                  <th>Board / University</th>
                  <th>Passing Year</th>
                </tr>
              </thead>
              <tbody>
                {userQualifications.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-slate-400">
                      No educational records added yet.
                    </td>
                  </tr>
                ) : (
                  userQualifications.map((q) => (
                    <tr key={q.id}>
                      <td className="font-semibold text-slate-900">{q.qualification?.qualificationName}</td>
                      <td>{q.boardUniversity || 'N/A'}</td>
                      <td>{q.passingYear || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button onClick={() => setActiveStep(5)} className="btn btn-primary">
              Continue to Document Uploads →
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Document Uploads & Final Submit */}
      {activeStep === 5 && (
        <div className="card-container">
          <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span>Step 5: Document Uploads & Final Application Submission</span>
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Upload verification documents. Max 1 document permitted per document type.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              { type: 'PROFILE_PHOTO', title: 'Profile Photograph' },
              { type: 'IDENTITY_PROOF', title: 'Aadhaar / ID Proof' },
              { type: 'RATION_CARD', title: 'Ration Card Copy' },
              { type: 'VOTER_ID', title: 'Voter ID Card' },
            ].map((docItem) => {
              const uploadedDoc = documents.find((d) => d.docType === docItem.type);

              return (
                <div key={docItem.type} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-slate-800 text-sm">{docItem.title}</span>
                    {uploadedDoc ? (
                      <span className="badge badge-approved text-xs">Uploaded</span>
                    ) : (
                      <span className="badge badge-draft text-xs">Pending</span>
                    )}
                  </div>

                  {uploadedDoc ? (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-xs font-mono text-slate-600 truncate max-w-[200px]">
                        {uploadedDoc.media?.fileName || 'Document File'}
                      </span>
                      {!isLocked && (
                        <button
                          onClick={() => handleDeleteDoc(uploadedDoc.id)}
                          className="text-rose-600 hover:bg-rose-50 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    !isLocked && (
                      <label className="btn btn-secondary text-xs w-full py-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>{uploadingDocType === docItem.type ? 'Uploading...' : 'Choose File to Upload'}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(docItem.type, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    )
                  )}
                </div>
              );
            })}
          </div>

          {!isLocked ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-blue-900 text-sm">Ready to Finalize Your Survey?</h4>
                <p className="text-xs text-blue-700">
                  Once submitted, your application will be reviewed by Administrator and locked for editing.
                </p>
              </div>
              <button onClick={handleFinalSubmit} className="btn btn-success py-3 px-6 text-sm font-bold whitespace-nowrap">
                <CheckCircle2 className="w-5 h-5" /> Submit Application to Admin
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-100 rounded-xl text-center text-slate-600 font-semibold text-sm">
              Form Application is currently locked in {applicationStatus} state.
            </div>
          )}
        </div>
      )}

      {/* Add Family Member Modal */}
      {showFamilyModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Add Household Family Member</h3>
            <form onSubmit={handleAddFamilyMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name *"
                  value={newFamily.firstName}
                  onChange={(e) => setNewFamily({ ...newFamily, firstName: e.target.value })}
                  className="form-input text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={newFamily.lastName}
                  onChange={(e) => setNewFamily({ ...newFamily, lastName: e.target.value })}
                  className="form-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newFamily.relationId}
                  onChange={(e) => setNewFamily({ ...newFamily, relationId: e.target.value })}
                  className="form-select text-sm"
                  required
                >
                  <option value="">Select Relation *</option>
                  {masters.relations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.relationName}
                    </option>
                  ))}
                </select>

                <select
                  value={newFamily.gender}
                  onChange={(e) => setNewFamily({ ...newFamily, gender: e.target.value })}
                  className="form-select text-sm"
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Age in Years"
                  value={newFamily.age}
                  onChange={(e) => setNewFamily({ ...newFamily, age: e.target.value })}
                  className="form-input text-sm"
                />
                <input
                  type="text"
                  placeholder="Occupation"
                  value={newFamily.occupation}
                  onChange={(e) => setNewFamily({ ...newFamily, occupation: e.target.value })}
                  className="form-input text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowFamilyModal(false)} className="btn btn-secondary text-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-sm">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
