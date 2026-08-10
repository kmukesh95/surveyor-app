import { Response } from 'express';
import { BeneficiaryService } from '../services/beneficiaryService';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { HTTP_STATUS } from '../../constants';

export class BeneficiaryController {
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.sendError('Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }
      const data = await BeneficiaryService.updateProfile(userId, req.body);
      return res.sendSuccess('Profile details updated successfully!', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to update profile', HTTP_STATUS.BAD_REQUEST);
    }
  }

  static async updateAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.sendError('Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }
      const data = await BeneficiaryService.updateAddress(userId, req.body);
      return res.sendSuccess('Household address updated successfully!', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to update address', HTTP_STATUS.BAD_REQUEST);
    }
  }

  static async addQualification(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.sendError('Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }
      const data = await BeneficiaryService.addQualification(userId, req.body);
      return res.sendSuccess('Qualification details added successfully!', data, HTTP_STATUS.CREATED);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to add qualification', HTTP_STATUS.BAD_REQUEST);
    }
  }

  static async deleteQualification(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const id = req.params.id;
      if (!userId || !id) {
        return res.sendError('Invalid request parameters', HTTP_STATUS.BAD_REQUEST);
      }
      await BeneficiaryService.deleteQualification(userId, id);
      return res.sendSuccess('Qualification record deleted successfully!');
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to delete qualification', HTTP_STATUS.BAD_REQUEST);
    }
  }

  static async submitApplication(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.sendError('Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }
      const data = await BeneficiaryService.submitApplication(userId);
      return res.sendSuccess('Application submitted successfully to Administrator for verification!', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to submit application', HTTP_STATUS.BAD_REQUEST);
    }
  }
}
