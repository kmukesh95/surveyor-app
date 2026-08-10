import { Response } from 'express';
import { AdminService } from '../services/adminService';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { HTTP_STATUS } from '../../constants';

export class AdminController {
  static async createStaffUser(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await AdminService.createStaffUser(req.body);
      return res.sendSuccess(
        `${req.body.roleCode} user created successfully with assigned zonal location!`,
        data,
        HTTP_STATUS.CREATED
      );
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to create staff user', HTTP_STATUS.BAD_REQUEST);
    }
  }

  static async getPendingApplications(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await AdminService.getPendingApplications();
      return res.sendSuccess('Pending applications retrieved successfully', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to fetch pending applications');
    }
  }

  static async approveBeneficiary(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      const userId = req.params.userId;
      if (!adminId || !userId) {
        return res.sendError('Invalid request parameters', HTTP_STATUS.BAD_REQUEST);
      }

      const data = await AdminService.approveBeneficiary(adminId, userId);
      return res.sendSuccess('Beneficiary application approved & 8-digit Survey Number generated successfully!', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to approve application', HTTP_STATUS.BAD_REQUEST);
    }
  }

  static async rejectBeneficiary(req: AuthenticatedRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      const userId = req.params.userId;
      const { rejectionReason } = req.body;

      if (!adminId || !userId || !rejectionReason) {
        return res.sendError('Rejection reason is required', HTTP_STATUS.BAD_REQUEST);
      }

      const data = await AdminService.rejectBeneficiary(adminId, userId, rejectionReason);
      return res.sendSuccess('Beneficiary application rejected', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to reject application', HTTP_STATUS.BAD_REQUEST);
    }
  }
}
