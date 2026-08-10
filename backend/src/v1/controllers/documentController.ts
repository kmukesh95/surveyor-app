import { Response } from 'express';
import path from 'path';
import { DocumentService } from '../services/documentService';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { HTTP_STATUS } from '../../constants';

export class DocumentController {
  static async uploadDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.sendError('Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }

      if (!req.file) {
        return res.sendError('No document file provided.', HTTP_STATUS.BAD_REQUEST);
      }

      const docType = (req.body.docType || 'IDENTITY_PROOF').toUpperCase();
      const validDocTypes = ['PROFILE_PHOTO', 'QUALIFICATION', 'IDENTITY_PROOF', 'RATION_CARD', 'VOTER_ID'];

      if (!validDocTypes.includes(docType)) {
        return res.sendError('Invalid docType provided.', HTTP_STATUS.BAD_REQUEST);
      }

      // Compute actual relative path from uploads directory
      const relativePath = path.relative(path.join(__dirname, '../../../'), req.file.path).replace(/\\/g, '/');
      const filePath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

      const doc = await DocumentService.addOrReplaceDocument(userId, {
        docType: docType as any,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        filePath,
      });

      return res.sendSuccess('Document uploaded & media linked successfully!', doc, HTTP_STATUS.CREATED);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to upload document', HTTP_STATUS.BAD_REQUEST);
    }
  }

  static async getUserDocuments(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.params.userId || req.user?.id;
      if (!userId) {
        return res.sendError('Authentication required', HTTP_STATUS.UNAUTHORIZED);
      }
      const data = await DocumentService.getUserDocuments(userId);
      return res.sendSuccess('User documents retrieved successfully', data);
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to fetch documents');
    }
  }

  static async deleteDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const docId = parseInt(req.params.id, 10);
      if (!userId || isNaN(docId)) {
        return res.sendError('Invalid document ID parameter', HTTP_STATUS.BAD_REQUEST);
      }
      await DocumentService.deleteDocument(userId, docId);
      return res.sendSuccess('Document record deleted successfully!');
    } catch (error: any) {
      return res.sendError(error.message || 'Failed to delete document', HTTP_STATUS.BAD_REQUEST);
    }
  }
}
