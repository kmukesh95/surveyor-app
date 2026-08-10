import { Request, Response } from 'express';
import { MasterService } from '../services/masterService';

export class MasterController {
  static async getRoles(req: Request, res: Response) {
    try {
      const data = await MasterService.getRoles();
      return res.sendSuccess('Master roles retrieved successfully', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to fetch master roles');
    }
  }

  static async getRelations(req: Request, res: Response) {
    try {
      const data = await MasterService.getRelations();
      return res.sendSuccess('Master relations retrieved successfully', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to fetch master relations');
    }
  }

  static async getQualifications(req: Request, res: Response) {
    try {
      const data = await MasterService.getQualifications();
      return res.sendSuccess('Master qualifications retrieved successfully', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to fetch master qualifications');
    }
  }

  static async getSocialCategories(req: Request, res: Response) {
    try {
      const data = await MasterService.getSocialCategories();
      return res.sendSuccess('Master social categories retrieved successfully', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to fetch master social categories');
    }
  }

  static async getStates(req: Request, res: Response) {
    try {
      const data = await MasterService.getStates();
      return res.sendSuccess('Master states retrieved successfully', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to fetch master states');
    }
  }

  static async getDistricts(req: Request, res: Response) {
    try {
      const stateId = req.query.stateId ? parseInt(req.query.stateId as string, 10) : undefined;
      const data = await MasterService.getDistricts(stateId);
      return res.sendSuccess('Master districts retrieved successfully', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to fetch master districts');
    }
  }

  static async getBlocks(req: Request, res: Response) {
    try {
      const districtId = req.query.districtId ? parseInt(req.query.districtId as string, 10) : undefined;
      const data = await MasterService.getBlocks(districtId);
      return res.sendSuccess('Master blocks retrieved successfully', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to fetch master blocks');
    }
  }
}
