# PassPal Backend - Prisma Setup

このプロジェクトではPrismaを使用してPostgreSQLデータベースと連携しています。

## 環境設定

### 1. データベース接続設定

`.env`ファイルの`DATABASE_URL`を実際のPostgreSQLデータベースに合わせて更新してください：

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/passpal_db?schema=public"
```

### 2. データベースのセットアップ

#### PostgreSQLでデータベースを作成
```bash
# PostgreSQLに接続
psql -U postgres

# データベースを作成
CREATE DATABASE passpal_db;

# データベースを切り替え
\c passpal_db;
```

#### UUID拡張を有効化
```bash
# setup.sqlを実行してUUID拡張を有効化
psql -U username -d passpal_db -f prisma/setup.sql
```

### 3. マイグレーションの実行

```bash
# マイグレーションを適用
npm run prisma:migrate

# または手動で初期マイグレーションを適用
npx prisma migrate dev --name init
```

### 4. Prismaクライアントの生成

```bash
npm run prisma:generate
```

## 利用可能なPrismaコマンド

```bash
# Prismaクライアントを生成
npm run prisma:generate

# 開発用マイグレーション実行
npm run prisma:migrate

# 本番環境マイグレーション実行
npm run prisma:deploy

# Prisma Studio起動（GUI管理ツール）
npm run prisma:studio

# データベースリセット
npm run prisma:reset
```

## 使用方法

各サービスでPrismaServiceを注入して使用します：

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async create(data: any) {
    return this.prisma.user.create({ data });
  }
}
```

## データベーススキーマ

- `courses` - 授業科目
- `course_ratings` - 科目評価
- `users` - ユーザー
- `user_devices` - ユーザーデバイス
- `attendance_logs` - 出欠ログ
- `notification_reports` - 通知レポート
- `classes` - 授業
- `class_notifiers` - 授業通知設定
- `assignments` - 課題

詳細なスキーマ定義は`prisma/schema.prisma`を参照してください。
