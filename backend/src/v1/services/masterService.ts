import { prisma } from '../../db/prisma';
import { CacheService } from '../../redis/redisClient';

export class MasterService {
  static async getRoles() {
    const cacheKey = 'master:roles';
    const cached = await CacheService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const roles = await prisma.masterRole.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { createdAt: 'asc' },
    });

    await CacheService.set(cacheKey, JSON.stringify(roles), 3600);
    return roles;
  }

  static async getRelations() {
    const cacheKey = 'master:relations';
    const cached = await CacheService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const relations = await prisma.masterRelation.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { relationName: 'asc' },
    });

    await CacheService.set(cacheKey, JSON.stringify(relations), 3600);
    return relations;
  }

  static async getQualifications() {
    const cacheKey = 'master:qualifications';
    const cached = await CacheService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const qualifications = await prisma.masterQualification.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { createdAt: 'asc' },
    });

    await CacheService.set(cacheKey, JSON.stringify(qualifications), 3600);
    return qualifications;
  }

  static async getSocialCategories() {
    const cacheKey = 'master:social_categories';
    const cached = await CacheService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const categories = await prisma.masterSocialCategory.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { categoryName: 'asc' },
    });

    await CacheService.set(cacheKey, JSON.stringify(categories), 3600);
    return categories;
  }

  static async getStates() {
    const cacheKey = 'master:states';
    const cached = await CacheService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const states = await prisma.masterState.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { stateName: 'asc' },
    });

    await CacheService.set(cacheKey, JSON.stringify(states), 3600);
    return states;
  }

  static async getDistricts(stateId?: number) {
    const cacheKey = stateId !== undefined ? `master:districts:${stateId}` : 'master:districts:all';
    const cached = await CacheService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const districts = await prisma.masterDistrict.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        ...(stateId !== undefined && { stateId }),
      },
      include: { state: true },
      orderBy: { districtName: 'asc' },
    });

    await CacheService.set(cacheKey, JSON.stringify(districts), 3600);
    return districts;
  }

  static async getBlocks(districtId?: number) {
    const cacheKey = districtId !== undefined ? `master:blocks:${districtId}` : 'master:blocks:all';
    const cached = await CacheService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const blocks = await prisma.masterBlock.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        ...(districtId !== undefined && { districtId }),
      },
      include: { district: true },
      orderBy: { blockName: 'asc' },
    });

    await CacheService.set(cacheKey, JSON.stringify(blocks), 3600);
    return blocks;
  }
}
