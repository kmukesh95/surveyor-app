import { Response } from 'express';
import { UserLocationService } from '../services/userLocationService';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { HTTP_STATUS } from '../../constants';

export class UserLocationController {
  static async assignLocation(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await UserLocationService.assignLocation(req.body);
      return res.sendSuccess('Zonal location assigned to user successfully!', data, HTTP_STATUS.CREATED);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to assign zonal location', HTTP_STATUS.BAD_REQUEST);
    }
  }

  static async getUserLocations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.params.userId || req.user?.id;
      if (!userId) {
        return res.sendError('User ID parameter is required', HTTP_STATUS.BAD_REQUEST);
      }
      const data = await UserLocationService.getUserLocations(userId);
      return res.sendSuccess('User assigned locations retrieved successfully', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to fetch user locations');
    }
  }

  static async deleteLocation(req: AuthenticatedRequest, res: Response) {
    try {
      const locationId = req.params.id;
      if (!locationId) {
        return res.sendError('Location ID parameter is required', HTTP_STATUS.BAD_REQUEST);
      }
      await UserLocationService.deleteLocation(locationId);
      return res.sendSuccess('User location mapping deleted successfully!');
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to delete user location', HTTP_STATUS.BAD_REQUEST);
    }
  }
}
