import { prisma } from '../../db/prisma';

export class UserLocationService {
  static async assignLocation(payload: {
    userId: string;
    stateId: number;
    districtId?: number;
    blockId?: number;
  }) {
    // Verify target user exists
    const user = await prisma.user.findFirst({
      where: { id: payload.userId, isDeleted: false },
      include: { role: true },
    });

    if (!user) {
      throw new Error('User record not found.');
    }

    // Verify State exists
    const state = await prisma.masterState.findFirst({
      where: { id: payload.stateId, isActive: true, isDeleted: false },
    });
    if (!state) throw new Error('Invalid State ID provided.');

    // If District provided, verify District exists
    if (payload.districtId) {
      const district = await prisma.masterDistrict.findFirst({
        where: { id: payload.districtId, stateId: payload.stateId, isActive: true, isDeleted: false },
      });
      if (!district) throw new Error('Invalid District ID for the specified State.');
    }

    // If Block provided, verify Block exists
    if (payload.blockId) {
      if (!payload.districtId) throw new Error('District ID is required when specifying a Block.');
      const block = await prisma.masterBlock.findFirst({
        where: { id: payload.blockId, districtId: payload.districtId, isActive: true, isDeleted: false },
      });
      if (!block) throw new Error('Invalid Block ID for the specified District.');
    }

    // Assign Zonal Location mapping
    const location = await prisma.userLocation.create({
      data: {
        userId: payload.userId,
        stateId: payload.stateId,
        districtId: payload.districtId || null,
        blockId: payload.blockId || null,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, mobile: true, role: true } },
        state: true,
        district: true,
        block: true,
      },
    });

    return location;
  }

  static async getUserLocations(userId: string) {
    const locations = await prisma.userLocation.findMany({
      where: { userId, isDeleted: false },
      include: {
        state: true,
        district: true,
        block: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return locations;
  }

  static async deleteLocation(locationId: string) {
    const existing = await prisma.userLocation.findFirst({
      where: { id: locationId, isDeleted: false },
    });

    if (!existing) {
      throw new Error('User location mapping record not found.');
    }

    await prisma.userLocation.update({
      where: { id: locationId },
      data: { isDeleted: true, isActive: false },
    });

    return true;
  }
}
