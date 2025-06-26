# PassPal Backend - Docker Setup

このドキュメントでは、PassPal BackendをDockerで実行する方法について説明します。

## 前提条件

- Docker Desktop がインストールされていること
- Docker Compose が利用可能であること
- Firebase Admin SDKのサービスアカウントキーファイルを取得済みであること

## セットアップ手順

### 1. Firebase設定

1. Firebase Admin SDKのサービスアカウントキーファイルを取得
2. プロジェクトルートに`config`ディレクトリを作成
3. サービスアカウントキーファイルを`config/firebase-admin-sdk.json`として保存

```bash
mkdir config
# firebase-admin-sdk.jsonをconfigディレクトリに配置
```

### 2. 環境変数の設定

```bash
# Docker用の環境変数ファイルをコピー
cp .env.docker .env

# 必要に応じて.envファイルを編集
```

### 3. 本番環境での起動

```bash
# アプリケーションの起動
docker-compose up -d

# ログの確認
docker-compose logs -f api

# アプリケーションの停止
docker-compose down
```

### 4. 開発環境での起動

```bash
# 開発環境での起動（ホットリロード有効）
docker-compose -f docker-compose.dev.yml up -d

# ログの確認
docker-compose -f docker-compose.dev.yml logs -f api

# Prisma Studioも起動する場合
docker-compose -f docker-compose.dev.yml --profile dev up -d

# 開発環境の停止
docker-compose -f docker-compose.dev.yml down
```

## サービス構成

### 本番環境 (docker-compose.yml)

- **api**: PassPal Backend API (Port: 3000)
- **postgres**: PostgreSQL データベース (Port: 5432)
- **redis**: Redis キャッシュ (Port: 6379)
- **prisma-studio**: Prisma Studio (Port: 5555) - `--profile dev`で起動

### 開発環境 (docker-compose.dev.yml)

- **api**: PassPal Backend API with hot reload (Port: 3000, Debug: 9229)
- **postgres**: PostgreSQL データベース (Port: 5432)
- **redis**: Redis キャッシュ (Port: 6379)
- **prisma-studio**: Prisma Studio (Port: 5555)

## 便利なコマンド

### データベース操作

```bash
# Prisma マイグレーション実行
docker-compose exec api npx prisma migrate deploy

# Prisma クライアント再生成
docker-compose exec api npx prisma generate

# データベースリセット（開発環境のみ）
docker-compose -f docker-compose.dev.yml exec api npx prisma migrate reset

# Prisma Studio起動（開発環境）
docker-compose -f docker-compose.dev.yml --profile dev up prisma-studio
```

### ログとデバッグ

```bash
# APIサーバーのログ表示
docker-compose logs -f api

# データベースのログ表示
docker-compose logs -f postgres

# コンテナ内でコマンド実行
docker-compose exec api sh

# PostgreSQLコンテナに接続
docker-compose exec postgres psql -U passpal_user -d passpal
```

### データボリューム管理

```bash
# データベースボリューム削除（データが削除されます）
docker-compose down -v

# 使用していないボリューム削除
docker volume prune
```

## API エンドポイント

- API サーバー: http://localhost:3000
- Prisma Studio: http://localhost:5555 (開発環境)
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## トラブルシューティング

### Firebase認証エラー

```bash
# Firebase設定ファイルの確認
docker-compose exec api ls -la /app/config/

# 環境変数の確認
docker-compose exec api env | grep FIREBASE
```

### データベース接続エラー

```bash
# PostgreSQLコンテナの状態確認
docker-compose ps postgres

# データベース接続テスト
docker-compose exec postgres pg_isready -U passpal_user -d passpal
```

### ポート競合エラー

ローカルで既にサービスが起動している場合、`docker-compose.yml`のポート設定を変更してください。

```yaml
ports:
  - "3001:3000"  # 3000 -> 3001に変更
```

## 本番環境への移行

1. 環境変数を本番用に更新
2. Firebase設定を本番環境用に変更
3. データベースの永続化設定を確認
4. セキュリティ設定の見直し
5. ログ管理の設定

## 参考情報

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
