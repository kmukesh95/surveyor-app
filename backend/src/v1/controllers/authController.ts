import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { HTTP_STATUS } from '../../constants';

export class AuthController {
  static async registerDirect(req: Request, res: Response) {
    try {
      const result = await AuthService.registerDirect(req.body);
      return res.sendSuccess('Direct user registration successful!', result, HTTP_STATUS.CREATED);
    } catch (error: any) {
      return res.sendError(error.message || 'Registration failed', HTTP_STATUS.BAD_REQUEST);
    }
  }

  static async registerSurveyor(req: AuthenticatedRequest, res: Response) {
    try {
      const surveyorId = req.user?.id;
      if (!surveyorId) {
        return res.sendError('Surveyor authentication required.', HTTP_STATUS.UNAUTHORIZED);
      }
      const result = await AuthService.registerSurveyor(surveyorId, req.body);
      return res.sendSuccess('Beneficiary household registered by surveyor successfully!', result, HTTP_STATUS.CREATED);
    } catch (error: any) {
      return res.sendError(error.message || 'Surveyor registration failed', HTTP_STATUS.BAD_REQUEST);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      return res.sendSuccess('Login successful!', result);
    } catch (error: any) {
      return res.sendError(error.message || 'Login failed', HTTP_STATUS.UNAUTHORIZED);
    }
  }

  static async verify2FA(req: Request, res: Response) {
    try {
      const { userId, tfaCode } = req.body;
      const result = await AuthService.verify2FA(userId, tfaCode);
      return res.sendSuccess('2FA Verification successful!', result);
    } catch (error: any) {
      return res.sendError(error.message || '2FA verification failed', HTTP_STATUS.BAD_REQUEST);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const token = req.token;
      if (userId && token) {
        await AuthService.logout(userId, token);
      }
      return res.sendSuccess('Logged out successfully.');
    } catch (error: any) {
      return res.sendError(error.message || 'Logout failed');
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.sendError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
      }
      const user = await AuthService.getMe(userId);
      return res.sendSuccess('User profile retrieved successfully', user);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to fetch user profile');
    }
  }
}
