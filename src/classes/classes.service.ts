import { Injectable } from '@nestjs/common';

@Injectable()
export class ClassesService {
  async getClass(manaboClassId: string, term: string) {
    // TODO: Implement class fetching logic
    return {
      id: '018c7e0c-bbbb-cccc-dddd-6d47afd8c8fc',
      term,
      manaboClassId,
      courseId: '018c7e0c-aaaa-aaaa-aaaa-6d47afd8c8fc',
    };
  }

  async createClass(classDto: {
    manaboClassId: string;
    term: string;
    title: string;
    leadInstructor: string;
  }) {
    // TODO: Implement class creation logic
    return {
      id: '018c7e0c-bbbb-cccc-dddd-6d47afd8c8fc',
      term: classDto.term,
      manaboClassId: classDto.manaboClassId,
      courseId: '018c7e0c-aaaa-aaaa-aaaa-6d47afd8c8fc',
    };
  }

  async subscribeToClassNotifications(classId: string) {
    // TODO: Implement class notification subscription logic
    return { classId };
  }

  async unsubscribeFromClassNotifications(classId: string) {
    // TODO: Implement class notification unsubscription logic
    return;
  }

  async getNotifiedClasses() {
    // TODO: Implement notified classes fetching logic
    return {
      data: [
        {
          id: '018c7e0c-bbbb-cccc-dddd-6d47afd8c8fc',
          term: '2025_春学期',
          manaboClassId: 'CS101',
          courseId: '018c7e0c-aaaa-aaaa-aaaa-6d47afd8c8fc',
        },
      ],
    };
  }
}
