import { Response } from 'express';
import { FamilyService } from '../services/familyService';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { HTTP_STATUS } from '../../constants';

export class FamilyController {
  static async addFamilyMember(req: AuthenticatedRequest, res: Response) {
    try {
      const headUserId = req.user?.id;
      if (!headUserId) {
        return res.sendError('Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }
      const data = await FamilyService.addFamilyMember(headUserId, req.body);
      return res.sendSuccess('Family member added successfully!', data, HTTP_STATUS.CREATED);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to add family member', HTTP_STATUS.BAD_REQUEST);
    }
  }

  static async getFamilyMembers(req: AuthenticatedRequest, res: Response) {
    try {
      const headUserId = req.params.userId || req.user?.id;
      if (!headUserId) {
        return res.sendError('Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }
      const data = await FamilyService.getFamilyMembers(headUserId);
      return res.sendSuccess('Family members retrieved successfully', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to fetch family members');
    }
  }

  static async getFamilyMemberById(req: AuthenticatedRequest, res: Response) {
    try {
      const headUserId = req.user?.id;
      const memberId = req.params.id;
      if (!headUserId || !memberId) {
        return res.sendError('Invalid request parameters', HTTP_STATUS.BAD_REQUEST);
      }
      const data = await FamilyService.getFamilyMemberById(headUserId, memberId);
      return res.sendSuccess('Family member details retrieved', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to fetch family member details');
    }
  }

  static async updateFamilyMember(req: AuthenticatedRequest, res: Response) {
    try {
      const headUserId = req.user?.id;
      const memberId = req.params.id;
      if (!headUserId || !memberId) {
        return res.sendError('Invalid request parameters', HTTP_STATUS.BAD_REQUEST);
      }
      const data = await FamilyService.updateFamilyMember(headUserId, memberId, req.body);
      return res.sendSuccess('Family member details updated successfully!', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to update family member');
    }
  }

  static async deleteFamilyMember(req: AuthenticatedRequest, res: Response) {
    try {
      const headUserId = req.user?.id;
      const memberId = req.params.id;
      if (!headUserId || !memberId) {
        return res.sendError('Invalid request parameters', HTTP_STATUS.BAD_REQUEST);
      }
      await FamilyService.deleteFamilyMember(headUserId, memberId);
      return res.sendSuccess('Family member record deleted successfully!');
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to delete family member');
    }
  }
}
