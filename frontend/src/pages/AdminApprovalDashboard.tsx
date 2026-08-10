import React, { useState, useEffect } from 'react';
import { axiosClient } from '../api/axiosClient';
import {
  Shield,
  FileCheck,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  MapPin,
  UserPlus,
  FileText,
  ExternalLink,
  GraduationCap,
  Users,
  Home,
  User as UserIcon,
} from 'lucide-react';

export const AdminApprovalDashboard: React.FC = () => {
  const [pendingApps, setPendingApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string; fileType?: string } | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tab State: 'pending' | 'createStaff' | 'zonal'
  const [activeTab, setActiveTab] = useState<'pending' | 'createStaff' | 'zonal'>('pending');

  const [masters, setMasters] = useState<{ states: any[]; districts: any[]; blocks: any[] }>({
    states: [],
    districts: [],
    blocks: [],
  });

  // Create Staff User Form State
  const [staffForm, setStaffForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: 'MALE',
    password: '',
    roleCode: 'SURVEYOR',
    stateId: '',
    districtId: '',
    blockId: '',
  });

  // Zonal Assignment State
  const [zonalForm, setZonalForm] = useState({ userId: '', stateId: '', districtId: '', blockId: '' });

  const fetchPendingApplications = async () => {
    try {
      setIsLoading(true);
      const res: any = await axiosClient.get('/admin/pending-applications');
      if (res.data) setPendingApps(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMastersAndUsers = async () => {
    try {
      const stRes: any = await axiosClient.get('/master/states');
      if (stRes.data) setMasters((prev) => ({ ...prev, states: stRes.data }));
    } catch (err) {
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
    fetchPendingApplications();
    fetchMastersAndUsers();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatusMessage(null);
      const res: any = await axiosClient.post('/admin/create-user', {
        ...staffForm,
        stateId: Number(staffForm.stateId),
        districtId: staffForm.districtId ? Number(staffForm.districtId) : undefined,
        blockId: staffForm.blockId ? Number(staffForm.blockId) : undefined,
      });

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `New ${staffForm.roleCode} user created successfully with assigned zonal location!`,
        });
        setStaffForm({
          firstName: '',
          middleName: '',
          lastName: '',
          email: '',
          mobile: '',
          gender: 'MALE',
          password: '',
          roleCode: 'SURVEYOR',
          stateId: '',
          districtId: '',
          blockId: '',
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleApprove = async (userId: string) => {
    if (!userId) {
      alert('Error: User ID is missing.');
      return;
    }
    if (window.confirm('Approve this household application and generate unique 8-digit Survey Number?')) {
      try {
        setStatusMessage(null);
        const res: any = await axiosClient.post(`/admin/approve-beneficiary/${userId}`);
        if (res.success) {
          setStatusMessage({
            type: 'success',
            text: `Application Approved Successfully! Generated Official Survey Number: ${res.data.surveyNumber}`,
          });
          setSelectedUser(null);
          await fetchPendingApplications();
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err.message });
      }
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingUserId || !rejectionReason.trim()) return;

    try {
      setStatusMessage(null);
      const res: any = await axiosClient.post(`/admin/reject-beneficiary/${rejectingUserId}`, {
        rejectionReason,
      });
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Application rejected and unlocked for citizen resubmission.' });
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedUser(null);
        await fetchPendingApplications();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleZonalAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatusMessage(null);
      const res: any = await axiosClient.post('/user-locations', {
        userId: zonalForm.userId,
        stateId: Number(zonalForm.stateId),
        districtId: zonalForm.districtId ? Number(zonalForm.districtId) : undefined,
        blockId: zonalForm.blockId ? Number(zonalForm.blockId) : undefined,
      });
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Zonal jurisdiction location assigned successfully!' });
        setZonalForm({ userId: '', stateId: '', districtId: '', blockId: '' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const getMediaFullUrl = (filePath: string) => {
    if (!filePath) return '';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `http://localhost:5000${cleanPath}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="card-container mb-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-0 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">Administrator Verification Workbench</h1>
              <span className="badge badge-submitted text-sm py-1.5 px-3">
                <Shield className="w-4 h-4" /> System Admin
              </span>
            </div>
            <p className="text-slate-300 text-sm">
              Review pending citizen household surveys, verify documents in full preview mode, and generate 8-digit official Survey Numbers.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-2 rounded-xl border border-white/10 flex-wrap">
            <button
              onClick={() => setActiveTab('pending')}
              className={`btn text-xs py-2 px-3 ${activeTab === 'pending' ? 'btn-primary' : 'text-slate-200 hover:bg-white/10'}`}
            >
              <FileCheck className="w-4 h-4" /> Pending Apps ({pendingApps.length})
            </button>
            <button
              onClick={() => setActiveTab('createStaff')}
              className={`btn text-xs py-2 px-3 ${activeTab === 'createStaff' ? 'btn-primary' : 'text-slate-200 hover:bg-white/10'}`}
            >
              <UserPlus className="w-4 h-4" /> Create Staff / Surveyor
            </button>
            <button
              onClick={() => setActiveTab('zonal')}
              className={`btn text-xs py-2 px-3 ${activeTab === 'zonal' ? 'btn-primary' : 'text-slate-200 hover:bg-white/10'}`}
            >
              <MapPin className="w-4 h-4" /> Map Locations
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: PENDING APPLICATIONS */}
      {activeTab === 'pending' && (
        <div className="card-container">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <span>Pending Household Verification Queue</span>
            </h2>
            <button onClick={fetchPendingApplications} className="btn btn-secondary text-xs py-1.5">
              Refresh Queue
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400">Loading pending applications...</div>
          ) : pendingApps.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">All Submitted Applications Have Been Verified!</p>
              <p className="text-xs text-slate-400 mt-1">New citizen survey submissions will appear here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Mobile</th>
                    <th>State / District / Block</th>
                    <th>Parents</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApps.map((u) => {
                    const detail = u.beneficiaryDetail;
                    const addr = u.beneficiaryAddresses?.[0];

                    return (
                      <tr key={u.id}>
                        <td className="font-semibold text-slate-900">
                          {u.firstName} {u.lastName}
                        </td>
                        <td>{u.mobile}</td>
                        <td className="text-xs">
                          {addr ? `${addr.state?.stateName || 'State'} -> ${addr.district?.districtName || 'District'} -> ${addr.block?.blockName || 'Block'}` : 'Address Pending'}
                        </td>
                        <td className="text-xs">
                          F: {detail?.fatherName || 'N/A'} | M: {detail?.motherName || 'N/A'}
                        </td>
                        <td>
                          <span className="badge badge-submitted text-xs">Submitted</span>
                        </td>
                        <td className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="btn btn-secondary text-xs py-1.5 px-2.5"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect Profile & Docs
                          </button>
                          <button
                            onClick={() => handleApprove(u.id)}
                            className="btn btn-success text-xs py-1.5 px-2.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectingUserId(u.id);
                              setShowRejectModal(true);
                            }}
                            className="btn btn-danger text-xs py-1.5 px-2.5"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE STAFF / SURVEYOR USER WITH LOCATION */}
      {activeTab === 'createStaff' && (
        <div className="card-container max-w-3xl mx-auto">
          <div className="mb-6 pb-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>Create Administrator / Field Surveyor User</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Field Surveyors & Administrators cannot self-register. Only Super Admin / Admin creates staff users with mandatory zonal location mapping.
            </p>
          </div>

          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  value={staffForm.firstName}
                  onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Middle Name</label>
                <input
                  type="text"
                  value={staffForm.middleName}
                  onChange={(e) => setStaffForm({ ...staffForm, middleName: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  value={staffForm.lastName}
                  onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input
                  type="text"
                  maxLength={10}
                  value={staffForm.mobile}
                  onChange={(e) => setStaffForm({ ...staffForm, mobile: e.target.value.replace(/\D/g, '') })}
                  placeholder="10-digit Mobile"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role to Assign *</label>
                <select
                  value={staffForm.roleCode}
                  onChange={(e) => setStaffForm({ ...staffForm, roleCode: e.target.value })}
                  className="form-select font-semibold text-blue-700"
                  required
                >
                  <option value="SURVEYOR">Field Surveyor</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="CMS_USER">CMS Content Manager</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="staff@surveyor-app.com"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Temporary Password *</label>
                <input
                  type="password"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* MANDATORY ZONAL LOCATION SELECTION */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Assign Mandatory Zonal Location Jurisdiction</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="form-group mb-0">
                  <label className="form-label text-xs">State *</label>
                  <select
                    value={staffForm.stateId}
                    onChange={(e) => {
                      setStaffForm({ ...staffForm, stateId: e.target.value, districtId: '', blockId: '' });
                      if (e.target.value) fetchDistricts(e.target.value);
                    }}
                    className="form-select text-sm"
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

                <div className="form-group mb-0">
                  <label className="form-label text-xs">District (Optional for Admin)</label>
                  <select
                    value={staffForm.districtId}
                    onChange={(e) => {
                      setStaffForm({ ...staffForm, districtId: e.target.value, blockId: '' });
                      if (e.target.value) fetchBlocks(e.target.value);
                    }}
                    disabled={!staffForm.stateId}
                    className="form-select text-sm"
                  >
                    <option value="">All Districts</option>
                    {masters.districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.districtName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-0">
                  <label className="form-label text-xs">Block (Required for Surveyor)</label>
                  <select
                    value={staffForm.blockId}
                    onChange={(e) => setStaffForm({ ...staffForm, blockId: e.target.value })}
                    disabled={!staffForm.districtId}
                    className="form-select text-sm"
                  >
                    <option value="">All Blocks</option>
                    {masters.blocks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.blockName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full py-3 text-base font-bold">
              Create Staff Account & Map Zonal Location
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: ASSIGN ZONAL LOCATIONS */}
      {activeTab === 'zonal' && (
        <div className="card-container">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Map Zonal Jurisdiction Location to Existing User</span>
          </h2>

          <form onSubmit={handleZonalAssign} className="space-y-4 max-w-2xl">
            <div className="form-group">
              <label className="form-label">User ID (UUID) *</label>
              <input
                type="text"
                placeholder="Enter User UUID string"
                value={zonalForm.userId}
                onChange={(e) => setZonalForm({ ...zonalForm, userId: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">State *</label>
                <select
                  value={zonalForm.stateId}
                  onChange={(e) => {
                    setZonalForm({ ...zonalForm, stateId: e.target.value, districtId: '', blockId: '' });
                    if (e.target.value) fetchDistricts(e.target.value);
                  }}
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
                <label className="form-label">District (Optional)</label>
                <select
                  value={zonalForm.districtId}
                  onChange={(e) => {
                    setZonalForm({ ...zonalForm, districtId: e.target.value, blockId: '' });
                    if (e.target.value) fetchBlocks(e.target.value);
                  }}
                  disabled={!zonalForm.stateId}
                  className="form-select"
                >
                  <option value="">All Districts</option>
                  {masters.districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.districtName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Block (Optional)</label>
                <select
                  value={zonalForm.blockId}
                  onChange={(e) => setZonalForm({ ...zonalForm, blockId: e.target.value })}
                  disabled={!zonalForm.districtId}
                  className="form-select"
                >
                  <option value="">All Blocks</option>
                  {masters.blocks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.blockName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary font-bold py-3 px-6">
              Assign Zonal Location Mapping
            </button>
          </form>
        </div>
      )}

      {/* FULL HOUSEHOLD AUDIT INSPECT MODAL */}
      {selectedUser && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-4xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Full Household Audit - {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-xs text-slate-500">
                  Mobile: {selectedUser.mobile} | Email: {selectedUser.email || 'N/A'} | Gender: {selectedUser.gender}
                </p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 text-sm">
              {/* 1. Personal & Family Background */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3 text-base flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  <span>1. Personal & Parents Background</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-xs text-slate-500 block">Father's Name</span>
                    <strong className="text-slate-800">{selectedUser.beneficiaryDetail?.fatherName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Mother's Name</span>
                    <strong className="text-slate-800">{selectedUser.beneficiaryDetail?.motherName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Spouse Name</span>
                    <strong className="text-slate-800">{selectedUser.beneficiaryDetail?.spouseName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Date of Birth</span>
                    <strong className="text-slate-800">
                      {selectedUser.beneficiaryDetail?.dob ? selectedUser.beneficiaryDetail.dob.split('T')[0] : 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 2. Household Location Address */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3 text-base flex items-center gap-2">
                  <Home className="w-4 h-4 text-blue-600" />
                  <span>2. Household Location Address</span>
                </h4>
                {selectedUser.beneficiaryAddresses && selectedUser.beneficiaryAddresses.length > 0 ? (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <p className="text-slate-800 font-semibold">
                      {selectedUser.beneficiaryAddresses[0].houseNumber || ''} {selectedUser.beneficiaryAddresses[0].buildingName || ''} {selectedUser.beneficiaryAddresses[0].streetLandmark || ''}
                    </p>
                    <p className="text-xs text-slate-600">
                      State: <strong>{selectedUser.beneficiaryAddresses[0].state?.stateName || 'N/A'}</strong> | District: <strong>{selectedUser.beneficiaryAddresses[0].district?.districtName || 'N/A'}</strong> | Block: <strong>{selectedUser.beneficiaryAddresses[0].block?.blockName || 'N/A'}</strong> | Pincode: <strong>{selectedUser.beneficiaryAddresses[0].pincode || 'N/A'}</strong>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200">No address details recorded.</p>
                )}
              </div>

              {/* 3. Household Family Members */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3 text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>3. Household Family Members ({selectedUser.beneficiaryFamilyMembers?.length || 0})</span>
                </h4>
                {selectedUser.beneficiaryFamilyMembers && selectedUser.beneficiaryFamilyMembers.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.beneficiaryFamilyMembers.map((fam: any) => (
                      <div key={fam.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                        <div>
                          <strong className="text-slate-900 block">{fam.firstName} {fam.lastName}</strong>
                          <span className="text-xs text-slate-500">Gender: {fam.gender} | Age: {fam.age ? `${fam.age} yrs` : 'N/A'} | Occupation: {fam.occupation || 'N/A'}</span>
                        </div>
                        <span className="badge badge-submitted">{fam.relation?.relationName || 'Member'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200">No family members listed.</p>
                )}
              </div>

              {/* 4. Educational Qualifications */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3 text-base flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>4. Educational Qualifications ({selectedUser.beneficiaryQualifications?.length || 0})</span>
                </h4>
                {selectedUser.beneficiaryQualifications && selectedUser.beneficiaryQualifications.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.beneficiaryQualifications.map((q: any) => (
                      <div key={q.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                        <div>
                          <strong className="text-slate-900 block">{q.qualification?.qualificationName || 'Qualification'}</strong>
                          <span className="text-xs text-slate-500">Board / University: {q.boardUniversity || 'N/A'}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-700">Year: {q.passingYear || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200">No educational qualifications added.</p>
                )}
              </div>

              {/* 5. Uploaded Documents with Full Interactive Preview Mode */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3 text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>5. Uploaded Document Attachments ({selectedUser.beneficiaryDocuments?.length || 0})</span>
                </h4>

                {selectedUser.beneficiaryDocuments && selectedUser.beneficiaryDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {selectedUser.beneficiaryDocuments.map((doc: any) => {
                      const docUrl = getMediaFullUrl(doc.media?.filePath);

                      return (
                        <div key={doc.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-900 text-sm block truncate">{doc.docType}</span>
                              <span className="text-xs text-slate-400 font-mono block truncate">
                                {doc.media?.fileName || 'Attachment File'}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {docUrl ? (
                              <button
                                onClick={() =>
                                  setPreviewDoc({
                                    title: `${doc.docType} - ${selectedUser.firstName} ${selectedUser.lastName}`,
                                    url: docUrl,
                                    fileType: doc.media?.fileType,
                                  })
                                }
                                className="btn btn-primary btn-sm shadow-xs"
                              >
                                <Eye className="w-4 h-4" /> Preview Doc
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">File Unavailable</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200">No documents uploaded yet.</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-200">
              <button
                onClick={() => {
                  setRejectingUserId(selectedUser.id);
                  setShowRejectModal(true);
                }}
                className="btn btn-danger text-sm py-2.5 px-4"
              >
                <XCircle className="w-4 h-4" /> Reject Application
              </button>
              <button onClick={() => handleApprove(selectedUser.id)} className="btn btn-success text-sm font-bold shadow-md py-2.5 px-4">
                <CheckCircle2 className="w-4 h-4" /> Approve & Issue Survey Number
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW LIGHTBOX MODAL */}
      {previewDoc && (
        <div className="modal-backdrop z-[2000]">
          <div className="modal-content max-w-4xl max-h-[90vh] flex flex-col p-4 bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>{previewDoc.title}</span>
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary text-xs py-1 px-3"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                </a>
                <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-auto bg-slate-900 rounded-xl flex flex-col items-center justify-center p-4 min-h-[500px]">
              {previewDoc.url.toLowerCase().endsWith('.pdf') || previewDoc.fileType === 'application/pdf' ? (
                <iframe src={previewDoc.url} className="w-full h-[600px] rounded-lg border-0" title="Document Preview" />
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  crossOrigin="anonymous"
                  className="max-w-full max-h-[650px] object-contain rounded-lg shadow-2xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.preview-error-fallback')) {
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'preview-error-fallback text-center p-6 bg-slate-800 rounded-xl border border-slate-700 max-w-md';
                      errorDiv.innerHTML = `
                        <div className="text-amber-400 font-bold mb-2 text-lg">Document Preview Unavailable</div>
                        <p className="text-slate-300 text-xs mb-4">File path: ${previewDoc.url}</p>
                        <a href="${previewDoc.url}" target="_blank" rel="noreferrer" className="btn btn-primary text-xs py-2 px-4 inline-flex items-center gap-2">
                          Download / Open File directly
                        </a>
                      `;
                      parent.appendChild(errorDiv);
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-3">Reject Household Application</h3>
            <p className="text-sm text-slate-500 mb-4">
              Enter rejection reason. The citizen will be notified and allowed to resubmit correction.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={4}
                placeholder="e.g. Profile photo is blurry. Please re-upload Aadhaar card copy."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="form-textarea text-sm"
                required
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowRejectModal(false)} className="btn btn-secondary text-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger text-sm font-bold">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
