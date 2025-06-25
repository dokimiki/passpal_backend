import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FcmService } from './fcm.service';
import {
  CreateNotificationReportDto,
  NotificationReportResponseDto,
} from './dto/notification-report.dto';
import {
  User,
  Assignment,
  Class,
  Course,
  ClassNotifier,
  UserDevice,
  ReportType,
  AssignmentStatus,
} from '@prisma/client';

type AssignmentWithClass = Assignment & {
  class: Class & {
    course: Course | null;
    notifiers: (ClassNotifier & {
      user: User & {
        devices: UserDevice[];
      };
    })[];
  };
};

@Injectable()
export class NotificationReportsService {
  private readonly logger = new Logger(NotificationReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fcmService: FcmService,
  ) {}

  async createNotificationReport(
    user: User,
    reportDto: CreateNotificationReportDto,
  ): Promise<NotificationReportResponseDto> {
    const { manaboDirectoryId, manaboAssignmentId, openAt, dueAt, reportType } =
      reportDto;

    this.logger.log(
      `Creating notification report: ${reportType} for assignment ${manaboAssignmentId}`,
    );

    // トランザクション内で実行
    const result = await this.prisma.$transaction(async (prisma) => {
      // 1. assignmentを検索または作成
      let assignment = await prisma.assignment.findFirst({
        where: {
          manaboDirectoryId,
          manaboAssignmentId,
        },
        include: {
          class: {
            include: {
              course: true,
              notifiers: {
                include: {
                  user: {
                    include: {
                      devices: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!assignment) {
        // assignmentが存在しない場合は、まずclassを検索
        // この場合、manaboDirectoryIdがclassのmanaboClassIdと一致することを想定
        const classEntity = await prisma.class.findFirst({
          where: {
            manaboClassId: manaboDirectoryId,
          },
          include: {
            course: true,
            notifiers: {
              include: {
                user: {
                  include: {
                    devices: true,
                  },
                },
              },
            },
          },
        });

        if (!classEntity) {
          throw new NotFoundException(
            `Class with manaboClassId ${manaboDirectoryId} not found`,
          );
        }

        // assignmentを新規作成
        assignment = await prisma.assignment.create({
          data: {
            classId: classEntity.id,
            manaboDirectoryId,
            manaboAssignmentId,
            openAt: openAt ? new Date(openAt) : null,
            dueAt: dueAt ? new Date(dueAt) : null,
            status:
              reportType === 'disappeared'
                ? AssignmentStatus.deleted
                : AssignmentStatus.opened,
          },
          include: {
            class: {
              include: {
                course: true,
                notifiers: {
                  include: {
                    user: {
                      include: {
                        devices: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } else {
        // 既存のassignmentを更新
        const updateData: {
          openAt?: Date | null;
          dueAt?: Date | null;
          status?: AssignmentStatus;
        } = {};

        if (openAt !== undefined) {
          updateData.openAt = openAt ? new Date(openAt) : null;
        }
        if (dueAt !== undefined) {
          updateData.dueAt = dueAt ? new Date(dueAt) : null;
        }
        if (reportType === 'disappeared') {
          updateData.status = AssignmentStatus.deleted;
        } else if (reportType === 'appeared') {
          updateData.status = AssignmentStatus.opened;
        }

        if (Object.keys(updateData).length > 0) {
          assignment = await prisma.assignment.update({
            where: { id: assignment.id },
            data: updateData,
            include: {
              class: {
                include: {
                  course: true,
                  notifiers: {
                    include: {
                      user: {
                        include: {
                          devices: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        }
      }

      // 2. notification_reportを作成
      const notificationReport = await prisma.notificationReport.create({
        data: {
          userId: user.id,
          assignmentId: assignment.id,
          reportType: reportType as ReportType,
        },
      });

      return { notificationReport, assignment };
    });

    // 3. 通知対象者にFCM通知を送信
    await this.sendNotificationToClassNotifiers(result.assignment, reportType);

    return {
      id: result.notificationReport.id,
      assignmentId: result.assignment.id,
      reportType: result.notificationReport.reportType,
      createdAt: result.notificationReport.createdAt.toISOString(),
    };
  }

  private async sendNotificationToClassNotifiers(
    assignment: AssignmentWithClass,
    reportType: string,
  ): Promise<void> {
    const notifiers = assignment.class.notifiers;

    if (notifiers.length === 0) {
      this.logger.log('No notifiers for this class');
      return;
    }

    // 全ての通知対象者のFCMトークンを収集
    const fcmTokens: string[] = [];
    notifiers.forEach((notifier) => {
      notifier.user.devices.forEach((device) => {
        fcmTokens.push(device.fcmToken);
      });
    });

    if (fcmTokens.length === 0) {
      this.logger.log('No FCM tokens found for notifiers');
      return;
    }

    // 通知メッセージを生成
    const { title, body } = this.generateNotificationMessage(
      assignment,
      reportType,
    );

    // FCM通知を送信
    try {
      await this.fcmService.sendMulticast(fcmTokens, title, body, {
        assignmentId: assignment.id,
        classId: assignment.classId,
        reportType,
      });
    } catch (error) {
      this.logger.error('Failed to send FCM notification', error);
      // 通知送信の失敗はnotification reportの作成を失敗させない
    }
  }

  private generateNotificationMessage(
    assignment: AssignmentWithClass,
    reportType: string,
  ): { title: string; body: string } {
    const courseName = assignment.class.course?.title || 'Unknown Course';

    switch (reportType) {
      case 'appeared':
        return {
          title: '新しい課題が公開されました',
          body: `${courseName} で新しい課題が公開されました`,
        };
      case 'changed':
        return {
          title: '課題が更新されました',
          body: `${courseName} の課題が更新されました`,
        };
      case 'disappeared':
        return {
          title: '課題が削除されました',
          body: `${courseName} の課題が削除されました`,
        };
      default:
        return {
          title: '課題に関する通知',
          body: `${courseName} の課題に変更があります`,
        };
    }
  }
}
