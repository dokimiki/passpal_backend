import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  /**
   * 複数のFCMトークンに通知を送信
   */
  async sendMulticast(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (tokens.length === 0) {
      this.logger.warn('No FCM tokens provided');
      return;
    }

    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      this.logger.log(
        `Sent notification to ${response.successCount} devices, ${response.failureCount} failures`,
      );

      // エラーがあった場合はログに記録
      if (response.failureCount > 0) {
        response.responses.forEach(
          (
            resp: { success: boolean; error?: { message: string } },
            idx: number,
          ) => {
            if (!resp.success && resp.error) {
              this.logger.error(
                `Failed to send to token ${tokens[idx]}: ${resp.error.message}`,
              );
            }
          },
        );
      }
    } catch (error) {
      this.logger.error('Failed to send FCM notification', error);
      throw error;
    }
  }

  /**
   * 単一のFCMトークンに通知を送信
   */
  async sendToToken(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    return this.sendMulticast([token], title, body, data);
  }
}
